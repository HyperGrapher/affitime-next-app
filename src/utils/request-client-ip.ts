/* eslint-disable @typescript-eslint/no-unsafe-return */
import axios from "axios"
import { IpSchema } from "../interface/zod.schema"

const getParsedClientIp = async () => {
    const res = await axios("https://ipapi.co/json/")
    return IpSchema.parse(await res.data)
  }

export default getParsedClientIp