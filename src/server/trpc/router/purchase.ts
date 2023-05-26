import { router, vendorProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import crypto from "node:crypto";
import axios from "axios";
import { PAYTR } from "../../../config/constants";
import { TRPCError } from "@trpc/server";
import { PRICING_ANNUALY, PRICING_MONTHLY } from "../../../config/pricing";
import { taxinfoValidationSchema } from "../../../interface/zod.schema";
import type {
  IPlanPaymentData,
  InstallmentType,
} from "../../../interface/payments.interface";


const paytr_post_url = "https://www.paytr.com/odeme";
const merchant_ok_url = "http://affitime.com/payments/success";

const merchant_fail_url = "http://affitime.com/payments/fail";
const debug_on = 1;
const test_mode = "1";
const non3d_test_failed = "0";
const client_lang = "tr"; 
const payment_type = "card"; 
const non_3d = "0"; 
const card_type = ""; 

export type PlanType = "BASIC" | "PRO" | "ULTIMATE";

const total = (annual: boolean, price: string) => {
  const calc = annual ? parseInt(price) * 12 : price;

  return String(calc);
};

export const purchaseRouter = router({
  getTaxInfo: protectedProcedure.query(({ ctx }) => {
    const { id } = ctx.session;

    if (!id) throw new TRPCError({ code: "NOT_FOUND" });

    const data = ctx.prisma.taxinfo.findFirst({
      where: {
        user_id: id,
      },
    });

    if (!data) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Tax data not found",
      });
    }

    return data;
  }),

  upsertTaxInfo: protectedProcedure
    .input(taxinfoValidationSchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = ctx.session;
      const existing = await ctx.prisma.taxinfo.findFirst({
        where: { user_id: id },
      });

      try {
        await ctx.prisma.user.update({
          where: { id },
          data: { fname: input.fname, lname: input.lname },
        });
        if (existing) {
          return await ctx.prisma.taxinfo.update({
            where: { user_id: id },
            data: {
              ...input,
            },
          });
        } else {
          return await ctx.prisma.taxinfo.create({
            data: { ...input, user_id: id },
          });
        }
      } catch (error) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product ID not found",
        });
      }
    }),
  purchasePack: vendorProcedure
    .input(
      z.object({
        user_ip: z.string(),
        currency: z.string(),
        user_address: z.string(),
        plan: z.string(),
        installment_count: z.string(),
        card_type: z.string(),
        annual: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { vendorId } = ctx.session;
      const { user_ip, annual, currency, user_address, plan, installment_count, card_type } = input;

      const payment_amount_as_plan = annual
        ? PRICING_ANNUALY[plan as PlanType]
        : PRICING_MONTHLY[plan as PlanType];
      const payment_amount = total(annual, payment_amount_as_plan) + ".00";

      const vendor = await ctx.prisma.vendor.findUnique({
        where: { id: vendorId },
        include: { user: true },
      });

      if (!vendor)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session vendor not found",
        });

      const merchant_oid = "IN" + Date.now(); 

      const user_basket = JSON.stringify([
        [`${annual ? "YILLIK" : "AYLIK"}-${plan}-PLAN`, payment_amount, 1], 
      ]);

      const email = vendor.user.email;
      const user_name = `${vendor.user.fname} ${vendor.user.lname}`;
      const user_phone = vendor.phone?.startsWith("0")
        ? vendor.phone
        : `0${vendor.phone}`;
      const merchant_id = PAYTR.merchant_id;
      const merchant_key = PAYTR.merchant_key;
      const merchant_salt = PAYTR.merchant_salt;

      const hashSTR = `${merchant_id}${user_ip}${merchant_oid}${email}${payment_amount}${payment_type}${installment_count}${currency}${test_mode}${non_3d}`;
      const paytr_token = hashSTR + merchant_salt;

      const token = crypto
        .createHmac("sha256", merchant_key)
        .update(paytr_token)
        .digest("base64");

      try {
        await ctx.prisma.planPayment.create({
          data: {
            userId: vendor.userId,
            vendorId,
            merchant_oid,
            user_basket,
            user_phone,
            user_name,
            user_address,
            payment_type,
            card_type,
            installment_count: parseInt(installment_count),
            payment_amount: parseFloat(payment_amount),
            packageType: plan as PlanType,
            annual,
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot create paymen plan",
        });
      }

      const response: IPlanPaymentData = {
        merchant_id: PAYTR.merchant_id,
        paytr_token: token,
        user_ip,
        merchant_oid,
        email: vendor.user.email,
        payment_type,
        payment_amount: payment_amount,
        installment_count: parseInt(installment_count),
        non_3d: parseInt(non_3d),
        non3d_test_failed: parseInt(non3d_test_failed),
        test_mode: parseInt(test_mode),
        currency,
        merchant_ok_url,
        merchant_fail_url,
        user_name,
        user_address,
        user_phone,
        user_basket,
        debug_on,
      };

      return response;
    }),

  getInstallmentInfo: protectedProcedure.query(async ({ ctx }) => {
    const { id } = ctx.session;

    if (!id) throw new TRPCError({ code: "NOT_FOUND" });

    const merchant_id = PAYTR.merchant_id;
    const merchant_key = PAYTR.merchant_key;
    const merchant_salt = PAYTR.merchant_salt;
    const request_id = "RI" + Date.now();

    const paytr_token = crypto
      .createHmac("sha256", merchant_key)
      .update(merchant_id + request_id + merchant_salt)
      .digest("base64");

    try {
      const formData = new URLSearchParams(); 
      formData.append("merchant_id", String(merchant_id));
      formData.append("request_id", request_id);
      formData.append("merchant_key", merchant_key);
      formData.append("merchant_salt", merchant_salt);
      formData.append("paytr_token", paytr_token);
      formData.append("single_ratio", "1");
      formData.append("abroad_ratio", "0");

      const data = await axios.request({
        url: "https://www.paytr.com/odeme/taksit-oranlari",
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        data: formData,
      });

      console.log(data.data);

      return data.data as InstallmentType;
    } catch (error) {
      console.error(error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Taksit oranlari alinamadi",
      });
    }
  }),
});
