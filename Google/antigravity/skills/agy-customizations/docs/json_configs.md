# JSON Configuration Files

JSON configuration files allow you to explicitly register and manage
customizations that are stored outside the default discovery locations (such as
project-specific folders or shared team directories).

Each customization type has its own configuration file, placed in your
customization root directory (e.g., `.agents/` in your project, or
`~/.gemini/config/` globally):

*   **Skills**: `skills.json`
*   **Plugins**: `plugins.json`

Inside a project, these files are honored in every `.agents/` directory between
the current working directory and the project root, so a config file at the
repository root applies no matter which subdirectory a session is started in.
Relative `path` entries resolve against the directory containing the dot-dir
that declares them, falling back to the project root when nothing exists there.

## Configuration Schema

Both configuration files share the same schema, allowing you to declare path
entries and inherit from other configurations.

```json
{
  "inherits": [
    {
      "path": "/path/to/shared/skills.json",
      "include_only": ["linter-skill"],
      "exclude": ["deprecated-skill"]
    }
  ],
  "entries": [
    {
      "path": "path/to/my/project/skills",
      "exclude": ["experimental-.*"]
    },
    {
      "path": "~/personal-skills"
    }
  ]
}
```

### Top-Level Fields

*   **`entries`** (array of objects, optional): A list of path entries to scan
    for customizations of this type. Each entry directory is scanned **one level
    deep**.
*   **`inherits`** (array of objects, optional): A list of other configuration
    files to inherit from. The entries from inherited files are merged with your
    local entries. Inherited files are processed in the order they are listed.

### Path Entry Fields

Each object in the `entries` or `inherits` array supports the following fields:

| Field          | Type             | Required | Description                   |
| :------------- | :--------------- | :------- | :---------------------------- |
| `path`         | string           | Yes      | The path to the customization |
:                :                  :          : directory (for `entries`) or  :  
:                :                  :          : another JSON config file (for :  
:                :                  :          : `inherits`).                  :  
| `include_only` | array of strings | No       | Patterns naming items         |
:                :                  :          : relative to `path`. If        :  
:                :                  :          : specified, only matching      :  
:                :                  :          : customizations will be        :  
:                :                  :          : loaded.                       :  
| `exclude`      | array of strings | No       | Patterns. Customizations      |
:                :                  :          : whose directory names match   :  
:                :                  :          : any of these patterns will be :  
:                :                  :          : skipped.                      :

## Explicitly Configured Paths

Config files are also honored on explicitly configured customization paths (e.g.
`skills_paths` in an agent's customization discovery config) when the configured
path points directly at a config file (e.g. `path/to/skills.json`). A configured
directory keeps its regular one-level scan; a manifest inside it is not
expanded. Directories referenced from manifest `entries` follow the standard
one-level entry scan, and top-level `exclude` patterns apply across all
explicitly configured paths, not just the one that declared them. They never
filter customizations inherited from the user's environment.

## Path Resolution Rules

The `path` field is resolved based on the following rules:

1.  **Absolute Paths**: Paths starting with `/` are treated as absolute local
    filesystem paths.
2.  **Home-Relative Paths**: Paths starting with `~/` are resolved relative to
    the user's home directory.
3.  **Workspace-Relative Paths**: Paths not starting with `/` or `~/` are
    resolved relative to the repository root (the folder containing `.git` or
    the root of the workspace).

### Pro-Tip: Team Sharing via VCS

To share customizations across a team:

1.  **Commit the Customizations**: Commit your team's skills to a shared
    directory in your repository (e.g., `tools/agents/skills/`).
2.  **Commit the Config**: Create and commit a `skills.json` at the root of your
    repository (in `.agents/skills.json`) that points to the shared directory
    using a workspace-relative path:

    ```json
    {
      "entries": [
        { "path": "tools/agents/skills" }
      ]
    }
    ```

3.  **Automatic Activation**: When other team members clone the repository and
    open it, the agent will automatically discover `.agents/skills.json` and
    load the shared skills.
