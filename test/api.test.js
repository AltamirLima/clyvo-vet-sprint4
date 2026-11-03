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
  const app=await startApp({PETFLOW_API_URL:'',PETFLOW_EMAIL:'',PETFLOW_SENHA:'',PETFLOW_TOKEN:''});
  try{const r=await fetch(app.url+'/api/petflow/pets');const data=await r.json();assert.equal(r.status,503);assert.equal(data.configured,false);}finally{app.close();}
});

test('PetFlow: faz login de colaborador, lê a página e completa a espécie pela raça',async()=>{
  let logins=0;
  const fake=await listen((req,res)=>{
    const json=(status,body)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(body));};
    if(req.method==='POST'&&req.url==='/api/auth/login'){logins++;return json(200,{accessToken:'token-'+logins,tipo:'COLABORADOR'});}
    if(req.headers.authorization!=='Bearer token-1') return json(401,{title:'Unauthorized'});
    if(req.url.startsWith('/api/racas')) return json(200,{content:[{id:10,nome:'Siamês',especieNome:'FELINA'},{id:20,nome:'Labrador',especieNome:'CANINA'}]});
    if(req.url.startsWith('/api/pets')) return json(200,{content:[{id:1,nome:'Mia',racaId:10,racaNome:'Siamês',porte:'PEQUENO',dtNascimento:'2022-03-15',tutorNome:'Maria'},{id:2,nome:'Bob',racaId:20,racaNome:'Labrador',porte:'GIGANTE',dtNascimento:'2019-01-01',tutorNome:'João'}],totalElements:2});
    json(404,{});
  });
  const app=await startApp({PETFLOW_API_URL:fake.url,PETFLOW_EMAIL:'master@clyvovet.com',PETFLOW_SENHA:'teste',PETFLOW_TOKEN:''});
  try{
    const r=await fetch(app.url+'/api/petflow/pets');const body=await r.json();
    assert.equal(r.status,200);
    assert.equal(body.data.length,2);
    assert.equal(body.data[0].especie,'FELINO');
    assert.equal(body.data[1].especie,'CANINO');
    assert.equal(logins,1,'um único login, reaproveitado nas duas chamadas');
  }finally{app.close();fake.server.close();}
});
