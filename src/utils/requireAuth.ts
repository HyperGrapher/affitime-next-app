import { getSession } from "next-auth/react";
import type { GetServerSidePropsContext, PreviewData } from "next/types";
import type { ParsedUrlQuery } from "querystring";

// Use in getServerSideProps for protected routes
const requireAuth = async (
  ctx: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cb: ({ses}: any) => unknown
) => {
  const session = await getSession(ctx);

  if (!session)
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };

  return cb({session});
};

export default requireAuth;
