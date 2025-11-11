// import { NextResponse } from 'next/server';
// import { Resend } from 'resend';
// import Cors from 'cors';
// const resend = new Resend(process.env.RESEND_API_KEY);

// export const runtime = 'edge';

// export async function OPTIONS() {
//   const headers = {
//     'Access-Control-Allow-Origin': '*',
//     'Access-Control-Allow-Methods': 'POST, OPTIONS',
//     'Access-Control-Allow-Headers': 'Content-Type',
//   };
//   return NextResponse.json({}, { headers, status: 200 });
// }

// let otpStore = {};

// export async function POST(req) {
//   try {
//     // Destructure the necessary fields from the request
//     const { email, otp } = await req.json();

//     otpStore[email] = {
//       otp,
//       createdAt: Date.now(),
//     }

//     // Send the email using Resend
//     const data = await resend.emails.send({
//       from: 'no-reply@federaledgefinance.com',
//       to: email,
//       subject: `Verification Code`,
//       html: `
//         <div style="background:#f6f6f6;padding:0;margin:0; width:100%; font-family:Arial,sans-serif;">
//         <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f6;padding:0;margin:0;">
//         <tr>
//           <td align="center">
//           <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.05);margin:40px 0;">
//             <tr>
//             <td style="padding:32px 32px 16px 32px;text-align:center;">
//               <!-- Logo Placeholder -->
//               <img src="https://via.placeholder.com/120x40?text=Logo" alt="Federal Edge Finance" style="display:block;margin:0 auto 16px auto;max-width:120px;">
//               <h2 style="font-family:Arial,sans-serif;color:#222;font-size:24px;margin:0 0 8px 0;">Federal Edge Finance</h2>
//               <p style="font-family:Arial,sans-serif;color:#555;font-size:16px;margin:0 0 24px 0;">Your OTP Code is:</p>
//               <div style="font-family:Arial,sans-serif;color:#222;font-size:32px;font-weight:bold;margin:16px 0;padding:12px 0;border:2px dashed #F97316;display:inline-block;width:120px;text-align:center;letter-spacing:4px;">
//                 ${otp}
//               </div>
//             </td>
//             </tr>
//             <tr>
//             <td style="padding:0 32px 32px 32px;text-align:center;">
//               <p style="font-family:Arial,sans-serif;color:#aaa;font-size:12px;margin:24px 0 0 0;">&copy; ${new Date().getFullYear()} Federal Edge Finance. All rights reserved.</p>
//             </td>
//             </tr>
//           </table>
//           </td>
//         </tr>
//         </table>
//       </div>
//       `,
//     });

//     return NextResponse.json({ success: true, data, message: 'OTP email sent successfully' }, { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } });
//   } catch (error) {
//     console.error('Failed to send OTP email:', error.message);
//     return NextResponse.json({ success: false, message: 'Failed to send OTP email' }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
//   }
// } 

// export { otpStore };




import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const runtime = 'edge';

// ✅ Global OTP Store
// Works only when SAME SERVER handles send + verify
export let otpStore = {};

export async function OPTIONS() {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  return NextResponse.json({}, { headers, status: 200 });
}

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // ✅ Backend generates OTP (NOT the frontend)
    const otp = Math.floor(100000 + Math.random() * 900000);

    // ✅ Store OTP in memory
    otpStore[email] = {
      otp,
      createdAt: Date.now(),
    };

    // ✅ Send email via Resend
    const data = await resend.emails.send({
      from: 'no-reply@federaledgefinance.com',
      to: email,
      subject: 'Verification Code',
      html: `
        <div style="font-family:Arial,sans-serif;">
          <h2>Your Verification Code</h2>
          <p>Your OTP code is:</p>
          <h1 style="letter-spacing:4px;">${otp}</h1>
        </div>
      `,
    });

    console.log("✅ OTP generated:", otp);

    return NextResponse.json(
      {
        success: true,
        message: "OTP email sent successfully",
        // ✅ keep this during development; remove in production
        debugOtp: otp,
      },
      { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } }
    );

  } catch (error) {
    console.error("❌ Failed to send OTP:", error);
    return NextResponse.json(
      { success: false, message: 'Failed to send OTP email' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
