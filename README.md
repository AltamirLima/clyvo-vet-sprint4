# CLYVO VET — Sprint 4

Projeto acadêmico da disciplina **Disruptive Architectures: IoT, IoB & Generative IA**.

## Integrantes
- **Olavo Porto Neves** — RM 563558
- **Altamir Lima** — RM 562906
- **Felipe Conte** — RM 562248
- **Luiz Gustavo Gonçalves** — RM 564495
- **Pedro Henrique Dias França** — RM 561940

## 1. O que foi implementado nesta Sprint

A aplicação agora inclui uma integração real com uma API Google Gemini por meio de um backend Node.js. O tutor pode escrever uma mensagem em linguagem natural; o modelo interpreta a intenção e sugere uma categoria de acompanhamento. A categoria é validada e encaminhada ao motor de regras existente, que continua selecionando os protocolos, prazos, prioridades e justificativas de forma determinística.

A funcionalidade depende de uma chave válida, um modelo habilitado e uma API Google Gemini (`generateContent`). Sem configuração válida, o sistema exibe um erro explícito; não apresenta uma resposta falsa como se a IA tivesse funcionado.

## 2. Problema de negócio

Uma recomendação ou retorno pode ser identificado durante o cuidado, mas não necessariamente se transforma em uma ação acompanhada pelo tutor e pela clínica. O CLYVO VET busca reduzir essa lacuna, transformando o contexto do pet em protocolos explicáveis e ações que podem ser acompanhadas na jornada.

## 3. Fluxo da IA

1. O tutor escreve uma mensagem na seção **Demonstração IA**.
2. A interface envia a mensagem e o contexto mínimo do pet ao backend Node.js.
3. O backend chama a API de IA generativa usando a chave armazenada no arquivo local `.env`.
4. A resposta estruturada é validada; somente categorias permitidas são aceitas.
5. A categoria sugerida é encaminhada ao motor de regras.
6. O motor apresenta os protocolos aplicáveis com prazo, prioridade e justificativa.
7. Para um pet cadastrado, o usuário pode criar ações na Jornada do Cuidado.

**Separação de responsabilidades:** o LLM interpreta a linguagem natural; o motor determinístico decide quais protocolos cadastrados correspondem à categoria. A IA não inventa datas, protocolos ou prazos.

## 4. Funcionalidades do protótipo

- Dashboard e cadastro/consulta de pets.
- Demonstração do motor de regras e interpretação de mensagem via IA generativa.
- 10 protocolos parametrizados, com gatilhos corrigidos para odontologia, geriatria e check-up felino.
- Prioridade, prazo e justificativa por protocolo.
- Criação e acompanhamento de jornadas.
- Tratamento de erros da API, de configuração e de respostas inválidas.
- Guardrail clínico: a solução não diagnostica, não prescreve e encaminha questões clínicas ao veterinário.

## 5. Tecnologias

- HTML5, CSS3 e JavaScript.
- Node.js 18+ (backend sem dependências externas de pacote).
- API Google Gemini (`generateContent`).
- `localStorage` para persistência local das demonstrações.
- Mermaid para o diagrama arquitetural.

## 6. Como executar

1. Instale Node.js 18 ou superior.
2. Copie `.env.example` para um arquivo chamado `.env`.
3. Abra `.env` e configure `GEMINI_API_KEY` com sua chave. **Nunca publique ou envie esse arquivo ao GitHub.**
4. O padrão usa `GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta` e `GEMINI_MODEL=gemini-3.1-flash-lite`. Crie sua chave no Google AI Studio e mantenha-a somente no arquivo local `.env`.
5. No terminal, dentro da pasta do projeto, execute `npm start`.
6. Abra `http://localhost:3000`.
7. Entre em **Demonstração IA**, selecione ou cadastre um pet, escreva uma mensagem fictícia e clique em **Interpretar mensagem com IA generativa**.
8. Confira a intenção e a categoria sugerida; revise os protocolos e, se o pet estiver cadastrado, crie a ação na jornada.
9. Execute `npm test` para os testes automatizados básicos.

