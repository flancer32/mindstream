# mindstream

A personal semantic feed that filters publications by meaning and attention, not by time or tags.

**Attention HTTP Ingress**
`POST /attention` accepts a single attention event.

Payload (JSON):
```json
{
  "identity": "uuid-string",
  "publication_id": "string",
  "attention_type": "overview_view | link_click | link_click_after_overview",
  "timestamp": "string"
}
```
`timestamp` is ignored; the server stores its own UTC timestamp.

**Dependencies**
- `@flancer32/teq-web`
- `@teqfw/di`
- `knex`
- `pg`

No extra middleware is used (no CORS/body-parser dependencies).

**Environment**
- `SERVER_PORT` (optional, default 3000)
- `SERVER_TYPE` (optional, `http`, `http2`, `https`)
- `DB_CLIENT`
- `DB_HOST`
- `DB_PORT`
- `DB_DATABASE`
- `DB_USER`
- `DB_PASSWORD`

**Run**
1. `npm install`
2. `node ./bin/app.mjs db:schema:create`
3. `npm start`

**Tests**
- `npm run test:unit`
