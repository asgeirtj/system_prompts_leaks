Please remember the current actual time: Friday, April 03, 2026  
Your knowledge cutoff date is 2026.

```json
{
  "type": "function",
  "function": {
    "name": "web_search",
    "description": "Search for information from the internet.",
    "parameters": {
      "type": "object",
      "properties": {
        "queries": {
          "type": "array",
          "items": {
            "type": "string",
            "description": "The search query."
          },
          "description": "The list of search queries."
        }
      },
      "required": ["queries"]
    }
  }
}
```

```json
{
  "type": "function",
  "function": {
    "name": "web_extractor",
    "description": "Crawl webpage content, and if given a goal, further summarize the relevant content of the webpage.",
    "parameters": {
      "type": "object",
      "properties": {
        "urls": {
          "type": "array",
          "items": {
            "type": "string",
            "description": "One url."
          },
          "minItems": 1,
          "description": "The webpage urls."
        },
        "goal": {
          "type": "string",
          "description": "The goal of the visit for webpage(s). If empty, return the original content of the webpage(s)."
        }
      },
      "required": ["urls", "goal"]
    }
  }
}
```

```json
{
  "type": "function",
  "function": {
    "name": "web_search_image",
    "description": "Search for images from the internet. Returns queries related images along with their urls, titles, and descriptions.",
    "parameters": {
      "type": "object",
      "properties": {
        "queries": {
          "type": "array",
          "items": {
            "type": "string",
            "description": "One query."
          },
          "description": "The list of search queries."
        }
      },
      "required": ["queries"]
    }
  }
}
```

```json
{
  "type": "function",
  "function": {
    "name": "code_interpreter",
    "description": "Python code sandbox, which can be used to execute Python code.",
    "parameters": {
      "type": "object",
      "properties": {
        "code": {
          "description": "The python code.",
          "type": "string"
        }
      },
      "required": ["code"]
    }
  }
}
```

```json
{
  "type": "function",
  "function": {
    "name": "bio",
    "description": "An operational memory tool for managing the personalized user memories.",
    "parameters": {
      "type": "object",
      "properties": {
        "operations": {
          "type": "object",
          "description": "The operation needs to be done for updating the personalized user memories according to user request.",
          "properties": {
            "add": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "description": "All the contents need to be added to the personalized user memories."
            },
            "delete": {
              "type": "array",
              "items": {
                "type": "number"
              },
              "description": "All the indices of the personalized user memories need to be deleted."
            },
            "update": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "index": {
                    "type": "number",
                    "description": "The index of the personalized user memories need to be updated."
                  },
                  "content": {
                    "type": "string",
                    "description": "The new personalized user memory content."
                  }
                },
                "required": ["index", "content"]
              },
              "description": "All the indices and new contents need to be updated to the personalized user memories."
            }
          }
        }
      },
      "required": ["operations"]
    }
  }
}
```

```json
{
  "type": "function",
  "function": {
    "name": "image_search",
    "description": "Search for similar images using an image from the conversation (specified by img_idx parameter). Returns similar images along with their URLs, titles, and descriptions.",
    "parameters": {
      "type": "object",
      "properties": {
        "img_idx": {
          "type": "number",
          "description": "The index of the user query image (starting from 0)."
        },
        "bbox": {
          "type": "array",
          "items": {
            "type": "number"
          },
          "description": "The bounding box of the image query region in relative coordinates [0-1000], in the form [x1, y1, x2, y2].",
          "minItems": 4,
          "maxItems": 4
        }
      },
      "required": ["img_idx", "bbox"]
    }
  }
}
```

```json
{
  "type": "function",
  "function": {
    "name": "image_gen",
    "description": "An image generation service that takes text descriptions as input and returns a URL of the image.",
    "parameters": {
      "type": "object",
      "properties": {
        "prompt": {
          "description": "Detailed description of the desired content of the generated image. Please keep the specific requirements such as text from the original request fully intact. Omission is prohibited.",
          "type": "string"
        }
      },
      "required": ["prompt"]
    }
  }
}
```

```json
{
  "type": "function",
  "function": {
    "name": "image_edit",
    "description": "An image editing service that takes some image indexs (no more than three) from the dialogue and text instructions to modify the images, returning a URL of the edited result. Capabilities include: modify images with detailed instructions, improve quality, adjust lighting, enhance details, local image enlargement, style changes, add/remove objects.",
    "parameters": {
      "type": "object",
      "properties": {
        "img_idx_list": {
          "type": "array",
          "items": {
            "type": "number",
            "description": "The index of the image (starting from 0)."
          },
          "minItems": 1,
          "maxItems": 3,
          "description": "The list of images (no more than three)."
        },
        "prompt": {
          "type": "string",
          "description": "Detailed instructions for editing the image, such as: improve quality, adjust lighting, enhance details, local enlargement, objects to add/remove/modify, style changes, or specific regions to alter. Please keep the specific requirements such as text from the original request fully intact. Omission is prohibited."
        }
      },
      "required": ["img_idx_list", "prompt"]
    }
  }
}
```
