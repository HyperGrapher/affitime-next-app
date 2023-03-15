import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";
import dayjs from "dayjs";
import Cors from 'cors'

const cors = Cors({
  methods: ['POST', 'GET', 'HEAD'],
})

function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}



// import Cors from 'cors'
// https://github.com/vercel/next.js/blob/canary/examples/api-routes-cors/pages/api/cors.ts

const callback = async (req: NextApiRequest, res: NextApiResponse) => {

  await runMiddleware(req, res, cors)

  res.setHeader("Access-Control-Allow-Origin", "*");

  const callback = req.body;
  console.log("affitime.com callback");
  console.log(callback);
  console.log("\n");

  const record = await prisma.planPayment.findFirst({
    where: { merchant_oid: callback.merchant_oid },
  });

  // let [data] = await db.query(`select * from plan_payment where merchant_oid = ?`, [callback.merchant_oid])

  if (!record) {
    return res.send("OK");
  }

  if (record.success) {
    // Aynı sipariş için birden fazla bildirim ulaşabilir (Ağ bağlantı sorunları vb. nedeniyle).
    console.log("---------> FAILED - already approved");
    return res.send("OK");
  }

  if (record.token !== callback.hash) {
    console.log("---------> FAILED - token != callback.hash");
    console.log("---------> callback.hash: ", callback.hash);
    console.log("---------> record.token: ", record.token);

    await prisma.planPayment.update({
      where: { merchant_oid: callback.merchant_oid },
      data: {
        errorReason: "BAD_HASH",
        success: false,
      },
    });

    return res.send("OK");
  }

  if (callback.status === "success") {
    // basarili
    console.log("-------> callback.status == success");

    const nowDate = dayjs(new Date());
    const months = record.annual ? 12 : 1;
    const validTill = nowDate.add(months, "month").toDate();

    console.log({ validTill });

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
    /// basarisiz
    console.log("-------> callback.status !== success - basarisiz");

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
