<!-- MCP server: Google Drive | captured 2026-07-16, Claude Code 2.1.211 -->

# Google Drive (MCP server)

## Tools (8)

### copy_file

Call this tool to copy an existing File in Google Drive.
The tool allows specifying a new title and a parent folder for the copy.
If the title is not specified, the copy title will be 'Copy of {original title}'If the parent folder is not specified, the copy will be created in the same folder as the original file, unless the requesting user does not have write access to that folder, in which case the copy will be created in the user's root folder.Returns the newly created File object upon successful copying.

```json
{
  "type": "object",
  "properties": {
    "fileId": {
      "description": "Required. The ID of the file to copy.",
      "type": "string"
    },
    "parentId": {
      "description": "The parent id of the newly created file. If empty, the file will be created with the same parent as the original file.",
      "type": "string"
    },
    "title": {
      "description": "The title of the newly created file. If empty, the title will be 'Copy of [original file title]'.",
      "type": "string"
    }
  },
  "required": [
    "fileId"
  ],
  "description": "Request to copy a file."
}
```

### create_file

Call this tool to create or upload a File to Google Drive.

If uploading content, prefer "text_content" for text content. For non-UTF8 contents, use the "base64_content" field and base64 encode the data to set on that field.

Returns a single File object upon successful creation.

The following Google first-party mime types can be created without providing content:

 - `application/vnd.google-apps.document` 
 - `application/vnd.google-apps.spreadsheet` 
 - `application/vnd.google-apps.presentation` 

Folders can be created by setting the mime type to `application/vnd.google-apps.folder`.

When uploading content, the `content_mime_type` field is required and should match the type of the content being uploaded.

By default, supported content will be converted to Google first-party mime types.

To disable conversions for first-party mime types, set `disable_conversion_to_google_type` to true.

```json
{
  "type": "object",
  "properties": {
    "base64Content": {
      "description": "Optional. The base64 encoded content to upload. It's an error to set this and text_content.",
      "type": "string"
    },
    "content": {
      "description": "The content of the file encoded as base64. The content field should always be base64 encoded regardless of the mime type of the file. DEPRECATED. Use base64_content or text_content instead.",
      "type": "string"
    },
    "contentMimeType": {
      "description": "The mime type of the content being uploaded. Required when any type of content is provided.",
      "type": "string"
    },
    "disableConversionToGoogleType": {
      "description": "Set to true to retain the passed in content mime type and not convert to a Google type. For example, without this a text/plain content mime type will be converted to to an application/vnd.google-apps.document. Has no effect for types that do not have a Google equivalent.",
      "type": "boolean"
    },
    "mimeType": {
      "description": "DEPRECATED. DO NOT USE!! Set content_mime_type instead.",
      "type": "string"
    },
    "parentId": {
      "description": "The parent id of the file.",
      "type": "string"
    },
    "textContent": {
      "description": "Optional. The (UTF-8) text content to upload. It's an error to set this and base64_content.",
      "type": "string"
    },
    "title": {
      "description": "The title of the file.",
      "type": "string"
    }
  },
  "description": "Request to upload a file."
}
```

### download_file_content

Call this tool to download the content of a Drive file as a base64 encoded string.

If the file is a Google Drive first-party mime type, the `exportMimeType` field is required and will determine the format of the downloaded file.

If the file is not found, try using other tools like `search_files` to find the file the user is requesting.

If the user wants a natural language representation of their Drive content, use the `read_file_content` tool (`read_file_content` should be smaller and easier to parse).

```json
{
  "type": "object",
  "properties": {
    "exportMimeType": {
      "description": "Optional. For Google native files, the MIME type to export the file to, ignored otherwise. Defaults to text if not specified.",
      "type": "string"
    },
    "fileId": {
      "description": "Required. The ID of the file to retrieve.",
      "type": "string"
    }
  },
  "required": [
    "fileId"
  ],
  "description": "Defines a request to download a file's content."
}
```

### get_file_metadata

Call this tool to find general metadata about a user's Drive file.

If the file is not found, try using other tools like `search_files` to find the file the user is requesting.

```json
{
  "type": "object",
  "properties": {
    "excludeContentSnippets": {
      "description": "If true, the content snippet will be excluded from the response.",
      "type": "boolean"
    },
    "fileId": {
      "description": "Required. The ID of the file to retrieve.",
      "type": "string"
    }
  },
  "required": [
    "fileId"
  ],
  "description": "Request to get the file."
}
```

### get_file_permissions

Call this tool to list the permissions of a Drive File.

