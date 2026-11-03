const defaultPets=[
{id:1,name:'Thor',emoji:'🐶',species:'CANINO',breed:'Labrador',size:'GRANDE',age:8,tutor:'Mariana Costa',status:'Acompanhamento ativo',priority:'ALTA'},
{id:2,name:'Luna',emoji:'🐱',species:'FELINO',breed:'Siamês',size:'PEQUENO',age:4,tutor:'Ricardo Alves',status:'Notificação pendente',priority:'MÉDIA'},
{id:3,name:'Mel',emoji:'🐶',species:'CANINO',breed:'Golden Retriever',size:'GRANDE',age:3,tutor:'Ana Martins',status:'Jornada concluída',priority:'NORMAL'},
{id:4,name:'Nina',emoji:'🐱',species:'FELINO',breed:'SRD',size:'MEDIO',age:7,tutor:'Lucas Santos',status:'Acompanhamento ativo',priority:'ALTA'}
];
function loadLS(k,d){try{const v=JSON.parse(localStorage.getItem(k)||'null');return v??d}catch{return d}}
let pets=loadLS('clyvoPets',defaultPets);
let analyses=loadLS('clyvoAnalyses',[]);
let journeys=loadLS('clyvoJourneys',[]);
const titles={dashboard:['Visão geral','Controle inteligente da jornada de cuidado.'],pets:['Pets cadastrados','Consulte, filtre e gerencie os pacientes.'],ia:['Demonstração da IA','Entenda como os dados geram recomendações explicáveis.'],protocols:['Protocolos','Base organizada de regras e critérios.'],architecture:['Arquitetura','Explore os componentes e integrações da solução.'],data:['Dados & IA','Origem, processamento e utilização das informações.'],journey:['Jornada','Acompanhe cada ação de cada pet.']};
const protocols=[
{id:'senior',icon:'👴',name:'Check-up geriátrico',category:'alta preventivo',when:'Idade igual ou superior a 7 anos',days:180,priority:'ALTA',why:'Pets idosos precisam de acompanhamento preventivo mais frequente.'},
{id:'vaccine',icon:'💉',name:'Vacinação anual',category:'preventivo',when:'Evento de vacinação ou ciclo anual',days:365,priority:'MÉDIA',why:'Mantém o calendário preventivo organizado.'},
{id:'deworm',icon:'🪱',name:'Vermifugação',category:'preventivo',when:'Evento de vermifugação',days:90,priority:'MÉDIA',why:'Cria acompanhamento periódico conforme o ciclo informado.'},
{id:'dental',icon:'🦷',name:'Saúde odontológica',category:'acompanhamento',when:'Necessidade odontológica registrada',days:120,priority:'MÉDIA',why:'Permite acompanhar retornos preventivos odontológicos.'},
{id:'chronic',icon:'🩺',name:'Condição crônica',category:'alta acompanhamento',when:'Condição crônica registrada',days:60,priority:'ALTA',why:'Condições recorrentes exigem acompanhamento mais próximo.'},
{id:'feline',icon:'🐱',name:'Check-up felino',category:'preventivo',when:'Felino em consulta de rotina',days:180,priority:'MÉDIA',why:'Organiza a continuidade preventiva do paciente felino.'},
{id:'weight',icon:'⚖️',name:'Controle de peso',category:'acompanhamento',when:'Avaliação de peso registrada',days:90,priority:'MÉDIA',why:'Permite acompanhar evolução e retornos periódicos.'},
{id:'derm',icon:'🧴',name:'Acompanhamento dermatológico',category:'acompanhamento',when:'Evento dermatológico registrado',days:45,priority:'MÉDIA',why:'Facilita retornos para acompanhamento de evolução.'},
{id:'post',icon:'🏥',name:'Pós-atendimento',category:'alta acompanhamento',when:'Atendimento ou procedimento registrado',days:15,priority:'ALTA',why:'Cria um retorno de acompanhamento após o evento.'},
{id:'routine',icon:'🩻',name:'Check-up preventivo',category:'preventivo',when:'Consulta de rotina sem outro protocolo prioritário',days:180,priority:'NORMAL',why:'Mantém a continuidade do cuidado preventivo.'}
];
const dataRows=[['Espécie','Cadastro do pet','Categórico','Seleciona protocolos','Personalização'],['Idade','Cadastro do pet','Numérico','Determina fase do paciente','Priorização'],['Histórico clínico','Atendimento','Registros estruturados','Contextualiza a análise','Contexto'],['Vacinas','Atendimento','Eventos e datas','Apoia prevenção','Contexto'],['Consultas','Agenda/atendimento','Evento + data + status','Acompanha continuidade','Contexto'],['Medicamentos','Atendimento','Registro estruturado','Contextualiza o paciente','Contexto'],['Comportamento','Interações','Eventos de interação','Acompanha jornada','Contexto'],['Evento','Aplicação','Tipo/status/data','Ativa regras','Contexto'],['Resposta','Jornada','Status','Acompanha adesão','Priorização']];
const journey=[
{icon:'📅',label:'ETAPA 1 DE 5',title:'Obrigação prevista',text:'O Motor Inteligente identificou um protocolo aplicável e criou uma obrigação futura.'},
{icon:'🔔',label:'ETAPA 2 DE 5',title:'Tutor notificado',text:'A obrigação é comunicada ao tutor para estimular a continuidade do cuidado.'},
{icon:'💬',label:'ETAPA 3 DE 5',title:'Resposta registrada',text:'A interação do tutor é registrada para acompanhar a evolução da jornada.'},
{icon:'🗓️',label:'ETAPA 4 DE 5',title:'Atendimento agendado',text:'A obrigação foi convertida em um agendamento para a clínica.'},
{icon:'✓',label:'ETAPA 5 DE 5',title:'Cuidado concluído',text:'O atendimento foi realizado e a jornada foi concluída.'}
];
let currentJourney=0,events=[];
function saveAll(){localStorage.setItem('clyvoPets',JSON.stringify(pets));localStorage.setItem('clyvoAnalyses',JSON.stringify(analyses));localStorage.setItem('clyvoJourneys',JSON.stringify(journeys));}
function priorityClass(p){return p==='ALTA'?'high':p==='MÉDIA'?'medium':'low'}
function go(v){document.querySelectorAll('.view').forEach(x=>x.classList.remove('show'));document.querySelectorAll('.nav').forEach(x=>x.classList.remove('active'));document.getElementById(v)?.classList.add('show');document.querySelector(`[data-view="${v}"]`)?.classList.add('active');pageTitle.textContent=titles[v][0];pageSub.textContent=titles[v][1];if(v==='journey')renderJourney();window.scrollTo({top:0,behavior:'smooth'});}
document.querySelectorAll('.nav').forEach(b=>b.onclick=()=>go(b.dataset.view));
today.textContent=new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'});
function updateCounters(){petCountNav.textContent=pets.length;kPets.textContent=pets.length;kAnalyses.textContent=analyses.length;kObligations.textContent=journeys.filter(j=>j.status!=='CUMPRIDA').length;}
function renderPreview(){petPreview.innerHTML=pets.slice(0,6).map(p=>`<article class="pet-card" onclick="showPet(${p.id})"><div class="pet-top"><div class="pet-emoji">${p.emoji}</div><span class="chip">${p.status}</span></div><h4>${escapeHtml(p.name)}</h4><p>${escapeHtml(p.breed)} • ${p.age} anos</p><div class="pet-meta"><span class="chip">${p.species}</span><span class="chip">${p.priority}</span></div></article>`).join('')}
function renderPets(){let q=(petSearch.value||'').toLowerCase().trim(),f=petFilter.value||'';let list=pets.filter(p=>(!q||`${p.name} ${p.breed} ${p.tutor} ${p.species}`.toLowerCase().includes(q))&&(!f||p.species===f));petList.innerHTML=list.map(p=>`<article class="pet-list-card"><div class="big-pet">${p.emoji}</div><div class="pet-info"><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.species)} • ${escapeHtml(p.breed)} • ${p.age} anos • Porte ${escapeHtml(p.size)}</p><div class="pet-meta"><span class="chip">${p.status}</span><span class="badge ${priorityClass(p.priority)}">${p.priority}</span></div><div class="actions"><button class="mini-btn" onclick="showPet(${p.id})">Ver dados</button><button class="mini-btn" onclick="usePetInIA(${p.id})">Analisar com IA ✦</button><button class="mini-btn danger" onclick="deletePet(${p.id})">Excluir</button></div></div></article>`).join('')||'<p>Nenhum pet encontrado com esses filtros.</p>';}
function showPet(id){let p=pets.find(x=>x.id===id);if(!p)return;let pj=journeys.filter(j=>j.petId===id),pa=analyses.filter(a=>a.petId===id);modalContent.innerHTML=`<div class="modal-profile"><div class="big-pet">${p.emoji}</div><div><span class="eyebrow">PERFIL DO PACIENTE</span><h2>${escapeHtml(p.name)}</h2><p>${escapeHtml(p.species)} • ${escapeHtml(p.breed)}</p></div></div><div class="detail-grid"><div class="detail"><small>IDADE</small><b>${p.age} anos</b></div><div class="detail"><small>PORTE</small><b>${p.size}</b></div><div class="detail"><small>TUTOR</small><b>${escapeHtml(p.tutor)}</b></div><div class="detail"><small>JORNADAS</small><b>${pj.length}</b></div></div><h3>Atividade registrada</h3><p>${pa.length} análise(s) de IA e ${pj.length} jornada(s) vinculada(s).</p><button class="primary" onclick="closeModal();usePetInIA(${p.id})">✦ Analisar este pet com IA</button>`;modal.classList.remove('hidden');}
function closeModal(){modal.classList.add('hidden')}
function deletePet(id){let p=pets.find(x=>x.id===id);if(!p||!confirm(`Excluir ${p.name}? As análises e jornadas vinculadas também serão removidas.`))return;pets=pets.filter(x=>x.id!==id);analyses=analyses.filter(a=>a.petId!==id);journeys=journeys.filter(j=>j.petId!==id);saveAll();refreshUI();}
// Mapeamento do PetResponse do PetFlow (Java) para o card do CLYVO.
const PORTE_PETFLOW={MINI:'PEQUENO',PEQUENO:'PEQUENO',MEDIO:'MEDIO',GRANDE:'GRANDE',GIGANTE:'GRANDE'};
function idadeEmAnos(data){
 if(!data)return 0;
 const n=new Date(data),h=new Date();
 let a=h.getFullYear()-n.getFullYear();
 if(h<new Date(h.getFullYear(),n.getMonth(),n.getDate()))a--;
 return Math.max(0,a);
}
function fromPetflow(x){
 const species=x.especie==='FELINO'?'FELINO':'CANINO';
 return {id:-Number(x.id),source:'PetFlow',name:String(x.nome||'Pet'),emoji:species==='FELINO'?'🐱':'🐶',species,breed:String(x.racaNome||'Não informada'),size:PORTE_PETFLOW[x.porte]||'MEDIO',age:idadeEmAnos(x.dtNascimento),tutor:String(x.tutorNome||'Tutor não informado'),status:'Importado do PetFlow',priority:'NORMAL'};
}
async function syncPetFlowPets(){
 const btn=[...document.querySelectorAll('button')].find(b=>b.getAttribute('onclick')==='syncPetFlowPets()');
 if(btn){btn.disabled=true;btn.textContent='Consultando PetFlow...';}
 try{
  const response=await fetch('/api/petflow/pets',{headers:{Accept:'application/json'}});
  const payload=await response.json().catch(()=>({error:'Resposta inválida do PetFlow.'}));
  if(!response.ok)throw new Error(payload.error||'Não foi possível consultar o PetFlow.');
  // O backend devolve a lista de PetResponse do PetFlow (o `content` da página), já com `especie`.
  const list=Array.isArray(payload.data)?payload.data:[];
  if(!list.length){alert('PetFlow conectado, mas não retornou pets para este colaborador.');return;}
  const imported=list.map(fromPetflow);
  // Os importados têm id negativo: não colidem com os pets locais (1, 2, 3... e Date.now()).
  // Reimportar substitui só os que vieram do PetFlow, sem duplicar e sem tocar nos locais.
  pets=pets.filter(p=>p.source!=='PetFlow').concat(imported);
  saveAll();refreshUI();alert(`${imported.length} pet(s) importado(s) do PetFlow (API Java + Oracle do grupo).`);
 }catch(e){alert(e.message+'\n\nOs pets locais foram preservados. Confira PETFLOW_API_URL, PETFLOW_EMAIL e PETFLOW_SENHA no .env.');}
 finally{if(btn){btn.disabled=false;btn.textContent='↻ Importar pets do PetFlow';}}
}
function openPetForm(){modalContent.innerHTML=`<span class="eyebrow">NOVO PACIENTE</span><h2>Cadastrar novo pet</h2><p>Adicione o paciente para iniciar o acompanhamento.</p><form onsubmit="addPet(event)"><div class="form-grid"><label>Nome<input id="newName" required></label><label>Espécie<select id="newSpecies" required><option value="">Selecione</option><option value="CANINO">Canino</option><option value="FELINO">Felino</option></select></label><label>Raça<input id="newBreed" required></label><label>Porte<select id="newSize" required><option value="">Selecione</option><option value="PEQUENO">Pequeno</option><option value="MEDIO">Médio</option><option value="GRANDE">Grande</option></select></label><label>Idade<input id="newAge" type="number" min="0" max="40" required></label><label>Tutor<input id="newTutor" required></label></div><button class="primary full">Cadastrar pet</button></form>`;modal.classList.remove('hidden')}
function addPet(e){e.preventDefault();let species=newSpecies.value,name=newName.value.trim(),breed=newBreed.value.trim(),size=newSize.value,age=Number(newAge.value),tutor=newTutor.value.trim();if(!name||!species||!breed||!size||age<0||!tutor)return;pets.push({id:Date.now(),name,emoji:species==='FELINO'?'🐱':'🐶',species,breed,size,age,tutor,status:'Novo cadastro',priority:'NORMAL'});saveAll();closeModal();refreshUI();alert(`✅ ${name} foi cadastrado com sucesso!`)}
function renderProtocols(filter='all'){let arr=protocols.filter(p=>filter==='all'||p.category.includes(filter));protocolList.innerHTML=arr.map(p=>`<article class="protocol-card"><div class="protocol-top"><div class="protocol-icon">${p.icon}</div><span class="badge ${priorityClass(p.priority)}">${p.priority}</span></div><h3>${p.name}</h3><p>${p.why}</p><div class="rule-flow"><div class="rule-box"><b>QUANDO</b>${p.when}</div><div class="rule-arrow">→</div><div class="rule-box"><b>ENTÃO</b>Criar ação em ${p.days} dias</div></div><div class="protocol-footer"><span>◷ ${p.days} dias</span><span>✦ Regra explicável</span></div></article>`).join('')}
function filterProtocols(f,el){document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active-filter'));el.classList.add('active-filter');renderProtocols(f)}
function usePetInIA(id){let p=pets.find(x=>x.id===id);if(!p)return;iaNome.value=p.name;iaEspecie.value=p.species;iaRaca.value=p.breed;iaPorte.value=p.size;iaIdade.value=p.age;iaEvento.value='ROTINA';iaNome.dataset.petId=id;go('ia')}
function loadScenario(s){let d={senior:['Thor','CANINO','Labrador','GRANDE',9,'ROTINA'],cat:['Mia','FELINO','Siamês','PEQUENO',4,'ROTINA'],chronic:['Max','CANINO','SRD','MEDIO',6,'CRONICA']}[s];[iaNome.value,iaEspecie.value,iaRaca.value,iaPorte.value,iaIdade.value,iaEvento.value]=d;iaDental.checked=s==='chronic';iaCronica.checked=s==='chronic';iaNome.dataset.petId='';runIA()}
function getRecs(age,esp,event,dental,chronic){
 let r=[];
 if(age>=7||event==='GERIATRICO')r.push(protocols.find(p=>p.id==='senior'));
 if(event==='VACINA')r.push(protocols.find(p=>p.id==='vaccine'));
 if(event==='VERMIFUGO')r.push(protocols.find(p=>p.id==='deworm'));
 if(dental||event==='ODONTO')r.push(protocols.find(p=>p.id==='dental'));
 if(chronic||event==='CRONICA')r.push(protocols.find(p=>p.id==='chronic'));
 if(esp==='FELINO'&&(event==='ROTINA'||event==='FELINO'))r.push(protocols.find(p=>p.id==='feline'));
 if(event==='PESO')r.push(protocols.find(p=>p.id==='weight'));
 if(event==='DERMATO')r.push(protocols.find(p=>p.id==='derm'));
 if(event==='POS_ATENDIMENTO')r.push(protocols.find(p=>p.id==='post'));
 if(!r.length)r.push(protocols.find(p=>p.id==='routine'));
 return [...new Map(r.filter(Boolean).map(x=>[x.id,x])).values()];
}
function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
function runIA(aiContext=null){
 let n=iaNome.value||'Pet',age=+iaIdade.value,esp=iaEspecie.value,event=iaEvento.value,dental=iaDental.checked,chronic=iaCronica.checked,rec=getRecs(age,esp,event,dental,chronic),petId=Number(iaNome.dataset.petId)||null;
 let analysis={id:Date.now(),petId,name:n,date:new Date().toLocaleString('pt-BR'),inputs:{age,esp,event,dental,chronic,breed:iaRaca.value,size:iaPorte.value},recs:rec.map(r=>r.id),savedToJourney:false,aiContext:aiContext||null};
 const dup=analyses.find(x=>x.petId===petId&&x.name===n&&JSON.stringify(x.inputs)===JSON.stringify(analysis.inputs)&&JSON.stringify(x.recs)===JSON.stringify(analysis.recs));if(dup){if(aiContext)dup.aiContext=aiContext;analysis=dup}else analyses.push(analysis);saveAll();updateCounters();
 const aiCard=aiContext?'<div class="ai-generated-card"><span class="eyebrow">IA GENERATIVA • RESPOSTA DA API</span><h4>Interpretação da mensagem</h4><p><b>Intenção:</b> '+escapeHtml(aiContext.intentLabel||aiContext.intent||'Não classificada')+'</p><p>'+escapeHtml(aiContext.summary||'')+'</p><p><b>Resposta sugerida:</b> '+escapeHtml(aiContext.response||'')+'</p><small>Categoria sugerida: '+escapeHtml(aiContext.suggestedEvent||'ROTINA')+(aiContext.needsVet?' • Encaminhamento veterinário recomendado':'')+'</small></div>':'';
 const vetAlert=aiContext?.needsVet?'<div class="guard vet-alert"><b>⚠️ Procure um médico-veterinário.</b><p>A mensagem descreve sintomas ou uma dúvida clínica. A plataforma não faz diagnóstico nem substitui atendimento profissional.</p></div>':''; iaResult.innerHTML='<div class="result-summary">'+vetAlert+aiCard+'<span class="eyebrow">MOTOR DE REGRAS • ANÁLISE CONCLUÍDA</span><h3>✓ '+rec.length+' protocolo(s) identificado(s)</h3><p><b>Decisão explicável:</b> o motor compara o contexto do pet com critérios parametrizados. A IA generativa interpreta a mensagem; os protocolos e prazos são selecionados por regras verificáveis.</p><div class="decision-path"><span>Dados</span> → <span>Interpretação IA</span> → <span>Regras</span> → <span>Protocolos</span> → <span>Ação</span></div>'+rec.map(r=>'<div class="recommendation"><div class="rec-head"><b>'+r.icon+' '+escapeHtml(r.name)+'</b><span class="badge '+priorityClass(r.priority)+'">'+escapeHtml(r.priority)+'</span></div><p><b>Critério:</b> '+escapeHtml(r.when)+'</p><p><b>Por que:</b> '+escapeHtml(r.why)+'</p><div class="rec-tags"><span>Prazo: '+r.days+' dias</span><span>Explicável</span></div></div>').join('')+(petId?'<div class="analysis-actions"><button class="primary full" onclick="saveAnalysisToJourney('+analysis.id+')">Criar ações de cuidado na jornada →</button></div>':'<div class="guard"><b>Demonstração registrada.</b><p>Para vincular ao histórico, selecione um pet cadastrado antes da análise.</p></div>')+'</div>';
}
async function interpretWithAI(){
 const message=(document.getElementById('tutorMessage')?.value||'').trim();
 const status=document.getElementById('aiInterpretationStatus');
 const btn=document.getElementById('interpretAiBtn');
 if(!message){status.className='ai-interpretation-status error';status.textContent='Digite uma mensagem do tutor para a IA interpretar.';return;}
 btn.disabled=true;btn.textContent='Interpretando com a API...';status.className='ai-interpretation-status';status.textContent='Enviando a mensagem ao serviço de IA seguro...';
 try{
  const response=await fetch('/api/ai/interpret',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message,pet:{name:iaNome.value||'Pet',species:iaEspecie.value,breed:iaRaca.value,age:Number(iaIdade.value)||0,size:iaPorte.value,event:iaEvento.value,dental:iaDental.checked,chronic:iaCronica.checked}})});
  const data=await response.json().catch(()=>({error:'O servidor retornou uma resposta inválida.'}));
  if(!response.ok)throw new Error(data.error||'Não foi possível concluir a interpretação da IA.');
  const allowed=['ROTINA','VACINA','VERMIFUGO','ODONTO','CRONICA','PESO','DERMATO','POS_ATENDIMENTO','GERIATRICO','FELINO'];
  const suggested=allowed.includes(data.suggestedEvent)?data.suggestedEvent:'ROTINA';
  iaEvento.value=suggested;
  status.className='ai-interpretation-status success';
  status.textContent='Interpretação recebida da API. Categoria identificada: '+suggested+'. O motor de regras será executado para validar protocolos.';
  runIA({...data,suggestedEvent:suggested});
 }catch(error){
  status.className='ai-interpretation-status error';
  status.textContent=error.message+' Confira se o servidor está iniciado e se a chave da API está configurada no arquivo .env. Nenhuma resposta simulada foi apresentada.';
 }finally{btn.disabled=false;btn.textContent='✦ Interpretar mensagem com IA generativa';}
}
function saveAnalysisToJourney(id){let a=analyses.find(x=>x.id===id);if(!a||!a.petId)return;if(a.savedToJourney){go('journey');return;}a.recs.forEach((pid,i)=>{let p=protocols.find(x=>x.id===pid);journeys.push({id:Date.now()+i,analysisId:id,petId:a.petId,protocolId:pid,status:'PREVISTA',createdAt:new Date().toLocaleString('pt-BR'),dueDays:p.days,events:[{status:'PREVISTA',time:new Date().toLocaleString('pt-BR'),msg:`IA recomendou ${p.name} e criou a obrigação de cuidado.`}]})});a.savedToJourney=true;saveAll();refreshUI();go('journey')}
let selectedJourneyId=null;
const journeyStatuses=['PREVISTA','NOTIFICADA','RESPONDIDA','AGENDADA','CUMPRIDA'];
function renderJourney(){
  if(!journeys.length){
    journeySteps.innerHTML='<div class="attention-empty">Nenhuma jornada salva. Faça uma análise vinculada a um pet e crie uma ação de cuidado.</div>';
    progressFill.style.width='0%';journeyIcon.textContent='📅';journeyStageLabel.textContent='SEM JORNADA';journeyTitle.textContent='Aguardando ação de cuidado';journeyText.textContent='As jornadas criadas a partir das análises aparecerão aqui.';prevJourney.disabled=true;nextJourney.disabled=true;renderEvents();return;
  }
  let active=journeys.find(j=>j.id===selectedJourneyId)||journeys[0];selectedJourneyId=active.id;
  const p=pets.find(x=>x.id===active.petId),pr=protocols.find(x=>x.id===active.protocolId);
  let idx=Math.max(0,journeyStatuses.indexOf(active.status));if(idx<0)idx=0;
  journeySteps.innerHTML='<div class="journey-records">'+journeys.map(j=>{const pet=pets.find(x=>x.id===j.petId);const protocol=protocols.find(x=>x.id===j.protocolId);return `<button class="mini-btn ${j.id===active.id?'active':''}" onclick="selectJourney(${j.id})">${escapeHtml(pet?.name||'Pet')} · ${escapeHtml(protocol?.name||'Ação')} · ${escapeHtml(j.status)}</button>`}).join('')+'</div><div class="journey-steps">'+journeyStatuses.map((st,i)=>`<div class="journey-step ${i===idx?'active':i<idx?'done':''}"><div class="step-circle">${i<idx?'✓':i+1}</div><b>${st}</b><small>${['Criada','Notificada','Respondida','Agendada','Concluída'][i]}</small></div>`).join('')+'</div>';
  progressFill.style.width=(idx/4*100)+'%';journeyIcon.textContent='🐾';journeyStageLabel.textContent=`ETAPA ${idx+1} DE 5`;journeyTitle.textContent=pr?.name||'Acompanhamento';journeyText.textContent=`Pet: ${p?.name||'Pet'}. Status atual: ${active.status}. ${pr?.why||'Ação de cuidado registrada.'}`;
  prevJourney.disabled=idx===0;nextJourney.disabled=idx===4;nextJourney.textContent=idx===4?'✓ Jornada concluída':'Avançar etapa →';
  events=Array.isArray(active.events)?active.events:[];renderEvents();
}
function selectJourney(id){selectedJourneyId=id;renderJourney()}
function addEvent(msg){events.unshift({msg,time:new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})})}
function advanceJourney(){const j=journeys.find(x=>x.id===selectedJourneyId);if(!j)return;const i=journeyStatuses.indexOf(j.status);if(i>=0&&i<4){j.status=journeyStatuses[i+1];j.events=j.events||[];j.events.unshift({status:j.status,time:new Date().toLocaleString('pt-BR'),msg:'Etapa atualizada para '+j.status});saveAll();refreshUI();renderJourney()}}
function previousJourney(){const j=journeys.find(x=>x.id===selectedJourneyId);if(!j)return;const i=journeyStatuses.indexOf(j.status);if(i>0){j.status=journeyStatuses[i-1];j.events=j.events||[];j.events.unshift({status:j.status,time:new Date().toLocaleString('pt-BR'),msg:'Etapa ajustada para '+j.status});saveAll();refreshUI();renderJourney()}}
function resetJourney(){selectedJourneyId=journeys[0]?.id??null;events=[];renderJourney()}
function clearEvents(){events=[];renderEvents()}
function renderEvents(){eventLog.innerHTML=events.length?events.map(e=>`<div class="event"><span class="event-dot"></span><span>${escapeHtml(e.msg||'')}</span><time>${escapeHtml(e.time||'')}</time></div>`).join(''):'<p>Nenhum evento registrado ainda.</p>'}
function renderAttention(){let items=journeys.filter(j=>j.status!=='CUMPRIDA').slice(0,5);attentionList.innerHTML=items.length?items.map(j=>{let p=pets.find(x=>x.id===j.petId),pr=protocols.find(x=>x.id===j.protocolId);return `<div class="attention-row"><div class="big-pet">${p?.emoji||'🐾'}</div><div><b>${escapeHtml(p?.name||'Pet')} — ${escapeHtml(pr?.name||'Ação')}</b><small>Agora: ${j.status} • Próximo cuidado: ${pr?.days||'-'} dias</small></div><span class="badge ${priorityClass(pr?.priority)}">${pr?.priority||'NORMAL'}</span></div>`}).join(''):'<div class="attention-empty">✨ Nenhuma ação pendente. Execute uma análise de IA em um pet para criar uma jornada.</div>'}
function renderPetAnalysisSelect(){let s=petAnalysisSelect;if(!s)return;let old=s.value;s.innerHTML=pets.map(p=>`<option value="${p.id}">${p.emoji} ${escapeHtml(p.name)}</option>`).join('');if(old)s.value=old;renderPetAnalysisHistory()}
function renderPetAnalysisHistory(){let s=petAnalysisSelect,box=petAnalysisHistory;if(!s||!box)return;let list=analyses.filter(a=>a.petId===Number(s.value)).sort((a,b)=>b.id-a.id);box.innerHTML=list.length?list.map(a=>`<article class="analysis-record"><span class="eyebrow">ANÁLISE SALVA</span><h4>${a.date}</h4><p><b>Contexto:</b> ${a.inputs.esp} • ${a.inputs.age} anos • ${a.inputs.event}</p><p><b>Protocolos:</b> ${a.recs.map(id=>protocols.find(p=>p.id===id)?.name).filter(Boolean).join(' • ')}</p><button class="mini-btn" onclick="${a.savedToJourney?"go('journey')":"saveAnalysisToJourney("+a.id+")"}">${a.savedToJourney?'Ver jornada':'Criar ações na jornada'}</button></article>`).join(''):'<div class="history-empty">🤖 Ainda não há análises salvas para este pet.</div>'}
function setArch(type,el){document.querySelectorAll('.arch-tab').forEach(x=>x.classList.remove('active-arch'));el.classList.add('active-arch');architectureContent.innerHTML=type==='flow'?`<div class="arch-flow"><div class="node">👤<b>Tutor / Clínica</b><small>Interação</small></div><div class="arch-arrow">→</div><div class="node">📱<b>CLYVO</b><small>Aplicação</small></div><div class="arch-arrow">→</div><div class="node">⚙️<b>API</b><small>Camada</small></div><div class="arch-arrow">↔</div><div class="node ai-node">✦<b>Motor IA</b><small>Recomendação</small></div></div>`:type==='layers'?`<div class="layer-view"><div class="layer"><h3>01 • Interface</h3><p>Dashboard, pets e jornadas.</p></div><div class="layer"><h3>02 • Aplicação</h3><p>Regras e fluxos.</p></div><div class="layer"><h3>03 • Inteligência</h3><p>Protocolos explicáveis.</p></div><div class="layer"><h3>04 • Dados</h3><p>Perfis e histórico.</p></div></div>`:`<div class="integration-view"><h3>Fluxo integrado</h3><p>Dados do pet → validação → banco → protocolos → recomendação → jornada.</p></div>`}
function renderDataTable(){let q=(dataSearch.value||'').toLowerCase(),f=dataUseFilter.value||'';dataTable.innerHTML=dataRows.filter(r=>(!q||r.join(' ').toLowerCase().includes(q))&&(!f||r[4]===f)).map(r=>`<tr>${r.map((x,i)=>`<td>${i===0?'<b>'+x+'</b>':x}</td>`).join('')}</tr>`).join('')}
function refreshUI(){updateCounters();renderPreview();renderAttention();renderPets();renderPetAnalysisSelect()}
iaForm.addEventListener('submit',e=>{e.preventDefault();runIA()});
renderProtocols();renderDataTable();setArch('flow',document.querySelector('.arch-tab'));resetJourney();refreshUI();
