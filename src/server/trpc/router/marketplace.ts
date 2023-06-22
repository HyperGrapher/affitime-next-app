import { router, vendorProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import crypto from "node:crypto";
import axios from "axios";
import {
  PAYTR_MARKETPLACE,
  PAYTR_MARKETPLACE_URL,
} from "../../../config/constants";
import { TRPCError } from "@trpc/server";
import dayjs from "dayjs";

import type {
  IPlanPaymentData,
  InstallmentType,
} from "../../../interface/payments.interface";

/*
      ex test card 1: 4355 0843 5508 4358
      ex test card 2: 4355 0843 5508 4358
      
        test cards for paytr magaza

        9792 0303 9444 0796
        4355 0843 5508 4358
        5406 6754 0667 5403

        Kart Ad Soyadı	PAYTR TEST
        Son Kullanma	12 / 30
        CVV	000


        taxinfo -> {"vkn":"1234567891","tckn":"29458195655","title":"dr","fname":"ragıp","lname":"adıgüzel","taxOffice":"adana v.d.","address":"some address that is valid"}
      
      select vendorId, merchant_oid, success, user_basket, payment_amount, payed_amount, errorReason, createdAt from market_payment;

*/

export const marketPlaceRouter = router({
  // Ilk adim kampanya icin vendor'den odeme al
  transferRequest: vendorProcedure
    .input(
      z.object({
        pid: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { vendorId } = ctx.session;
      const { pid } = input;

      const vendor = await ctx.prisma.vendor.findUnique({
        where: { id: vendorId },
        include: { user: true },
      });

      if (!vendor)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session vendor not found",
        });

      const marketPayment = await ctx.prisma.marketPayment.findFirst({
        where: { vendorId: vendorId },
      });

      if (!marketPayment)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session vendor not found",
        });

      // !  https://dev.paytr.com/platform-transfer-talebi/transfer-talimatinin-sonucunun-alinmasi

      const merchant_id = PAYTR_MARKETPLACE.merchant_id;
      const merchant_key = PAYTR_MARKETPLACE.merchant_key;
      const merchant_salt = PAYTR_MARKETPLACE.merchant_salt;

      const merchant_oid = marketPayment.merchant_oid; // "MP" + Date.now(); // En fazla 64 karakter, Alfa numerik
      const trans_id = "TRANS" + Date.now(); // En fazla 60 karakter, Alfa numerik
      const submerchant_amount = 70000; // 70tl -> 7000
      const total_amount = 100000; // 100tl -> 10000
      const transfer_name = "ragip adiguzel"; // 100tl -> 10000
      const transfer_iban = "TR 80 0011 1000 0000 0056 7128 34".replace(
        /\s+/g,
        ""
      );

      const nd = dayjs(new Date());
      const ed = nd.add(2, "month");

      const start_date = nd.format("YYYY-MM-DD HH:mm:ss");
      const end_date = ed.format("YYYY-MM-DD HH:mm:ss");
      // paytr_token_for_geri_donen - https://dev.paytr.com/platform-transfer-talebi/geri-donen-odemeleri-listele
      const paytr_token_for_geri_donen = crypto
        .createHmac("sha256", merchant_key)
        .update(merchant_id + start_date + end_date + merchant_salt)
        .digest("base64");

      const hash_str =
        merchant_id +
        merchant_oid +
        trans_id +
        submerchant_amount +
        total_amount +
        transfer_name +
        transfer_iban;
      const paytr_token = crypto
        .createHmac("sha256", merchant_key)
        .update(hash_str + merchant_salt)
        .digest("base64");

      console.log({ paytr_token, transfer_iban, lng: transfer_iban.length });
      // Transfer Talimatının Verilmesi

      const data = await axios.request({
        url: PAYTR_MARKETPLACE_URL,
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        data: {
          merchant_id: merchant_id,
          merchant_oid: merchant_oid,
          trans_id: trans_id,
          submerchant_amount: submerchant_amount,
          total_amount: total_amount,
          transfer_name: transfer_name,
          transfer_iban: transfer_iban,
          paytr_token: paytr_token,
        },
      });
      // merchant_oid ile basarili odeme bulunamadi (MP1682864464175) err_no: 006
      if (data) {
        console.log(data.status); // hata olsa da 200
        console.log(data.data);

        if (data.data.status === "error") {
          console.log(data.data.err_msg, data.data.err_no);

          if (data.data.err_no === "091") {
            // iban hatali
            console.log("iban hatali");
          }
        }
        if (data.data.status === "success") {
          console.log(data.data);
        }
      } else {
        console.log("Something went wrong!");
      }

      return {};
    }),

  createCampaignPayment: vendorProcedure
    .input(
      z.object({
        user_ip: z.string(),
        currency: z.string(),
        user_address: z.string(),
        installment_count: z.string(),
        card_type: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { vendorId, id } = ctx.session;
      const { user_ip, currency, user_address, installment_count, card_type } =
        input;
      const payment_type = "card";
      const paytr_post_url = "https://www.paytr.com/odeme";
      const merchant_ok_url = "http://affitime.com/payments/mp-success";
      const merchant_fail_url = "http://affitime.com/payments/fail";

      const debug_on = 1;
      const test_mode = "1";
      const non3d_test_failed = "0";
      const non_3d = "0"; //3d'siz işlem
      const payment_amount = "1000.00";

      const vendor = await ctx.prisma.vendor.findUnique({
        where: { id: vendorId },
        include: { user: true },
      });

      if (!vendor)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session vendor not found",
        });

      const taxinfo = await ctx.prisma.taxinfo.findUnique({
        where: { user_id: id },
      });

      if (!taxinfo)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session vendor not found",
        });

      const merchant_oid = "MP" + Date.now(); // + Date.now(); // En fazla 64 karakter, Alfa numerik

      const user_basket = JSON.stringify([
        [`vendor-marketplace`, payment_amount, 1], // 1. ürün (Ürün Ad - Birim Fiyat - Adet)
      ]);

      const email = vendor.user.email; // Müşterinizin sitenizde kayıtlı veya form vasıtasıyla aldığınız eposta adresi.
      const user_name = `${vendor.user.fname} ${vendor.user.lname}`;
      // const user_name = `PAYTR TEST`;
      const user_phone = vendor.phone?.startsWith("0")
        ? vendor.phone
        : `0${vendor.phone}`;
      const merchant_id = PAYTR_MARKETPLACE.merchant_id;
      const merchant_key = PAYTR_MARKETPLACE.merchant_key;
      const merchant_salt = PAYTR_MARKETPLACE.merchant_salt;

      const hashSTR = `${merchant_id}${user_ip}${merchant_oid}${email}${payment_amount}${payment_type}${installment_count}${currency}${test_mode}${non_3d}`;
      const paytr_token = hashSTR + merchant_salt;

      const token = crypto
        .createHmac("sha256", merchant_key)
        .update(paytr_token)
        .digest("base64");

      try {
        await ctx.prisma.marketPayment.create({
          data: {
            vendorUserId: vendor.userId,
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
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot create paymen plan",
        });
      }

      const response: IPlanPaymentData = {
        merchant_id: PAYTR_MARKETPLACE.merchant_id,
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
        debug_on, // 0,1
      };

      return response;
    }),
});
