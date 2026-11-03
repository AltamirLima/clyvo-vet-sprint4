const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { spawn } = require('node:child_process');
const path = require('node:path');

async function listen(handler){
  const server=http.createServer(handler);
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  return {server,url:`http://127.0.0.1:${server.address().port}`};
}
async function startApp(extra={}){
  const port=32000+Math.floor(Math.random()*20000);
  const proc=spawn(process.execPath,[path.join(__dirname,'..','server.js')],{
    cwd:path.join(__dirname,'..'),
    env:{...process.env,PORT:String(port),GEMINI_API_KEY:'',...extra}
  });
  const url=`http://127.0.0.1:${port}`;
  let ready=false;
  for(let i=0;i<60&&!ready;i++){
    try{const r=await fetch(url+'/api/health');ready=r.ok;}catch{}
    if(!ready) await new Promise(r=>setTimeout(r,100));
  }
  if(!ready){proc.kill();throw new Error('Servidor de teste não iniciou.');}
  return {proc,url,close:()=>proc.kill()};
}
const post=(url,body)=>fetch(url+'/api/ai/interpret',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});

test('health informa modelo e estado da configuração sem expor segredo',async()=>{
  const app=await startApp({GEMINI_MODEL:'modelo-teste'});
  try{const r=await fetch(app.url+'/api/health');const data=await r.json();assert.equal(data.status,'online');assert.equal(data.model,'modelo-teste');assert.equal(data.aiConfigured,false);assert.equal(JSON.stringify(data).includes('GEMINI_API_KEY'),false);}finally{app.close();}
});
test('mensagem vazia retorna 400 antes de chamar o Gemini',async()=>{
  const app=await startApp({GEMINI_API_KEY:'teste'});
  try{const r=await post(app.url,{message:''});assert.equal(r.status,400);}finally{app.close();}
});
test('resposta válida do Gemini retorna categoria permitida',async()=>{
  const fake=await listen((req,res)=>{res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({candidates:[{content:{parts:[{text:JSON.stringify({intent:'vacina',intentLabel:'Vacinação',summary:'Acompanhamento vacinal',suggestedEvent:'VACINA',needsVet:false,response:'Confirme o calendário com a clínica.'})}]}}]}));});
  const app=await startApp({GEMINI_API_KEY:'teste',GEMINI_BASE_URL:fake.url});
  try{const r=await post(app.url,{message:'Quero organizar as vacinas'});const data=await r.json();assert.equal(r.status,200);assert.equal(data.suggestedEvent,'VACINA');assert.equal(data.needsVet,false);}finally{app.close();fake.server.close();}
});
test('erro 404 do provedor é traduzido para mensagem clara',async()=>{
  const fake=await listen((req,res)=>{res.writeHead(404,{'Content-Type':'application/json'});res.end(JSON.stringify({error:{message:'model not found'}}));});
  const app=await startApp({GEMINI_API_KEY:'teste',GEMINI_BASE_URL:fake.url});
  try{const r=await post(app.url,{message:'oi'});const data=await r.json();assert.equal(r.status,502);assert.match(data.error,/modelo configurado não está disponível/i);assert.equal(data.providerStatus,404);}finally{app.close();fake.server.close();}
});

test('PetFlow informa configuração pendente sem credenciais',async()=>{
  const app=await startApp({PETFLOW_API_URL:'',PETFLOW_TOKEN:''});
  try{const r=await fetch(app.url+'/api/petflow/pets');const data=await r.json();assert.equal(r.status,503);assert.equal(data.configured,false);}finally{app.close();}
});
