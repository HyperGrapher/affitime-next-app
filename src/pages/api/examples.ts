import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "../../server/db/client";
import requestIp from 'request-ip'

const examples = async (req: NextApiRequest, res: NextApiResponse) => {
  
  const detectedIp = requestIp.getClientIp(req)

  const examples = await prisma.user.findMany();
  res.status(200).json({detectedIp});
};

export default examples;