```json
{
  "type": "object",
  "properties": {
    "fileId": {
      "description": "Required. The ID of the file to get permissions for.",
      "type": "string"
    }
  },
  "required": [
    "fileId"
  ],
  "description": "Request to get file permissions."
}
```

### list_recent_files

Call this tool to find recent files for a user specified a sort order. Default sort order is `recency`.

Supported sort orders are:

 - `recency`: The most recent timestamp from the file's date-time fields.
 - `lastModified`: The last time the file was modified by anyone.
 - `lastModifiedByMe`: The last time the file was modified by the user.

The default page size is 10. Utilize `next_page_token` to paginate through the results.

```json
{
  "type": "object",
  "properties": {
    "excludeContentSnippets": {
      "description": "If true, the content snippet will be excluded from the response.",
      "type": "boolean"
    },
    "orderBy": {
      "description": "The sort order for the files.",
      "type": "string"
    },
    "pageSize": {
      "description": "The maximum number of files to return.",
      "format": "int32",
      "type": "integer"
    },
    "pageToken": {
      "description": "The page token to use for pagination.",
      "type": "string"
    }
  },
  "description": "Request to list files."
}
```

### read_file_content

Call this tool to fetch a natural language representation of a Drive file, and optionally, its comments.

The file content may be incomplete for very large files. The text representation will change over time, so don't make assumptions about the particular format of the text returned by this tool.If supported, comment tags will be included in the content.

Supported Mime Types:

 - `application/vnd.google-apps.document` 
 - `application/vnd.google-apps.presentation` 
 - `application/vnd.google-apps.spreadsheet` 
 - `application/pdf` 
 - `application/msword` 
 - `application/vnd.openxmlformats-officedocument.wordprocessingml.document` 
 - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` 
 - `application/vnd.openxmlformats-officedocument.presentationml.presentation` 
 - `application/vnd.oasis.opendocument.spreadsheet` 
 - `application/vnd.oasis.opendocument.presentation` 
 - `application/x-vnd.oasis.opendocument.text` 
 - `image/png` 
 - `image/jpeg` 
 - `image/jpg` 

If the file is not found, try using other tools like `search_files` to find the file the user is requesting using keywords.

```json
{
  "type": "object",
  "properties": {
    "fileId": {
      "description": "Required. The ID of the file to retrieve.",
      "type": "string"
    },
    "includeComments": {
      "description": "Whether to include comments in the response. Comments will be inlined in the text content of the file with a mapping to the comment threads.",
      "type": "boolean"
    }
  },
  "required": [
    "fileId"
  ],
  "description": "Request to read file content with support for fetching comments."
}
```

### search_files

Search for Drive files using a structured query (syntax: `query_term operator values`).
Combine clauses with `and`, `or`, `not`, and parentheses. String values must be single-quoted; escape embedded quotes as `\'`. 

Query terms & operators:

 - `title` (ops: contains, =, !=) — file title
 - `fullText` (ops: contains) — title or body text
 - `mimeType` (ops: contains, =, !=) — MIME type
 - `modifiedTime`, `viewedByMeTime`, `createdTime` (ops: `<=`, `<`, `=`, `!=`, `>`, `>=`). Use RFC 3339 UTC, e.g., `2012-06-04T12:00:00-08:00`. Date types not comparable.
 - `parentId` (ops: `=`, `!=`). Use `'root'` for the user's "My Drive".
 - `owner` (ops: `=`, `!=`). Use `'me'` for the requesting user.
 - `sharedWithMe` (ops: `=`, `!=`). Values: `true` or `false`.

Other operators: `and`, `or`, `not`.

Examples:

 - `title contains 'hello' and title contains 'goodbye'`
 - `modifiedTime > '2024-01-01T00:00:00Z' and (mimeType contains 'image/' or mimeType contains 'video/')`
 - `parentId = '1234567'`
 - `fullText contains 'hello'`
 - `owner = 'test@example.org'`
 - `sharedWithMe = true`
 - `owner = 'me'` (for files owned by the user)

Use `next_page_token` to paginate. An empty response means no more results.

```json
{
  "type": "object",
  "properties": {
    "excludeContentSnippets": {
      "description": "If true, the content snippet will be excluded from the response.",
      "type": "boolean"
    },
    "pageSize": {
      "description": "The maximum number of files to return in each page.",
      "format": "int32",
      "type": "integer"
    },
    "pageToken": {
      "description": "The page token to use for pagination.",
      "type": "string"
    },
    "query": {
      "description": "The search query.",
      "type": "string"
    }
  },
  "description": "Request to search files."
}
```
