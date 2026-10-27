# Files API - Java

## Files API

> **Out of beta.** In current SDKs `client.beta().files()` has breaking shape changes from previous versions, matching the stable `client.files()` - migrate per the Files API row in `shared/live-sources.md`. Examples below predate this.

Under `client.beta().files()`. This sample references the file from a message with the beta message types.

```java
import com.anthropic.models.beta.files.FileUploadParams;
import com.anthropic.models.beta.files.BetaFileMetadata;
import com.anthropic.models.beta.messages.BetaRequestDocumentBlock;
import com.anthropic.models.beta.messages.BetaFileDocumentSource;
import java.nio.file.Paths;

BetaFileMetadata meta = client.beta().files().upload(
    FileUploadParams.builder()
        .file(Paths.get("/path/to/doc.pdf"))  // or .file(InputStream) or .file(byte[])
        .build());

// Reference in a beta message:
BetaRequestDocumentBlock doc = BetaRequestDocumentBlock.builder()
    .source(BetaFileDocumentSource.builder().fileId(meta.id()).build())
    .build();
```

Other methods: `.list()`, `.delete(String fileId)`, `.download(String fileId)`, `.retrieveMetadata(String fileId)`.
