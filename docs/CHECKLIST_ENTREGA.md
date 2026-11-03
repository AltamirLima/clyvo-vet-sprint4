# Checklist de conformidade — Sprint 4 Disruptive

## Implementação
- [x] Integração de backend para chamada de API de IA generativa.
- [x] Interface para mensagem do tutor em linguagem natural.
- [x] Saída estruturada: intenção, resumo, categoria sugerida e orientação segura.
- [x] Categoria da IA conectada ao motor de regras existente.
- [x] Protocolos, prioridade e prazo continuam determinados por regras explicáveis.
- [x] Corrigidos gatilhos para ODONTO, GERIATRICO e FELINO.
- [x] Chave da API configurada exclusivamente no backend via arquivo .env.
- [x] Tratamento de erro para chave ausente, falha de rede, resposta inválida e erros da API.
- [x] Guardrail clínico documentado e incluído no prompt.
- [x] Persistência atual descrita honestamente como localStorage.
- [x] README e diagrama de arquitetura atualizados.
- [x] Testes automatizados básicos adicionados.

## Configuração e validação antes da entrega
- [ ] Copiar .env.example para .env no computador que executará a demonstração.
- [ ] Inserir uma chave válida e confirmar provedor/modelo compatível.
- [ ] Executar npm start e testar a chamada real à API.
- [ ] Executar npm test.
- [ ] Testar mensagem sobre vacina, retorno de consulta, mensagem vaga e relato de sintoma.
- [ ] Testar chave inválida e indisponibilidade de API; conferir que o sistema mostra erro sem simular sucesso.
- [ ] Gravar novo vídeo de aproximadamente 5 minutos mostrando a IA realmente funcionando.
- [ ] Atualizar o link do vídeo da Sprint 4 em README.md e LINKS.txt.
- [ ] Conferir ZIP final e testar sua integridade antes do envio.

## Limitações atuais
- A IA real depende de chave válida, rede e modelo autorizado.
- A aplicação ainda usa localStorage; não há banco remoto nem integração com prontuário clínico.
- A API deve ser compatível com Gemini generateContent; outros formatos exigem adaptação do adaptador.


## Pendências que dependem do grupo
- [ ] Gravar vídeo pitch de aproximadamente 5 minutos.
- [ ] Inserir link não listado do vídeo no README e em LINKS.txt.
- [ ] Configurar credencial de colaborador PetFlow em `.env` e validar integração com dados reais.
