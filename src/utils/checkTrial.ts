import dayjs from "dayjs";
import type { Session } from "next-auth";
import { appPaymentRequiredTypes } from "../config/constants";
import { prisma } from "../server/db/client";

export const checkTrial = async (session: Session) => {
  const { id } = session;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      createdAt: true,
      trialTill: true,
      validFrom: true,
      validTill: true,
      trial: true,
      pro: true,
      packageType: true,
    },
  });

  const trialTill = dayjs(user?.trialTill);
  const nowDate = dayjs(new Date());
  const trialDiff = trialTill.diff(nowDate, "second");

  if (user?.trial) {

    if (trialDiff < 0) {

      return {
        type: appPaymentRequiredTypes.END_OF_TRIAL,
        paymentRequired: true,
        packageType: user.packageType,
      };
    } else {
      return {
        type: appPaymentRequiredTypes.NONE,
        paymentRequired: false,
        packageType: user.packageType,
      };
    }
  } 

  const validTill = dayjs(user?.validTill);

  const validDiff = validTill.diff(nowDate, "second");

  if (user?.pro) {
    if (validDiff < 0) {
      return {
        type: appPaymentRequiredTypes.END_OF_PLAN,
        paymentRequired: true,
        packageType: user.packageType,
      };
    } else {
      return {
        type: appPaymentRequiredTypes.NONE,
        paymentRequired: false,
        packageType: user.packageType,
      };
    }
  } else {
    return {
      type: appPaymentRequiredTypes.UNKNOWN,
      paymentRequired: true,
      packageType: user?.packageType,
    };
  }
};
