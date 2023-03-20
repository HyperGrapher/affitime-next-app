import dayjs from "dayjs";
import type { Session } from "next-auth";
import { appPaymentRequiredTypes } from "../config/constants";
import { prisma } from "../server/db/client";

// ? turn into middleware
// ! turn into general package checker
export const checkTrial = async (
  //   context: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>,
  session: Session
) /* : Promise<IUserPlanCheck> */ => {
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

  console.log("checkTrials user: ", user);
  // ! make sql schedule to change values for this to work

  const trialTill = dayjs(user?.trialTill); // can be different for every user, so its much better
  const nowDate = dayjs(new Date());

  const trialDiff = trialTill.diff(nowDate, "second");
  const c = new Date()
  console.log("Trialdiff", trialDiff, "nowDate: ", nowDate.toDate(), "dateObj: ", c);

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

  // ! WARN This is not checking all possible states.
  // ! ex: pro is still pro if payment is overdue
  // if (user?.trial && !user.pro) {
  //   if (Math.abs(creationDiff) > 14) {
  //     console.log("Trial is ended");

  // const modal = {
  //   modalType: AppPaymentModalType.END_OF_TRIAL,
  //   days: String(Math.abs(diff))
  // } as IUserPayCheck

  //     return true;
  //   }

  // const modal = {
  //   modalType: Math.abs(diff) > 10 ? AppPaymentModalType.REMAINING : AppPaymentModalType.NONE,
  //   days: String(Math.abs(diff))
  // } as IUserPayCheck

  //   console.log("User is still on trial");
  //   return false;
  // }

  // const modal = {
  //   modalType: AppPaymentModalType.REMAINING,
  //   days: String(Math.abs(diff))
  // } as IUserPayCheck
};
