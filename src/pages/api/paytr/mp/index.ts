import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "../../../../server/db/client";
import dayjs from "dayjs";
import crypto from "node:crypto";

const PAYTR_MARKETPLACE = {
  merchant_id: 339896,
  merchant_key: "bfqaRWT9ZGMw3HC4",
  merchant_salt: "ejRTNLhidiGwJn53",
};

const action = async (req: NextApiRequest, res: NextApiResponse) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const callback = req.body;
  console.log(callback);

  if (callback.trans_ids) {
    // * Marketplace Paytr response
    console.log("Marketplace API Paytr response");
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

    const test_mode = Number(callback.test_mode); // 0 or 1

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
          test_mode: callback.test_mode,
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
          payed_amount: callback.total_amount,
          payment_type: callback.payment_type,
          test_mode: callback.test_mode,
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
          payed_amount: callback.total_amount,
          payment_type: callback.payment_type,
          test_mode: callback.test_mode,
          success: false,
        },
      });
    }

    res.send("OK"); // Bildirimin alındığını PayTR sistemine bildir.
  }
};

export default action;

/*

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

 ? Axios callback: 

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

*/
