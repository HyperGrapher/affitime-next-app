import dayjs from "dayjs";
import type { Session } from "next-auth";
// import type { GetServerSidePropsContext, PreviewData } from "next/types";
// import type { ParsedUrlQuery } from "querystring";
import { prisma } from "../server/db/client";

export enum AppPaymentModalType {
  NONE = "none",
  REMAINING = "remains",
  END_OF_TRIAL = "end_of_trial",
  PAYMENT_REQUIRED = "payment_required_for_pro_user",
}

export interface IUserPayCheck {
  modalType: AppPaymentModalType;
  days: string;
}

/*
modal type IPaymentModal: 
"remaining trial days" if < 7, 
"trial ended" if < 0, 
"payment required" if pro and overdue payment days


*/

// Return true if not pro end trial is
export const checkTrial = async (
  //   context: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>,
  session: Session
): Promise<boolean> => {
  const { id } = session;
  const user = await prisma.user.findUnique({ where: { id } });

  // trial: true,
  // pro: false,

  // const regDate = user?.createdAt // 2023-01-22T20:31:18.204Z

  const regDate = dayjs(user?.createdAt);
  const nowDate = dayjs(new Date());

  const diff = regDate.diff(nowDate, "day");

  console.log(Math.abs(diff));

  // ! WARN This is not checking all possible states.
  // ! ex: pro is still pro if payment is overdue
  if (user?.trial && !user.pro) {
    if (Math.abs(diff) > 14) {
      console.log("Trial is ended");

      // const modal = {
      //   modalType: AppPaymentModalType.END_OF_TRIAL,
      //   days: String(Math.abs(diff))
      // } as IUserPayCheck

      return true;
    }

    // const modal = {
    //   modalType: Math.abs(diff) > 10 ? AppPaymentModalType.REMAINING : AppPaymentModalType.NONE,
    //   days: String(Math.abs(diff))
    // } as IUserPayCheck

    console.log("User is still on trial");
    return false;
  }

  // const modal = {
  //   modalType: AppPaymentModalType.REMAINING,
  //   days: String(Math.abs(diff))
  // } as IUserPayCheck

  console.log("Not Trial And User is Pro");
  return false;
};
