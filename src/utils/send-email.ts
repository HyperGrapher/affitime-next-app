
import axios from "axios";
import { sendPulseCreds } from "../config/constants";
import type { PulseTokenReturnType } from "../interface/email.interface";

export async function sendEmail(withTemplate: object) {
    const pulseToken = await axios.request<PulseTokenReturnType>({
      method: "post",
      url: "https://api.sendpulse.com/oauth/access_token",
      data: sendPulseCreds,
    });
  
    const resp = await axios.post(
      "https://api.sendpulse.com/smtp/emails",
      withTemplate,
      {
        headers: {
          Authorization: `Bearer ${pulseToken.data.access_token}`,
          "Content-type": "application/json",
        },
      }
    );
    
    return resp;
  }