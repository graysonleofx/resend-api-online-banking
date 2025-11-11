// import { NextResponse } from 'next/server';
// import { otpStore } from "../send-otp/route";

// export const runtime = 'edge';

// export async function OPTIONS() {
//   const headers = {
//     'Access-Control-Allow-Origin': '*',
//     'Access-Control-Allow-Methods': 'POST, OPTIONS',
//     'Access-Control-Allow-Headers': 'Content-Type',
//   };
//   return NextResponse.json({}, { headers, status: 200 });
// }

// export async function POST(req) {
//  try {
//   const {email, otp} = await req.json();

//   const record = otpStore[email]

//   if(!record) {
//     return Response.json({ success: false, message: 'OTP not found or expired' }, { status: 400, headers: {'Access-Control-Allow-Origin': '*'} });
//   }

//   if(Date.now() - record.createdAt > 5 * 60 * 1000){
//     delete otpStore[email];
//     return Response.json({ success: false, message: "OTP expired" }, { status: 400, headers: {'Access-Control-Allow-Origin': '*'} });
//   }

//    if (record.otp === otp) {
//     delete otpStore[email];
//     return Response.json({ success: true, headers: {'Access-Control-Allow-Origin': '*'} });
//   }
//   return Response.json({ success: false, message: "Invalid OTP" }, { status: 401, headers: {'Access-Control-Allow-Origin': '*'} });

//   } catch (error) {
//   console.error('Error verifying OTP:', error);
//   return Response.json({ success: false, message: "Internal Server Error" }, { status: 500, headers: {'Access-Control-Allow-Origin': '*'} });
//   }
// }

import { NextResponse } from 'next/server';
import { otpStore } from "../send-otp/route";

export const runtime = 'edge';

export async function OPTIONS() {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  return NextResponse.json({}, { status: 200, headers });
}

export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: 'Email and OTP are required' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const record = otpStore[email];

    if (!record) {
      return NextResponse.json(
        { success: false, message: 'OTP not found or expired' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // ✅ check expiration
    if (Date.now() - record.createdAt > 5 * 60 * 1000) {
      delete otpStore[email];
      return NextResponse.json(
        { success: false, message: 'OTP expired' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // ✅ match OTP
    if (record.otp === otp) {
      delete otpStore[email];
      return NextResponse.json(
        { success: true, message: 'OTP verified successfully' },
        { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // ❌ wrong OTP
    return NextResponse.json(
      { success: false, message: 'Invalid OTP' },
      { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } }
    );

  } catch (error) {
    console.error("OTP Verification Error:", error.message);
    return NextResponse.json(
      { success: false, message: 'Invalid request body' },
      { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
