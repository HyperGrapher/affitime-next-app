import { router, vendorProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import crypto from "node:crypto";
import { Base64 } from "js-base64";
import axios from "axios";
import { PAYTR } from "../../../config/constants";
import { TRPCError } from "@trpc/server";
import { PRICING_ANNUALY, PRICING_MONTHLY } from "../../../config/pricing";
import { taxinfoValidationSchema } from "../../../interface/zod.schema";
import { IPlanPaymentData } from "../../../interface/payments.interface";

const paytr_post_url = "https://www.paytr.com/odeme";
const merchant_ok_url = "http://affitime.com/payments/success";
// Ödeme sürecinde beklenmedik bir hata oluşması durumunda müşterinizin yönlendirileceği sayfa
// Bu sayfa siparişi iptal edeceğiniz sayfa değildir! Yalnızca müşterinizi bilgilendireceğiniz sayfadır!
const merchant_fail_url = "http://affitime.com/payments/fail";
const debug_on = 1;
const test_mode = "1";
//non3d işlemde, başarısız işlemi test etmek için 1 gönderilir (test_mode ve non_3d değerleri 1 ise dikkate alınır!)
const non3d_test_failed = "0";
const client_lang = "tr"; //Ödeme süreci dil seçeneği tr veya en.
const payment_type = "card"; // Ödeme türü
const non_3d = "0"; //3d'siz işlem
const card_type = ""; // taksit icin gerekli yoksa degil. Alabileceği değerler; advantage, axess, combo, bonus, cardfinans, maximum, paraf, world, saglamkart
const installment_count = "0"; // Taksit Sayısı

export type PlanType = "BASIC" | "PRO" | "ULTIMATE";

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
        annual: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { vendorId } = ctx.session;
      const { user_ip, annual, currency, user_address, plan } = input;

      // let payment_amount = annual
      //   ? PRICING_ANNUALY[plan as PlanType]
      //   : PRICING_MONTHLY[plan as PlanType];
      const payment_amount = "1290.00";
      const vendor = await ctx.prisma.vendor.findUnique({
        where: { id: vendorId },
        include: { user: true },
      });

      if (!vendor)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session user ID not found",
        });

      const merchant_oid = "IN" + Date.now(); // En fazla 64 karakter, Alfa numerik
      // > microtime.now()
      // 1297448895297028

      const user_basket = JSON.stringify([
        [`${annual ? "YILLIK" : "AYLIK"}-${plan}-PLAN`, payment_amount, 1], // 1. ürün (Ürün Ad - Birim Fiyat - Adet)
      ]);

      const email = vendor.user.email; // Müşterinizin sitenizde kayıtlı veya form vasıtasıyla aldığınız eposta adresi.
      const user_name = 'test user' // `${vendor.user.fname} ${vendor.user.lname}`;
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

        /*
1|affiti.m | ---------> FAILED - token != callback.hash
1|affiti.m | ---------> callback.hash:  a5+nIiuduXG3g/S2daUNhnvsGTtCiMNqE6XYk6SWJrc=
1|affiti.m | ---------> record.token:  LYJQZpP3pa24lOO5tQ2+g7SWAY9Z/muhMrFlX/IMtF0=
        */

      try {
        await ctx.prisma.planPayment.create({
          data: {
            userId: vendor.userId,
            merchant_oid,
            token,
            user_basket,
            user_phone,
            user_name,
            user_address,
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
        payment_amount: parseFloat(payment_amount), // double
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
        debug_on, // 0,1
      };

      return response;
    }),
});
