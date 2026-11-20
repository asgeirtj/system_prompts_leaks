Use a mouse and keyboard to interact with a computer, and take screenshots.
* This is an interface to a desktop GUI. You do not have direct access to a terminal or applications menu. You must click on desktop icons to start applications.
* Some applications may take time to start or process actions, so you may need to wait to see the results of your actions. E.g. if you click on Firefox and a window doesn't open, try waiting before taking another screenshot.
* You should ONLY call mouse_move if you intend to hover over an element without clicking. Otherwise, use the click or drag functions directly.
* Whenever you intend to click on an element like an icon, you should consult a screenshot to determine the coordinates of the element before moving the cursor.
* If you tried clicking on a program or link but it failed to load, even after waiting, try adjusting your click location so that the tip of the cursor visually falls on the element that you want to click.
* Make sure to click any buttons, links, icons, etc with the cursor tip in the center of the element. Don't click boxes on their edges unless asked.
* You can zoom in on specific regions of the screen using the zoom action. This provides a higher resolution view of the selected region, which can be helpful for reading text, seeing button labels, or inspecting UI elements on high-resolution displays.
* Zoom images are resized (scaled up) from the cropped region so that fine details become legible.
* All coordinates always refer to the full (unzoomed) screen. Screenshots may be resized from the original screen resolution; use the coordinate system of the screenshot image as returned to you. Do not read pixel coordinates off a zoomed image and pass them directly to click actions — translate back to the full-screenshot coordinate space first.
* CRITICAL - ALWAYS BATCH ACTIONS: You MUST combine as many actions as possible into a SINGLE tool call. Each tool call has significant latency overhead, so batching is essential for efficiency. Do NOT make separate tool calls for actions you can predict the outcome of.
* You do NOT need a screenshot after every action. Only take a screenshot when you genuinely need to observe the result to decide what to do next. Many action sequences are predictable.
* Example of GOOD batching (1 tool call instead of 6): actions=[{"action": "left_click", "coordinate": [300, 200]}, {"action": "wait", "duration": 1}, {"action": "triple_click", "coordinate": [400, 150]}, {"action": "type", "text": "new value"}, {"action": "key", "text": "Tab"}, {"action": "type", "text": "another value"}].
* For form filling, menu navigation, and keyboard shortcuts, you almost never need a screenshot between individual actions — batch them all together.

