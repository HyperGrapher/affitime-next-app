import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "../../../../server/db/client";
import dayjs from "dayjs";
import crypto from "node:crypto";
import { PAYTR_MARKETPLACE } from "../../../../config/constants";

const action = async (req: NextApiRequest, res: NextApiResponse) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const callback = req.body;

  if (callback.trans_ids) {
    
  } else {
    const record = await prisma.marketPayment.findFirst({
      where: { merchant_oid: callback.merchant_oid },
    });

    if (!record) {
      return res.send("OK");
    }

    if (record.success) {
      return res.send("OK");
    }

    const paytr_token =
      callback.merchant_oid +
      PAYTR_MARKETPLACE.merchant_salt +
      callback.status +
      callback.total_amount;

    const token = crypto
      .createHmac("sha256", PAYTR_MARKETPLACE.merchant_key)
      .update(paytr_token)
      .digest("base64");


    if (token !== callback.hash) {
    
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


    if (callback.status === "success") {
      await prisma.marketPayment.update({
        where: { merchant_oid: callback.merchant_oid },
        data: {
          payed_amount: Number(callback.total_amount),
          payment_amount: Number(callback.payment_amount),
          payment_type: callback.payment_type,
          test_mode: Boolean(Number(callback.test_mode)),
          success: true,
        },
      });
    } else {
   
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

    res.send("OK"); 
  }
};

export default action;
