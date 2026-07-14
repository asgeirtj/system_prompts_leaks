Current date: 2026-07-14  
User location: Iceland

```json
{
  "name": "search",
  "description": "Web search. Split multiple queries with '||'.",
  "parameters": {
    "type": "object",
    "properties": {
      "queries": {
        "type": "string",
        "description": "query1||query2"
      }
    },
    "required": ["queries"],
    "additionalProperties": false,
    "$schema": "http://json-schema.org/draft-07/schema#"
  }
}
```
