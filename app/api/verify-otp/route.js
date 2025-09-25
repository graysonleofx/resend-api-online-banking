import { NextResponse } from 'next/server';
import { otpStore } from "../send-otp/route";

export const runtime = 'edge';

export async function OPTIONS() {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  return NextResponse.json({}, { headers, status: 200 });
}

export async function POST(req) {
  const {email, otp} = await req.json();

  const record = otpStore[email]

  if(!record) {
    return Response.json({ success: false, message: 'OTP not found or expired' }, { status: 400, headers: {'Access-Control-Allow-Origin': '*'} });
  }

  if(Date.now() - record.createAt > 5 * 60 * 1000){
    delete otpStore[email];
    return Response.json({ success: false, message: "OTP expired" }, { status: 400, headers: {'Access-Control-Allow-Origin': '*'} });
  }

   if (record.otp === otp) {
    delete otpStore[email];
    return Response.json({ success: true, headers: {'Access-Control-Allow-Origin': '*'} });
  }
  return Response.json({ success: false, message: "Invalid OTP" }, { status: 401, headers: {'Access-Control-Allow-Origin': '*'} });
}