import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "../../server/db/client";
import { getServerAuthSession } from "../../server/common/get-server-auth-session";
import formidable from "formidable";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

export const config = {
  api: {
    bodyParser: false,
  },
};
const allowedExts = ["jpeg", "jpg", "png", "webp"];
const handleFileUpload = async (
  req: NextApiRequest,
  saveLocally: boolean,
  userId: string
): Promise<{
  fields: formidable.Fields;
  files: formidable.Files;
  newFilename: string;
}> => {
  const opt: formidable.Options = {};
  let newFilename = "";
  if (saveLocally) {
    const existingFiles = await fs.readdir(
      path.join(process.cwd() + "/public" + "/avatars")
    );
    const existingFile = existingFiles.filter((fn) => fn.startsWith(userId))[0];

    if (existingFile) {
      await fs.unlink(
        path.join(process.cwd() + "/public" + "/avatars", existingFile)
      );
    }

    opt.uploadDir = path.join(process.cwd(), "/public/avatars");
    opt.filename = (name, ext, path, form) => {
      const filename = path.originalFilename ?? "";

      if (!filename) Promise.reject(new Error("fail"));

      const extension =
        filename.substring(filename.lastIndexOf(".") + 1, filename.length) ||
        filename;

      if (!allowedExts.includes(extension))
        Promise.reject(new Error("ext fail"));
        const rand = crypto.randomBytes(6).toString("base64url");


      const filenameWithExt = `${userId}-${rand}.${extension}`;
      newFilename = filenameWithExt;
      return filenameWithExt;
    };
  }

  const form = formidable(opt);

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files, newFilename });
    });
  });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerAuthSession({ req, res });
  const user = await prisma.user.findUnique({
    where: {
      id: session?.id,
    },
  });

  if (!session) {
    return res.status(403).json({ error: true, message: "No session" });
  }
  if (!user) {
    return res.status(403).json({ error: true, message: "No user" });
  }

  try {
    await fs.readdir(path.join(process.cwd() + "/public" + "/avatars"));
  } catch (error) {
    await fs.mkdir(path.join(process.cwd() + "/public" + "/avatars"));
  }

  try {
    const result = await handleFileUpload(req, true, user.id);
    console.log(result.newFilename);

    await prisma.user.update({
      where: {
        id: session.id,
      },
      data: {
        image: `/avatars/${result.newFilename}`,
      },
    });

    res.status(200).json({ error: false, message: "success", path: `/avatars/${result.newFilename}`  });
  } catch (error) {
    console.log(error);

    res
      .status(501)
      .json({ error: true, message: "failed during file operation" });
  }
};

export default handler;
