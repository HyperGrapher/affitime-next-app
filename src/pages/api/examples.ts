import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "../../server/db/client";
import requestIp from "request-ip";
import { getServerAuthSession } from "../../server/common/get-server-auth-session";

const examples = async (req: NextApiRequest, res: NextApiResponse) => {
  const reqip = requestIp.getClientIp(req);
  const session = await getServerAuthSession({ req, res });
  const examples = await prisma.user.findMany();

  if (session) {
    return res.status(200).json({ reqip, examples, session });
  }

  res.status(200).json({ reqip, session });
};

export default examples;
