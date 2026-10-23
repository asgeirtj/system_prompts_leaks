# Manual test marketplace: add, install, try and update

Use the existing ZCode UI for the user handoff. The agent prepares source and the catalog; the user performs registration, installation, updates and trial. These steps require no global CLI or Node command.

## Source, catalog and installation

```text
<workspace>/plugins/my-plugin/       editable source
<workspace>/plugins/marketplace.json test catalog
             |
       user adds market in UI
             v
Host-managed market → user installs → installed copy
                                          |
                                   new-task trial
```

Give the actual absolute market root directory to paste, usually `<workspace>/plugins/`. It contains `marketplace.json`; it is not the individual plugin subdirectory. For `.claude-plugin/marketplace.json`, the market root is the parent of `.claude-plugin`.

The source, marketplace copy and installed copy are different locations. Registration/installation belongs to the target Host's user inventory. A local dev market is not public publishing or project-exclusive installation.

## First addition and installation

1. In the workspace/host where the files were created, open **插件市场 / Plugin Marketplace**.
2. Click **添加 / Add → 添加插件市场 / Add Plugin Marketplace**.
3. Paste the actual market root directory provided in the handoff, then click **添加 / Add**. Desktop local users can also choose the directory. For remote work or phone control, paste the directory on the target Host, not a path on the phone or an unrelated local computer.
4. After success, open **个人 / Personal** and find the actual market name and plugin. Check the displayed name, description and expected version in the plugin details.
5. Click **安装 / Install**. After installation, the plugin can also be managed under **设置 → 插件 / Settings → Plugins**. If it is disabled or needs configuration, explain the relevant manual enable/configuration action; preserve the user's choice.

Do not report a registered market or installed plugin merely because its source files exist. For a first delivery, state that addition, installation and trial are pending.

## Try it in a new task

Give a small acceptance prompt based on the implemented capability and describe an observable expected result. Ask the user to create a new task after installation. For skills, select the installed plugin/skill in the composer picker and send the prompt; do not fabricate an installed file path. For MCP or hooks, describe the intended tool result or trigger and any actual configuration requirement.

Old tasks may retain an earlier capability catalog. A successful installation alone does not prove the capability works. If the user has not run the example, mark the trial as pending; if they report a failure, use that evidence to debug it.

## Updating an existing plugin

The agent edits the original source, increments its manifest version and synchronizes that version and metadata into the same marketplace entry. Preserve the market name, plugin identity and unrelated entries; do not edit installed caches or re-scaffold implemented source.

Then guide the user to:

1. Open the marketplace page's gear button to **市场源 / Marketplace Sources**.
2. Find the actual dev market and click its refresh button (**刷新该市场 / Refresh this marketplace**). Reuse the existing source instead of adding it again.
3. Return to **个人 / Personal**, open the plugin details and click **更新 / Update** when available.
4. Confirm the expected version, retain the existing enabled/disabled choice, and run the acceptance example in a new task.

Source edits are not hot reload. A market refresh updates the catalog; the installed plugin still needs its update action.

## Errors, cancellation and delivery

- On addition/refresh failure, ask for the UI error and verify the supplied root, catalog JSON and relative source path. Keep source files intact. A same-name/different-source conflict needs a deliberate source choice; do not remove or rebind a market automatically.
- If no update appears, compare source and listing versions with the installed version and confirm the user refreshed the intended market on the same host.
- Cancellation or no user reply leaves the relevant action pending.
- Give actual paths, IDs and versions; all example values below must be replaced before sending the handoff.

Example Chinese handoff:

> 源码：〈实际源码目录〉；测试市场清单：〈实际清单文件〉。  
>  
> 请在"插件市场 → 添加 → 添加插件市场"粘贴：〈实际市场根目录〉。  
>  
> 添加后在"个人 → 〈实际市场名〉"找到"〈插件展示名〉"，点击安装。  
>  
> 安装后新建任务，选择该插件/技能并发送：〈具体验收提示〉。预期：〈可观察结果〉。  
>  
> 当前状态：源码和清单已生成；市场待手动添加，插件待安装，试用待验。
