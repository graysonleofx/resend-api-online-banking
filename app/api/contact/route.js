// Import the Resend SDK
import Cors from 'cors';
import initMiddleware from '../init-middleware';

import {Resend} from 'resend';
const resend = new Resend('process.env.RESEND_API_KEY');

const cors = initMiddleware(
  Cors({
    origin: ['http://localhost:3000/', 'https://shipwiselogistics.online/'],
    methods: ['POST', 'GET', 'OPTIONS'],
  })
)

// export default function handler(req, res) {
//   res.setHeader('Access-Control-Allow-Origin', req.headers.origin);

//   res.setHeader('Access-Control-Allow-Origin-Method', 'GET, POST, OPTIONS');

//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

//   if(req.method === 'OPTIONS'){
//     res.status(200).end();
//     return;
//   }
// }

export async function POST(req) {
  const body = await req.json();
  
  const {name, email, phone, subject, message} = body;
  try{
    const data = await resend.emails.send({
      from: email,
      to: ['contact-us@shipwidelogistics.online'],
      subject: subject || 'New Contact Message',
      html: `
        <p><strong>Name:</strong>${name} </p>
        <br>
        <p><strong>Email:</strong>${email} </p>
        <br>
        <p><strong>Phone:</strong>${phone} </p>
        <br>
        <p><strong>Message:</strong>${message} </p>
        <br>
      `
    })
    console.log('Resend Response', data);

    return new Response(JSON.stringify({success: true, data}), {
      status: 200,
      headers:{
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }catch(error){
    console.error('Contact email error', error)
    return new Response(JSON.stringify({success: false, error: 'Failed to send email'}), {
      status: 500,
      headers:{
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers:{
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Origin-Method': 'POST, OPTIONS',
      'Access-Control-Allow-Origin-Header': 'Content-Type',
    },
  })
}

export async function GET() {
  return new Response('Contact API is live', {status: 200})
}

// export async function POST(req) {
//   const body = await req.json();

//   const {name, email, phone, subject, message} = body;

//   try{
//     const data = await resend.emails.send({
//       from: email,
//       to: ['contact@pennywiselogistics.online'],
//       subject: subject,
//       html: `
//         <p><strong>Name:</strong>${name} </p>
//         <br>
//         <p><strong>Email:</strong>${email} </p>
//         <br>
//         <p><strong>Phone:</strong>${phone} </p>
//         <br>
//         <p><strong>Message:</strong>${message} </p>
//         <br>
//       `
//     })
//     console.log('Resend Response', data);

//     return Response.json({ success: true, data, message: 'Email sent successfully' });
//   }catch(error){
//     return Response.json({success: false, error: error.message}, {status: 500})
//   }
// }
