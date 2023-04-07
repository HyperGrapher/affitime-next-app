import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";
import dayjs from "dayjs";

const callback = async (req: NextApiRequest, res: NextApiResponse) => {

  res.setHeader("Access-Control-Allow-Origin", "*");

  const callback = req.body;


  const record = await prisma.planPayment.findFirst({
    where: { merchant_oid: callback.merchant_oid },
  });


  if (!record) {
    return res.send("OK");
  }

  if (record.success) {
    return res.send("OK");
  }

  if (callback.status === "success") {
    const nowDate = dayjs(new Date());
    const months = record.annual ? 12 : 1;
    const validTill = nowDate.add(months, "month").toDate();

    await prisma.planPayment.update({
      where: { merchant_oid: callback.merchant_oid },
      data: {
        success: true,
        validTill,
      },
    });

    await prisma.user.update({
      where: { id: record.userId },
      data: {
        packageType: record.packageType,
        validTill,
        pro: true,
        trial: false,
      },
    });
  } else {

    await prisma.planPayment.update({
      where: { merchant_oid: callback.merchant_oid },
      data: {
        errorReason: "PAYMENT_FAIL",
        success: false,
      },
    });
  }

  return res.send("OK");
};

export default callback;
