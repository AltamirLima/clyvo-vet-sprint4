# Integração com PetFlow

O backend Node disponibiliza `GET /api/petflow/pets`, que consulta `GET /api/pets` da API Java do grupo sem expor o token ao navegador.

## Configuração

No `.env` local:

```env
PETFLOW_API_URL=https://clyvo-vet-api-java.onrender.com
PETFLOW_TOKEN=COLE_AQUI_O_TOKEN_DE_COLABORADOR
```

O token deve ser fornecido pelo responsável pelo backend PetFlow. Não o envie por chat, não o coloque no frontend e não faça commit do `.env`.

Reinicie `npm start` e valide:
- `GET http://localhost:3000/api/health`: `petflowConfigured` deve ser `true`.
- `GET http://localhost:3000/api/petflow/pets`: deve retornar `source: PetFlow API` e os dados devolvidos pelo endpoint Java.

## Limite conhecido

A revisão não forneceu um token de colaborador nem o contrato completo do JSON retornado pela API Java. Por isso, a ponte está implementada e protegida no backend, mas a sincronização/mapeamento dos pets reais para os cartões locais precisa ser validada com o responsável pelo PetFlow antes de ser apresentada como integração de dados concluída. Até lá, a interface mantém os dados demonstrativos locais.
