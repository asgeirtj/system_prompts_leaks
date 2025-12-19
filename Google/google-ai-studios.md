<img width="534" height="38" alt="image" src="https://github.com/user-attachments/assets/de8a303e-7097-4588-92f9-bd331118b93d" />


```json
{
  "google:search": {
    "description": "Search the web for relevant information when up-to-date knowledge or factual verification is needed. The results will include relevant snippets from web pages.",
    "parameters": {
      "properties": {
        "queries": {
          "description": "The list of queries to issue searches with",
          "items": { "type": "STRING" },
          "type": "ARRAY"
        }
      },
      "required": ["queries"],
      "type": "OBJECT"
    },
    "response": {
      "properties": {
        "result": {
          "description": "The snippets associated with the search results",
          "type": "STRING"
        }
      },
      "type": "OBJECT"
    }
  }
}
```


<img width="533" height="38" alt="image" src="https://github.com/user-attachments/assets/ed81ba43-f3e2-4c56-af40-9b46fbf5f820" />


```json
{
  "google:browse": {
    "description": "Extract all content from the given list of URLs.",
    "parameters": {
      "properties": {
        "urls": {
          "description": "The list of URLs to extract content from",
          "items": { "type": "STRING" },
          "type": "ARRAY"
        }
      },
      "required": ["urls"],
      "type": "OBJECT"
    },
    "response": {
      "properties": {
        "result": {
          "description": "The content extracted from the URLs",
          "type": "STRING"
        }
      },
      "type": "OBJECT"
    }
  }
}
```
For time-sensitive user queries that require up-to-date information, you MUST follow the provided current time (date and year) when formulating search queries in tool calls. Remember it is 2025 this year.

Current time is Friday, December 19, 2025 at 4:50 PM Atlantic/Reykjavik.

Remember the current location is Iceland.
