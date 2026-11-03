# Integração com PetFlow

O PetFlow é a API Java do grupo (Spring Boot sobre Oracle), publicada em
`https://clyvo-vet-api-java.onrender.com`. O CLYVO importa dela os pets reais para analisá-los com
a IA:

```text
Oracle → API Java (PetFlow) → backend Node (CLYVO) → interface → IA (Gemini) + motor de regras
```

## Configuração

No `.env` local:

```env
PETFLOW_API_URL=https://clyvo-vet-api-java.onrender.com
PETFLOW_EMAIL=<e-mail de um colaborador do PetFlow>
PETFLOW_SENHA=<senha desse colaborador>
```

Peça a credencial de colaborador ao responsável pelo PetFlow. Não a envie por chat, não a coloque
no frontend e não faça commit do `.env`.

Alternativa para uma demonstração curta: `PETFLOW_TOKEN` com um token já gerado. Ele **expira em
15 minutos**; por isso o caminho recomendado é e-mail e senha.

Reinicie `npm start` e valide:

- `GET http://localhost:3000/api/health`: `petflowConfigured` deve ser `true`;
- `GET http://localhost:3000/api/petflow/pets`: deve retornar `source: PetFlow API` e a lista de
  pets em `data`.

## Como o backend chama o PetFlow

1. `POST /api/auth/login` com `{"email", "senha", "tipo": "COLABORADOR"}`. A resposta traz o
   `accessToken`.
2. O token **vale 15 minutos** e o colaborador **não recebe refresh token**. O backend guarda o
   token por 14 minutos e, se receber 401, faz um novo login uma vez. O cache também respeita o
   limite do PetFlow, de no máximo 5 logins por minuto por IP.
3. `GET /api/racas?size=500`, uma vez, para saber a espécie de cada raça (`especieNome`: `CANINA`
   ou `FELINA`). O pet não traz a espécie diretamente.
4. `GET /api/pets?size=100&sort=nome`. A resposta é uma página (`Page<PetResponse>`), com os pets
   em `content`.

O timeout das chamadas ao PetFlow é de **90 segundos**: o plano gratuito do Render hiberna e pode
levar até ~80 s para acordar na primeira chamada. Antes de uma apresentação, acorde o Render
abrindo `https://clyvo-vet-api-java.onrender.com/actuator/health` e esperando o `UP`.

## Formato devolvido pelo PetFlow (`PetResponse`)

```json
{
  "content": [
    {
      "id": 1, "nome": "Luna", "dtNascimento": "2022-03-15", "sexo": "F",
      "porte": "GRANDE", "castrado": true, "status": "ATIVO",
      "tutorId": 1, "tutorNome": "Maria Aparecida Silva",
      "racaId": 1, "racaNome": "Labrador", "clinicaId": 1
    }
  ],
  "totalElements": 2
}
```

O backend devolve ao navegador só a lista (`content`), acrescentando `especie` (`CANINO` ou
`FELINO`).

## Mapeamento para os cards do CLYVO (`assets/app.js`, `fromPetflow`)

| CLYVO | PetFlow | Observação |
|---|---|---|
| `id` | `-id` | Negativo, para não colidir com os pets locais (1, 2, 3...) |
| `name` | `nome` | |
| `species` | `especie` | Vem da raça |
| `breed` | `racaNome` | |
| `size` | `porte` | O PetFlow tem `MINI` e `GIGANTE`: `MINI → PEQUENO` e `GIGANTE → GRANDE` |
| `age` | `dtNascimento` | Idade calculada em anos |
| `tutor` | `tutorNome` | |

Reimportar substitui só os pets que vieram do PetFlow (`source: 'PetFlow'`), sem duplicar e sem
alterar os pets locais.
