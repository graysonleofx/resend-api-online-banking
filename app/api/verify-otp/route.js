import { otpStore } from "../send-otp/route";

export async function POST(req) {
  const {email, otp} = await req.json();

  const record = otpStore[email]

  if(!record) {
    return Response.json({ success: false, message: 'OTP not found or expired' }, { status: 400 });
  }

  if(Date.now() - record.createAt > 5 * 60 * 1000){
    delete otpStore[email];
    return Response.json({ success: false, message: "OTP expired" }, { status: 400 });
  }

   if (record.otp === otp) {
    delete otpStore[email];
    return Response.json({ success: true });
  }
  return Response.json({ success: false, message: "Invalid OTP" }, { status: 401 });
}