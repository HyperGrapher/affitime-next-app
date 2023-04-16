import dayjs from "dayjs";
import type { Session } from "next-auth";
import { appPaymentRequiredTypes } from "../config/constants";
import { prisma } from "../server/db/client";

export const checkUserStatus = async (session: Session) => {
  const { id } = session;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      createdAt: true,
      validTill: true,
      trial: true,
      pro: true,
      packageType: true,
    },
  });

  if (user?.trial || user?.pro) {
    return {
      type: appPaymentRequiredTypes.NONE,
      paymentRequired: false,
      packageType: user.packageType,
    };
  }

  if (user?.pro === false && user?.trial === false) {
    if (!user.validTill) {
      return {
        type: appPaymentRequiredTypes.END_OF_TRIAL,
        paymentRequired: true,
        packageType: user.packageType,
      };
    }

    return {
      type: appPaymentRequiredTypes.END_OF_PLAN,
      paymentRequired: true,
      packageType: user.packageType,
    };
  }

  
  return {
    type: appPaymentRequiredTypes.UNKNOWN,
    paymentRequired: true,
    packageType: user?.packageType,
  };
};

async function checkTrialPrev(session: Session) {
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

  const trialTill = dayjs(user?.trialTill); // can be different for every user, so its much better
  const nowDate = dayjs(new Date());

  const trialDiff = trialTill.diff(nowDate, "second");
  const c = new Date();
  console.log(
    "Trialdiff",
    trialDiff,
    "nowDate: ",
    nowDate.toDate(),
    "dateObj: ",
    c
  );

  if (user?.trial) {
    console.log("User is in Trial", trialDiff);
    if (trialDiff < 0) {
      console.log("But Trial is ended");
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
  } else {
    console.log("User is not in Trial");
  }

  const validTill = dayjs(user?.validTill);

  const validDiff = validTill.diff(nowDate, "second");

  if (user?.pro) {
    // check for packages and allowence
    console.log("User has a PLAN", validDiff);
    if (validDiff < 0) {
      console.log("But PLAN is ended");
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
    console.log("This shouldnt be seen");
    return {
      type: appPaymentRequiredTypes.UNKNOWN,
      paymentRequired: true,
      packageType: user?.packageType,
    };
  }
}
