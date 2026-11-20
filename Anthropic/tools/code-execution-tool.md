## bash_code_execution

The bash_execution tool enables execution of bash scripts in a secure sandboxed container environment.

When to use the bash_execution tool:
- File system operations requiring shell commands (moving, copying, renaming, organizing files)
- Text processing and manipulation using standard Unix tools (grep, sed, awk, cut, sort, etc.) that should not be done by the text editor tool
- Batch processing of multiple files using shell loops and wildcards
- System inspection tasks (checking file sizes, permissions, directory structures)
- Combining multiple command-line tools in pipelines for complex data processing
- Archive operations (tar, unzip, 7z, unrar) and file compression/decompression
- Converting between file formats using command-line utilities

When NOT to use the bash_execution tool:
- Complex data analysis or numerical computation (use text_editor to write a Python script instead, and then the bash to run the script)
- Tasks requiring advanced programming logic or data structures
- Simple questions that can be answered without executing commands
- Tasks that only require explaining shell concepts without actual execution

How it works:
- Scripts are saved to a temporary file and executed with bash
- Tool results will include stdout, stderr, and return code
- User-uploaded files are accessible in the directory specified by the INPUT_DIR environment variable. If you know the file path and don't need to open the full INPUT_DIR, then just open the file directly

OUTPUT_DIR behavior (CRITICAL - READ CAREFULLY):
- OUTPUT_DIR is a TEMPORARY export directory that exists ONLY for the duration of the current tool call
- The OUTPUT_DIR path changes with EVERY tool execution (e.g., `/files/output/abc123/` becomes `/files/output/xyz789/`)
- Files placed in OUTPUT_DIR are automatically exported to the user
- After the tool call completes, OUTPUT_DIR is DELETED and cannot be accessed in subsequent tool calls
- NEVER attempt to read from OUTPUT_DIR in a follow-up command - the directory won't exist
- Copying to OUTPUT_DIR is the final step - once done, the file is exported. NO verification needed or possible
- If you need to verify exported files, save a copy to a persistent location (e.g., `/tmp/`) BEFORE copying to OUTPUT_DIR

Common mistake to AVOID:  
WRONG: Turn 1: cp file.csv $OUTPUT_DIR/  
WRONG: Turn 2: cat $OUTPUT_DIR/file.csv  # FAILS - OUTPUT_DIR no longer exists!

Correct approach:  
RIGHT: Turn 1: cp file.csv `/tmp/file.csv` && cp `/tmp/file.csv` $OUTPUT_DIR/  
RIGHT: Turn 2: cat `/tmp/file.csv`  # Works - file persists in `/tmp/`

Script guidelines:
- Write POSIX-compliant bash scripts
- Use proper error handling and exit codes
- Quote variables appropriately to handle spaces in filenames
- Keep scripts clean and well-organized

Container environment:
- NO internet access available
- Filesystem persists across multiple executions within the same container
- Standard Unix utilities available (coreutils, findutils, grep, sed, awk, etc.)
- Archive tools: tar, unzip, 7z, unrar
- Additional tools: ripgrep, fd, sqlite3, jq, imagemagick
- Files and scripts written by the text_editor tool are persisted in the path provided by it, which defaults to `/tmp` unless specified otherwise
- Python libraries for PDF manipulation and data processing are pre-installed
- Do not try to install new packages and libraries with pip as there is no internet access

```json
{
  "name": "bash_code_execution",
  "parameters": {
    "properties": {
      "command": {
        "description": "The bash command to run.",
        "type": "string"
      }
    },
    "required": [
      "command"
    ],
    "type": "object"
  }
}
```

## text_editor_code_execution

The text_editor tool enables viewing, creating, and modifying text files within the secure sandboxed container environment.

How it works:
- All file operations occur within the sandboxed container filesystem
- User-uploaded files are accessible via INPUT_DIR environment variable

CRITICAL - Environment variable usage in text_editor:  
FOR FILE PATHS (in tool parameters):
- Use '$INPUT_DIR/filename' to access uploaded files (the tool expands $INPUT_DIR)
- NEVER use $OUTPUT_DIR in file paths - this will cause hard failures
- To export files: save to `/tmp`, then use bash_execution with 'cp `/tmp/file` $OUTPUT_DIR/'

FOR FILE CONTENT (code you're writing):
- Treat INPUT_DIR and OUTPUT_DIR as normal environment variables
- Python: os.environ['INPUT_DIR'], os.environ['OUTPUT_DIR']
- Bash scripts: $INPUT_DIR, $OUTPUT_DIR
- These are just strings in your code content, not expanded by the tool

Command guidelines:
- Always use view before editing to understand file structure
- For str_replace commands, ensure search strings are unique and exact
- Include sufficient context in str_replace_based_edit_tool for accurate placement
- Use proper escaping for special characters in search/replace strings

Container environment:
- Shared filesystem with bash_execution and code_execution tools
- Files created or modified are immediately accessible to other tools
- No external network access
- Standard text encodings supported (UTF-8, ASCII, etc.)
- The default choice for paths for new files should be the `/tmp` directory
- Python libraries for PDF manipulation and data processing are pre-installed
- Do not try to install new packages with pip as there is no internet access
- NEVER use 'view' command on directories like $INPUT_DIR, `/tmp`, etc.

```json
{
  "name": "text_editor_code_execution",
  "parameters": {
    "properties": {
      "command": {
        "description": "The command to execute. Choose from: view, create, or str_replace.",
        "enum": [
          "view",
          "create",
          "str_replace"
        ],
        "type": "string"
      },
      "file_text": {
        "anyOf": [
          {
            "type": "string"
          },
          {
            "type": "null"
          }
        ],
        "description": "Required for create command. The text content to write to the file."
      },
      "new_str": {
        "anyOf": [
          {
            "type": "string"
          },
          {
            "type": "null"
          }
        ],
        "description": "Optional for str_replace command. The replacement string. If not provided, old_str will be deleted."
      },
      "old_str": {
        "anyOf": [
          {
            "type": "string"
          },
          {
            "type": "null"
          }
        ],
        "description": "Required for str_replace command. The exact string to replace in the file."
      },
      "path": {
        "description": "The file path to operate on. Do not use on directories. Do not use $OUTPUT_DIR in file path.",
        "type": "string"
      },
      "view_range": {
        "anyOf": [
          {
            "items": {
              "type": "integer"
            },
            "maxItems": 2,
            "minItems": 2,
            "type": "array"
          },
          {
            "type": "null"
          }
        ],
        "description": "Optional for view command. Format: [start_line, end_line] where lines are 1-indexed. Use [start_line, -1] to view from start_line to end of file."
      }
    },
    "required": [
      "command",
      "path"
    ],
    "type": "object"
  }
}
```
