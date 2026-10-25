const {SYSTEM,validate,allow}=require('../server/mark-ett.cjs');
module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 const send=(status,body)=>res.status(status).json(body);
 if(req.method!=='POST'){res.setHeader('Allow','POST');return send(405,{error:'Use POST'});}
 const origin=req.headers.origin;
 if(!['https://www.industryarmymarketing.com','https://industryarmymarketing.com'].includes(origin))return send(403,{error:'Please open the chat on IAM.'});
 if(!String(req.headers['content-type']||'').includes('application/json'))return send(415,{error:'Use JSON'});
 if(Number(req.headers['content-length']||0)>18000)return send(413,{error:'Message is too long.'});
 let messages;
 try {messages=validate(typeof req.body==='string'?JSON.parse(req.body):req.body);}catch{return send(400,{error:'Please shorten the conversation or start a new chat.'});}
 if(!allow(req.headers['x-vercel-forwarded-for']||req.headers['x-forwarded-for']||req.socket?.remoteAddress)){res.setHeader('Retry-After','600');return send(429,{error:'Please wait a few minutes before asking more questions. You can also contact Colin directly.'});}
 const key=process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_OIDC_TOKEN;
 if(!key)return send(503,{error:'Mark Ett is temporarily unavailable. Please use the IAM contact form.'});
 try {
  const response=await fetch('https://ai-gateway.vercel.sh/v1/chat/completions',{method:'POST',signal:AbortSignal.timeout(22000),headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.MARK_ETT_MODEL||'google/gemini-2.5-flash',max_tokens:1200,messages:[{role:'system',content:SYSTEM},...messages]})});
  if(!response.ok){console.error('mark_ett_gateway_status',response.status);return send(503,{error:'Mark Ett could not reach the AI service. Please try again or contact IAM.'});}
  const data=await response.json();const reply=data.choices?.[0]?.message?.content?.trim();
  if(!reply)return send(503,{error:'No reply was returned. Please try again.'});
  return send(200,{reply});
 }catch{console.error('mark_ett_request_failed');return send(503,{error:'Mark Ett is taking too long. Please try again or use the IAM contact form.'});}
};
