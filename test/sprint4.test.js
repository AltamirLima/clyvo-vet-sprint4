const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('backend documenta as categorias válidas', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
  for (const event of ['ROTINA','VACINA','VERMIFUGO','ODONTO','CRONICA','PESO','DERMATO','POS_ATENDIMENTO','GERIATRICO','FELINO']) {
    assert.ok(source.includes("'" + event + "'"), 'Categoria ausente: ' + event);
  }
});

test('frontend chama backend e não contém chave de API hardcoded', () => {
  const app = fs.readFileSync(path.join(__dirname, '..', 'assets', 'app.js'), 'utf8');
  assert.ok(app.includes("fetch('/api/ai/interpret'"), 'Frontend não chama o endpoint de IA');
  assert.ok(!/sk-[A-Za-z0-9]{15,}/.test(app), 'Possível chave hardcoded no frontend');
});

test('chave é carregada no backend e não no navegador', () => {
  const server = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
  assert.ok(server.includes('process.env.GEMINI_API_KEY'));
  assert.ok(server.includes("'x-goog-api-key':API_KEY"));
});


test('mensagens que exigem veterinário bloqueiam a criação automática de ações na jornada', () => {
  const app = fs.readFileSync(path.join(__dirname, '..', 'assets', 'app.js'), 'utf8');
  assert.ok(app.includes('aiContext?.needsVet'));
  assert.ok(app.includes('Jornada preventiva pausada.'));
  assert.ok(app.includes('Nenhuma ação automática será criada.'));
});