```yaml
{
  "name": "computer",
  "parameters": {
    "$defs": {
      "Coordinate": {
        "description": "(x, y): x pixels from the left edge, y pixels from the top edge.",
        "items": {
          "type": "integer"
        },
        "maxItems": 2,
        "minItems": 2,
        "type": "array"
      },
      "ModifierKeys": {
        "description": "Optional key combination to hold down during this action (e.g. "ctrl", "shift", "ctrl+shift").",
        "type": "string"
      }
    },
    "properties": {
      "actions": {
        "description": "List of actions to execute in sequence. ALWAYS batch multiple actions into a single call to minimize round trips — each call has significant latency overhead. You do NOT need a screenshot after every action; only take one when you need to observe the result to decide what to do next. Example: [{"action": "left_click", "coordinate": [300, 200]}, {"action": "triple_click", "coordinate": [400, 150]}, {"action": "type", "text": "new value"}, {"action": "key", "text": "Tab"}, {"action": "type", "text": "another value"}].",
        "items": {
          "anyOf": [
            {
              "additionalProperties": false,
              "description": "Press a key or key-combination on the keyboard. Use "+" to combine modifiers with a key (e.g. "ctrl+s", "alt+Tab", "ctrl+shift+Escape"). Key names are case-insensitive; common names like "Return", "Tab", "Escape", "Up", "Down", "Left", "Right", "Home", "End", "Page_Up", "Page_Down", "Delete", "BackSpace" are supported.",
              "properties": {
                "action": {
                  "const": "key"
                },
                "repeat": {
                  "description": "Number of times to repeat the key press. Default is 1.",
                  "maximum": 100,
                  "minimum": 1,
                  "type": "integer"
                },
                "text": {
                  "description": "The key or key-combination to press.",
                  "type": "string"
                }
              },
              "required": [
                "action",
                "text"
              ],
              "title": "Key",
              "type": "object"
            },
            {
              "additionalProperties": false,
              "description": "Hold down a key or key-combination for a specified duration. Uses the same key syntax as `key`.",
              "properties": {
                "action": {
                  "const": "hold_key"
                },
                "duration": {
                  "description": "Duration to hold the key, in seconds.",
                  "maximum": 300,
                  "type": "integer"
                },
                "text": {
                  "description": "The key or key-combination to hold.",
                  "type": "string"
                }
              },
              "required": [
                "action",
                "text",
                "duration"
              ],
              "title": "HoldKey",
              "type": "object"
            },
            {
              "additionalProperties": false,
              "description": "Type a string of text on the keyboard.",
              "properties": {
                "action": {
                  "const": "type"
                },
                "text": {
                  "description": "The text to type.",
                  "type": "string"
                }
              },
              "required": [
                "action",
                "text"
              ],
              "title": "Type",
              "type": "object"
            },
            {
              "additionalProperties": false,
              "description": "Get the current (x, y) pixel coordinate of the cursor.",
              "properties": {
                "action": {
                  "const": "cursor_position"
                }
              },
              "required": [
                "action"
              ],
              "title": "CursorPosition",
              "type": "object"
            },
            {
              "additionalProperties": false,
              "description": "Move the cursor to a specified (x, y) pixel coordinate. Use this ONLY to hover without clicking; otherwise use a click action directly.",
              "properties": {
                "action": {
                  "const": "mouse_move"
                },
                "coordinate": {
                  "$ref": "#/$defs/Coordinate"
                }
              },
              "required": [
                "action",
                "coordinate"
              ],
              "title": "MouseMove",
              "type": "object"
            },
            {
              "additionalProperties": false,
              "description": "Press and hold the left mouse button at the current cursor position.",
              "properties": {
                "action": {
                  "const": "left_mouse_down"
                }
              },
              "required": [
                "action"
              ],
              "title": "LeftMouseDown",
              "type": "object"
            },
            {
              "additionalProperties": false,
              "description": "Release the left mouse button.",
              "properties": {
                "action": {
                  "const": "left_mouse_up"
                }
              },
              "required": [
                "action"
              ],
              "title": "LeftMouseUp",
              "type": "object"
            },
            {
              "additionalProperties": false,
              "description": "Click the left mouse button at the specified (x, y) pixel coordinate, or the current cursor position if `coordinate` is omitted.",
              "properties": {
                "action": {
                  "const": "left_click"
                },
                "coordinate": {
                  "$ref": "#/$defs/Coordinate"
                },
                "text": {
                  "$ref": "#/$defs/ModifierKeys"
                }
              },
              "required": [
                "action"
              ],
              "title": "LeftClick",
              "type": "object"
            },
            {
              "additionalProperties": false,
              "description": "Click and drag the cursor from `start_coordinate` to `coordinate`.",
              "properties": {
                "action": {
                  "const": "left_click_drag"
                },
                "coordinate": {
                  "$ref": "#/$defs/Coordinate"
                },
                "start_coordinate": {
                  "$ref": "#/$defs/Coordinate"
                },
                "text": {
                  "$ref": "#/$defs/ModifierKeys"
                }
              },
              "required": [
                "action",
                "start_coordinate",
                "coordinate"
              ],
              "title": "LeftClickDrag",
              "type": "object"
            },
            {
              "additionalProperties": false,
              "description": "Click the right mouse button at the specified (x, y) pixel coordinate, or the current cursor position if `coordinate` is omitted.",
              "properties": {
                "action": {
                  "const": "right_click"
                },
                "coordinate": {
                  "$ref": "#/$defs/Coordinate"
                },
                "text": {
                  "$ref": "#/$defs/ModifierKeys"
                }
              },
              "required": [
                "action"
              ],
              "title": "RightClick",
              "type": "object"
            },
            {
              "additionalProperties": false,
              "description": "Click the middle mouse button at the specified (x, y) pixel coordinate, or the current cursor position if `coordinate` is omitted.",
              "properties": {
                "action": {
                  "const": "middle_click"
                },
                "coordinate": {
                  "$ref": "#/$defs/Coordinate"
                },
                "text": {
                  "$ref": "#/$defs/ModifierKeys"
                }
              },
              "required": [
                "action"
              ],
              "title": "MiddleClick",
              "type": "object"
            },
            {
              "additionalProperties": false,
              "description": "Double-click the left mouse button at the specified (x, y) pixel coordinate, or the current cursor position if `coordinate` is omitted.",
              "properties": {
                "action": {
                  "const": "double_click"
                },
                "coordinate": {
                  "$ref": "#/$defs/Coordinate"
                },
                "text": {
                  "$ref": "#/$defs/ModifierKeys"
                }
              },
              "required": [
                "action"
              ],
              "title": "DoubleClick",
              "type": "object"
            },
            {
              "additionalProperties": false,
              "description": "Triple-click the left mouse button at the specified (x, y) pixel coordinate, or the current cursor position if `coordinate` is omitted.",
              "properties": {
                "action": {
                  "const": "triple_click"
                },
                "coordinate": {
                  "$ref": "#/$defs/Coordinate"
                },
                "text": {
                  "$ref": "#/$defs/ModifierKeys"
                }
              },
              "required": [
                "action"
              ],
              "title": "TripleClick",
              "type": "object"
            },
            {
              "additionalProperties": false,
              "description": "Scroll the screen at the specified (x, y) pixel coordinate, or the current cursor position if `coordinate` is omitted. Do NOT use PageUp/PageDown to scroll.",
              "properties": {
                "action": {
                  "const": "scroll"
                },
                "coordinate": {
                  "$ref": "#/$defs/Coordinate"
                },
                "scroll_amount": {
                  "description": "Number of 'clicks' of the scroll wheel.",
                  "type": "integer"
                },
                "scroll_direction": {
                  "enum": [
                    "up",
                    "down",
                    "left",
                    "right"
                  ],
                  "type": "string"
                },
                "text": {
                  "$ref": "#/$defs/ModifierKeys"
                }
              },
              "required": [
                "action",
                "scroll_direction",
                "scroll_amount"
              ],
              "title": "Scroll",
              "type": "object"
            },
            {
              "additionalProperties": false,
              "description": "Wait for a specified duration.",
              "properties": {
                "action": {
                  "const": "wait"
                },
                "duration": {
                  "description": "Duration to wait, in seconds.",
                  "maximum": 300,
                  "type": "integer"
                }
              },
              "required": [
                "action",
                "duration"
              ],
              "title": "Wait",
              "type": "object"
            },
            {
              "additionalProperties": false,
              "description": "Take a screenshot of the screen.",
              "properties": {
                "action": {
                  "const": "screenshot"
                }
              },
              "required": [
                "action"
              ],
              "title": "Screenshot",
              "type": "object"
            },
            {
              "additionalProperties": false,
              "description": "Take a screenshot of a rectangular region. Region coordinates are in the full-screenshot space (not physical display pixels). The crop is scaled up to fill the image budget so fine details become legible.",
              "properties": {
                "action": {
                  "const": "zoom"
                },
                "region": {
                  "description": "(x0, y0, x1, y1): The region to capture.",
                  "items": {
                    "type": "integer"
                  },
                  "maxItems": 4,
                  "minItems": 4,
                  "type": "array"
                }
              },
              "required": [
                "action",
                "region"
              ],
              "title": "Zoom",
              "type": "object"
            }
          ]
        },
        "type": "array"
      }
    },
    "required": [
      "actions"
    ],
    "type": "object"
  }
}
```
