import { createCipheriv, createDecipheriv } from "crypto";

const ALGORITHM = "aes-256-cbc";
const ENCODING = "utf8";
const DEFAULT_INITIALIZATION_VECTOR = "0";
const DEFAULT_SYMMETRIC_KEY = "d6F3Efeq";

/* 
used for encrypting confidential data 
*/

export function encrypt(
  value: string,
  key = DEFAULT_SYMMETRIC_KEY,
  iv = DEFAULT_INITIALIZATION_VECTOR
) {
  const cipher = createCipheriv(ALGORITHM, key, iv);
  let crypted = "" // cipher.update(value, ENCODING, "base64");
  crypted += cipher.final("base64");
  return crypted;
}

export function decrypt(
  value: string,
  key = DEFAULT_SYMMETRIC_KEY,
  iv = DEFAULT_INITIALIZATION_VECTOR
) {
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  let dec = "" // decipher.update(value, "base64", ENCODING);
  dec += decipher.final(ENCODING);
  return dec;
}
