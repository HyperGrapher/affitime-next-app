import { router, vendorProcedure } from "../trpc";
import { z } from "zod";
import crypto from "node:crypto";
import { Base64 } from "js-base64";
import axios from "axios";
import { PAYTR } from "../../../config/constants";
import { TRPCError } from "@trpc/server";
import { PRICING_ANNUALY, PRICING_MONTHLY } from "../../../config/pricing";
type PlanType = "BASIC" | "PRO" | "ULTIMATE";

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
const non_3d = "1"; //3d'siz işlem
const card_type = ""; // taksit icin gerekli yoksa degil. Alabileceği değerler; advantage, axess, combo, bonus, cardfinans, maximum, paraf, world, saglamkart
const installment_count = "0"; // Taksit Sayısı



export const purchaseRouter = router({
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

      let payment_amount = annual
        ? PRICING_ANNUALY[plan as PlanType]
        : PRICING_MONTHLY[plan as PlanType];
      payment_amount += ".00";
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

      const basket = JSON.stringify([
        [`${annual ? "YILLIK" : "AYLIK"}-${plan}-PLAN`, payment_amount, 1], // 1. ürün (Ürün Ad - Birim Fiyat - Adet)
      ]);
      const user_basket = basket;

      const email = vendor.user.email; // Müşterinizin sitenizde kayıtlı veya form vasıtasıyla aldığınız eposta adresi.
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
        await ctx.prisma.vendor.findUnique({
          where: { id: vendorId },
          include: { user: true },
        });
      } catch (error) {}

      console.log({
        input,
        payment_amount,
        user_basket,
        merchant_oid,
        token,
        user_name,
        user_phone,
      });
      //   console.log({ hashSTR });
      //   console.log({ token });

      return { success: true, error: false };

      //   try {
      //     await ctx.prisma.partner.update({
      //       where: { id: partnerId },
      //       data: {
      //         interests: { input },
      //       },
      //     });

      //     return { success: true, error: false };
      //   } catch (error) {
      //     console.error(error);
      //     return { success: false, error: error };
      //   }
    }),
});
