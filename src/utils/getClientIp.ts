import axios from "axios"

const getClientIp = async () => {
    const res = await axios("https://ipapi.co/json/")
    return await res.data
  }

export default getClientIp