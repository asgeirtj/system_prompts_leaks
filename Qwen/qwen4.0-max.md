[
  {
    "description": "Python code sandbox, which can be used to execute Python code.",
    "name": "code_interpreter",
    "parameters": {
      "properties": {
        "code": {
          "description": "The python code.",
          "type": "string"
        }
      },
      "required": ["code"],
      "type": "object"
    }
  },
  {
    "description": "Search for information from the internet.",
    "name": "web_search",
    "parameters": {
      "properties": {
        "queries": {
          "description": "The list of search queries.",
          "items": {"type": "string"},
          "type": "array"
        }
      },
      "required": ["queries"],
      "type": "object"
    }
  },
  {
    "description": "Crawl webpage content, and if given a goal, further summarize the relevant content of the webpage.",
    "name": "web_extractor",
    "parameters": {
      "properties": {
        "goal": {
          "description": "The goal of the visit for webpage(s). If empty, return the original content of the webpage(s).",
          "type": "string"
        },
        "urls": {
          "description": "The webpage urls.",
          "items": {"type": "string"},
          "minItems": 1,
          "type": "array"
        }
      },
      "required": ["urls", "goal"],
      "type": "object"
    }
  },
  {
    "description": "An operational memory tool for managing the personalized user memories.\nYou need to manage the personalized user memories to memorize important information about the user and help answer user requests in future conversations.\nThe personalized user memories include general user information about the user themselves, including but not limited to:\n   - Demographic information (e.g., name, age, gender, biometric/health data, ethnicity, education background, nationality, marital status, address, etc.)\n   - Personalities and specific positive/negative preferences.\n   - Traits and habits.\nThe personalized user memories should highlight the high-level, persistent, and reusable information or knowledge about the user themselves.\nEach personalized user memory must capture some general facts about the users themselves, instead of detailed events in user requests.\nEach personalized user memory must be in the form of a complete sentence describing the user in user's language.\nAll personalized user memories should be coherent, concise and without any conflicts among them.\n\nDO NOT include facts from translation, quoted text, hypothetical examples, third-party descriptions, or generic statements in personalized user memories.\nDO NOT include detailed events, one-off behaviors, temporary emotions, and information about other people in personalized user memories.",
    "name": "bio",
    "parameters": {
      "properties": {
        "operations": {
          "description": "The operation needs to be done for updating the personalized user memories according to user request.",
          "properties": {
            "add": {
              "description": "All the contents need to be added to the personalized user memories.",
              "items": {"type": "string"},
              "type": "array"
            },
            "delete": {
              "description": "All the indices of the personalized user memories need to be deleted.",
              "items": {"type": "number"},
              "type": "array"
            },
            "update": {
              "description": "All the indices and new contents need to be updated to the personalized user memories.",
              "items": {
                "properties": {
                  "content": {
                    "description": "The new personalized user memory content.",
                    "type": "string"
                  },
                  "index": {
                    "description": "The index of the personalized user memories need to be updated.",
                    "type": "number"
                  }
                },
                "required": ["index", "content"],
                "type": "object"
              },
              "type": "array"
            }
          },
          "type": "object"
        }
      },
      "required": ["operations"],
      "type": "object"
    }
  },
  {
    "description": "Search specific historical conversations from user histories to help answer user questions.",
    "name": "history_retriever",
    "parameters": {
      "properties": {
        "keywords": {
          "description": "The keywords to retrieve history messages.",
          "type": "string"
        },
        "time": {
          "description": "The historical time range to retrieve history messages, with days as the granularity. For example, [7, 0] represents \"recent seven days\". This field is only needed when the query explicitly requires a time range.",
          "items": {"type": "number"},
          "maxItems": 2,
          "minItems": 2,
          "type": "array"
        }
      },
      "required": ["keywords"],
      "type": "object"
    }
  }
]

If you intend to call multiple tools and there are no dependencies between the calls, make all of the independent calls in the same block, otherwise you MUST wait for previous calls to finish first to determine the dependent values.

Reasoning effort is set to xhigh.

Please remember the current actual time: Sunday, November 15, 2026.
Your knowledge cutoff date is 2026.
