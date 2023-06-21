import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "../../../../server/db/client";
import dayjs from "dayjs";
import crypto from "node:crypto";
import { PAYTR_MARKETPLACE } from "../../../../config/constants";


const action = async (req: NextApiRequest, res: NextApiResponse) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const callback = req.body;
  console.log(callback);

  // !  https://dev.paytr.com/platform-transfer-talebi/transfer-talimatinin-sonucunun-alinmasi
  if (callback.trans_ids) {
    // * Marketplace Paytr response
    console.log("Marketplace Paytr response", 'callback.trans_ids');

    // ## trans_ids: Daha önce PayTR'a ilettiğiniz transfer taleplerinden tamamlanan transferlerin trans_id bilgilerini içeren JSON
    // ## (trans_id bilgisi transfer talebi yaparken PayTR'a gönderdiğiniz her işlem için eşsiz değerdir)
    // ## Örn: Burada trans_ids JSON verisini DECODE edip, çıktıdaki her bir trans_id ile veritabanınızdan transfer talebini tespit ederek ilgili kullanıcınıza bilgilendirme gönderebilirsiniz (email, sms vb.)
    const processed_result = JSON.parse("{trans_ids: ''}");
  } else {
    // * Direct API Paytr response
    console.log("Direct API Paytr response");

    const record = await prisma.marketPayment.findFirst({
      where: { merchant_oid: callback.merchant_oid },
    });

    if (!record) {
      return res.send("OK");
    }

    if (record.success) {
      console.log("---------> Already approved");
      return res.send("OK");
    }
    // Oluşturulan hash'i, paytr'dan gelen post içindeki hash ile karşılaştır (isteğin paytr'dan geldiğine ve değişmediğine emin olmak için)
    // Bu işlemi yapmazsanız maddi zarara uğramanız olasıdır.

    const paytr_token =
      callback.merchant_oid +
      PAYTR_MARKETPLACE.merchant_salt +
      callback.status +
      callback.total_amount;

    const token = crypto
      .createHmac("sha256", PAYTR_MARKETPLACE.merchant_key)
      .update(paytr_token)
      .digest("base64");

    // const test_mode = Number(callback.test_mode); // 0 or 1

    if (token !== callback.hash) {
      console.log("---------> FAILED - token != callback.hash");
      console.log(
        "---------> callback.hash: ",
        callback.hash,
        "token created: ",
        token
      );

      await prisma.marketPayment.update({
        where: { merchant_oid: callback.merchant_oid },
        data: {
          errorReason: "BAD_HASH",
          errorCode: "CUSTOM",
          payed_amount: callback.total_amount,
          payment_type: callback.payment_type,
          test_mode: Boolean(Number(callback.test_mode)),
          success: false,
        },
      });

      return res.send("OK");
    }
    // callback
    //  {
    //    hash: '93xStbx/ieOWlHwaJNtDIZBjfMG0MXQNxPtyggNR/7I=',
    //    merchant_oid: 'IN1678965047026',
    //    status: 'failed',
    //    total_amount: '0',
    //    failed_reason_code: '10',
    //    failed_reason_msg: 'Bu işlemde 3D Secure kullanılmalıdır.',
    //    payment_type: 'card',
    //    merchant_id: '320089',
    //    test_mode: '1'
    //  }

    if (callback.status === "success") {
      // basarili
      console.log("---> cb.status == success | oid:", callback.merchant_oid);
      const nowDate = dayjs(new Date());
      const months = 2;
      const validFrom = dayjs(new Date()).toDate();
      const validTill = nowDate.add(months, "month").toDate();

      await prisma.marketPayment.update({
        where: { merchant_oid: callback.merchant_oid },
        data: {
          validFrom,
          validTill,
          payed_amount: Number(callback.total_amount),
          payment_amount: Number(callback.payment_amount),
          payment_type: callback.payment_type,
          test_mode: Boolean(Number(callback.test_mode)),
          success: true,
        },
      });
    } else {
      /// basarisiz
      console.log("---> cb.status - basarisiz: ", callback.failed_reason_msg);

      await prisma.marketPayment.update({
        where: { merchant_oid: callback.merchant_oid },
        data: {
          errorReason: callback.failed_reason_msg,
          errorCode: callback.failed_reason_code,
          payed_amount: Number(callback.total_amount),
          payment_type: callback.payment_type,
          test_mode: Boolean(Number(callback.test_mode)),
          success: false,
        },
      });
    }

    res.send("OK"); // Bildirimin alındığını PayTR sistemine bildir.
  }
};