Abrir o arquivo `index.html` diretamente não ativa o backend nem a API. A demonstração real exige conexão com a internet e uma chave/modelo válidos.

## 7. Arquitetura e persistência

Consulte [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md) e [`docs/SPRINT4_IMPLEMENTACAO_IA.md`](docs/SPRINT4_IMPLEMENTACAO_IA.md).

O backend e a chamada externa à API de IA estão implementados. Pets, análises e jornadas continuam armazenados no `localStorage` do navegador. **Não existe banco de dados remoto nem integração com prontuário clínico real nesta versão**; não apresentamos esses componentes como implementados.

## 8. Segurança e limitações

- A chave fica no backend, no arquivo local `.env`; o servidor publica apenas `index.html` e os arquivos de `assets/`.
- O backend limita o tamanho da mensagem e valida categorias permitidas.
- Não use dados reais sensíveis de clientes na apresentação. Prefira exemplos fictícios.
- Respostas de IA podem conter erros e devem ser verificadas.
- O sistema não diagnostica, não prescreve e não substitui o médico-veterinário.
- A integração usa o endpoint Gemini `generateContent` e a resposta estruturada em JSON.

## 9. Estrutura do projeto

```text
CLYVO_VET_SPRINT4/
├── index.html
├── server.js
├── package.json
├── .env.example
├── .gitignore
├── LINKS.txt
├── assets/
│   ├── app.js
│   ├── logo.svg
│   └── style.css
├── docs/
│   ├── ARQUITETURA.md
│   ├── CHECKLIST_ENTREGA.md
│   ├── DADOS_E_IA.md
│   ├── DOCUMENTACAO_IA.md
│   ├── ROTEIRO_PITCH.md
│   ├── ROTEIRO_PITCH_SPRINT4.md
│   └── SPRINT4_IMPLEMENTACAO_IA.md
└── test/
    └── sprint4.test.js
```

## 10. Entrega

- **GitHub:** https://github.com/AltamirLima/clyvo-vet-sprint4
- **Vídeo pitch Sprint 4 (YouTube):** https://www.youtube.com/watch?v=28eXsLMHgDE

Antes da entrega, configure a chave no ambiente de demonstração, execute os testes e valide a integridade do ZIP.

## Observação sobre o repositório
O repositório se chamava `clyvo-vet-sprint3` e foi renomeado para `clyvo-vet-sprint4`. O endereço antigo redireciona para o novo.

## Integração PetFlow
A tela **Pets cadastrados** tem a ação **Importar pets do PetFlow**, que traz os pets reais da API Java do grupo (PetFlow, sobre Oracle) para o CLYVO, onde podem ser analisados pela IA. O fluxo é **Oracle → API Java (PetFlow) → backend Node → interface → IA**.

- O navegador chama `GET /api/petflow/pets`. O backend Node faz login de colaborador no PetFlow com `PETFLOW_EMAIL` e `PETFLOW_SENHA` (do `.env`), consulta `GET /api/pets` e devolve a lista de pets já com a espécie, que vem da raça.
- O token do PetFlow vale 15 minutos e não tem refresh: o backend o guarda por 14 minutos e faz um novo login quando ele vence. A credencial e o token nunca chegam ao navegador.
- Os pets importados recebem id negativo, para não colidir com os pets locais de demonstração; reimportar substitui só os que vieram do PetFlow.
- Sem credencial, a aplicação continua com os pets locais e informa que a integração não está configurada.

Detalhes, formato do JSON e mapeamento dos campos: [`docs/INTEGRACAO_PETFLOW.md`](docs/INTEGRACAO_PETFLOW.md).

## Modelo Gemini
O modelo padrão foi atualizado para `gemini-3.1-flash-lite`. Ele pode ser substituído por `GEMINI_MODEL` no `.env`, caso a disponibilidade da API mude.

## Vídeo pitch
Pendente de gravação pelo grupo. Adicionar aqui o link não listado após a gravação.
