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




// import { NextResponse } from 'next/server';
// import { otpStore } from "../send-otp/route";

// export const runtime = 'edge';

// export async function OPTIONS() {
//   const headers = {
//     'Access-Control-Allow-Origin': '*',
//     'Access-Control-Allow-Methods': 'POST, OPTIONS',
//     'Access-Control-Allow-Headers': 'Content-Type',
//   };
//   return NextResponse.json({}, { status: 200, headers });
// }

// export async function POST(req) {
//   try {
//     const { email, otp } = await req.json();

//     if (!email || !otp) {
//       return NextResponse.json(
//         { success: false, message: 'Email and OTP are required' },
//         { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
//       );
//     }

//     // const record = otpStore[email];
//     const record = await db.otp.findUnique({ where: { email } })


//     // if (!record) {
//     //   return NextResponse.json(
//     //     { success: false, message: 'OTP not found or expired' },
//     //     { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
//     //   );
//     // }
//     if (!record) return res.status(400).json({ success: false, message: 'OTP not found' })


//     // ✅ check expiration
//     // if (Date.now() - record.createdAt > 5 * 60 * 1000) {
//     //   delete otpStore[email];
//     //   return NextResponse.json(
//     //     { success: false, message: 'OTP expired' },
//     //     { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
//     //   );
//     // }
//     if (record.expiresAt < Date.now()) return res.status(400).json({ success: false, message: 'OTP expired' })


//     // ✅ match OTP
//     if (record.otp === otp) {
//       delete otpStore[email];
//       return NextResponse.json(
//         { success: true, message: 'OTP verified successfully' },
//         { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } }
//       );
//     }

//     // ❌ wrong OTP
//     // return NextResponse.json(
//     //   { success: false, message: 'Invalid OTP' },
//     //   { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } }
//     // );
//     if (record.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP' })


//   } catch (error) {
//     console.error("OTP Verification Error:", error.message);
//     return NextResponse.json(
//       { success: false, message: 'Invalid request body' },
//       { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
//     );
//   }
// }


import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ✅ Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ✅ Must use Node runtime (Edge does not support Supabase SDK fully)
export const runtime = 'nodejs';

export async function OPTIONS() {
  const headers = {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
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

    // 🔹 Fetch OTP record from Supabase
    const { data: record, error: fetchError } = await supabase
      .from('otp')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error('❌ Fetch error:', fetchError);
      throw new Error('Database fetch failed');
    }

    if (!record) {
      return NextResponse.json(
        { success: false, message: 'OTP not found or expired' },
        { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // 🔹 Check expiration
    const now = new Date();
    const expiresAt = new Date(record.expires_at);
    if (expiresAt < now) {
      // delete expired OTP
      await supabase.from('otp').delete().eq('email', email);
      return NextResponse.json(
        { success: false, message: 'OTP expired' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // 🔹 Validate OTP
    if (String(record.otp) !== String(otp)) {
      return NextResponse.json(
        { success: false, message: 'Invalid OTP' },
        { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // ✅ OTP verified — delete it (one-time use)
    await supabase.from('otp').delete().eq('email', email);

    return NextResponse.json(
      { success: true, message: 'OTP verified successfully' },
      { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (error) {
    console.error('❌ OTP Verification Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
