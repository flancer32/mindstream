# Attention Ingress HTTP Response Matrix

| Situation | HTTP code | Description |
| --- | --- | --- |
| Success (normal or duplicate) | 204 No Content | Event accepted/ignored |
| Invalid JSON | 400 Bad Request | Payload schema mismatch |
| Missing or invalid UUID | 400 Bad Request | Identity error |
| Invalid `attention_type` | 400 Bad Request | Unsupported type |
| Publication or identity not found | 422 Unprocessable Entity | Semantically invalid data |
