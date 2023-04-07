import bcrypt from "bcrypt";

export const comparePassword = async (
  incomingPassword: string,
  dbPassword: string
): Promise<boolean> => {
  return bcrypt
    .compare(incomingPassword, dbPassword)
    .then((res) => {
      return res;
    })
    .catch((e) => {

      console.log(e);
      return false;
    });
};