export default action;

/*

! ERROR START
 PrismaClientValidationError: Argument payed_amount: Got invalid value '100000' on prisma.updateOneMarketPayment. Provided String, expected Float or NullableFloatFieldUpdateOperationsInput or Null.
 Argument test_mode: Got invalid value '1' on prisma.updateOneMarketPayment. Provided String, expected Boolean or NullableBoolFieldUpdateOperationsInput or Null.
     at Document.validate (/home/burak/apps/affinext/node_modules/@prisma/client/runtime/index.js:32560:20)
     at serializationFn (/home/burak/apps/affinext/node_modules/@prisma/client/runtime/index.js:36149:19)
     at runInChildSpan (/home/burak/apps/affinext/node_modules/@prisma/client/runtime/index.js:25582:12)
     at PrismaClient._executeRequest (/home/burak/apps/affinext/node_modules/@prisma/client/runtime/index.js:36156:31)
     at applyQueryExtensions (/home/burak/apps/affinext/node_modules/@prisma/client/runtime/index.js:34486:19)
     at consumer (/home/burak/apps/affinext/node_modules/@prisma/client/runtime/index.js:36080:18)
     at /home/burak/apps/affinext/node_modules/@prisma/client/runtime/index.js:36085:51
     at AsyncResource.runInAsyncScope (node:async_hooks:203:9)
     at /home/burak/apps/affinext/node_modules/@prisma/client/runtime/index.js:36085:29
     at runInChildSpan (/home/burak/apps/affinext/node_modules/@prisma/client/runtime/index.js:25582:12) {
   clientVersion: '4.8.1'
 }

! ERROR END

success_callback:{
   hash: 'FYwETRRvVB0KTNeERk2zzNpDi854uD2MaJgGHhLn0P8=',
   merchant_oid: 'MP1687384672126',
   status: 'success',
   total_amount: '100000',
   payment_type: 'card',
   payment_amount: '100000',
   currency: 'TL',
   installment_count: '1',
   merchant_id: '339896',
   test_mode: '1'
 }

 ? Axios callback 1: 

  {
   paytr_token: 'ln4s0QMYKV5UemWjKOpYAvy1xAXVioQ5d/lmYKSQFs4=',
   transfer_iban: 'TR800011100000000056712834',
   lng: 26
 }

 200

 {
   status: 'error',
   err_no: '006',
   err_msg: 'merchant_oid ile basarili odeme bulunamadi (get from db)'
 }

 merchant_oid ile basarili odeme bulunamadi (get from db) 006

 [Object: null prototype] {
   hash: 'FYwETRRvVB0KTNeERk2zzNpDi854uD2MaJgGHhLn0P8=',
   merchant_oid: 'MP1687384672126',
   status: 'success',
   total_amount: '100000',
   payment_type: 'card',
   payment_amount: '100000',
   currency: 'TL',
   installment_count: '1',
   merchant_id: '339896',
   test_mode: '1'
 }


 ? axios callback 2 

  {
   paytr_token: 'JBMBdZRRNVwptFYo8ULgC9OfgkWa/OBSZVhObfwlvU0=',
   transfer_iban: 'TR800011100000000056712834',
   lng: 26
 }
 200
 {
   status: 'error',
   err_no: '007',
   err_msg: 'merchant_oid bulundu ancak odeme henuz siteye bildirilmemis (MP1687384672126)'
 }

 merchant_oid bulundu ancak odeme henuz siteye bildirilmemis (MP1687384672126) 007

*/
