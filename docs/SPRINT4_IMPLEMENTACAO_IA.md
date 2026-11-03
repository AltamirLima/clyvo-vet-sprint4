# Sprint 4 — Implementação da IA do CLYVO VET

## O que foi implementado
- Endpoint de backend `POST /api/ai/interpret` que chama uma API Google Gemini (generateContent).
- Interface para o tutor escrever uma mensagem em linguagem natural.
- Classificação de intenção e sugestão de categoria de acompanhamento pela IA generativa.
- Integração do resultado com o motor de regras determinístico já existente.
- Recomendação final com protocolos, prioridade, prazo e justificativa; o modelo não inventa protocolos nem define prazos.
- Tratamento de chave ausente, conexão indisponível, resposta inválida e erros retornados pela API.
- Guardrail: a IA não diagnostica, prescreve nem recomenda medicamentos; questões clínicas são encaminhadas ao veterinário.
- Correção dos gatilhos de protocolo para ODONTO, GERIATRICO e FELINO, além dos eventos existentes.

## Arquitetura implementada
```text
Tutor -> Frontend CLYVO VET -> Backend Node.js -> API de IA
                                      |
                                      v
                         validação do JSON/categorias
                                      |
                                      v
Frontend <- interpretação + evento sugerido <- backend
   |
   v
Motor de regras local -> protocolos -> jornada -> localStorage
```

A API externa realiza a interpretação da linguagem natural. O motor de regras continua sendo a fonte determinística de protocolo, prazo e prioridade. A arquitetura que mostra banco remoto é conceitual: nesta versão, a persistência do protótipo continua em `localStorage`; não alegamos que existe um banco remoto implementado.

## Como executar
Requisito: Node.js 18 ou superior.

1. Instale Node.js 18+.
2. Na pasta raiz do projeto, copie `.env.example` para `.env`.
3. Preencha `GEMINI_API_KEY` com sua chave. Nunca commite o arquivo `.env`.
4. A integração está configurada para a API Google Gemini. Crie uma chave no Google AI Studio e configure `GEMINI_API_KEY`; o padrão usa `GEMINI_MODEL=gemini-3.1-flash-lite`.
5. Execute `npm start`.
6. Abra `http://localhost:3000`.
7. Entre em Demonstração IA, selecione ou cadastre um pet, digite uma mensagem e clique em **Interpretar mensagem com IA generativa**.
8. Confira a interpretação, a categoria sugerida e os protocolos gerados. Se o pet estiver cadastrado, crie a ação na Jornada.

## Testes
- Execute `npm test` para testes automatizados básicos de integração e segurança estática.
- Faça testes manuais com mensagem de vacina atrasada, dúvida administrativa de retorno, mensagem vaga e relato de sintomas.
- Teste também chave ausente, chave inválida e API indisponível. A interface deve exibir erro claro sem simular sucesso.
- A demonstração real da API requer chave válida, acesso à rede e um modelo habilitado na conta.

## Segurança e limitações
- A chave fica no backend em `.env`, nunca no frontend.
- O backend limita o tamanho da mensagem, valida categorias de saída e não aceita instruções do modelo para alterar protocolos ou prazos.
- A IA pode errar; suas sugestões são auxiliares e precisam ser verificadas.
- Não envie dados pessoais ou clínicos desnecessários. Use dados fictícios na demonstração acadêmica.
- O protótipo não substitui avaliação veterinária, não realiza diagnóstico e não prescreve.
- A aplicação ainda usa `localStorage`; não há API clínica nem banco remoto para consultar histórico real.


## Provedor configurado
O backend chama `POST /models/{model}:generateContent` da API Gemini, envia a chave no cabeçalho `x-goog-api-key` e solicita resposta JSON com `generationConfig.responseMimeType`. A resposta é lida de `candidates[0].content.parts`. Referência oficial: https://ai.google.dev/api/generate-content.
