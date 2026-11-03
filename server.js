const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

loadEnvFile();
const ROOT = __dirname;
const PORT = Number(process.env.PORT || 3000);
const API_BASE = (process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta').replace(/\/$/, '');
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
const API_KEY = process.env.GEMINI_API_KEY || '';
const MIME = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.json':'application/json; charset=utf-8','.md':'text/markdown; charset=utf-8','.png':'image/png','.jpg':'image/jpeg'};

function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (match && !Object.prototype.hasOwnProperty.call(process.env, match[1])) {
      process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    }
  }
}
function send(res, status, body) {
  res.writeHead(status, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
  res.end(JSON.stringify(body));
}
function readBody(req, limit=12000) {
  return new Promise((resolve,reject)=>{
    let data='';
    req.on('data',chunk=>{data+=chunk;if(data.length>limit){reject(new Error('A solicitação excedeu o limite permitido.'));req.destroy();}});
    req.on('end',()=>{try{resolve(JSON.parse(data||'{}'));}catch{reject(new Error('JSON inválido.'));}});
    req.on('error',reject);
  });
}
const allowedEvents = ['ROTINA','VACINA','VERMIFUGO','ODONTO','CRONICA','PESO','DERMATO','POS_ATENDIMENTO','GERIATRICO','FELINO'];

async function callGemini(payload) {
  const url=API_BASE+'/models/'+encodeURIComponent(MODEL)+':generateContent';
  for(let attempt=1;attempt<=3;attempt++){
    let response;
    try{
      response=await fetch(url,{method:'POST',headers:{'x-goog-api-key':API_KEY,'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(30000)});
    }catch(e){
      if((e.name==='TimeoutError'||e.name==='AbortError')&&attempt<3) continue;
      throw e;
    }
    if((response.status===429||response.status===503)&&attempt<3){
      await new Promise(resolve=>setTimeout(resolve,attempt*1000));
      continue;
    }
    return response;
  }
}
function geminiError(status){
  const messages={
    400:'A API recusou a solicitação. Confira os dados enviados.',
    401:'A chave da API não foi reconhecida. Confira GEMINI_API_KEY.',
    403:'A chave não tem permissão para acessar este serviço.',
    404:'O modelo configurado não está disponível. Confira GEMINI_MODEL no arquivo .env.',
    429:'Limite de uso da API atingido. Aguarde um pouco e tente novamente.',
    503:'O serviço de IA está com alta demanda. Tente novamente em alguns instantes.'
  };
  return messages[status]||'A API de IA recusou a solicitação. Código: '+status+'.';
}

async function interpret(req,res) {
  if (!API_KEY || API_KEY === 'coloque_sua_chave_aqui') return send(res,503,{error:'Gemini não configurado. Copie .env.example para .env e informe GEMINI_API_KEY.'});
  let body;
  try { body=await readBody(req); } catch(e) { return send(res,400,{error:e.message}); }
  const message=String(body.message||'').trim();
  if (!message || message.length>1200) return send(res,400,{error:'A mensagem é obrigatória e deve ter até 1.200 caracteres.'});
  const pet=body.pet && typeof body.pet==='object' ? body.pet : {};
  const safePet={name:String(pet.name||'Pet').slice(0,80),species:pet.species==='FELINO'?'FELINO':'CANINO',breed:String(pet.breed||'Não informado').slice(0,80),age:Math.max(0,Math.min(40,Number(pet.age)||0)),size:String(pet.size||'Não informado').slice(0,20),event:allowedEvents.includes(pet.event)?pet.event:'ROTINA',dental:Boolean(pet.dental),chronic:Boolean(pet.chronic)};
  const system = 'Você é o componente de interpretação de intenção do CLYVO VET. Não diagnostique, não prescreva, não recomende medicamentos e não dê opinião clínica. Se a mensagem descrever sintomas, urgência, dor, piora ou dúvida clínica, marque needsVet=true e oriente procurar um veterinário; em emergência, procurar atendimento veterinário imediatamente. Nunca invente datas ou dados do histórico. Sua tarefa é classificar a intenção para organizar acompanhamento administrativo/preventivo. Retorne APENAS JSON válido com campos: intent (string curta), intentLabel (string em português), summary (resumo neutro em português), suggestedEvent (um destes códigos: ROTINA,VACINA,VERMIFUGO,ODONTO,CRONICA,PESO,DERMATO,POS_ATENDIMENTO,GERIATRICO,FELINO), needsVet (boolean), response (resposta curta e segura em português). Se não houver contexto suficiente, use ROTINA e peça confirmação.';
  const user = JSON.stringify({mensagemDoTutor:message,contextoPet:safePet,objetivo:'Classificar a intenção e sugerir categoria de acompanhamento sem inferir fatos clínicos.'});
  let apiResponse;
  try {
    apiResponse=await callGemini({systemInstruction:{parts:[{text:system}]},contents:[{role:'user',parts:[{text:user}]}],generationConfig:{temperature:0.1,responseMimeType:'application/json',maxOutputTokens:1500}});
  } catch(e) {
    console.error('[Gemini] Falha de conexão:',e.message);
    const timeout=e.name==='TimeoutError'||e.name==='AbortError';
    return send(res,timeout?504:502,{error:timeout?'A API de IA demorou demais para responder. Tente novamente.':'Não foi possível conectar à API de IA. Verifique a conexão e o endereço configurado.'});
  }
  const raw=await apiResponse.text();
  if (!apiResponse.ok) {
    console.error('[Gemini] HTTP',apiResponse.status,raw.slice(0,1000));
    return send(res,apiResponse.status===429||apiResponse.status===503?503:502,{error:geminiError(apiResponse.status),providerStatus:apiResponse.status});
  }
  let payload;
  try { payload=JSON.parse(raw); } catch { return send(res,502,{error:'A API retornou uma resposta inválida.'}); }
  const content=payload.candidates?.[0]?.content?.parts?.map(part=>part.text||'').join('');
  let result;
  try { result=JSON.parse(content); } catch { return send(res,502,{error:'A resposta do modelo não veio no formato JSON esperado.'}); }
  const suggestedEvent=allowedEvents.includes(result.suggestedEvent)?result.suggestedEvent:'ROTINA';
  return send(res,200,{intent:String(result.intent||'acompanhamento').slice(0,80),intentLabel:String(result.intentLabel||'Acompanhamento do pet').slice(0,120),summary:String(result.summary||'').slice(0,500),suggestedEvent,needsVet:Boolean(result.needsVet),response:String(result.response||'Confirme as informações com a clínica.').slice(0,700),model:MODEL,provider:'Google Gemini API'});
}
function serveStatic(req,res) {
  let urlPath;
  try { urlPath=decodeURIComponent(new URL(req.url,'http://localhost').pathname); }
  catch { res.writeHead(400); return res.end('URL inválida.'); }
  const requested=urlPath==='/'?'/index.html':urlPath;
  const normalized=requested.replace(/\\/g,'/');
  const isIndex=normalized==='/index.html';
  const isAsset=normalized.startsWith('/assets/') && !normalized.split('/').some(part=>part.startsWith('.')||part==='..');
  if (!isIndex && !isAsset) {res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});return res.end('Arquivo não encontrado.');}
  const filePath=path.resolve(ROOT,'.'+normalized);
  if (!filePath.startsWith(path.join(ROOT,'assets')+path.sep) && !isIndex) {res.writeHead(404);return res.end('Arquivo não encontrado.');}
  fs.readFile(filePath,(err,content)=>{
    if(err){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});return res.end('Arquivo não encontrado.');}
    res.writeHead(200,{'Content-Type':MIME[path.extname(filePath)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});
    res.end(content);
  });
}
async function petflowPets(req,res){
  const base=(process.env.PETFLOW_API_URL||'').replace(/\/$/,'');
  const token=process.env.PETFLOW_TOKEN||'';
  if(!base||!token) return send(res,503,{configured:false,error:'Integração PetFlow não configurada. Defina PETFLOW_API_URL e PETFLOW_TOKEN no .env.'});
  try{
    const upstream=await fetch(base+'/api/pets',{headers:{Authorization:'Bearer '+token,Accept:'application/json'},signal:AbortSignal.timeout(15000)});
    const raw=await upstream.text();
    if(!upstream.ok){console.error('[PetFlow] HTTP',upstream.status,raw.slice(0,500));return send(res,upstream.status===401||upstream.status===403?502:503,{configured:true,error:'Não foi possível consultar os pets no PetFlow. Verifique o acesso de colaborador.'});}
    let data;try{data=JSON.parse(raw)}catch{return send(res,502,{configured:true,error:'A API PetFlow retornou dados inválidos.'});}
    return send(res,200,{configured:true,source:'PetFlow API',data});
  }catch(e){console.error('[PetFlow]',e.message);return send(res,504,{configured:true,error:'A API PetFlow não respondeu dentro do tempo esperado.'});}
}
http.createServer((req,res)=>{
  if(req.method==='GET'&&req.url==='/api/health') return send(res,200,{status:'online',aiConfigured:Boolean(API_KEY&&API_KEY!=='coloque_sua_chave_aqui'),model:MODEL,petflowConfigured:Boolean(process.env.PETFLOW_API_URL&&process.env.PETFLOW_TOKEN)});
  if(req.method==='GET'&&req.url==='/api/petflow/pets') return petflowPets(req,res);
  if(req.method==='POST'&&req.url==='/api/ai/interpret') return interpret(req,res);
  if(req.url.startsWith('/api/')) return send(res,404,{error:'Endpoint não encontrado.'});
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end('Método não permitido.');}
  serveStatic(req,res);
}).listen(PORT,'127.0.0.1',()=>console.log('CLYVO VET Sprint 4 em http://localhost:'+PORT));
