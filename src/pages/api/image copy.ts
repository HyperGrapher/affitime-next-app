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
  userId: string,
  role: string
): Promise<{
  fields: formidable.Fields;
  files: formidable.Files;
  newFilename: string;
}> => {
  const opt: formidable.Options = {};
  let newFilename = "";

  // TODO create uploadFolder var
  if (saveLocally) {
    const parent = path.dirname(process.cwd()).split("/").pop();

    if (!parent) return Promise.reject(new Error("parent fail"));

    const existingFiles = await fs.readdir(
      path.join(parent, "app-images", "avatars")
    );
    const existingFile = existingFiles.filter((fn) => fn.startsWith(userId))[0];

    if (existingFile) {
      await fs.unlink(path.join(parent, "app-images", "avatars", existingFile));
    }

    console.log(path.join(parent, "app-images", "avatars"), "---------- JOIN");
    

    opt.uploadDir = path.join(parent, "app-images", "avatars");
    opt.filename = (name, ext, path, form) => {
      const originalFilename = path.originalFilename ?? "";

      if (!originalFilename) Promise.reject(new Error("fail"));

      const extension =
        originalFilename.substring(
          originalFilename.lastIndexOf(".") + 1,
          originalFilename.length
        ) || originalFilename;

      if (!allowedExts.includes(extension))
        Promise.reject(new Error("ext fail"));
      const randStr = crypto.randomBytes(6).toString("base64url");

      const filenameWithExt = `${userId}-${role
        .substring(0, 3)
        .toLocaleLowerCase()}-${randStr}.${extension}`;
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

  const parent = path.dirname(process.cwd()).split("/").pop() ?? "@@@@";
  await fs.mkdir(path.join(parent, "app-images", "avatars"));
  console.log({parent});
  
  try {
    await fs.readdir(path.join(parent, "app-images", "avatars"));
  } catch (error) {
    console.log('__CREATING__');
    console.log(path.join(parent, "app-images", "avatars"), "<---------- JOIN");
    await fs.mkdir(path.join(parent, "app-images", "avatars"));
  }

  try {
    const result = await handleFileUpload(req, true, user.id, user.role);
    console.log(result.newFilename);

    await prisma.user.update({
      where: {
        id: session.id,
      },
      data: {
        image: `${result.newFilename}`,
      },
    });

    res.status(200).json({
      error: false,
      message: "success",
      path: `${result.newFilename}`,
    });
  } catch (error) {
    console.log("-----------> error");
    console.log(error);
    res
      .status(501)
      .json({ error: true, message: "failed during file operation" });
  }
};

export default handler;
