import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";
import dayjs from "dayjs";
import { sendEmail } from "../../../utils/send-email";

function trialEnding(brand: string, email: string) {
  return {
    email: {
      subject: "Deneme Süren Bitmek Üzere",
      template: {
        id: 13523,
        variables: {
          brand,
          current_year: new Date().getUTCFullYear(),
        },
      },
      from: {
        name: "Affitime",
        email: "noreply@affitime.com",
      },
      to: [
        {
          email: email,
          name: brand,
        },
      ],
    },
  };
}

function trialEnded(brand: string, email: string) {
  return {
    email: {
      subject: "Deneme Süren Bitti",
      template: {
        id: 13519,
        variables: {
          brand,
          current_year: new Date().getUTCFullYear(),
        },
      },
      from: {
        name: "Affitime",
        email: "noreply@affitime.com",
      },
      to: [
        {
          email: email,
          name: brand,
        },
      ],
    },
  };
}

async function updateEmailQueue(id: number) {
  await prisma.emailQueue.update({
    where: { id },
    data: {
      sent: true,
    },
  });
}

const action = async (req: NextApiRequest, res: NextApiResponse) => {
  // await runMiddleware(req, res, cors)

  res.setHeader("Access-Control-Allow-Origin", "*");

  const mailQueue = await prisma.emailQueue.findMany({
    where: { sent: false },
    include: {
      user: {
        select: {
          vendor_username: true,
        },
      },
    },
  });

  if (mailQueue.length === 0) {
    return res.status(200).json({ error: false, message: "no email queue" });
  }

  try {
    for (const mq of mailQueue) {
      switch (mq.type) {
        case "TRIAL_ENDING_SOON":
          await sendEmail(
            trialEnding(mq.user?.vendor_username ?? "", mq.email)
          );
          await updateEmailQueue(mq.id);
          break;
        case "TRIAL_ENDED":
          await sendEmail(trialEnded(mq.user?.vendor_username ?? "", mq.email));
          await updateEmailQueue(mq.id);
          break;

        default:
          console.log("no email to send");
          break;
      }
    }
  } catch (error) {
    return res.status(501).json({
      error: true,
      message: `${mailQueue.length} mails cannot be sent`,
      cause: error,
    });
  }

  return res
    .status(200)
    .json({ error: false, message: `${mailQueue.length} mails sent` });
};

export default action;
