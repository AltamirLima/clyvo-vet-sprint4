# CLYVO VET — Documentação do componente de IA

## 1. Problema de negócio

O CLYVO VET trata um ponto da jornada contínua de cuidado veterinário: uma recomendação ou retorno pode ser identificado, mas não necessariamente se transforma em uma ação concluída pelo tutor e pela clínica.

O componente inteligente transforma dados do pet e eventos registrados em **obrigações futuras de cuidado**, com prioridade, prazo e justificativa. Dessa forma, a clínica consegue acompanhar o próximo passo e o tutor recebe uma orientação operacional para continuidade do cuidado.

## 2. Abordagem escolhida

A abordagem do Sprint 4 é um **motor de regras inteligentes (sistema baseado em regras parametrizadas)**.

A escolha é adequada ao protótipo porque os critérios utilizados são explícitos e precisam ser auditáveis. Em vez de gerar uma opinião clínica livre, o motor compara atributos do pet e eventos com protocolos previamente definidos e produz uma recomendação explicável.

### Por que essa abordagem?

- **Explicabilidade:** cada recomendação mostra o critério que foi identificado e o protocolo acionado.
- **Previsibilidade:** as mesmas entradas produzem a mesma decisão dentro das regras configuradas.
- **Priorização:** protocolos podem possuir prioridade e prazo diferentes.
- **Segurança de escopo:** o protótipo não diagnostica, prescreve ou substitui o veterinário.
- **Evolução:** novos protocolos podem ser parametrizados sem alterar o conceito do fluxo.

## 3. Entradas utilizadas

O motor considera, no protótipo, informações como espécie, raça, porte, idade, evento de cuidado, necessidade odontológica e condição crônica. Análises e jornadas também ficam vinculadas quando a demonstração utiliza um pet cadastrado.

No modelo conceitual do projeto, também fazem parte do contexto de dados: perfil do pet, histórico clínico, vacinas, consultas, medicamentos e comportamento/interações do tutor.

## 4. Personalização e priorização

A decisão é personalizada pelo contexto do paciente. Exemplos implementados no protótipo:

- idade igual ou superior a 7 anos → check-up geriátrico;
- evento de vacinação → protocolo de vacinação anual;
- evento de vermifugação → protocolo de vermifugação;
- necessidade odontológica → acompanhamento odontológico;
- condição crônica → acompanhamento de condição crônica;
- felino em rotina → check-up felino;
- avaliação de peso → controle de peso;
- evento dermatológico → acompanhamento dermatológico;
- pós-atendimento/procedimento → acompanhamento pós-atendimento;
- ausência de regra específica → check-up preventivo.

Cada protocolo possui **prioridade, prazo e justificativa**, permitindo explicar a ação sugerida.

## 5. Fluxo de decisão

```text
Tutor / Clínica
      ↓
Aplicação CLYVO VET
      ↓
Dados do pet + evento + contexto
      ↓
Validação e organização
      ↓
Motor de regras inteligentes
      ↓
Protocolos aplicáveis
      ↓
Prioridade + prazo + justificativa
      ↓
Recomendação
      ↓
Jornada: prevista → notificada → respondida → agendada → cumprida
```

A interpretação de mensagens utiliza backend Node.js e API real Gemini (`generateContent`). O protótipo mantém os cadastros e históricos locais em `localStorage`; a ponte segura para a API PetFlow está disponível no backend e depende de credencial de colaborador para consultar os dados reais.

## 6. Arquitetura de integração

A solução é organizada em quatro blocos principais:

1. **Aplicação:** interface para tutor/clínica, cadastro de pets, análise e acompanhamento.
2. **API / camada de aplicação:** representa a entrada e saída de dados e as regras de negócio.
3. **Banco de dados:** representa o armazenamento de perfis, histórico, eventos, análises, protocolos e jornadas.
4. **Motor inteligente:** recebe contexto, avalia protocolos e devolve recomendações explicáveis.

O diagrama completo está em [`ARQUITETURA.md`](ARQUITETURA.md).

## 7. Dados: origem, estrutura e utilização

| Dado | Origem | Estrutura | Uso |
|---|---|---|---|
| Perfil do pet | Cadastro | campos estruturados | Personalização |
| Espécie | Cadastro | enum/texto | Contexto e regras |
| Raça | Cadastro | texto | Contexto |
| Porte | Cadastro | enum | Contexto |
| Idade | Cadastro | inteiro | Priorização |
| Histórico clínico | Sistema/atendimentos | registros estruturados | Contexto |
| Vacinas | Sistema/atendimentos | eventos e datas | Recomendação preventiva |
| Consultas | Sistema/atendimentos | eventos e datas | Continuidade |
| Medicamentos | Sistema/atendimentos | registros estruturados | Contexto |
| Comportamento/interações | Aplicação | eventos/interações | Acompanhamento |
| Eventos | Aplicação | tipo + data/status | Acionamento de protocolo |
| Protocolos | Base de conhecimento | regra + prazo + prioridade | Decisão |
| Análises | Motor inteligente | entradas + recomendações | Histórico e rastreabilidade |
| Jornadas | Aplicação | status + eventos | Acompanhamento |

## 8. Exemplo de decisão

**Entrada:** cão, 8 anos, porte grande, evento de rotina.

**Regra atendida:** idade >= 7 anos.

**Saída:** protocolo de check-up geriátrico, prioridade alta, prazo configurado e justificativa apresentada na interface.

A recomendação é uma ação de acompanhamento e **não constitui diagnóstico ou prescrição**.

## 9. Guardrail clínico

O sistema não deve responder perguntas clínicas com diagnóstico, prescrição ou opinião médica. Quando uma questão exigir avaliação clínica, a decisão deve ser direcionada ao profissional veterinário.

## 10. Escopo do Sprint 4

Nesta Sprint 4, a interpretação de mensagens usa um backend Node.js com a API real do Google Gemini (`generateContent`), e os pets podem ser importados da API PetFlow do grupo (Java sobre Oracle). As análises e as jornadas do protótipo continuam no `localStorage` do navegador.
