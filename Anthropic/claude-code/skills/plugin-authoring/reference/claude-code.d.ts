// Written by Claude Code 2.1.267.
// Claude Code function hooks: the plugin API's TypeScript declarations.
//
// EARLY ACCESS: this surface may change between releases without notice.
// Written by `/plugin-types`; regenerate with that command after an update
// rather than editing. The version that wrote it is on the line above.
//
// What is here: the module a hooks module may import types from,
//   import type { Register, On, EngineInterface } from 'claude-code'
// (at run time the import is empty), and the globals a hooks module has:
// `h` and `Fragment` (what JSX compiles against), the JSX namespace, and
// the environment's web APIs (URL, TextEncoder, AbortController,
// crypto.subtle, ...). A hooks module runs in an environment of its own:
// no DOM, no Node. The elements a render hook draws with (`Box`, `Text`,
// `Button`, ...) are not globals: they come from the surface's table,
//   const { Box, Text } = $.ui.resolve(e)
//
// Typing a plugin against it:
//   export const register: Register = (on, options) => { ... }
// or, in a .js module,
//   /** @type {import('claude-code').Register} */
//   export const register = (on, options) => { ... }
//
// A tsconfig.json (or jsconfig.json) that fits a hooks module:
//   {
//     "compilerOptions": {
//       "target": "es2023", "lib": ["es2023"], "types": [],
//       "module": "esnext", "moduleResolution": "bundler",
//       "strict": true, "noEmit": true, "skipLibCheck": true,
//       "jsx": "react", "jsxFactory": "h", "jsxFragmentFactory": "Fragment"
//     },
//     "include": [".claude/types", "hooks"]
//   }
// ".claude/types" is where /plugin-types writes; "hooks" is the plugin's
// hooks/ folder. `lib` names no DOM: the environment has none, and the
// DOM's own `Text` would shadow the element.

declare module 'claude-code' {
  /**
   * What an Agent call a plugin raised (`$.tool.call({ tool: "Agent", ... })`)
   * answers as `result` once the agent settles; `text` is its final answer.
   *
   * A plugin's spawn always runs in the background, so the call resolves with
   * this record and not the Agent tool's own (BuiltinToolResults), which is
   * what a model's Agent call carries at `tool.call`.
   */
  export type AgentCallRecord = {
      /**
       * The spawned agent's id, as `$.agent.list()` names it.
       */
      agentId: string;
      /**
       * The model the agent resolved to, when one is known.
       */
      resolvedModel?: string;
  };

  /**
   * One agent loop of this session as `$.agent.list()` returns it: a subagent
   * or an in-process teammate.
   */
  export type AgentInfo = {
      /**
       * The agent's id: the same string its loop's `tool.call` events carry as
       * `agentId`, and a spawn inside it as `parentAgentId`.
       */
      id: string;
      /**
       * Its row's label.
       */
      description: string;
      /**
       * The agent definition it runs as (`general-purpose`, `Explore`, ...), or
       * `teammate` for an in-process teammate.
       */
      type: string;
      /**
       * `running`, `completed`, `failed`, `killed`, or another of the engine's task
       * statuses.
       */
      status: string;
      /**
       * The id of the subagent whose loop spawned it; absent when the main loop
       * did.
       */
      parentId?: string;
      /**
       * The plugin whose `$.agent.spawn` (or Agent `$.tool.call`) started it;
       * absent when the model or the person did.
       *
       * The origin axis: which plugin caused it, whichever loop that hook ran in.
       */
      spawnedBy?: string;
      /**
       * What SendMessage addresses it by (`Agent({ name })`, or the engine's own
       * for a background agent), when it has one; not `description` or `type`.
       */
      name?: string;
  };

  /**
   * Which model loop an event happened in: the loop's agent id inside a
   * subagent's or a teammate's loop, absent on the main loop.
   *
   * The agent axis, not the origin axis: `next.origin` names the plugin whose
   * hook frame caused the dispatch (the recursion skip), whichever loop it ran
   * in; `agentId` names the loop, whoever caused the call.
   */
  export type AgentLoop = {
      /**
       * The id of the loop this call runs in: for a subagent or a teammate, the
       * `id` `$.agent.list()` gives it; absent on the main loop.
       *
       * A workflow's agents and the engine's own forks (compaction, memory) carry
       * ids no list names. Pinned: a different value is refused, one left out is
       * kept. Which loop, not which plugin caused it (that is `next.origin`).
       */
      agentId?: string;
  };

  /**
   * The input of `agent.offer`: one agent type, at the moment the engine
   * offers it to the model.
   *
   * Listed for the model (the agent listing) or named by it at dispatch
   * (`subagent_type`): the same event at each.
   */
  export type AgentOfferInput = {
      /**
       * Which type (`Explore`, `advisor`, a plugin's agent); the key a matcher
       * narrows on.
       */
      agent: string;
      /**
       * Its listing line's text as the definition states it (`whenToUse`).
       */
      description: string;
      /**
       * Where the definition came from (`built-in`, `plugin`, a settings
       * source), so a matcher tells a built-in from a user's agent of its name.
       */
      source: string;
      /**
       * Who provides this agent: the plugin and its tier; `{ plugin: "engine",
       * tier: "core" }` for a built-in. Pinned: a rewrite is refused.
       */
      provider: Origin;
  };

  /**
   * What an `agent.offer` hook returns: whether the model is offered the agent
   * type, in its listing and at dispatch.
   */
  export type AgentOfferResult = {
      isOffered: boolean;
  };

  /**
   * `agent.spawn`'s input as the call takes it: what the Agent tool's caller
   * says; the engine fills the rest.
   */
  export type AgentSpawnArgs = Pick<AgentSpawnInput, 'prompt'> & Partial<Pick<AgentSpawnInput, 'description' | 'subagentType' | 'model' | 'name' | 'cwd' | 'background'>>;

  /**
   * The input of `agent.spawn` (agent-spawn/): what the Agent tool decided
   * about the subagent it is about to start, before its model is resolved.
   *
   * A hook rewrites content (prompt, description, subagentType, model,
   * background, cwd), read back as the tool's parameters; tool_use_id, name,
   * fork, parentModel, permissionMode, parentAgentId and provider are pinned.
   */
  export type AgentSpawnInput = {
      /**
       * The Agent tool call this spawn belongs to (for `$.ui.notice`). Pinned:
       * the spawn's identity.
       */
      tool_use_id: string;
      /**
       * The task the subagent is given: the Agent tool's `prompt` parameter. A
       * rewrite is the prompt the subagent runs with.
       */
      prompt: string;
      /**
       * The Agent tool's short `description` of the task (a few words). A rewrite
       * is what the task shows as.
       */
      description: string;
      /**
       * The resolved agent type (`general-purpose`, `Explore`, a plugin's agent,
       * `fork`). A rewrite names another agent this call can dispatch, exactly.
       *
       * That definition is the one spawned; a name matching none refuses the
       * spawn, and a fork dispatches no other.
       */
      subagentType: string;
      /**
       * Who provides this agent: the plugin and its tier; `{ plugin: "engine",
       * tier: "core" }` for a built-in. Pinned with the spawn's identity.
       */
      provider: Origin;
      /**
       * The Agent tool's `model` parameter as given, an alias (`haiku`) or a
       * full id; undefined lets the agent's own model, then the parent's, decide.
       *
       * Ignored for forks, which always inherit. A hook sets this to pick the
       * subagent's model.
       */
      model?: string;
      /**
       * The parent's effective model, what `inherit` resolves to. Pinned: a fact
       * of the parent (set `model` to change what the subagent runs on).
       */
      parentModel: string;
      /**
       * The id of the loop the spawn happens in (its `tool.call` `agentId`; for a
       * subagent or teammate its `$.agent.list()` id); absent from main.
       *
       * Pinned: a different value is refused, one left out is kept. The agent
       * axis, not the origin: `next.origin` names the plugin whose hook frame
       * caused the spawn, this names the model loop it happened in.
       */
      parentAgentId?: string;
      /**
       * The parent's permission mode (`default`, `acceptEdits`, `plan`, ...), which
       * the subagent inherits. Pinned: a fact of the parent.
       */
      permissionMode?: string;
      /**
       * True when the subagent will run in the background (or remotely). A
       * rewrite is read back as the call's `run_in_background`.
       *
       * The agent's own definition, coordinator mode and remote isolation can
       * still force it on, and disabled background tasks force it off.
       */
      background: boolean;
      /**
       * True for a fork of the parent: it inherits the parent's context and model,
       * and `model` is ignored. Pinned: the spawn's identity.
       */
      fork: boolean;
      /**
       * Given by the call (`Agent({ name })`, addressable by SendMessage);
       * undefined when unnamed. Pinned: the address the parent routes by.
       */
      name?: string;
      /**
       * The directory the subagent runs in when the call set one (`cwd`); undefined
       * means the parent's. A rewrite is where the subagent runs.
       */
      cwd?: string;
  };

  /**
   * What an `agent.spawn` hook returns and what `next(e)` resolves to:
   * `{ model }`, or `{ deny: reason }`, which refuses the spawn.
   *
   * `$.agent.spawn(input)` resolves to `{ model, text, isError }` once the
   * subagent ran; a `deny` there means the spawn was refused and nothing ran.
   */
  export type AgentSpawnResult = {
      /**
       * What the subagent runs on: from core the resolved id; from a hook an
       * alias (`haiku`) or an id, resolved like the Agent tool's parameter.
       */
      model: string;
      /**
       * The subagent's final message, or why its run failed when `isError`.
       *
       * Set on what `$.agent.spawn(input)` resolves to; absent at the event,
       * which fires before the run.
       */
      text?: string;
      /**
       * Set by core on what `$.agent.spawn(input)` resolves to, present only
       * when the subagent ran and failed (`text` says why).
       *
       * Absent at the event, which fires before the run.
       */
      isError?: true;
      deny?: undefined;
  } | {
      /**
       * Refuses the spawn, so nothing runs; the model sees the text as the
       * Agent tool's error.
       */
      deny: string;
      model?: undefined;
      text?: undefined;
      isError?: undefined;
  };

  /**
   * The hook `on("*", hook)` takes: it runs on every event, plugin nouns no
   * declaration names included, so `e` is `unknown` and `next` is StarNext.
   *
   * Until `next.is(pattern, e)` narrows `e`, all a hook can do with it is pass
   * it on, time it, log it, or fail it; once narrowed it is an ordinary hook on
   * those events.
   *
   * @param $ the engine interface; at `engine.create` the empty table, so a hook
   *          that reads `$` tests `next.is("engine.create", e)` first
   */
  export type AnyEventHook = ($: EngineInterface, e: unknown, next: StarNext) => unknown;

  /**
   * Every key of every variant, index signatures included.
   */
  type AnyKeyOf<I> = I extends unknown ? keyof I : never;

  /**
   * The argument of event `N`: `e` in its hooks, and what its call takes. For a
   * union of names, the union of their arguments.
   */
  export type Args<N extends EventName = EventName> = EventOf[N];

  /**
   * Options of `$.ui.ask`.
   */
  export type AskProps = {
      /**
       * 2-4 option labels; fewer than two are padded with Yes/No; free text is the
       * dialog's Other.
       */
      options?: readonly string[];
      /**
       * A short chip beside the question (`Approach`, 12 characters at most).
       */
      header?: string;
      /**
       * Allow several options; the answer comes back comma-joined.
       */
      multiSelect?: boolean;
  };

  /**
   * The input of `attribution.text`: one text the engine asks the model to
   * write into a commit or a pull request, at the moment it is composed.
   *
   * Composed for the Bash description, the commit skills, a PR's body, the
   * pre-ship mandate and the commit gate's deny: the same event at each.
   */
  export type AttributionTextInput = {
      /**
       * Which text (`commit`, `pr`, `exemption`, `remedy`); the key a matcher
       * narrows on.
       */
      kind: AttributionTextKind;
      /**
       * As the engine composed it, the settings applied.
       */
      text: string;
  };

  /**
   * Which git text `attribution.text` carries: the commit trailer, the PR
   * footer, the mandate's or the commit gate's sentence naming the exemption.
   */
  export type AttributionTextKind = 'commit' | 'pr' | 'exemption' | 'remedy';

  /**
   * What an `attribution.text` hook returns: the text the model reads in
   * that place.
   */
  export type AttributionTextResult = {
      text: string;
  };

  /**
   * What `$.audio.play` plays: a URL the engine fetches, or the bytes.
   */
  export type AudioClip = {
      /**
       * A file of the calling plugin's own, relative to the plugin's
       * directory (`fx/open.wav`); no `.`, no leading slash.
       *
       * The engine resolves and loads it: in a page, the plugin's served
       * copy; in the CLI, the file on disk.
       */
      asset: string;
      url?: undefined;
      base64?: undefined;
      mime?: undefined;
  } | {
      /**
       * The clip's URL; the engine fetches it (never the plugin).
       */
      url: string;
      asset?: undefined;
      base64?: undefined;
      mime?: undefined;
  } | {
      /**
       * The clip's bytes, base64.
       */
      base64: string;
      /**
       * What the bytes are (`audio/mpeg`, `audio/wav`).
       */
      mime: string;
      asset?: undefined;
      url?: undefined;
  };

  type BackgroundTaskSummary = {
      id: string;
      /**
       * Friendly task-type label (e.g. 'shell', 'subagent', 'monitor', 'workflow'). Falls back to the raw discriminant for unknown types.
       */
      type: string;
      status: string;
      /**
       * Free-text description. Capped at 1000 chars; clipped values append an in-string "... [+N chars]" marker.
       */
      description: string;
      /**
       * Shell command line. Only present for 'shell' tasks. Capped at 1000 chars with the same "... [+N chars]" marker.
       */
      command?: string;
      /**
       * Subagent type name. Only present for 'subagent' tasks.
       */
      agent_type?: string;
      /**
       * MCP server name. Only present for 'monitor' / 'MCP task' tasks.
       */
      server?: string;
      /**
       * MCP tool name. Only present for 'monitor' / 'MCP task' tasks.
       */
      tool?: string;
      /**
       * Workflow name. Only present for 'workflow' tasks.
       */
      name?: string;
  };

  type BaseHookInput = {
      session_id: string;
      transcript_path: string;
      cwd: string;
      /**
       * UUID correlating a user prompt with all subsequent events until the next prompt. Same value emitted on OpenTelemetry events as the `prompt.id` attribute, so hook output can be joined to OTel events at prompt grain. Absent until the first user input of the process lifetime.
       */
      prompt_id?: string;
      permission_mode?: string;
      /**
       * Subagent identifier. Present only when the hook fires from within a subagent (e.g., a tool called by an AgentTool worker). Absent for the main thread, even in --agent sessions. Use this field (not agent_type) to distinguish subagent calls from main-thread calls.
       */
      agent_id?: string;
      /**
       * Agent type name (e.g., "general-purpose", "code-reviewer"). Present when the hook fires from within a subagent (alongside agent_id), or on the main thread of a session started with --agent (without agent_id).
       */
      agent_type?: string;
      /**
       * Reasoning effort applied to the current turn. Same shape as StatusLineCommandInput.effort. Present for hooks that fire within a tool-use context (PreToolUse, PostToolUse, Stop, SubagentStop, etc.) on a model that supports the effort parameter; absent for session-lifecycle hooks and models without effort support.
       */
      effort?: {
          /**
           * Active effort level for the current turn (e.g., "low", "medium", "high", "xhigh", "max"), after any silent downgrade for the selected model. Also exposed to hook commands and Bash as the CLAUDE_EFFORT env var.
           */
          level: string;
      };
  };

  /**
   * The `Box` props a `hover` may override, none of which moves layout: colors,
   * the style of a border the Box already has, and `display` to reveal.
   *
   * `display` is `"flex"` alone, on a Box drawn `display: "none"` inside a
   * visible keyed Box; `borderStyle` restyles, it never adds a border.
   */
  export type BoxHoverProps = {
      borderStyle?: string;
      borderColor?: string;
      borderDimColor?: boolean;
      backgroundColor?: string;
      display?: 'flex';
  };

  /**
   * The props of `Box`: the layout, margin, padding and border props of Ink's Box
   * a tree may set (render-site/ RENDER_PROPS), and the two of hover.
   */
  export type BoxProps = {
      /**
       * Makes the Box a hover scope: while the pointer is anywhere over it, its
       * own `hover` and that of every element beneath it apply.
       *
       * A nested Box with a `key` of its own scopes what is beneath it. A key a
       * sibling Box already took, or one that is no plain string, names no
       * scope: the Box draws, and hovers beneath it stay inert.
       */
      key?: string;
      /**
       * Style overrides applied by the surface while the pointer is over the
       * nearest `Box` with a `key`, this one included; never a layout change.
       *
       * No hook runs and nothing crosses to the plugin. To reveal on hover, keep
       * the keyed Box visible and draw a Box inside it `display: "none"` with
       * `hover: { display: "flex" }`. Refused outside a keyed Box (hoverProblem).
       */
      hover?: BoxHoverProps;
      flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
      flexGrow?: number;
      flexShrink?: number;
      flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
      alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
      alignSelf?: 'flex-start' | 'center' | 'flex-end' | 'auto';
      justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
      gap?: number;
      columnGap?: number;
      rowGap?: number;
      width?: number | string;
      height?: number | string;
      minWidth?: number | string;
      minHeight?: number | string;
      margin?: number;
      marginX?: number;
      marginY?: number;
      marginTop?: number;
      marginBottom?: number;
      marginLeft?: number;
      marginRight?: number;
      padding?: number;
      paddingX?: number;
      paddingY?: number;
      paddingTop?: number;
      paddingBottom?: number;
      paddingLeft?: number;
      paddingRight?: number;
      borderStyle?: string;
      borderColor?: string;
      borderDimColor?: boolean;
      backgroundColor?: string;
      overflow?: 'visible' | 'hidden';
      display?: 'flex' | 'none';
  };

  /**
   * One variant per built-in tool; with none in the table (a plugin author's
   * project before `/plugin-types` ran), one loose variant over every name.
   */
  export type BuiltinToolCallInput = [BuiltinToolName] extends [never] ? BuiltinToolCallInputFallback : {
      [N in BuiltinToolName]: ToolInputOf<N, BuiltinToolInputs[N]>;
  }[BuiltinToolName];

  /**
   * The built-in branch's answer when no built-in tool is declared: every
   * name, its args unconstrained.
   */
  type BuiltinToolCallInputFallback = {
      /**
       * The name of the tool being called (`Bash`); comparing it narrows `e` once
       * the table has entries. Reserved: a rewrite of it is ignored by core.
       */
      tool: string;
      /**
       * The tool_use block's id: the same at every event of the call and in
       * `$.ui.notice`. Reserved: a rewrite of it is ignored by core.
       */
      tool_use_id: string;
      [argument: string]: unknown;
  };

  /**
   * The arguments of each built-in tool by name, for declaration merging;
   * empty until a declaration file adds entries, then `e.tool === "Bash"`
   * narrows `e` to Bash's arguments.
   *
   * `/plugin-types` writes this build's set beneath the engine's declarations
   * (claude-code.d.ts), from each tool's input schema.
   *
   * @example
   * interface BuiltinToolInputs { Bash: { command: string; timeout?: number } }
   */
  export interface BuiltinToolInputs {
  }

  /**
   * The names of the built-in tools (tool-inputs/).
   */
  export type BuiltinToolName = keyof BuiltinToolInputs & string;

  /**
   * The structured result of each built-in tool by name, for declaration
   * merging; empty until a declaration file adds entries, then after
   * `e.tool === "Bash"` the `result` of `next(e)` is Bash's record.
   *
   * `/plugin-types` writes this build's set beneath the engine's declarations
   * (claude-code.d.ts), from each tool's output schema; a tool without one is
   * `unknown`.
   *
   * @example
   * interface BuiltinToolResults { Bash: { stdout: string; stderr: string } }
   */
  export interface BuiltinToolResults {
  }

  /**
   * The props of `Button`, every surface's pressable leaf: an address, a
   * label, the closure a press runs, and the label styles a hover overrides.
   *
   * The terminal draws `[ label ]` (or `1: label` when `plain`), a desktop a
   * native button; a click, a `hotkey`, or Enter while it has the focus
   * (`abovePrompt:focus`) raises `ui.press`, whose bottom is `onPress`. A leaf.
   */
  export type ButtonProps = {
      /**
       * The element's address: `e.element` at `ui.press`, what a matcher names.
       * Defaults to the label.
       */
      key?: string;
      /**
       * The text drawn on the button; or the one string child.
       */
      label?: string;
      /**
       * One digit (`"1"`) or one lowercase letter (`"w"`) that presses it where
       * the site honours one (the `AbovePrompt` band); anything else is refused.
       *
       * A digit presses from an empty composer; a digit or letter presses on
       * keydown while one of the band's Buttons has the focus (Shift+w matches
       * `"w"`; held keys repeat). Of two Buttons on one hotkey the later wins.
       */
      hotkey?: string;
      /**
       * Drawn without chrome: the hotkey in the accent color, a colon, the
       * label (`1: Yes`), as a survey's row reads.
       */
      plain?: true;
      /**
       * Label style overrides (the `Text` set) applied by the surface while the
       * pointer is over the nearest enclosing `Box` that carries a `key`.
       *
       * No hook runs and nothing crosses to the plugin; under the pointer itself
       * the button inverts as it always has. Refused outside a keyed Box.
       */
      hover?: TextHoverProps;
      /**
       * What the press runs, in the plugin's own environment: the bottom of the
       * `ui.press` chain. The host holds only a handle, for the drawing's life.
       */
      onPress: () => void;
  };

  /**
   * The handler `on(...).catch(handler)` takes for a hook of type `F`: the
   * hook's `($, e, next)`, run afresh when it throws, misreturns or overruns.
   *
   * `next` carries `error` and `called` (Caught) and is replay-safe. A return
   * within the grace is the hook's result, held to the event's shape as the
   * hook's is; `undefined` stands for `await next(e)`, the hook absent.
   */
  export type CatchHandler<F> = F extends ($: infer D, e: infer E, next: infer N) => infer R ? ($: D, e: E, next: N & Caught) => R | undefined | Promise<Awaited<R> | undefined> : never;

  /**
   * What `next` carries into a `.catch` handler and nowhere else: why the
   * hook failed, and whether it had called `next` before it did.
   *
   * There `next` is replay-safe: when `called`, `next(e)` resolves to what the
   * hook's last call settled to, nothing beneath running again, the argument
   * unread; when not, it runs the hooks beneath once and a later call replays.
   */
  export type Caught = {
      /**
       * Why the hook failed (HookFailure); undefined on an ordinary hook's
       * `next`, so its presence says a handler is running.
       */
      readonly error: HookFailure;
      /**
       * True when the failed hook had called `next()` or `next.to()` at least
       * once, settled or in flight; the handler runs once that call settled.
       */
      readonly called: boolean;
  };

  /**
   * The name of a classic hook event as a function-hooks event: the settings
   * hook's own name under `classic` (`classic.Stop`, `classic.PreToolUse`).
   */
  export type ClassicEventName = `classic.${ClassicHookEvent}`;

  /**
   * The classic (settings) hook events, one per classic event name: `e` is
   * what the classic hook receives on stdin for that event.
   *
   * The chain is [managed settings hooks, ...hooks modules, the other settings
   * hooks as core], so a managed block ends it above every module. In shape
   * `classic.PreToolUse` alone differs: its `e` is ToolCallEnvelope, no more.
   */
  export type ClassicEventOf = {
      [E in ClassicHookEvent as `classic.${E}`]: E extends 'PreToolUse' ? ToolCallEnvelope : ClassicHookInputs[E];
  };

  /**
   * The name of a classic hook event: `PreToolUse`, `Stop`, and the rest.
   */
  export type ClassicHookEvent = HookInput['hook_event_name'];

  /**
   * What a classic hook receives on stdin for each event, by event name: the
   * Agent SDK's `<Event>HookInput`.
   */
  export type ClassicHookInputs = {
      [I in HookInput as I['hook_event_name']]: I;
  };

  /**
   * Everything a classic hook event's answer can carry, named as the classic
   * hook's JSON output names it; each event reads its subset (ClassicResultOf).
   *
   * The settings hooks below fold into one of these (last write wins, contexts
   * concatenate); a hooks module returns `next(e)`, a copy with fields changed,
   * or its own. A field of the wrong shape fails the hook, which is skipped.
   */
  export type ClassicResult = {
      /**
       * `decision: "block"` with this text as `reason` (a command hook's exit
       * code 2): the event's block, veto or re-prompt, as docs/hooks.md has it.
       */
      block?: string;
      /**
       * `continue: false`: the session stops after this event.
       */
      preventContinuation?: true;
      /**
       * Shown when `preventContinuation` stops the session (`stopReason`).
       */
      stopReason?: string;
      /**
       * `hookSpecificOutput.additionalContext`, one entry per hook: text handed
       * to the model with the event.
       */
      additionalContext?: string[];
      /**
       * `hookSpecificOutput.sessionTitle` (UserPromptSubmit, SessionStart).
       */
      sessionTitle?: string;
      /**
       * `hookSpecificOutput.suppressOriginalPrompt` (UserPromptSubmit,
       * UserPromptExpansion).
       */
      suppressOriginalPrompt?: true;
      /**
       * `hookSpecificOutput.initialUserMessage` (SessionStart).
       */
      initialUserMessage?: string;
      /**
       * `hookSpecificOutput.watchPaths` (SessionStart).
       */
      watchPaths?: string[];
      /**
       * `hookSpecificOutput.reloadSkills` (SessionStart).
       */
      reloadSkills?: true;
      /**
       * `hookSpecificOutput.permissionDecision` (PreModelSwitch).
       */
      permissionDecision?: 'allow' | 'deny' | 'ask';
      /**
       * `hookSpecificOutput.permissionDecisionReason` (PreModelSwitch).
       */
      permissionDecisionReason?: string;
      /**
       * `hookSpecificOutput.decision` (PermissionRequest).
       */
      decision?: PermissionRequestDecision;
      /**
       * `hookSpecificOutput.updatedToolOutput` (PostToolUse): replaces what the
       * model sees of the tool's result.
       */
      updatedToolOutput?: unknown;
      /**
       * `hookSpecificOutput.updatedMCPToolOutput` (PostToolUse, MCP tools only).
       */
      updatedMCPToolOutput?: unknown;
      /**
       * `hookSpecificOutput.retry` (PermissionDenied).
       */
      retry?: true;
      /**
       * `hookSpecificOutput.displayContent` (MessageDisplay).
       */
      displayContent?: string;
      /**
       * `hookSpecificOutput.worktreePath` (WorktreeCreate; a command hook prints
       * it): the worktree the hook created, absolute or relative to its cwd.
       *
       * Left unset, the session creates its git worktree as it would unhooked.
       */
      worktreePath?: string;
  };

  /**
   * The event-specific fields of ClassicResult each classic event reads (its
   * `hookSpecificOutput`), by event; an event absent here reads none of them.
   *
   * `block`, `preventContinuation` and `stopReason` are every event's.
   */
  export type ClassicResultFields = {
      UserPromptSubmit: 'additionalContext' | 'sessionTitle' | 'suppressOriginalPrompt';
      UserPromptExpansion: 'additionalContext' | 'suppressOriginalPrompt';
      SessionStart: 'additionalContext' | 'initialUserMessage' | 'sessionTitle' | 'watchPaths' | 'reloadSkills';
      Setup: 'additionalContext';
      PreModelSwitch: 'permissionDecision' | 'permissionDecisionReason';
      PostModelSwitch: 'additionalContext';
      SubagentStart: 'additionalContext';
      PostToolUse: 'additionalContext' | 'updatedToolOutput' | 'updatedMCPToolOutput';
      PostToolUseFailure: 'additionalContext';
      PostToolBatch: 'additionalContext';
      Stop: 'additionalContext';
      SubagentStop: 'additionalContext';
      PermissionDenied: 'retry';
      PermissionRequest: 'decision';
      MessageDisplay: 'displayContent';
      WorktreeCreate: 'worktreePath';
  };

  /**
   * What each classic hook event's hook returns and its `next(e)` resolves to:
   * the event's own subset of ClassicResult.
   *
   * `classic.PreToolUse` keeps its `allow` / `ask` / `deny` result
   * (PreToolUseResult).
   */
  export type ClassicResultOf = {
      [E in ClassicHookEvent as `classic.${E}`]: E extends 'PreToolUse' ? PreToolUseResult : Pick<ClassicResult, 'block' | 'preventContinuation' | 'stopReason' | (E extends keyof ClassicResultFields ? ClassicResultFields[E] : never)>;
  };

  /**
   * Options of `$.model.classify`.
   */
  export type ClassifyOptions = {
      /**
       * An alias (`haiku`) or a full model id; default the engine's small fast
       * model.
       */
      model?: string;
  };

  /**
   * The element table a surface module draws with, `surface.elements`: the
   * terminal's constructors (types/ Elements) less `Client` (none nests).
   *
   * What `$.ui.resolve(e)` is to a hooks module, with no `$` and no hook
   * between: `const { Box, Text } = surface.elements`, then `<Box>`. A Button,
   * Input or Select keeps its handler here and still raises `ui.press` etc.
   */
  export type ClientElements = Omit<Elements['terminal'], 'Client'>;

  /**
   * One key the person pressed while a `Client` had the focus, as
   * `surface.onKey` hands it. Escape never arrives: it returns the focus.
   */
  export type ClientKeyEvent = {
      /**
       * A special key's name (`up`, `down`, `left`, `right`, `return`, `tab`,
       * `backspace`, `delete`, `pageup`, `home`, ...) or the character typed.
       */
      key: string;
      /**
       * Modifier keys held with it, each present only when true.
       */
      ctrl?: true;
      shift?: true;
      meta?: true;
  };

  /**
   * One export of a plugin's surface module: from the `Client`'s props and the
   * instance's surface to the tree drawn in its region (no nested `Client`).
   *
   * Runs in the plugin's surface environment on the drawing thread, under a
   * time budget per call; a throw or an overrun unmounts the instance and
   * draws one line naming the plugin and the export in its place.
   */
  export type ClientModule<P extends JsonValue = JsonValue, S = unknown> = (props: P, surface: ClientSurface<S>) => RenderElement;

  /**
   * One pointer event over a `Client`'s region, as `surface.onPointer` hands
   * it: cell coordinates relative to the region's top-left corner.
   *
   * After a `down` in the region the instance holds the pointer until the
   * `up`: every `move` reaches it, past the edges too (negative, or beyond
   * `columns`/`rows`), and the transcript neither selects nor scrolls.
   */
  export type ClientPointerEvent = {
      type: ClientPointerType;
      /**
       * The column under the pointer, 0 at the region's left edge; on `enter`
       * and `leave`, the last column a move reported.
       */
      x: number;
      /**
       * The row under the pointer, 0 at the region's top edge.
       */
      y: number;
      /**
       * Which button is down (`down`, `move` while held) or came up (`up`);
       * absent on a hover `move`, `enter` and `leave`.
       */
      button?: 'left' | 'middle' | 'right';
      /**
       * Modifier keys the terminal reported held, each present only when true.
       */
      shift?: true;
      alt?: true;
      ctrl?: true;
  };

  /**
   * What the pointer did over a `Client`'s region: a button went down, the
   * pointer moved, the button came up, or the pointer crossed the region's edge.
   */
  export type ClientPointerType = 'down' | 'move' | 'up' | 'enter' | 'leave';

  /**
   * The props of `Client`: which export of the plugin's surface module draws
   * here, under what key, with what data, in how much room.
   */
  export type ClientProps = {
      /**
       * The instance's address within the drawing: two `Client`s of one plugin in
       * one tree take two keys. What `e.element` carries at `ui.message`.
       *
       * The engine keeps the instance (its local state, its timers) across the
       * plugin's redraws while a `Client` under this key stays in the tree.
       */
      key: string;
      /**
       * The name of the export of the plugin's surface module that draws the
       * instance: `export function List(props, surface)` is `module: "List"`.
       */
      module: string;
      /**
       * Plain data (JsonValue) handed to the module function; a new value on a
       * redraw reaches the running instance, its state kept.
       *
       * Bounded as a tree's text is (validateTree); not a channel for closures.
       * Typed `unknown` so a matcher over a tree stays shallow.
       */
      props?: unknown;
      /**
       * Columns the instance's region takes: a count, or a percentage of the
       * parent. Absent, the region is as wide as what the module draws.
       */
      width?: number | string;
      /**
       * Rows the instance's region takes: a count, or a percentage of the parent.
       * Absent, the region is as tall as what the module draws.
       */
      height?: number | string;
      /**
       * How the region grows into free room along the parent's direction, as a
       * Box's `flexGrow`.
       */
      flexGrow?: number;
  };

  /**
   * What a surface module's function receives as its second argument: its
   * elements, the instance's local state, its region, input, clock and port.
   *
   * Called again (same `surface`, same `state`) on new props, after
   * `setState`, and on a resize; what it returns is drawn in the region. No
   * `$` here: the hooks module has it, and `post` is the way to reach it.
   */
  export type ClientSurface<S = unknown> = {
      /**
       * The surface's element table (ClientElements), the tags the module draws
       * with: `const { Box, Text } = surface.elements`. No `Client` in it.
       */
      readonly elements: ClientElements;
      /**
       * The instance's local state: `undefined` until the first `setState`.
       * Kept across the plugin's redraws; dropped with the instance.
       */
      readonly state: S | undefined;
      /**
       * Replaces the local state and schedules one more call of the function on
       * the next frame; several calls before it coalesce into one redraw.
       */
      setState: (next: S) => void;
      /**
       * The region's width in cells, as last laid out (0 before the first
       * layout).
       */
      readonly columns: number;
      /**
       * The region's height in cells, as last laid out (0 before the first
       * layout).
       */
      readonly rows: number;
      /**
       * Calls `fn` every `ms` milliseconds on the surface's frame clock until
       * the returned function is called or the instance unmounts.
       *
       * Start it once (while `state` is still undefined), not on every call.
       */
      every: (ms: number, fn: () => void) => () => void;
      /**
       * Sets the instance's pointer listener (one; a later call replaces it)
       * and returns what clears it. See ClientPointerEvent for capture.
       */
      onPointer: (fn: (event: ClientPointerEvent) => void) => () => void;
      /**
       * Sets the instance's key listener (one; a later call replaces it),
       * reached while a click has given it the focus; Escape returns that.
       */
      onKey: (fn: (event: ClientKeyEvent) => void) => () => void;
      /**
       * Sends plain data to the plugin's hooks module: `e.data` of a
       * `ui.message` only that plugin's hooks see, one per frame at most.
       *
       * A later post in the same frame replaces an undelivered one; a hook
       * answering `{ props }` hands this instance its next props.
       */
      post: (data: JsonValue) => void;
  };

  /**
   * The props of `Code`, source text every surface draws with the engine's own
   * highlighter: coloured tokens, a line gutter on request, or a unified diff.
   *
   * A leaf: no children. `source` is the element's data as a string is a
   * Text's, bounded and free of control characters the same way (render-site/
   * codeProblem); the colour on screen is the engine's, never the plugin's.
   */
  export type CodeProps = {
      /**
       * The text drawn: source code, or under `format: 'diff'` one or more
       * unified-diff hunks.
       *
       * At most MAX_TEXT_CHARS; tab and newline are the only control characters
       * it may hold.
       */
      source: string;
      /**
       * A highlight.js language id or alias (`typescript`, `ts`, `py`), a
       * plugin-contributed grammar's included.
       *
       * Absent, the language is inferred from `path`; when neither resolves,
       * the text is drawn plain.
       */
      language?: string;
      /**
       * A file path the language is inferred from when `language` is absent:
       * its extension or name, else a shebang on the first line.
       *
       * Drawn nowhere and never read: nothing touches the disk.
       */
      path?: string;
      /**
       * The 1-based number of the first line of `source`: present, a dim
       * right-aligned gutter numbers the lines from it; absent, no gutter.
       *
       * Ignored under `format: 'diff'`, whose hunks carry their own numbers.
       */
      startLine?: number;
      /**
       * `'source'` (the default) draws `source` as code; `'diff'` reads it as
       * unified-diff hunks and draws gutters, markers, add and remove colouring.
       *
       * A hunk is `@@ -a,b +c,d @@` then lines starting ` `, `+` or `-`; a
       * leading `---`/`+++` pair and `\ No newline at end of file` are read
       * past. A source that does not parse as hunks is refused.
       */
      format?: 'source' | 'diff';
      /**
       * What a line wider than the room does, in Text's `wrap` vocabulary:
       * `'wrap'` (the default) continues it on rows under the gutter.
       *
       * `'truncate-end'` cuts it at the edge with an ellipsis; Text's other
       * spellings are refused, since a gutter leaves them no sense here.
       */
      wrap?: 'wrap' | 'truncate-end';
  };

  /**
   * The input of `command.describe`: how one slash command presents in the
   * typeahead and `/help`, at the moment the engine lists it.
   */
  type CommandDescribeInput = {
      /**
       * Names the command without its slash; the key a matcher narrows on. A
       * rewrite is refused.
       */
      command: string;
      /**
       * The one-line description the menu shows, as the command declares it.
       */
      description: string;
      /**
       * The hint drawn dim after the name (`[name]`), when the command has one.
       */
      argumentHint?: string;
      /**
       * Whether the typeahead and `/help` leave the command out; a hidden
       * command still runs when typed in full.
       */
      isHidden: boolean;
      /**
       * Whether the command declares it runs at once when typed mid-turn,
       * instead of waiting for the turn to end.
       *
       * One that decides per invocation reads false. Read only: not part of
       * what a hook answers, and a rewrite is refused.
       */
      immediate: boolean;
      /**
       * Who provides this command: the plugin and its tier; `{ plugin: "engine",
       * tier: "core" }` for a built-in. Pinned: a rewrite is refused.
       */
      provider: Origin;
  };

  /**
   * What a `command.describe` hook returns: the description, hint and hidden
   * flag the menu uses; the name, `immediate` and `provider` stay as they were.
   */
  type CommandDescribeResult = Omit<CommandDescribeInput, 'command' | 'immediate' | 'provider'>;

  /**
   * One slash command as `$.command.list()` returns it.
   */
  type CommandInfo = {
      /**
       * What the person runs it by, without the slash.
       */
      name: string;
      /**
       * The one line the typeahead shows for it.
       */
      description: string;
      /**
       * Where it comes from (CommandSource).
       */
      source: CommandSource;
      /**
       * Which plugin added it, when `source` is `plugin` and the engine knows:
       * the one that registered it, or whose manifest carries it.
       */
      plugin?: string;
  };

  /**
   * `command.run`'s input as a plugin's `$.command.run` takes it: `origin` is
   * the engine's to set (the calling plugin's name).
   */
  type CommandRunArgs = Omit<CommandRunInput, 'origin'>;

  /**
   * The input of `command.run`: one slash command about to run, the way the
   * person typed it (`/name args`), and where the run came from.
   */
  type CommandRunInput = {
      /**
       * Names the command without its slash (`compact`, `hello`), aliases and
       * folds resolved; the key a matcher narrows on. A rewrite is refused.
       */
      command: string;
      /**
       * Everything after the name, as typed (`""` when nothing was); a hook
       * rewrites it with `next({ ...e, args })`.
       */
      args: string;
      /**
       * Where the run came from, in `prompt.submit`'s words (PromptOrigin):
       * the person's Enter (`composer`), the bridge, the SDK, or a plugin.
       *
       * A plugin's `$.command.run` reads `{ kind: 'plugin', name }`. `next(e)`
       * passes it on as received.
       */
      origin: PromptOrigin;
  };

  /**
   * What a `command.run` hook returns and what `next(e)` and `$.command.run`
   * resolve to: the command's output text, when it has one.
   *
   * From core, `text` is what the command printed (a `local` command's
   * returned text; a panel command may print nothing) and `ref` names the
   * run. A hook's own answer without `next` runs no command: its `text` is
   * shown as the command's output, under the plugin's name when it alone
   * hooks the command.
   */
  type CommandRunResult = {
      /**
       * The command's output as a transcript line, or undefined when the
       * command showed nothing as text (a panel, a prompt for the model).
       */
      text?: string;
      /**
       * Set by core on what `next(e)` resolves to: names the engine's run of
       * the command (its result stays on the host side).
       *
       * A hook that returns the object it got makes the engine use that run
       * verbatim. Absent on a hook's own `{ text }` and on `$.command.run`'s.
       */
      ref?: number;
  };

  /**
   * Where a slash command comes from, as `$.command.list()` tells them apart.
   *
   * `builtin` ships with Claude Code; `plugin` is a plugin's markdown command,
   * skill or `$.command.register`; `user` is the user's or project's own
   * file; `mcp` an MCP server's prompt.
   */
  type CommandSource = 'builtin' | 'plugin' | 'user' | 'mcp';

  /**
   * What `$.command.register` takes: the slash command this plugin serves.
   */
  type CommandSpec = {
      /**
       * The command's name without the slash (letters, digits, `_`, `-`; up to
       * 64); the person runs it as `/<name>`.
       */
      name: string;
      /**
       * The one line the typeahead and `/help` show for it.
       */
      description: string;
      /**
       * The hint drawn dim after the name (`[name]`), when it takes arguments.
       */
      argumentHint?: string;
      /**
       * Set so that `/<name>` typed while a turn is in flight runs at once
       * instead of waiting for the turn to end, as it does when left out.
       *
       * Its `command.run` hook then runs while a turn may still be streaming and
       * must not assume the turn's state (what the transcript holds, whether a
       * tool is mid-call); its `{ text }` prints as an idle run's does.
       */
      immediate?: true;
  };

  type ConfigChangeHookInput = BaseHookInput & {
      hook_event_name: 'ConfigChange';
      source: 'user_settings' | 'project_settings' | 'local_settings' | 'policy_settings' | 'skills';
      file_path?: string;
  };

  /**
   * The plugin's identity (`plugin`) and the nouns core contributes to `$` as
   * the innermost step of the `engine.create` fold.
   *
   * A plugin's finished `$` (EngineInterface) has every core noun an outer
   * step did not withhold, and every noun the plugins' steps added.
   */
  export interface CoreEngineInterface {
      /**
       * This plugin, as loaded: its manifest name and its directory.
       */
      plugin: {
          /**
           * From plugin.json; debug-log and `$.ui.log` lines carry it.
           */
          name: string;
          /**
           * The plugin's directory (the one holding plugin.json), absolute.
           */
          root: string;
      };
      /**
       * Display: a line under an open dialog, a redraw request, a transcript
       * line, a pane the surface places.
       */
      ui: {
          /**
           * Shows `text` as one line under the dialog open for `tool_use_id`, or
           * removes the line when `text` is undefined.
           *
           * Core removes the line when the call resolves. A call that is not open
           * is refused, as is another plugin's `$.tool.call` run.
           *
           * @param tool_use_id the call whose open dialog gets the line
           * @param text the line to show; undefined removes it
           * @example
           * $.ui.notice(e.tool_use_id, "checked by my-plugin"); return next(e)
           */
          notice: (tool_use_id: string, text: string | undefined) => void;
          /**
           * Re-runs an event whose results the engine caches: `ui.render` draws the
           * instances this plugin may draw again; the others drop the cached answers.
           *
           * A render hook whose state changed (a countdown) calls this for a redraw,
           * at most ten a second (calls sooner fold into one); a `prompt.section` or
           * `prompt.context` hook whose inputs changed calls it: dropped next turn.
           *
           * @param event `ui.render`, `prompt.section`, `prompt.context` or
           *              `tool.describe`
           */
          invalidate: (event: InvalidatableEventName) => void;
          /**
           * The elements of the surface `e` is drawn on (Elements[e.surface]): a
           * frozen table of constructors, the JSX tags a render hook draws with.
           *
           * A read, not a dispatch: the engine ran `ui.resolve` (the other hooks,
           * then core) at load, per surface and component. Narrowed `e.surface`:
           * that table exactly; unnarrowed: the union, so shared names type-check.
           *
           * @param e this hook's own `ui.render` argument (its surface and
           *          component pick the table)
           * @returns the surface's frozen element table (`Elements[e.surface]`)
           * @example
           * const { Box, Text } = $.ui.resolve(e)
           * return <Box>{await next(e)}<Text dimColor>done</Text></Box>
           */
          resolve: <E extends ResolveInput>(e: E) => Elements[E['surface']];
          /**
           * Appends one line to the transcript, drawn like a system notice (dim;
           * not sent to the model), and records it in the debug log.
           *
           * The line is a row of its own at the surface's next frame, wherever the
           * transcript is then; lines keep the order they were logged in. A `-p` or
           * SDK run has no transcript: its host receives the line as `ui_log`.
           *
           * @param text the line's text
           * @example
           * $.ui.log(`prompt from ${e.origin.kind}: ${e.text.length} chars`)
           */
          log: (text: string) => void;
          /**
           * Asks the user `question` in the engine's own AskUserQuestion dialog and
           * resolves to the label they chose, or the text typed under "Other".
           *
           * Another plugin's `ui.render` hook on `AskUserQuestion` draws it (this
           * plugin's own is skipped); a multi-select answer is comma-joined. Rejects
           * when the dialog is dismissed, and in a plain `-p` run (nothing to ask).
           *
           * @param question the question, ending in a question mark
           * @param options 2-4 option labels, or `{ options, header, multiSelect }`
           * @returns the label chosen, the chosen labels comma-joined, or free text
           *          typed under "Other" (so compare it with the labels exactly)
           * @example
           * const mood = await $.ui.ask("How careful?", ["Bold", "Careful"])
           */
          ask: (question: string, options?: readonly string[] | AskProps) => Promise<string>;
          /**
           * Shows `text` on the notification bar under the prompt for a few
           * seconds, the way the engine's own "context left" notice appears.
           *
           * It leaves the transcript and the model untouched.
           *
           * @param text the line to show
           * @param options `timeoutMs`: how long it stays (default 4000)
           * @example
           * $.ui.toast(`turn took ${Math.round(e.durationMs / 1000)} s`)
           */
          toast: (text: string, options?: ToastOptions) => void;
          /**
           * Pins `text` as this plugin's status line under the prompt, beside the
           * engine's own pinned notices, until the next call replaces it.
           *
           * One per plugin; `undefined` removes it.
           *
           * @param text the line to keep on screen; undefined clears it
           * @example
           * $.ui.status("thinking..."); return next(e)
           */
          status: (text: string | undefined) => void;
          /**
           * Opens a pane: a framed region the surface places, whose body this
           * plugin draws by hooking `ui.render` for `{ component: "Pane" }`.
           *
           * One instance per id (`requestId`): opening an open id retitles it.
           * Placement and size are the surface's, the keyboard the person's (ctrl+x
           * tab, Esc; `focus` is a request); a hook on `ui.open` may refuse it.
           *
           * @param pane `id` (1-64 of letters, digits, `_`, `-`), `title`, `focus`
           * @returns settles once the pane is open (or retitled)
           * @example
           * await $.ui.open({ id: "clock", title: "Clock" })
           */
          open: (pane: PaneOpenArgs) => Promise<void>;
          /**
           * Closes one of the open panes; an id that is not open is left alone.
           *
           * Every close raises `ui.close`, `e.origin` naming whose it is: this call
           * (`plugin`), the header's `[x]` (`person`), an unload (`unload`). A hook
           * that answers without `next` keeps the pane open, except on an unload.
           *
           * @param pane `id`: the id the pane was opened under
           * @returns settles once the pane is gone or a hook answered for it;
           *          rejects on a hook's `{ deny }`
           * @example
           * onPress: () => $.ui.close({ id: "clock" })
           */
          close: (pane: PaneCloseArgs) => Promise<void>;
      };
      /**
       * Completions through the session's own client and credentials.
       */
      model: {
          /**
           * Runs one text completion through the session's own API client and
           * resolves to the reply's text.
           *
           * No tools, no history, no system prompt beyond the CLI's identity block
           * and `request.system`.
           *
           * @param request the model (an alias such as `haiku`, or a full id,
           *   resolved like a `--model` value), the prompt, and a token cap
           * @returns the reply's text
           * @example
           * const reply = await $.model.complete({ model: "haiku", prompt: "Hi." })
           */
          complete: (request: ModelCompleteRequest) => Promise<string>;
          /**
           * Runs one tool-less completion over the session's OWN transcript, sharing
           * the main thread's prompt cache; the reply's text and the fork's usage.
           *
           * Not `complete`: sharing the cache prefix means the model and system
           * prompt are the session's, read from its last turn's cache-safe snapshot,
           * and tools are denied. Null on a cold snapshot or an API error.
           *
           * @param request the one user message the fork answers
           * @returns the reply's text with the fork's usage, or null on a cold
           *          snapshot or an API error
           * @example
           * const reply = await $.model.fork({ prompt: "One line to learn?" })
           * if (reply !== null) $.ui.log(`${reply.usage.output_tokens} tokens`)
           */
          fork: (request: ModelForkRequest) => Promise<ModelForkReply | null>;
          /**
           * Picks one of `labels` for `text` with one completion over
           * `$.model.complete` and a fixed classifier prompt.
           *
           * `text` is data; the model answers with a label alone. Nullable: it
           * resolves `undefined` when the answer named none of `labels`. A failed
           * request, an abort or a reply with no text rejects, naming the cause.
           *
           * @param text what to classify
           * @param labels the labels to choose from (2 or more)
           * @param options `model`: an alias or id; default the engine's small
           *   fast model
           * @returns the label the model named, or undefined when it named none;
           *          rejects when the request fails or the reply has no text
           * @example
           * const kind = await $.model.classify(e.text, ["bug", "feature"])
           * if (kind === undefined) return next(e)
           */
          classify: (text: string, labels: readonly string[], options?: ClassifyOptions) => Promise<string | undefined>;
      };
      /**
       * Sound: clip playback and platform speech.
       */
      audio: {
          /**
           * Plays one audio clip, starting now; clips are not queued, so two calls
           * play together (a bed under speech).
           *
           * `{ asset }` is the plugin's own file, loaded by the engine (in a page
           * decoded once and cached; in the CLI through `afplay`). Resolves when
           * playback ends; rejects, naming the cause, when the clip cannot play.
           *
           * @param clip the plugin's own file (`{ asset }`), a URL the engine
           *   fetches, or the bytes as base64 with their MIME type
           * @param options `shouldLoop`, `gain`, and an AbortSignal that stops the
           *   clip
           */
          play: (clip: AudioClip, options?: PlayOptions) => Promise<void>;
          /**
           * Speaks `text` with the platform's own synthesizer: the page's
           * `speechSynthesis` in the browser build, `say` on macOS. Plain text.
           *
           * Utterances are queued among themselves; clips are not. Resolves when
           * the utterance has ended; rejects, naming the cause, when there is no
           * synthesizer, the voice is not installed, or the utterance failed.
           *
           * @param text what to say, as plain text
           * @param options `voice`: the system voice's exact name (`Samantha`);
           *   absent, the synthesizer's default
           * @returns nothing, once the utterance has ended
           */
          speak: (text: string, options?: SpeakOptions) => Promise<SpeakResult>;
      };
      /**
       * The engine's connected MCP servers.
       */
      mcp: {
          /**
           * Calls `tool` on one of the engine's connected MCP servers with the
           * engine's own connection and credentials.
           *
           * A `cached` server is dialed on first use. Resolves to the tool's result
           * as MCP returns it: `content` blocks and `isError`. No permission prompt:
           * the plugin's call, seen by the hooks above it, is the grant.
           *
           * @param server the server's name as /mcp lists it (`claude.ai Gmail`;
           *   the tool-name spelling `claude_ai_Gmail` is accepted too)
           * @param tool the tool's name on that server (`create_draft`)
           * @param args the tool's arguments; none when absent
           * @returns the tool's result as MCP returns it: `content` blocks and
           *          `isError`
           * @example
           * const { content } = await $.mcp.call("claude.ai Gmail", "create_draft")
           */
          call: (server: string, tool: string, args?: Record<string, unknown>) => Promise<McpToolResult>;
      };
      /**
       * The running session, read as plain data, and compacting it.
       */
      session: {
          /**
           * Returns the transcript so far, one entry per user or assistant
           * message; progress rows, `$.ui.log` lines and notices are not messages.
           *
           * Each entry is a SessionMessage, `{ role, text, toolUses }` (a user
           * message may add `toolResults`; a `toolUses` entry adds its `result` and
           * `text` once answered). A long transcript answers its newest 4096.
           *
           * @example
           * const last = (await $.session.messages()).at(-1)
           */
          messages: () => Promise<SessionMessage[]>;
          /**
           * Returns the directory the session runs in, absolute.
           */
          cwd: () => Promise<string>;
          /**
           * Returns the main loop's model, as `/model` shows it.
           */
          model: () => Promise<string>;
          /**
           * Returns how many prompts the user has sent this session (user turns in
           * the transcript).
           */
          turnCount: () => Promise<number>;
          /**
           * Returns the session's id (the transcript file's name).
           */
          id: () => Promise<string>;
          /**
           * Returns the git repository the session runs in, read from the working
           * copy on each call; null when the directory is not inside one.
           *
           * @example
           * const repo = await $.session.repo(); const publicRepo = !repo?.internal
           */
          repo: () => Promise<SessionRepo | null>;
          /**
           * Returns where the session draws: `terminal` under the REPL, `desktop`
           * under the Code session renderer; null where nothing draws.
           *
           * Nothing draws in a plain -p run or an SDK host without the renderer.
           * The one session read that never rejects: null is also its answer where
           * no session is bound at all.
           *
           * @example
           * return (await $.session.surface()) === "desktop" ? { text: "" } : next(e)
           */
          surface: () => Promise<RenderSurface | null>;
          /**
           * Returns how full the context window is, the account's rate-limit
           * windows, and the session's cost: the status line's own figures.
           *
           * `context` is the live window (past the last compaction) against the
           * session model's size, its `tokens` and `percent` there once a response
           * came back; `rateLimits`, the windows the last response reported.
           *
           * @returns `{ context, rateLimits, cost }` as the status line has them
           * @example
           * const { context } = await $.session.usage()
           * if ((context.percent ?? 0) >= 85) await $.session.compact()
           */
          usage: () => Promise<SessionUsage>;
          /**
           * Compacts the conversation: the event `session.compact` with `trigger`
           * `plugin`, the same call `/compact` makes, between turns.
           *
           * It runs through the other plugins' hooks (this plugin's own skipped),
           * then core: a summary and the kept messages in the transcript's place.
           * Resolves `{ skip }` when a hook vetoed it; rejects while a turn runs.
           *
           * @example
           * const { skip } = await $.session.compact({ instructions: "the plan" })
           */
          compact: EventCalls['session']['compact'];
      };
      /**
       * The running model turn: ending it.
       */
      turn: {
          /**
           * Cancels the running model turn: the one whose id `turn.start` handed
           * this plugin, its running tools stopped, no interruption marker.
           *
           * The event `turn.abort`, seen by the hooks above; the prompt this
           * plugin submits next is the context. Rejects, naming both ids, when
           * `turnId` is not the running turn's; a hook may end its own turn.
           *
           * @param input `turnId`: the id `turn.start` carried
           * @example
           * on("turn.start", ($, e, next) => { held = e.turnId; return next(e) })
           */
          abort: (input: OpEventOf['turn.abort']) => Promise<void>;
      };
      /**
       * Submitting a prompt: the model sees it as a user turn; the engine knows
       * it is the plugin's.
       */
      prompt: {
          /**
           * Submits a prompt: the event `prompt.submit`, the same call the engine
           * makes for a typed prompt; `input.text` runs when the session is idle.
           *
           * It goes through every other plugin's hook (this plugin's own is
           * skipped) with `e.origin` `{ kind: 'plugin', name }`, the name the
           * model reads it under unless a hook leaves it out of its answer.
           *
           * @example
           * void $.prompt.submit({ text: "List the TODOs you just mentioned." })
           */
          submit: EventCalls['prompt']['submit'];
      };
      /**
       * The tools the model has in this session, and running one.
       */
      tool: {
          /**
           * Returns the tools the model can call now, built-in and MCP alike, in
           * the order the model sees them.
           *
           * @example
           * const names = (await $.tool.list()).map(t => t.name)
           */
          list: () => Promise<ToolInfo[]>;
          /**
           * Calls a tool: the event `tool.call`, the same call the engine makes for
           * the model's tool calls, under a `tool_use_id` of its own.
           *
           * It runs through the other plugins' hooks (this plugin's own skipped),
           * the permission check and its dialog, then the tool. Rejects when no
           * tool has that name or the call is aborted.
           *
           * @example
           * const { text } = await $.tool.call({ tool: "Read", file_path: "a.md" })
           */
          call: EventCalls['tool']['call'];
          /**
           * Declares a tool the model can call from the next prompt on: the name,
           * description and input schema of `mcp__<plugin>__<name>`.
           *
           * Serve it with a `tool.call` hook on `{ tool: "mcp__<plugin>__<name>" }`
           * that returns the result (a call no hook answers fails); a name registered
           * again is replaced. Rejects until the session binds, at `session.start`.
           *
           * @param tool `name`, `description` (what the model reads), `inputSchema`
           *             (a JSON schema object; default `{ type: "object" }`)
           * @returns `{ tool }`, the registered tool's full name
           *          `mcp__<plugin>__<name>`
           * @example
           * await $.tool.register({ name: "weather", description: "Weather." })
           */
          register: (tool: ToolSpec) => Promise<OpValueOf['tool.register']>;
      };
      /**
       * The slash commands the person can run in this session, and running one.
       */
      command: {
          /**
           * Returns the slash commands the person can run now, built-in, plugin
           * and MCP alike, in the order the typeahead lists them.
           *
           * @example
           * const names = (await $.command.list()).map(c => c.name)
           */
          list: () => Promise<CommandInfo[]>;
          /**
           * Runs a slash command as if the person typed `/command args`: the
           * event `command.run`, queued and run once the session is idle.
           *
           * It runs through the other plugins' hooks (this plugin's own skipped)
           * with `e.origin` `{ kind: 'plugin', name }`, its lines in the transcript.
           * Rejects an unknown name, and inside a hook the turn is waiting on.
           *
           * @example
           * const { text } = await $.command.run({ command: "status", args: "" })
           */
          run: EventCalls['command']['run'];
          /**
           * Declares the slash command `/<name>` for this session, listed in the
           * typeahead from the next keystroke on.
           *
           * Serve it with a `command.run` hook on `{ command: "<name>" }` that
           * returns `{ text }`; a run no hook answers says so as its output.
           * Registering a name again replaces it; a built-in's name is refused.
           *
           * @param command `name`, `description` (what the menu shows),
           *   `argumentHint` (dim after the name), `immediate` (runs mid-turn)
           * @returns `{ command }`, the registered name
           * @example
           * await $.command.register({ name: "hello", description: "Says hi." })
           */
          register: (command: CommandSpec) => Promise<OpValueOf['command.register']>;
      };
      /**
       * Subagents.
       */
      agent: {
          /**
           * Spawns a subagent: the event `agent.spawn`, the same call the engine
           * makes when the Agent tool starts one; the engine fills the rest.
           *
           * It runs through the Agent tool under this call's origin for its life:
           * the other plugins' hooks see its calls and this plugin's do not, so it
           * is seen through what this resolves to, `{ model, text }` or `{ deny }`.
           *
           * @example
           * const { text } = await $.agent.spawn({ prompt: "Summarize README.md." })
           */
          spawn: EventCalls['agent']['spawn'];
          /**
           * Returns the session's subagents so far, the ones the model spawned and
           * the ones plugins did alike.
           */
          list: () => Promise<AgentInfo[]>;
      };
      /**
       * The file system as the engine's own process reaches it, text only
       * (UTF-8); a relative path is under the session's working directory.
       *
       * An absolute path is used as given. A read or a write over 4 MiB
       * rejects; what the operating system refuses rejects with its errno
       * (`ENOENT`, `EACCES`). Where a path may go is an `fs.*` hook's to say.
       */
      fs: {
          /**
           * Reads a file and returns its text. Rejects when missing.
           *
           * @param path relative to the working directory, or absolute
           * @returns the file's text
           * @example
           * const readme = await $.fs.read("README.md")
           */
          read: (path: string) => Promise<string>;
          /**
           * Writes `text` to a file, creating it and its directories as needed.
           *
           * @param path relative to the working directory, or absolute
           * @param text the whole new content
           */
          write: (path: string, text: string) => Promise<void>;
          /**
           * Lists a directory: `{ name, kind, size }` per entry, by name.
           *
           * @param path the directory's path; absent, the working directory
           * @returns the entries, `{ name, kind, size }` each
           */
          list: (path?: string) => Promise<FsEntry[]>;
          /**
           * Returns whether the path exists; never rejects.
           */
          exists: (path: string) => Promise<boolean>;
          /**
           * Returns `{ kind, size, mtimeMs }` of the path. Rejects when missing.
           */
          stat: (path: string) => Promise<FsStat>;
          /**
           * Reads the named instruction files in every directory above the
           * session's original working directory, the way the engine reads CLAUDE.md.
           *
           * Root first, each `{ dir, name, content }` that exists, the content
           * with its `@include`s after it; with `of`, on down to that file's
           * directory, as the engine reads a nested CLAUDE.md when a file is read.
           *
           * @param request `names`, relative `.md` file names (no `..`) looked for
           * in each directory; `of`, the file whose directory the walk goes down to
           * @returns the files found, root first
           * @example
           * const found = await $.fs.ancestors({ names: ["AGENTS.md"] })
           * const stack = await $.fs.ancestors({ names: ["AGENTS.md"], of: path })
           */
          ancestors: (request: FsAncestorsRequest) => Promise<readonly FsAncestor[]>;
      };
      /**
       * This plugin's own key-value store, kept between sessions and hot
       * reloads; values are JSON data.
       *
       * On the page localStorage under the plugin's name; in the CLI a JSON file
       * under ~/.claude/plugins/store/.
       */
      store: {
          /**
           * Returns the value under `key`, or `undefined` when unset.
           *
           * @example
           * const count = Number((await $.store.get("count")) ?? 0) + 1
           */
          get: (key: string) => Promise<unknown>;
          /**
           * Sets `key` to `value`, which must be JSON data.
           *
           * `get` reads back `JSON.parse(JSON.stringify(value))`: a Date is its ISO
           * string, an `undefined` field is dropped, a Map or Set is `{}`. Rejects
           * a function, a cycle, or a store over 4 MiB of JSON text in all.
           */
          set: (key: string, value: unknown) => Promise<void>;
          /**
           * Removes `key` from the store.
           */
          delete: (key: string) => Promise<void>;
          /**
           * Returns every key set, in insertion order.
           */
          keys: () => Promise<string[]>;
      };
      /**
       * Timers, run where the plugin's environment lives (no host round trip).
       *
       * A timer's callback is the plugin's own function, and a hot reload of the
       * plugin drops its pending timers with the old environment.
       */
      clock: {
          /**
           * Returns milliseconds since the epoch, now.
           */
          now: () => number;
          /**
           * Resolves after `ms` milliseconds; rejects at once when `signal` aborts.
           *
           * @param ms how long, in milliseconds
           * @param options `signal`: ends the wait early with a rejection (pass
           *   `next.signal` so a hook's wait ends with its dispatch)
           * @example
           * await $.clock.sleep(500, { signal: next.signal })
           */
          sleep: (ms: number, options?: SleepOptions) => Promise<void>;
          /**
           * Calls `fn` once after `ms` milliseconds; `cancel()` before then stops it.
           */
          after: TimerCall;
          /**
           * Calls `fn` every `ms` milliseconds until `cancel()`.
           *
           * @example
           * const tick = $.clock.every(1000, () => $.ui.status(`${$.clock.now()}`))
           */
          every: TimerCall;
      };
      /**
       * The network, through the host.
       */
      http: {
          /**
           * Fetches `url` through the host (never the plugin's own network) and
           * resolves `{ status, ok, headers, text }` once the body is read.
           *
           * http or https, to whatever the host process can reach, unless the
           * administrator's policy switches refuse it; an `auth` credential rides
           * https only. On a page the document's CSP decides what is reachable.
           *
           * @param url the URL (http or https, or same-origin on a page)
           * @param init `{ method, headers, body }` (body a string)
           * @returns `{ status, ok, headers, text }` once the body is read
           * @example
           * const { ok, text } = await $.http.fetch("https://example.com/status")
           */
          fetch: (url: string, init?: HttpInit) => Promise<HttpResponse>;
      };
      /**
       * Commands on the host, run as the user the session runs as. CLI only.
       *
       * Local execution, not a network path: what a command of its own reaches
       * is its own, as for the Bash tool and a settings `command` hook.
       */
      process: {
          /**
           * Runs a command on the host by its argument vector (no shell) and
           * resolves `{ exitCode, stdout, stderr }` once it exits, any exit code.
           *
           * One shot: the whole output is read, so a background process left
           * writing holds the call until the timeout. Rejects when the command
           * cannot start or is still running then. Git runs with repo hooks off.
           *
           * @param argv the command and its arguments, `argv[0]` the executable
           * @param init `{ cwd, env, stdin, timeoutMs }` (cwd the session's by
           *             default; timeout 30 s by default, ten minutes at most)
           * @returns `{ exitCode, stdout, stderr }` once the child exits
           * @example
           * const { exitCode, stdout } = await $.process.run(["git", "status"])
           */
          run: (argv: readonly string[], init?: ProcessRunInit) => Promise<ProcessRunResult>;
      };
      /**
       * What the settings files, `--settings` and managed policy hold, as the
       * engine runs under it; read only.
       *
       * Every key crosses as the source holds it, `env` and the helper commands
       * included: nothing is filtered. The OAuth session and the global config
       * (~/.claude.json) are not settings and are never read.
       */
      settings: {
          /**
           * Resolves with the settings merged over every source, as the engine
           * reads them, or with one source's settings as loaded (`{ source }`).
           *
           * A snapshot in plain data each call; a source with no file answers
           * `{}`. The sources (SettingsSource) rise in precedence from `user` to
           * `policy`: the merge takes a key from the last source that has it.
           *
           * @param args `{ source }` to read one source; nothing for the merge
           * @returns the settings object, keyed as a settings.json is
           * @example
           * const { permissions } = await $.settings.read()
           * const policy = await $.settings.read({ source: "policy" })
           */
          read: (args?: SettingsReadArgs) => Promise<Settings>;
      };
      /**
       * The environment of this process, the one every Bash child, MCP server
       * and `$.process.run` command started after inherits.
       *
       * `get` and `set` take the variable's name as a string literal, so what a
       * module reads and writes is read off its source: `claude plugin validate`
       * lists the names, and a name the module does not spell is refused.
       */
      env: {
          /**
           * Resolves with the variable's value, or `undefined` when it is unset.
           *
           * `name` must be a string literal; `claude plugin validate` lists the
           * names your module reads and writes.
           *
           * @example
           * const home = await $.env.get("HOME")
           */
          get: (name: string) => Promise<string | undefined>;
          /**
           * Sets the variable for this process and everything it starts after, or
           * unsets it when `value` is `undefined`.
           *
           * `name` must be a string literal; `claude plugin validate` lists the
           * names your module reads and writes.
           *
           * @example
           * await $.env.set("GIT_PAGER", "cat")
           */
          set: (name: string, value: string | undefined) => Promise<void>;
      };
  }

  /**
   * The name of an event the engine defines itself (a key of CoreEventOf):
   * what EVENT_NAMES lists; EventName adds the declared plugin nouns' events.
   */
  type CoreEventName = keyof CoreEventOf;

  /**
   * The argument of each event the engine defines itself: its call sites'
   * (EngineEventOf), the classic hooks' (ClassicEventOf), the calls on `$`.
   */
  type CoreEventOf = EngineEventOf & ClassicEventOf & OpEventOf;

  type CwdChangedHookInput = BaseHookInput & {
      hook_event_name: 'CwdChanged';
      old_cwd: string;
      new_cwd: string;
  };

  type DirectoryAddedHookInput = BaseHookInput & {
      hook_event_name: 'DirectoryAdded';
      /**
       * Absolute path of the directory that was added.
       */
      directory: string;
      /**
       * How the directory was added: "slash_command" for /add-dir, "register_repo_root" for the SDK control_request.
       */
      source: 'slash_command' | 'register_repo_root';
  };

  /**
   * The `children` field every element constructor's props carry, appended
   * beside its own props type: one child, or a list that may nest.
   *
   * JSX types a lone child as the child itself, not a list of one
   * (`<Text dimColor>done</Text>` passes the string), and a mapped list beside
   * a sibling as a nested list (`<Box>{rows.map(row)}<Text>done</Text></Box>`).
   */
  export type ElementChildren = {
      children?: RenderChildren;
  };

  /**
   * An element as `$.ui.resolve(e)` hands it out: a constructor from props to
   * the frozen plain-data element, `children` among the props as JSX passes.
   *
   * `const { Box } = $.ui.resolve(e)` then `<Box gap={1}>...</Box>` compiles to
   * `h(Box, { gap: 1 }, ...children)`, and `h` calls a function tag with its
   * props (render-jsx/), so the table's constructors are the JSX tags.
   */
  export type ElementConstructor<P> = (props: P & ElementChildren) => RenderElement;

  /**
   * Every element name of every surface: what a table handed out is completed to
   * (an omitted one draws a fragment; see `ui.resolve`).
   */
  export type ElementName = {
      [P in RenderSurface]: keyof Elements[P];
  }[RenderSurface];

  /**
   * The element constructors each surface draws, by `e.surface`: what
   * `$.ui.resolve(e)` returns and a `ui.resolve` hook passes on; no globals.
   *
   * Both carry `Box`, `Text`, `Button`, `Input`, `Select`, `Link`, `Code` and
   * `Client`; the desktop alone `Svg`. Narrowing `e.surface` gives that table
   * exactly; unnarrowed, the union; a name a surface lacks draws a fragment.
   */
  export type Elements = {
      terminal: {
          Box: ElementConstructor<BoxProps>;
          Text: ElementConstructor<TextProps>;
          Button: ElementConstructor<ButtonProps>;
          Input: ElementConstructor<InputProps>;
          Select: ElementConstructor<SelectProps>;
          Link: ElementConstructor<LinkProps>;
          Code: ElementConstructor<CodeProps>;
          Client: ElementConstructor<ClientProps>;
      };
      desktop: {
          Box: ElementConstructor<BoxProps>;
          Text: ElementConstructor<TextProps>;
          Button: ElementConstructor<ButtonProps>;
          Input: ElementConstructor<InputProps>;
          Select: ElementConstructor<SelectProps>;
          Svg: ElementConstructor<SvgProps>;
          Link: ElementConstructor<LinkProps>;
          Code: ElementConstructor<CodeProps>;
          Client: ElementConstructor<ClientProps>;
      };
  };

  /**
   * The table `ui.resolve` answers for an argument of surface `P`.
   */
  export type ElementTable<P extends RenderSurface = RenderSurface> = Elements[P];

  /**
   * Hook input for the Elicitation event. Fired when an MCP server requests user input. Hooks can auto-respond (accept/decline) instead of showing the dialog.
   */
  type ElicitationHookInput = BaseHookInput & {
      hook_event_name: 'Elicitation';
      mcp_server_name: string;
      message: string;
      mode?: 'form' | 'url';
      url?: string;
      elicitation_id?: string;
      requested_schema?: Record<string, unknown>;
  };

  /**
   * Hook input for the ElicitationResult event. Fired after the user responds to an MCP elicitation. Hooks can observe or override the response before it is sent to the server.
   */
  type ElicitationResultHookInput = BaseHookInput & {
      hook_event_name: 'ElicitationResult';
      mcp_server_name: string;
      elicitation_id?: string;
      mode?: 'form' | 'url';
      action: 'accept' | 'decline' | 'cancel';
      content?: Record<string, unknown>;
  };

  /**
   * The input of `engine.create` (interface-ops/, hooks-host/
   * buildInterfaces): the fold that builds `$`, once per load, core innermost.
   *
   * A hook is written in post-order: `const built = await next(e)` is `$` as
   * built so far; `return { ...built, voice: { say } }` adds this plugin's noun.
   * See EngineEventOf's `engine.create` for what a step may and may not do.
   */
  export type EngineCreateInput = {
      /**
       * In list order, first is outermost (managed plugins first, so an org
       * plugin's withholding wins).
       */
      plugins: readonly string[];
  };

  /**
   * What an `engine.create` hook returns: `$` as built so far with this
   * plugin's nouns added, less any it withheld.
   *
   * Every declared noun is optional here. Between hooks it crosses the chain
   * as interface descriptors; a hook sees objects (EngineInterfaceBuilt).
   */
  export type EngineCreateResult = Partial<EngineInterface> & {
      readonly [noun: string]: unknown;
  };

  /**
   * The events the engine raises at its call sites, and `engine.create`; the
   * classic settings hooks' events are ClassicEventOf.
   *
   * At every one, a hook that fails (throws, overruns its budget, answers a
   * wrong shape) is skipped: the hooks beneath and core run in its place, or
   * its last `next` result stands; the failure is reported, naming it.
   */
  export type EngineEventOf = {
      /**
       * Fires when the engine is about to run a tool. `next(e)` runs the hooks
       * beneath, then core (the permission prompt, the tool itself).
       *
       * Return `{ deny: reason }` to refuse or `{ result }` to answer yourself; a
       * hook that returns while its `next` is pending aborts what runs beneath.
       * The managed-settings hooks run first: their deny is the call's result.
       */
      'tool.call': ToolCallInput;
      /**
       * Fires when the engine is about to draw a component: once per input value
       * (props, viewport width), plugin load or `$.ui.invalidate("ui.render")`.
       *
       * A repaint reuses the answer; a clock invalidates. `next(e)` resolves to the
       * drawing: return it, wrap it, draw your own, or rewrite `props`. A tree that
       * does not validate draws the engine's own; `--plugin-dir` is told why.
       */
      'ui.render': RenderInput;
      /**
       * Fires when the plugins load (not per draw), once per surface, component
       * and plugin: `e` names the surface and component, never the props.
       *
       * `next(e)` resolves to the surface's table, which `$.ui.resolve(e)` then
       * reads. Return it, one with an element restyled for every other plugin,
       * or one with a key left out (a fragment there); own table: hook skipped.
       */
      'ui.resolve': ResolveInput;
      /**
       * Fires when a `Button` a render hook drew is pressed on a surface; `e` is
       * `{ plugin, element, component, surface }`, `element` the button's `key`.
       *
       * `next(e)` runs the hooks beneath, then core: the element's own `onPress`
       * closure, in its plugin's environment, resolving to `{ element }`. Return
       * `next(e)` to let the press through, or `{ element }` to take it.
       */
      'ui.press': UiPressInput;
      /**
       * Fires when an `Input` a render hook drew changes or is submitted; `e` is
       * `{ plugin, element, component, surface, kind, value }`.
       *
       * `next(e)` runs the hooks beneath, then the element's own `onInput` or
       * `onSubmit` with `e.value` as the chain left it, resolving to `{ element,
       * value }`; `next({ ...e, value })` rewrites the typing, an answer takes it.
       */
      'ui.input': UiInputArgument;
      /**
       * Fires when a `Select` a render hook drew is picked from; `e` is
       * `{ plugin, element, component, surface, value }`.
       *
       * `next(e)` runs the hooks beneath, then the element's own `onSelect` with
       * `e.value` as the chain left it, resolving to `{ element, value }`;
       * `next({ ...e, value })` rewrites the pick, an answer takes it.
       */
      'ui.select': UiSelectArgument;
      /**
       * Fires when a `Client` THIS plugin drew posts from its surface module
       * (`surface.post(data)`); only this plugin's hooks see it.
       *
       * `next.origin` names `client`: `data` came from code. Core answers `{}`;
       * `next({ ...e, data })` rewrites the data; `{ props }` hands the posting
       * instance its next props without a redraw. One per instance per frame.
       */
      'ui.message': UiMessageArgument;
      /**
       * Fires when the engine offers an agent type to the model, in the agent
       * listing and again at dispatch; `next(e)` resolves to `{ offered: true }`.
       *
       * Return `{ offered: false }` to keep the type out of the listing and
       * refuse its dispatch. A hook that fails passes it through.
       *
       * @example
       * on("agent.offer", { agent: "advisor" }, () => ({ offered: false }))
       */
      'agent.offer': AgentOfferInput;
      /**
       * Fires when the Agent tool is about to start a subagent, everything
       * decided and its model not yet resolved.
       *
       * `next(e)` resolves to `{ model }`. Return it, `next({ ...e, model })`,
       * `{ model }` of your own (an alias resolves like the tool's parameter), or
       * `{ deny: reason }`.
       */
      'agent.spawn': AgentSpawnInput;
      /**
       * Fires when a prompt is submitted, before the turn starts. `next(e)` runs
       * the hooks beneath and the UserPromptSubmit settings hooks.
       *
       * Rewrite with `next({ ...e, text })` (the user message on screen follows)
       * or stop it with `{ drop: reason }`; a broken plugin never blocks a prompt.
       * A prompt typed while a turn ran fires at Enter, with that turn's id.
       */
      'prompt.submit': PromptSubmitInput;
      /**
       * Fires once per named section of the system prompt, when the engine
       * assembles it; `next(e)` resolves to `{ text }` as core computed it.
       *
       * Sections are cached by name for the session until
       * `$.ui.invalidate("prompt.section")`: an unstable answer spends the
       * model's prompt cache on every call. A hook that fails passes it through.
       *
       * @example
       * on("prompt.section", { name: "memory" }, () => ({ text: null }))
       */
      'prompt.section': PromptSectionInput;
      /**
       * Fires once per conversation, when the engine computes the context blocks
       * its first user message carries; `next(e)` resolves to `{ blocks }`.
       *
       * Append, drop, reorder or rewrite with `next({ ...e, blocks })`; the
       * engine renders what comes back, in order, until
       * `$.ui.invalidate("prompt.context")` or a re-read (compaction, `/clear`).
       *
       * @example
       * on("prompt.context", () => ({ blocks: [] }))
       */
      'prompt.context': PromptContextInput;
      /**
       * Fires once per tool, when the engine first renders the tool's schema for
       * the model in a session; `next(e)` resolves to `{ description }`.
       *
       * Rendered schemas are cached for the session until
       * `$.ui.invalidate("tool.describe")`: an unstable answer spends the model's
       * prompt cache on every call. A hook that fails passes it through.
       *
       * @example
       * on("tool.describe", { tool: "Bash" }, () => ({ description: "Shell." }))
       */
      'tool.describe': ToolDescribeInput;
      /**
       * Fires when a slash command is about to run (`/name args` typed, or a
       * plugin's `$.command.run`); `next(e)` resolves to `{ text }`, its output.
       *
       * Core is the engine's command (a registered one has none). Rewrite `args`
       * with `next`, or return `{ text }` without it to answer in its place; one
       * after `next` replaces a printed output, not a panel or prompt it opened.
       *
       * @example
       * on("command.run", { command: "hello" }, () => ({ text: "hello" }))
       */
      'command.run': CommandRunInput;
      /**
       * Fires once per command, when the engine lists it for the typeahead and
       * `/help`; `next(e)` resolves to `{ description, argumentHint, isHidden }`.
       *
       * Listed answers are cached for the session until
       * `$.ui.invalidate("command.describe")`. A hook that fails passes it
       * through.
       *
       * @example
       * on("command.describe", ($, e, next) => next({ ...e, isHidden: true }))
       */
      'command.describe': CommandDescribeInput;
      /**
       * Fires when the engine expands a skill's prompt for the model (`/name`,
       * the Skill tool, a preload); `next(e)` resolves to `{ text }` as computed.
       *
       * Return `{ text }` with the text the model reads instead. A hook that
       * fails passes it through.
       *
       * @example
       * on("skill.prompt", { skill: "commit" }, () => ({ text: "A haiku." }))
       */
      'skill.prompt': SkillPromptInput;
      /**
       * Fires when the engine composes a git text the model is to write (`kind`:
       * `commit`, `pr`, `exemption`, `remedy`); `next(e)` resolves to `{ text }`.
       *
       * Return `{ text }` with the text the model reads instead. A hook that
       * fails passes it through.
       *
       * @example
       * on("attribution.text", { kind: "commit" }, () => ({ text: "" }))
       */
      'attribution.text': AttributionTextInput;
      /**
       * Fires once per process for each loaded plugin, before the first prompt,
       * and again for one that loads or reloads later; `next(e)` is `{ cwd }`.
       *
       * Observe. The first is awaited, so a `$.tool.register` here is listed by
       * turn one. A later one (an edit, new options, `/reload-plugins`, an enable)
       * runs that plugin's hooks alone, so its timers start again. Not `/clear`.
       *
       * @example
       * on("session.start", ($, e, next) => $.tool.register(t).then(() => next(e)))
       */
      'session.start': SessionStartInput;
      /**
       * Fires when a delivery reaches the session (a relay's event, a peer's
       * message, a Remote Control prompt), before it is queued; `{ text }`.
       *
       * Rewrite with `next({ ...e, text })`, or return `{ consumed: reason }` to
       * take it: nothing is queued, shown or read by the model. `origin` and
       * `event` pass on as received; `session.send`, its dual, is reserved.
       *
       * @example
       * on("session.receive", { origin: "peer" }, () => ({ consumed: "muted" }))
       */
      'session.receive': SessionReceiveInput;
      /**
       * Fires when the conversation is about to be compacted (`/compact`, the
       * threshold, a plugin, or ahead of time); `next(e)` resolves `{ messages }`.
       *
       * Rewrite `instructions` or `messages` on the way down, the messages on
       * the way up, or answer `{ messages }` of your own; `{ skip: reason }`
       * leaves the conversation as it is. `trigger` passes on as received.
       *
       * @example
       * on("session.compact", { trigger: "precompute" }, () => ({ skip: "off" }))
       */
      'session.compact': SessionCompactInput;
      /**
       * Fires when a model turn begins, before its first model call; `next(e)`
       * resolves to `{ turnId }`. Observe: a different return changes nothing.
       */
      'turn.start': TurnStartInput;
      /**
       * Fires when one model response inside a turn is whole: at its first tool
       * result or at the turn's end. Observe: a different return changes nothing.
       *
       * Every intermediate response of the turn passes here; the last one is
       * followed by `turn.complete`.
       */
      'turn.step': TurnStepInput;
      /**
       * Fires when a model turn has ended, at the point its duration is reported;
       * `next(e)` resolves to `{ text }`, the answer. `e.reason` says why.
       *
       * Return `{ text }` with a different text to show it beneath the answer (a
       * synopsis, a TL;DR line); the transcript's record is never rewritten. A
       * hook that fails leaves the answer as it was.
       */
      'turn.complete': TurnCompleteInput;
      /**
       * Runs while `$` is being built, once per load or reload of this plugin
       * and before any other hook of it; `next(e)` resolves to `$` built so far.
       *
       * A step may ADD nouns and WITHHOLD nouns (leave one out, or return without
       * `next`); it may NOT REPLACE one another step added: the step fails, named
       * with both plugins. A step that fails unloads its plugin; `$` is rebuilt.
       */
      'engine.create': EngineCreateInput;
  };

  /**
   * `$`, the first parameter of every hook. Frozen; core's interface plus
   * every noun the plugins' `engine.create` steps added.
   *
   * Flat, `<noun>.<event>`; it does not carry `on`, since registration happens
   * before `$` exists. An interface so a plugin types the noun it provides by
   * declaration merging, the way a jQuery plugin types `$.fn`.
   *
   * @example
   * declare module "claude-code" { interface EngineInterface { voice: Voice } }
   */
  export interface EngineInterface extends CoreEngineInterface {
  }

  /**
   * What `next(e)` resolves to at `engine.create`: `$` as the steps beneath
   * built it, typed as `$` is, open to nouns no declaration names yet.
   *
   * A withheld noun is on it as a stub (a step inside withheld it, or the
   * last fold did and this is a reload), and the host refuses an op on one a
   * step outside withholds later; a typed module bootstraps at load on it.
   */
  export type EngineInterfaceBuilt = EngineInterface & {
      readonly [noun: string]: unknown;
  };

  /**
   * The engine's events' results.
   */
  export type EngineResultOf = {
      /**
       * `{ result, context? }`, `{ deny }`, or core's `{ ref, result }`.
       */
      'tool.call': ToolCallResult;
      /**
       * The tree to draw; `{ type: "engine", ref }` is core's own drawing.
       */
      'ui.render': RenderElement;
      /**
       * The surface's element table (Elements[e.surface]): constructors from props
       * to a RenderElement.
       */
      'ui.resolve': ElementTable;
      /**
       * `{ element }`: the element whose handler the press reached.
       */
      'ui.press': UiPressResult;
      /**
       * `{ element, value }`: the field whose handler the input reached, and
       * the text it received.
       */
      'ui.input': UiInputResult;
      /**
       * `{ element, value }`: the picker whose handler the pick reached, and
       * the value it received.
       */
      'ui.select': UiSelectResult;
      /**
       * `{ props? }`: the posting instance's next props, when a hook hands some.
       */
      'ui.message': UiMessageResult;
      /**
       * `{ offered }`.
       */
      'agent.offer': AgentOfferResult;
      /**
       * `{ model }` or `{ deny }`.
       */
      'agent.spawn': AgentSpawnResult;
      /**
       * `{ text, context? }` or `{ drop }`.
       */
      'prompt.submit': PromptSubmitResult;
      /**
       * `{ text }` (null leaves the section out).
       */
      'prompt.section': PromptSectionResult;
      /**
       * `{ blocks }` (a block left out is not sent).
       */
      'prompt.context': PromptContextResult;
      /**
       * `{ description }`.
       */
      'tool.describe': ToolDescribeResult;
      /**
       * `{ text }` (the command's output, when it printed one).
       */
      'command.run': CommandRunResult;
      /**
       * `{ description, argumentHint, isHidden }`.
       */
      'command.describe': CommandDescribeResult;
      /**
       * `{ text }`.
       */
      'skill.prompt': SkillPromptResult;
      /**
       * `{ text }`.
       */
      'attribution.text': AttributionTextResult;
      /**
       * `{ cwd }`.
       */
      'session.start': SessionStartResult;
      /**
       * `{ text }`, or `{ consumed }`.
       */
      'session.receive': SessionReceiveResult;
      /**
       * `{ messages, tokensBefore?, tokensAfter? }`, or `{ skip }`.
       */
      'session.compact': SessionCompactResult;
      /**
       * `{ turnId }`.
       */
      'turn.start': TurnStartResult;
      /**
       * `{ turnId, index }`.
       */
      'turn.step': TurnStepResult;
      /**
       * `{ text }`.
       */
      'turn.complete': TurnCompleteResult;
      /**
       * `$` as built so far, with this plugin's interface added and any it
       * withheld left out; `next(e)` resolves to EngineInterfaceBuilt.
       */
      'engine.create': EngineCreateResult;
  };

  /**
   * The events as calls on `$`, one signature each: `$.<noun>.<event>(input)`
   * takes the event's input and resolves to its result, from either side.
   *
   * The engine raises an event so (`$.tool.call(input)` in the tool runner); a
   * plugin's call reaches the same event with the calling hook alone skipped.
   * `input` may leave out what the engine fills (`tool_use_id`, the parent).
   */
  export type EventCalls = {
      tool: {
          call: ToolCallOverloads;
          describe: (input: ToolDescribeInput) => Promise<ToolDescribeResult>;
      };
      command: {
          run: (input: CommandRunArgs) => Promise<CommandRunResult>;
          describe: (input: CommandDescribeInput) => Promise<CommandDescribeResult>;
      };
      prompt: {
          submit: (input: PromptSubmitArgs) => Promise<PromptSubmitResult>;
          section: (input: PromptSectionInput) => Promise<PromptSectionResult>;
          context: (input: PromptContextInput) => Promise<PromptContextResult>;
      };
      skill: {
          prompt: (input: SkillPromptInput) => Promise<SkillPromptResult>;
      };
      attribution: {
          text: (input: AttributionTextInput) => Promise<AttributionTextResult>;
      };
      agent: {
          offer: (input: AgentOfferInput) => Promise<AgentOfferResult>;
          spawn: (input: AgentSpawnArgs) => Promise<AgentSpawnResult>;
      };
      session: {
          start: (input: SessionStartInput) => Promise<SessionStartResult>;
          receive: (input: SessionReceiveInput) => Promise<SessionReceiveResult>;
          compact: (input?: SessionCompactArgs) => Promise<SessionCompactResult>;
      };
      turn: {
          start: (input: TurnStartInput) => Promise<TurnStartResult>;
          step: (input: TurnStepInput) => Promise<TurnStepResult>;
          complete: (input: TurnCompleteInput) => Promise<TurnCompleteResult>;
      };
      ui: {
          render: <C extends RenderComponent>(input: RenderInput<C>) => Promise<RenderElement>;
          resolve: <E extends ResolveInput>(e: E) => Elements[E['surface']];
      };
  };

  /**
   * The name of an event: a key of EventOf, the engine's own (CoreEventName)
   * and the declared plugin nouns' (NounEventName).
   */
  export type EventName = keyof EventOf;

  /**
   * The argument of each event, by event name: what a hook receives as `e`
   * and what the call on `$` takes. Plain data, frozen to every depth.
   *
   * The engine's own events (CoreEventOf: a plugin's `$.fs.write(...)` is
   * a dispatch the hooks above it see) and the methods of the plugin nouns
   * declared on EngineInterface (NounEventOf).
   */
  export type EventOf = CoreEventOf & NounEventOf;

  /**
   * The result of event `N`: what its hooks return and what their `next(e)`
   * resolves to.
   */
  export type EventResult<N extends EventName = EventName> = ResultOf[N];

  /**
   * The hook signature of each event, `($, e, next)`, as one mapped type over
   * EventOf.
   *
   * With one handler type per event, `Events[E]` for a generic E would be a
   * union; as one mapped type it stays a single function type and activate.ts
   * calls it without a cast (TS 4.6 correlated unions).
   *
   * @param $ the engine interface, frozen, the same object at every invocation;
   *   at `engine.create` the empty table, since `$` exists after the fold
   * @param e the event's argument, frozen to every depth (`e.command = "ls"`
   *   throws and fails the hook); a rewrite is a copy passed to `next`
   * @param next the rest of the chain; a chain a hook raises through `$` skips
   *   this hook and runs every other, its plugin's others too (HookOrigin)
   */
  export type Events = {
      [E in keyof EventOf]: ($: E extends 'engine.create' ? NoEngineInterface : EngineInterface, e: Args<E>, next: Next<E>) => EventResult<E> | Promise<EventResult<E>>;
  };

  type ExitReason = 'clear' | 'resume' | 'logout' | 'prompt_input_exit' | 'other';

  type FileChangedHookInput = BaseHookInput & {
      hook_event_name: 'FileChanged';
      file_path: string;
      event: 'change' | 'add' | 'unlink';
  };

  /**
   * One file `$.fs.ancestors` found: the directory it stands in, the name it
   * was asked for by, and its text as the engine's memory loader reads it.
   */
  export type FsAncestor = {
      /**
       * The directory the file stands in, absolute.
       */
      dir: string;
      /**
       * The spelling the caller asked for it by.
       */
      name: string;
      /**
       * The file's text, with what its `@include`s bring after it.
       */
      content: string;
  };

  /**
   * The argument of `$.fs.ancestors`: the file names to look for in each
   * directory, and the file to walk down to.
   */
  export type FsAncestorsRequest = {
      /**
       * Relative `.md` file names, each looked for in every directory.
       */
      names: readonly string[];
      /**
       * The file the walk goes on down to the directory of, relative to the
       * working directory or absolute; absent, it ends at the working directory.
       */
      of?: string;
  };

  /**
   * One entry of `$.fs.list`.
   */
  export type FsEntry = {
      /**
       * The entry's name (no directory part).
       */
      name: string;
      /**
       * `file`, `dir`, or `other`.
       */
      kind: 'file' | 'dir' | 'other';
      /**
       * Bytes, for a file.
       */
      size: number;
  };

  /**
   * What `$.fs.stat` resolves with.
   */
  export type FsStat = {
      /**
       * `file`, `dir`, or `other`.
       */
      kind: 'file' | 'dir' | 'other';
      /**
       * Bytes, for a file.
       */
      size: number;
      /**
       * Last modification, milliseconds since the epoch.
       */
      mtimeMs: number;
  };

  /**
   * Every event (`*`), or every event under a namespace (`classic.*`: each
   * one whose name starts with `classic.`).
   */
  export type Glob = '*' | `${Namespace}.*`;

  /**
   * The hook `on(pattern, hook)` takes for a glob or a negation: one function
   * placed on every selected event, `e` and the result typed as their union.
   *
   * `next.event` says which event a run is; `next.is(pattern, e)` narrows `e`
   * to one of them. At `engine.create` (a negation may select it) `$` is the
   * empty table and the hook observes the fold, as a `*` hook does.
   */
  export type GlobHook<P extends Pattern, N extends EventName = Selected<P>> = ($: EngineInterface, e: Args<N>, next: GlobNext<P>) => EventResult<N> | Promise<EventResult<N>>;

  /**
   * `next` in a hook on a glob or a negation: an overload per selected event,
   * then one over their union for an `e` not yet narrowed.
   *
   * `is` narrows `e` to the selected events its pattern names; `event` is one
   * of the selected names.
   */
  export type GlobNext<P extends Pattern, N extends EventName = Selected<P>> = OrderedOverloads<N> & {
      (e: Args<N>): Promise<GlobNextResult<N>>;
      /**
       * Continues this dispatch at a tier, as Next's `to` (a managed hook's),
       * over the selected events' union for an `e` not yet narrowed.
       */
      readonly to: (e: Args<N>, tier: TargetTier) => Promise<GlobNextResult<N>>;
      readonly signal: AbortSignal;
      readonly is: <M extends PatternOver<N>>(pattern: M, e: unknown) => e is Args<Extract<N, Selected<M>>>;
      readonly event: N;
      readonly origin: Origin;
      readonly trace: readonly TraceEntry<N, Args<N>, GlobNextResult<N>>[];
  };

  /**
   * What `next(e)` resolves to in a glob hook before `e` is narrowed: the
   * NextResult of each selected event, as a union.
   */
  type GlobNextResult<N extends EventName> = {
      [K in N]: NextResult<K>;
  }[N];

  /**
   * One hook, `($, e, next)`, on event `E`.
   */
  export type Hook<E extends EventName = EventName> = Events[E];

  /**
   * Why a hook failed, as its `.catch` handler reads it on `next.error`: plain
   * frozen data.
   *
   * `throw`: the hook threw, or returned what the site refuses, `message`
   * saying what; `timeout`: it outran its budget, `message` then what its last
   * `next()` rejected with, if it did. `budget` is the handler's own grace.
   */
  export type HookFailure = {
      readonly kind: 'throw' | 'timeout';
      /**
       * The thrown error's message, or for a timeout what the hook's last
       * `next()` rejected with; absent for a timeout with nothing rejected.
       */
      readonly message?: string;
      /**
       * The grace the handler runs under, in milliseconds; past it, the hook is
       * absent as if it had no handler.
       */
      readonly budget: number;
  };

  /**
   * The hook type per pattern: an event's own (Events), `*`'s (AnyEventHook),
   * or a glob's over the events it selects (GlobHook), as one conditional type.
   *
   * One type, so the two-argument `on` stays ONE generic signature: as an
   * overload set the language service offers no tool-name completions inside
   * `e.tool === "`; as an index into a table TS intersects every argument.
   */
  export type HookFor<P extends Pattern> = P extends '*' ? AnyEventHook : P extends EventName ? Events[P] : GlobHook<P>;

  type HookInput = PreToolUseHookInput | PostToolUseHookInput | PostToolUseFailureHookInput | PostToolBatchHookInput | PermissionDeniedHookInput | NotificationHookInput | UserPromptSubmitHookInput | UserPromptExpansionHookInput | SessionStartHookInput | SessionEndHookInput | StopHookInput | StopFailureHookInput | SubagentStartHookInput | SubagentStopHookInput | PreCompactHookInput | PostCompactHookInput | PreModelSwitchHookInput | PostModelSwitchHookInput | PermissionRequestHookInput | SetupHookInput | TeammateIdleHookInput | TaskCreatedHookInput | TaskCompletedHookInput | ElicitationHookInput | ElicitationResultHookInput | ConfigChangeHookInput | InstructionsLoadedHookInput | WorktreeCreateHookInput | WorktreeRemoveHookInput | CwdChangedHookInput | FileChangedHookInput | DirectoryAddedHookInput | MessageDisplayHookInput;

  /**
   * What a hooks module exports: `register`, and nothing the loader reads
   * besides.
   */
  export type HooksModule = {
      register: Register;
  };

  /**
   * Options of `$.http.fetch`.
   */
  export type HttpInit = {
      /**
       * `GET` (default), `POST`, ...
       */
      method?: string;
      /**
       * Request headers.
       */
      headers?: Record<string, string>;
      /**
       * The request body, as text.
       */
      body?: string;
  };

  /**
   * What `$.http.fetch` resolves with.
   */
  export type HttpResponse = {
      /**
       * The HTTP status code.
       */
      status: number;
      /**
       * True for a 2xx status.
       */
      ok: boolean;
      /**
       * Response headers, lower-cased names.
       */
      headers: Record<string, string>;
      /**
       * The body, as text.
       */
      text: string;
  };

  /**
   * The keys of object pattern `P` that object member `E` cannot satisfy, `D`
   * levels down; `never` when there is none, which is what keeps the member.
   *
   * A key `E` does not have (an open record has every string key), or one
   * whose value `P` narrows to nothing.
   */
  type ImpossibleKeys<E, P, D extends readonly unknown[]> = {
      [K in keyof P]-?: K extends keyof E ? [NarrowedValue<Exclude<E[K], undefined>, P[K], D>] extends [never] ? K : never : K;
  }[keyof P];

  /**
   * The props of `Input`, every surface's one-line text field: an address,
   * optional texts, and the closures a change and a submit run. A leaf.
   *
   * Focused through the same ring as `Button` (`abovePrompt:focus`); while it
   * has focus every printable key reaches it alone and Esc returns them; a
   * change and Enter raise `ui.input`, whose bottom is `onInput` / `onSubmit`.
   */
  export type InputProps = {
      /**
       * The element's address: `e.element` at `ui.input`, what a matcher names.
       */
      key: string;
      /**
       * Text drawn before the field.
       */
      label?: string;
      /**
       * Text drawn dim in an empty field.
       */
      placeholder?: string;
      /**
       * The text the field holds when drawn; the person's typing replaces it
       * until the hook draws another.
       */
      value?: string;
      /**
       * What Enter does, in a word or two, drawn beside the field while it has
       * focus (`send`). Defaults to `submit`.
       */
      submitLabel?: string;
      /**
       * Runs on every change of the text, in the plugin's own environment: the
       * bottom of a `ui.input` chain of kind `change`.
       */
      onInput?: (value: string, e: UiInputArgument) => void;
      /**
       * Runs on Enter with the text, in the plugin's own environment: the bottom
       * of a `ui.input` chain of kind `submit`. No model turn unless it asks one.
       */
      onSubmit: (value: string, e: UiInputArgument) => void;
  };

  type InstructionsLoadedHookInput = BaseHookInput & {
      hook_event_name: 'InstructionsLoaded';
      file_path: string;
      memory_type: 'User' | 'Project' | 'Local' | 'Managed';
      load_reason: 'session_start' | 'nested_traversal' | 'path_glob_match' | 'include' | 'compact';
      globs?: string[];
      trigger_file_path?: string;
      parent_file_path?: string;
  };

  /**
   * What `$.ui.invalidate` takes: a render event, or one of the four events
   * whose answers the engine caches for the session.
   */
  export type InvalidatableEventName = RenderEventName | 'prompt.section' | 'prompt.context' | 'tool.describe' | 'command.describe';

  /**
   * Whether tag key `K` selects members of `I`: it does when each member gives
   * it ONE literal (`component: "ToolUse"` on the ToolUse variant).
   *
   * A key that is the same union on every member is a filter at runtime; it
   * is left out of the selection so that it cannot defeat the narrowing the
   * other keys give.
   */
  type IsDiscriminant<I, K> = I extends unknown ? K extends KnownKeys<I> ? IsSingleLiteral<I[K]> : true : never;

  /**
   * Whether `V` is made of literals only: `"a" | "b"` is, `string` is not.
   */
  type IsLiteralValued<V> = string extends V ? false : number extends V ? false : boolean extends V ? false : [V] extends [string | number | boolean] ? true : false;

  /**
   * Whether `V` is exactly one string, number or boolean literal.
   */
  type IsSingleLiteral<V> = [V] extends [string | number | boolean] ? IsUnion<V> extends true ? false : true : false;

  /**
   * Whether `T` is a union of two or more members.
   */
  type IsUnion<T, U = T> = T extends unknown ? [U] extends [T] ? false : true : never;

  /**
   * Plain data: what JSON holds, and what crosses between a plugin's hooks
   * module and its surface module whole (a `Client`'s props, a post's data).
   *
   * A function, a class instance, `undefined` or a cycle is not plain data;
   * the engine refuses one where it checks, and drops it where it clones.
   */
  export type JsonValue = string | number | boolean | null | readonly JsonValue[] | {
      readonly [key: string]: JsonValue;
  };

  /**
   * What `next` takes in a matched hook: the variants of `e` the matcher can
   * match (KeptMembers), as declared, so a rewrite of a pinned field passes.
   */
  type KeptEvent<P extends Pattern, M> = MatchedNames<P, M> extends infer N extends EventName ? N extends unknown ? KeptMembers<Args<N>, M> : never : never;

  /**
   * The members of the argument union `E` matcher `P` can match, as declared;
   * what `next` takes, so a rewrite may change a field the matcher pinned.
   *
   * A member is dropped when `P` names a key it lacks, or gives a key, at any
   * depth, a value none of that key's values can equal (ImpossibleKeys).
   */
  type KeptMembers<E, P> = E extends unknown ? [ImpossibleKeys<E, P, []>] extends [never] ? E : never : never;

  /**
   * The declared keys of `T`, the string and number index signatures left out.
   */
  type KnownKeys<T> = keyof {
      [K in keyof T as string extends K ? never : number extends K ? never : K]: 0;
  };

  /**
   * The events whose overload must come after the rest, lest it shadow them.
   *
   * `classic.PreToolUse` shares `tool.call`'s envelope, `turn.abort` every
   * turn event's `turnId`, and an object of any shape is assignable to NoArgs.
   */
  type LateOverload = 'classic.PreToolUse' | 'turn.abort' | NoArgsEvent;

  /**
   * The props of `Link`, a hyperlink both surfaces draw: an OSC 8 span on the
   * terminal (else its text then the URL in dim), an anchor on desktop.
   *
   * An inline element: its children are the text, strings and inline
   * elements; absent children the `label`, absent both the URL. The host
   * bounds `href` before the tree crosses (render-site/ linkProblem).
   */
  export type LinkProps = {
      /**
       * Where the link goes: an `https:` URL (or `http://localhost`), at most
       * MAX_LINK_HREF_CHARS of printable ASCII, spelled as `new URL(href).href`.
       *
       * No `user@host` part, no raw `@`, space or non-ASCII letter (encode them);
       * anything else refuses the tree the Link is in.
       */
      href: string;
      /**
       * The text drawn when the element has no children; absent both, the URL
       * itself is the text.
       */
      label?: string;
  };

  /**
   * What a matcher value selects by: itself, or `unknown` for a RegExp, which
   * selects nothing.
   */
  type Literal<X> = X extends RegExp ? unknown : X;

  /**
   * The argument a matched hook receives: `e` narrowed by `M` (Narrowed), per
   * event the registration covers.
   */
  export type MatchedEvent<P extends Pattern, M> = MatchedNames<P, M> extends infer N extends EventName ? N extends unknown ? Narrowed<Args<N>, M> : never : never;

  /**
   * The hook `on(pattern, matcher, hook)` takes: `($, e, next)` with `e`
   * narrowed by the matcher (MatchedEvent), and a tagged result the same way.
   *
   * `next` takes the variants the matcher keeps, as declared (KeptEvent), so
   * `next(e)` passes and so does a rewrite of a pinned field; `next.is` names
   * the events the registration covers and narrows as the matcher does.
   */
  export type MatchedHook<P extends Pattern, M> = ($: EngineInterface, e: MatchedEvent<P, M>, next: Next<MatchedNames<P, M>, KeptEvent<P, M>, MatchedResult<P, M>, {
      [K in MatchedNames<P, M>]: Narrowed<Args<K>, M>;
  }>) => MatchedResult<P, M> | Promise<MatchedResult<P, M>>;

  /**
   * The events a matched registration on `P` covers: the event named, or for a
   * glob every selected event whose input has each key the matcher names.
   */
  type MatchedNames<P, M = never> = P extends EventName ? P : {
      [N in Selected<P & string>]: [M] extends [never] ? N : keyof M extends AnyKeyOf<Args<N>> ? N : never;
  }[Selected<P & string>];

  /**
   * What a matched hook returns: the event's result, narrowed by `M` where the
   * result is a union tagged by the matcher's tag keys.
   */
  export type MatchedResult<P extends Pattern, M> = MatchedNames<P, M> extends infer N extends EventName ? N extends unknown ? Select<EventResult<N>, Selection<Args<N>, M>> : never : never;

  /**
   * What `on(event, matcher, hook)` takes for an argument of type `I`: the
   * shape of the `e` the hook wants, a partial of it at any depth.
   *
   * A leaf is `===` or a RegExp (`{ command: /^p4 / }`); an array is any-of;
   * an object is a partial of an OBJECT, so `{ command: { startsWith } }` is
   * a type error where `e` is typed and free where it is `unknown`.
   */
  export type Matcher<I, All = I> = I extends unknown ? {
      readonly [K in KnownKeys<I>]?: MatcherValue<I[K], MatcherValueOf<All, K>>;
  } & (string extends keyof I ? OpenMatcher<I, All> : unknown) : never;

  /**
   * Any matcher at all, for a field typed `unknown` (a tool's input, a
   * result's output): the kinds the engine accepts, unchecked there.
   *
   * The four kinds: a scalar is `===`; a RegExp tests the value as a string
   * (`{ command: /^p4 / }`); an array matches if any element does; an object
   * is a partial of an object. `{ startsWith: 'p4' }` never matches a string.
   */
  type MatcherData = string | number | boolean | null | RegExp | readonly MatcherData[] | {
      readonly [key: string]: MatcherData;
  };

  /**
   * The declared keys of every variant of `I` (index signatures aside).
   */
  type MatcherKeys<I> = I extends unknown ? KnownKeys<I> : never;

  /**
   * What matches one value of type `V`, by the runtime's kinds (matchesWith):
   * a scalar leaf takes the value or a RegExp; an object, a partial of it.
   *
   * For an array, what matches one ELEMENT of it, since a pattern against an
   * array value holds when some element matches; for `unknown`, any matcher.
   * A scalar matches by `===`, a RegExp tests the value as a string.
   */
  type MatcherOne<V> = unknown extends V ? MatcherData : V extends readonly (infer Item)[] ? MatcherOne<Item> : V extends string | number | boolean | null ? V | RegExp : V extends object ? Matcher<V> : V extends undefined ? never : unknown;

  /**
   * What a matcher gives a key whose value is `V` on this variant and `Across`
   * over every variant: one MatcherOne, or an array of them matched as one-of.
   *
   * The one-of is typed over every variant, so `{ tool: ['Bash', 'Read'] }`
   * types on the Bash variant; with a nested pattern beside it, the pattern is
   * checked against a variant the one-of names, not against each of them.
   */
  type MatcherValue<V, Across = V> = MatcherOne<V> | readonly MatcherOne<Across>[];

  /**
   * The type of key `K` across the variants of `I` that declare it.
   */
  type MatcherValueOf<I, K> = I extends unknown ? K extends KnownKeys<I> ? I[K] : never : never;

  /**
   * One block of an MCP result: `type` and the fields that kind of block carries.
   */
  export type McpContentBlock = {
      /**
       * The block's kind: `text`, `image`, `audio`, `resource`, `resource_link`.
       */
      type: string;
      /**
       * Set on a `text` block.
       */
      text?: string;
      /**
       * Set on a `resource_link` (or embedded `resource`) block.
       */
      uri?: string;
      /**
       * Declared by an image, audio or resource block.
       */
      mimeType?: string;
      [field: string]: unknown;
  };

  /**
   * The MCP branch: one variant per declared tool when McpToolInputs has
   * entries, else one loose variant over every `mcp__*` name.
   */
  export type McpToolCallInput = [keyof McpToolInputs] extends [never] ? McpToolCallInputFallback : {
      [N in keyof McpToolInputs & string]: ToolInputOf<N, McpToolInputs[N] & Record<string, unknown>>;
  }[keyof McpToolInputs & string];

  /**
   * The MCP branch's answer when no MCP tool is declared: every `mcp__*`
   * name, its args unconstrained.
   */
  type McpToolCallInputFallback = {
      /**
       * The name of the tool being called (`mcp__<server>__<tool>`); comparing
       * it narrows `e`. Reserved: a rewrite of it is ignored by core.
       */
      tool: McpToolName;
      /**
       * The tool_use block's id: the same at every event of the call and in
       * `$.ui.notice`. Reserved: a rewrite of it is ignored by core.
       */
      tool_use_id: string;
      [argument: string]: unknown;
  };

  /**
   * The inputs of the MCP tools this project knows, keyed by full tool name,
   * for declaration merging; empty by default, then every MCP tool is loose.
   *
   * A `.d.ts` in the plugin author's project (written by `/plugin-types <dir>`
   * from the connected servers' JSON Schemas, or by hand) adds entries under
   * `declare module "claude-code"`; `e.tool === <name>` then narrows to them.
   *
   * @example
   * interface McpToolInputs { "mcp__my_server__send": { to: string } }
   */
  export interface McpToolInputs {
  }

  /**
   * The name of an MCP tool as the engine spells it: `mcp__<server>__<tool>`.
   */
  export type McpToolName = `mcp__${string}__${string}`;

  /**
   * An MCP tools/call result as the SDK returns it, plain data.
   */
  export type McpToolResult = {
      /**
       * The result's content blocks, in order (text, image, resource,
       * resource_link, ...).
       */
      content: McpContentBlock[];
      /**
       * True when the server reported the call as failed; the blocks then describe
       * the error.
       */
      isError: boolean;
      /**
       * The server's structured result, when its tool declares an output schema.
       */
      structuredContent?: unknown;
  };

  /**
   * Hook input for the MessageDisplay event. Fired with each batch of newly completed lines while an assistant message streams. Display-only: the stored message and what the model sees are untouched.
   */
  type MessageDisplayHookInput = BaseHookInput & {
      hook_event_name: 'MessageDisplay';
      /**
       * UUID of the current turn.
       */
      turn_id: string;
      /**
       * UUID of the assistant message being displayed. Stable across every flush of the same message. Not the API msg_... id.
       */
      message_id: string;
      /**
       * Zero-based index of this delta within the message. Increments by one per flush.
       */
      index: number;
      /**
       * True on the message's last flush. Exactly one flush per message has it.
       */
      final: boolean;
      /**
       * The newly completed lines since the prior flush. Always whole lines, except on the final flush which may end mid-line. The delta of the final flush is empty when the message ends on a newline; treat final as the end-of-message signal regardless.
       */
      delta: string;
  };

  /**
   * What `$.model.complete` takes.
   */
  export type ModelCompleteRequest = {
      /**
       * An alias (`haiku`) or a full model id; resolved and allowlist-checked like
       * a `--model` value.
       */
      model: string;
      /**
       * The one user message; the reply's text comes back.
       */
      prompt: string;
      /**
       * Precedes the completion as its system prompt, after the CLI's identity
       * block. Default none.
       */
      system?: string;
      /**
       * The reply's token cap. Default 256.
       */
      maxTokens?: number;
  };

  /**
   * What `$.model.fork` resolves to when the fork answered: the reply's text
   * and what the fork cost.
   */
  export type ModelForkReply = {
      /**
       * The non-error replies' text, joined by newlines.
       */
      text: string;
      /**
       * The fork's token counts, so a plugin can account for what it spent.
       */
      usage: ModelForkUsage;
  };

  /**
   * What `$.model.fork` takes.
   */
  export type ModelForkRequest = {
      /**
       * The one user message, appended to the session's own transcript.
       *
       * The reply's text and usage come back, or null on an API error or a cold
       * transcript.
       */
      prompt: string;
  };

  /**
   * What one fork cost, as the API counted it: the four token counts of the
   * fork's completions summed.
   */
  export type ModelForkUsage = {
      input_tokens: number;
      output_tokens: number;
      cache_read_input_tokens: number;
      cache_creation_input_tokens: number;
  };

  /**
   * The prefixes a glob may name: one or more whole leading segments of an
   * event name (`tool` of `tool.call`), derived, plugin nouns included.
   */
  export type Namespace<N extends string = EventName> = N extends `${infer Head}.${infer Rest}` ? Head | `${Head}.${Namespace<Rest>}` : never;

  /**
   * How many object or array levels a matcher narrows `e` through, counted as
   * a tuple's length: the runtime's MATCH_DEPTH_LIMIT, which refuses deeper.
   *
   * Past it a field keeps its declared type; nothing becomes `any`.
   */
  type NarrowDepth = 8;

  /**
   * `e` in a matched hook: the members of the argument union `E` matcher `P`
   * can match, each with the keys `P` names narrowed to what a match implies.
   *
   * A scalar narrows to the literal, a one-of to what its alternatives give,
   * an object key recursively, an array some element of which must match to
   * a non-empty tuple; other keys, `unknown` and RegExp-matched fields keep.
   */
  export type Narrowed<E, P> = E extends unknown ? NarrowedMember<E, P, []> : never;

  /**
   * A value of declared type `V` under a one-of, folded over the tuple into
   * `Found`: the union of what each alternative narrows `V` to (NarrowedByOne).
   *
   * An alternative that cannot match adds nothing, so a one-of none of whose
   * alternatives can is `never`; a one-of typed as a plain array rather than
   * a tuple narrows by the union of its elements at once.
   */
  type NarrowedByAny<V, Alternatives extends readonly unknown[], D extends readonly unknown[], Found = never> = Alternatives extends readonly [infer First, ...infer Rest] ? NarrowedByAny<V, Rest, D, Found | NarrowedByOne<V, First, D>> : Alternatives extends readonly [] ? Found : Found | NarrowedByOne<V, Alternatives[number], D>;

  /**
   * A value of declared type `V` under one matcher node `Q` that is not a
   * one-of, member of `V` by member; a member that cannot match is `never`.
   *
   * An array some element of which must match becomes NonEmpty; a RegExp
   * keeps the member; an object pattern recurses into an object member, one
   * level down; a scalar keeps a member as narrow, and replaces a wider one.
   */
  type NarrowedByOne<V, Q, D extends readonly unknown[]> = V extends readonly (infer Item)[] ? [NarrowedValue<Item, Q, [...D, unknown]>] extends [never] ? never : NonEmpty<V, Item> : Q extends RegExp ? V : Q extends object ? V extends object ? NarrowedMember<V, Q, [...D, unknown]> : never : V extends Q ? V : Q extends V ? Q : never;

  /**
   * One object member `E` under object pattern `P`, `D` levels down: `never`
   * when a key of `P` is impossible on it (ImpossibleKeys), else `E` narrowed.
   *
   * Each key `P` names is narrowed (NarrowedValue); every other key, and each
   * key's optionality, stays as declared.
   */
  type NarrowedMember<E, P, D extends readonly unknown[]> = [
  ImpossibleKeys<E, P, D>
  ] extends [never] ? {
      [K in keyof E]: K extends keyof P ? NarrowedValue<E[K], P[K], D> : E[K];
  } : never;

  /**
   * A value of declared type `V` where the matcher gives `Q`, `D` levels
   * down: NarrowedByAny under a one-of (an array), NarrowedByOne otherwise.
   *
   * As declared once `D` reaches NarrowDepth, or for a field typed `unknown`
   * (a tool's input), which no pattern narrows.
   */
  type NarrowedValue<V, Q, D extends readonly unknown[]> = D['length'] extends NarrowDepth ? V : unknown extends V ? V : Q extends readonly unknown[] ? NarrowedByAny<V, Q, D> : NarrowedByOne<V, Q, D>;

  /**
   * `!` before a name or a glob: every event except the ones it selects. `!*`
   * would select none, so it is no pattern.
   */
  type Negation = `!${Exclude<EventName | Glob, '*'>}`;

  /**
   * The rest of the chain, as one hook receives it: made once per dispatch per
   * hook, frozen; `next(e)` resolves to the downstream result.
   *
   * Each call runs the hooks below again; core is the last, and below it `next`
   * rejects. Called with no argument it rejects, naming the hook. A hook that
   * returns without calling it ends the chain; returning nothing is a failure.
   *
   * @template S what `next.is(pattern, e)` narrows `e` to, per event: the event's
   *   argument, or, under a matcher, that argument narrowed by it (MatchedHook)
   * @template T the tool `e` names, when it names one: on `tool.call` it types
   *   the result (NextResultFor); an `e` without `tool` takes the line beneath
   */
  export type Next<N extends EventName = EventName, E = Args<N>, O = NextResult<N>, S extends {
      [K in N]?: unknown;
  } = {
      [K in N]: Args<K>;
  }> = {
      <T extends string>(e: E & ToolNamed<T>): Promise<NextResultFor<N, O, T>>;
      (e: E): Promise<O>;
      /**
       * Continues this dispatch at a tier: `next(e)` with every link between
       * this hook's own tier and that one skipped, by tier and narrowing only.
       *
       * A managed hook's: prepend may name append, builtin or core, append core;
       * it never skips a tier with more authority, so no user hook skips the
       * org's. A literal on the hook's own `next`; skipped links are traced.
       */
      readonly to: {
          <T extends string>(e: E & ToolNamed<T>, tier: TargetTier): Promise<NextResultFor<N, O, T>>;
          (e: E, tier: TargetTier): Promise<O>;
      };
      /**
       * Aborts when the call this dispatch belongs to is abandoned: the user
       * interrupted, a hook above settled first, or this hook ran out of budget.
       *
       * Anything the hook started (timers, requests) should stop on it. It is an
       * AbortSignal of the plugin's own environment, driven by the chain's.
       */
      readonly signal: AbortSignal;
      /**
       * Whether this dispatch's event is selected by `pattern` (a name, a glob,
       * a negation), as a type predicate on `e`: `next.is("tool.call", e)`.
       *
       * Under a matcher the narrowing includes it. `pattern` names events this
       * hook covers (PatternOver); a name outside them is a compile error.
       */
      readonly is: <M extends PatternOver<N>>(pattern: M, e: unknown) => e is S[Extract<N, Selected<M>>];
      /**
       * The name of this dispatch's event, as a value, for a glob hook to log or
       * switch on.
       */
      readonly event: N;
      /**
       * Who raised this dispatch: the calling plugin's name and the tier it sits
       * in (Origin); the engine reads `{ plugin: "engine", tier: "core" }`.
       *
       * Set by the host alone, from the environment the call came from (its own
       * MessagePort) and that plugin's seat; nothing a plugin writes reaches it.
       * Every hook of one dispatch sees the same origin, and `next.to` keeps it.
       *
       * @example
       * return next.origin.tier === "prepend" ? next.to(e, "append") : next(e)
       */
      readonly origin: Origin;
      /**
       * What settled beneath this hook on its latest `next()` call, the one
       * started last: an entry per link beneath, nearest first, the engine's last.
       *
       * Empty before `next` is called; filled even when `next` rejected; a link
       * still running joins in place later, nothing listed leaves; it ends short
       * of the engine at a link that answered its last call itself. Data, frozen.
       */
      readonly trace: readonly TraceEntry<N, E, O>[];
  };

  /**
   * What `next(e)` resolves to for event `N`: the event's result, except at
   * `engine.create`, where the steps beneath return `$` as built so far.
   *
   * A withheld noun is on that `$` as a stub, so the built table is typed
   * whole where what a hook returns (EngineCreateResult) is partial.
   */
  export type NextResult<N extends EventName> = N extends 'engine.create' ? EngineInterfaceBuilt : EventResult<N>;

  /**
   * What `next(e)` resolves to once `e.tool` is the literal `T`: on `tool.call`
   * the result typed for that tool; on every other event, `O` as declared.
   *
   * `result` is Bash's record after `e.tool === "Bash"`; an un-narrowed `e`
   * names every tool, and `result` stays `unknown`.
   */
  export type NextResultFor<N extends EventName, O, T extends string> = [
  N
  ] extends ['tool.call'] ? ToolCallResult<T> : O;

  /**
   * The argument of a call on `$` that takes nothing (`$.session.cwd()`): an
   * object with no keys.
   */
  type NoArgs = Record<never, never>;

  /**
   * The events whose argument is exactly NoArgs (`session.cwd`, a declared
   * plugin noun's `() => ...`); their overloads come last (LateOverload).
   */
  type NoArgsEvent = {
      [N in EventName]: Args<N> extends NoArgs ? NoArgs extends Args<N> ? N : never : never;
  }[EventName];

  /**
   * What an `engine.create` hook receives as `$`: nothing. Every property
   * reads as `never`, so `$.model` inside the hook is a compile error.
   */
  export type NoEngineInterface = {
      readonly [noun: string]: never;
  };

  /**
   * Array type `V`, of element `Item`, once some element of it is known to
   * match: a tuple of at least one `Item`, readonly when `V` is.
   *
   * So `e` still passes wherever the declared array is taken; a `V` that is
   * already a non-empty tuple is kept as it is.
   */
  type NonEmpty<V, Item> = V extends readonly [unknown, ...unknown[]] ? V : V extends Item[] ? [Item, ...Item[]] : readonly [Item, ...Item[]];

  type NotificationHookInput = BaseHookInput & {
      hook_event_name: 'Notification';
      message: string;
      title?: string;
      notification_type: string;
  };

  /**
   * The declared plugin nouns' methods as event rows (NounEventRow), one per
   * `<noun>.<method>` that is a function; a member that is not is no event.
   */
  type NounEvent = {
      [K in PluginNoun]: {
          [M in keyof EngineInterface[K] & string]: EngineInterface[K][M] extends (...args: infer Parameters) => infer Result ? NounEventRow<`${K}.${M}`, Parameters extends readonly [] ? NoArgs : Parameters[0], Awaited<Result>> : never;
      }[keyof EngineInterface[K] & string];
  }[PluginNoun];

  /**
   * The name of a declared plugin noun's event (`voice.speak`).
   */
  type NounEventName = keyof NounEventOf & string;

  /**
   * The events of the plugin nouns declared on EngineInterface, by name: the
   * argument of each `<noun>.<method>`. Empty until a plugin declares a noun.
   *
   * @example
   * declare module "claude-code" { interface EngineInterface { voice: Voice } }
   */
  export type NounEventOf = {
      [E in NounEvent as E['name']]: E['args'];
  };

  /**
   * The result of a declared plugin noun's event as its hooks see it:
   * `{ value }` (the method's answer) or `{ deny }`.
   */
  type NounEventResult<N extends NounEventName> = ValueOrDeny<NounValueOf[N]>;

  /**
   * One method of a declared plugin noun as an event row: its event's name,
   * argument (the method's first parameter) and value (its awaited result).
   */
  type NounEventRow<Name extends string, Args, Value> = {
      name: Name;
      args: Args;
      value: Value;
  };

  /**
   * What each declared plugin noun's method answers (the `value` of its
   * event's result), by event name.
   */
  type NounValueOf = {
      [E in NounEvent as E['name']]: E['value'];
  };

  /**
   * Registers `hook` on the events `pattern` selects: one by name, every one
   * under a namespace (`classic.*`), all (`*`), or all but some (`!tool.*`).
   *
   * One function stands on every selected event (`next.event` says which),
   * under a matcher for the inputs it matches; a plugin's registrations nest
   * in order, first outermost; a repeat throws. Returns the Registration.
   */
  export type On = {
      <P extends Pattern>(pattern: P, hook: NoInfer<HookFor<P>>): Registration<HookFor<P>>;
      <P extends Pattern, const M extends Matcher<Args<MatchedNames<P>>>>(pattern: P, matcher: M, hook: NoInfer<MatchedHook<P, M>>): Registration<MatchedHook<P, M>>;
  };

  /**
   * The keys a variant with a string index signature (an MCP tool's input)
   * takes beyond its own: another variant's key as typed there; others free.
   *
   * So a misspelt value for a key some variant declares (`command: 5`) is
   * refused on every variant, not admitted by the open one.
   */
  type OpenMatcher<I, All> = {
      readonly [K in Exclude<MatcherKeys<All>, KnownKeys<I>>]?: MatcherValue<MatcherValueOf<All, K>>;
  } & Readonly<Record<string, unknown>>;

  /**
   * The name of a call on `$` the host serves, as an event.
   */
  export type OpEventName = keyof OpEventOf;

  /**
   * The calls on `$` the host serves, as events: `e` is the call's argument as
   * it crosses to the host, and every one is hookable by name and by `on("*")`.
   *
   * A hook above the caller passes it on, rewrites it, refuses it with
   * `{ deny }` or answers with `{ value }`; core is the host's implementation.
   * The calling hook alone is skipped, and `next.origin` names the caller.
   */
  export type OpEventOf = {
      /**
       * The argument of `$.model.complete(request)`.
       */
      'model.complete': ModelCompleteRequest;
      /**
       * The argument of `$.model.classify(text, labels, options)`.
       */
      'model.classify': {
          text: string;
          labels: readonly string[];
          options?: ClassifyOptions;
      };
      /**
       * The argument of `$.model.fork(request)`.
       */
      'model.fork': ModelForkRequest;
      /**
       * The clip and how to play it (`shouldLoop`, `gain`); the signal does not
       * cross.
       */
      'audio.play': {
          clip: AudioClip;
          shouldLoop: boolean;
          gain?: number;
      };
      /**
       * The argument of `$.audio.speak(text, { voice })`.
       */
      'audio.speak': SpeakRequest;
      /**
       * The argument of `$.mcp.call(server, tool, args)`.
       */
      'mcp.call': {
          server: string;
          tool: string;
          args: Record<string, unknown>;
      };
      /**
       * The argument of `$.session.cwd()`.
       */
      'session.cwd': NoArgs;
      /**
       * The argument of `$.session.model()`.
       */
      'session.model': NoArgs;
      /**
       * The argument of `$.session.turnCount()`.
       */
      'session.turnCount': NoArgs;
      /**
       * The argument of `$.session.id()`.
       */
      'session.id': NoArgs;
      /**
       * The argument of `$.session.messages()`.
       */
      'session.messages': NoArgs;
      /**
       * The argument of `$.session.repo()`.
       */
      'session.repo': NoArgs;
      /**
       * The argument of `$.session.surface()`.
       */
      'session.surface': NoArgs;
      /**
       * The argument of `$.session.usage()`.
       */
      'session.usage': NoArgs;
      /**
       * The argument of `$.turn.abort({ turnId })`.
       */
      'turn.abort': {
          turnId: string;
      };
      /**
       * The argument of `$.tool.list()`.
       */
      'tool.list': NoArgs;
      /**
       * The argument of `$.tool.register(spec)`.
       */
      'tool.register': {
          name: string;
          description: string;
          inputSchema: Record<string, unknown>;
      };
      /**
       * The argument of `$.command.list()`.
       */
      'command.list': NoArgs;
      /**
       * The argument of `$.command.register(spec)`.
       */
      'command.register': CommandSpec;
      /**
       * The argument of `$.agent.list()`.
       */
      'agent.list': NoArgs;
      /**
       * The argument of `$.ui.toast(text, { timeoutMs })`.
       */
      'ui.toast': {
          text: string;
          timeoutMs?: number;
      };
      /**
       * The argument of `$.ui.status(text)`; `text` undefined clears the line.
       */
      'ui.status': {
          text: string | undefined;
      };
      /**
       * The argument of `$.ui.log(text)`.
       */
      'ui.log': {
          text: string;
      };
      /**
       * The argument of `$.ui.notice(toolUseId, text)`.
       */
      'ui.notice': {
          toolUseId: string;
          text: string | undefined;
      };
      /**
       * The argument of `$.ui.invalidate(event)`.
       */
      'ui.invalidate': {
          event: InvalidatableEventName;
      };
      /**
       * The argument of `$.ui.open({ id, title, focus })`; a hook above the
       * opener may retitle it or refuse it with `{ deny }`, never rename it.
       */
      'ui.open': PaneOpenArgs;
      /**
       * The argument of `$.ui.close({ id })` with `origin` `plugin`; the engine
       * raises it too, for the header's `[x]` (`person`) and an unload (`unload`).
       */
      'ui.close': PaneCloseInput;
      /**
       * The argument of `$.fs.read(path)`.
       */
      'fs.read': {
          path: string;
      };
      /**
       * The argument of `$.fs.write(path, text)`.
       */
      'fs.write': {
          path: string;
          text: string;
      };
      /**
       * The argument of `$.fs.list(path)`.
       */
      'fs.list': {
          path: string;
      };
      /**
       * The argument of `$.fs.exists(path)`.
       */
      'fs.exists': {
          path: string;
      };
      /**
       * The argument of `$.fs.stat(path)`.
       */
      'fs.stat': {
          path: string;
      };
      /**
       * The argument of `$.fs.ancestors({ names, of })`.
       */
      'fs.ancestors': FsAncestorsRequest;
      /**
       * The argument of `$.store.get(key)`.
       */
      'store.get': {
          key: string;
      };
      /**
       * The argument of `$.store.set(key, value)`.
       */
      'store.set': {
          key: string;
          value: unknown;
      };
      /**
       * The argument of `$.store.delete(key)`.
       */
      'store.delete': {
          key: string;
      };
      /**
       * The argument of `$.store.keys()`.
       */
      'store.keys': NoArgs;
      /**
       * The argument of `$.http.fetch(url, init)`.
       */
      'http.fetch': {
          url: string;
          init?: HttpInit;
      };
      /**
       * The argument of `$.process.run(argv, init)`.
       */
      'process.run': {
          argv: readonly string[];
          init?: ProcessRunInit;
      };
      /**
       * The argument of `$.settings.read({ source })`.
       */
      'settings.read': SettingsReadArgs;
      /**
       * The argument of `$.env.get(name)`; `name` is identity, pinned.
       */
      'env.get': {
          name: string;
      };
      /**
       * The argument of `$.env.set(name, value)`; `name` is identity, pinned,
       * and no `value` unsets.
       */
      'env.set': {
          name: string;
          value?: string;
      };
  };

  /**
   * The result of a call on `$` as its event's hooks see it: `{ value }` (the
   * call's answer) or `{ deny }`.
   */
  export type OpEventResult<N extends OpEventName = OpEventName> = ValueOrDeny<OpValueOf[N]>;

  /**
   * What each call on `$` answers (the `value` of its event's result), by event
   * name.
   */
  export type OpValueOf = {
      'model.complete': string;
      'model.classify': string | undefined;
      'model.fork': ModelForkReply | null;
      'audio.play': void;
      'audio.speak': SpeakResult;
      'mcp.call': McpToolResult;
      'session.cwd': string;
      'session.model': string;
      'session.turnCount': number;
      'session.id': string;
      'session.messages': SessionMessage[];
      'session.repo': SessionRepo | null;
      'session.surface': RenderSurface | null;
      'session.usage': SessionUsage;
      'turn.abort': void;
      'tool.list': ToolInfo[];
      'tool.register': {
          tool: string;
      };
      'command.list': CommandInfo[];
      'command.register': {
          command: string;
      };
      'agent.list': AgentInfo[];
      'ui.toast': void;
      'ui.status': void;
      'ui.log': void;
      'ui.notice': void;
      'ui.invalidate': void;
      'ui.open': void;
      'ui.close': void;
      'fs.read': string;
      'fs.write': void;
      'fs.list': FsEntry[];
      'fs.exists': boolean;
      'fs.stat': FsStat;
      'fs.ancestors': readonly FsAncestor[];
      'store.get': unknown;
      'store.set': void;
      'store.delete': void;
      'store.keys': string[];
      'http.fetch': HttpResponse;
      'process.run': ProcessRunResult;
      'settings.read': Settings;
      'env.get': string | undefined;
      'env.set': void;
  };

  /**
   * One call signature per event in `Names`, intersected, the ambiguous ones
   * (LateOverload) after the rest: `next` for a hook covering several events.
   *
   * An empty group contributes nothing (Overloads<never> is unknown).
   */
  type OrderedOverloads<Names extends EventName> = Overloads<Exclude<Names, LateOverload>> & Overloads<Extract<Names, 'classic.PreToolUse'>> & Overloads<Extract<Names, 'turn.abort'>> & Overloads<Extract<Names, NoArgsEvent>>;

  /**
   * Who raised a dispatch, as `next.origin` holds it: the calling plugin's
   * name and the tier it sits in; the engine reads `engine` in `core`.
   *
   * The same pair a `next.trace` entry names its link by, and an event's
   * `provider` its subject's definer by. Set by the host from where the call
   * came from and where that plugin was seated; nothing a plugin writes.
   */
  type Origin = {
      /**
       * Whose hook made the `$` call, by name; `"engine"` for a call site,
       * `"client"` for a `Client` surface module's `ui.message` post.
       */
      readonly plugin: string;
      /**
       * Where that plugin sits among the chain's tiers (Tier); `"core"` for the
       * engine, the owning plugin's for a `client` post.
       */
      readonly tier: Tier;
  };

  /**
   * One call signature per event in `Names`, intersected into an overload set.
   */
  type Overloads<Names extends EventName> = UnionToIntersection<{
      [N in Names]: (e: Args<N>) => Promise<NextResult<N>>;
  }[Names]>;

  /**
   * The argument of `$.ui.close`: the pane to close (`{ id }`). `origin` is
   * the engine's to set: a plugin's call reads `plugin` at the hooks.
   */
  type PaneCloseArgs = Omit<PaneCloseInput, 'origin'>;

  /**
   * The input of `ui.close`: the pane closing and why (PaneCloseOrigin).
   * Closing an id that is not open does nothing.
   */
  type PaneCloseInput = {
      /**
       * What `$.ui.open` named the pane; pinned: `next(e)` passes it on.
       */
      id: string;
      /**
       * Who closes it, set by the engine: a hook that answers without `next`
       * keeps the pane open on `plugin` and `person`, never on `unload`.
       */
      origin: PaneCloseOrigin;
  };

  /**
   * Why a pane closes, as the engine stamped it at `ui.close`: `plugin`, a
   * plugin's `$.ui.close`; `person`, the header's `[x]`; `unload`, the engine's.
   *
   * `unload` drops a pane nothing draws any more (its plugin unloaded, or its
   * drawing threw): it is gone before the hooks hear of it, and its opener's
   * hooks do not run. `next(e)` passes the origin on as received; none sets it.
   */
  type PaneCloseOrigin = 'plugin' | 'person' | 'unload';

  /**
   * The argument of `$.ui.open`: which pane, its title, and whether the
   * plugin asks the person's keyboard for it.
   */
  type PaneOpenArgs = {
      /**
       * Names the pane: 1-64 of letters, digits, `_` and `-`. One pane per id:
       * opening an open id delivers the new title, never a second instance.
       *
       * Pinned at the hooks: `next(e)` passes it on; the title and focus rewrite.
       */
      id: string;
      /**
       * The header's text; the id when omitted.
       */
      title?: string;
      /**
       * A request, not a grant: the surface focuses (and raises) the pane only
       * while the prompt has the keys over an empty composer.
       *
       * An element of the band or a pane the person holds, text in the
       * composer, a dialog or a survey each refuse it: the pane opens without
       * the keyboard.
       */
      focus?: true;
  };

  /**
   * What `on(pattern, hook)` and `next.is(pattern, e)` take: an event's name,
   * a glob (`*`, `classic.*`), or a negation of either (`!tool.describe`).
   */
  export type Pattern = EventName | Glob | Negation;

  /**
   * The patterns `next.is` takes in a hook covering the events `N`: their
   * names, `*`, a glob over one of their namespaces, or a negation.
   *
   * A name none of them has is a compile error, as is a glob over a namespace
   * none is under; a negation that selects none of them narrows `e` to never.
   */
  type PatternOver<N extends EventName> = N | '*' | `${Namespace<N>}.*` | Negation;

  type PermissionBehavior = 'allow' | 'deny' | 'ask';

  type PermissionDeniedHookInput = BaseHookInput & {
      hook_event_name: 'PermissionDenied';
      tool_name: string;
      tool_input: unknown;
      tool_use_id: string;
      reason: string;
  };

  /**
   * Permission mode for controlling how tool executions are handled. 'default' - Standard behavior, prompts for dangerous operations. 'acceptEdits' - Auto-accept file edit operations. 'bypassPermissions' - Bypass all permission checks (requires allowDangerouslySkipPermissions). 'plan' - Planning mode, no actual tool execution. 'dontAsk' - Don't prompt for permissions, deny if not pre-approved. 'auto' - Use a model classifier to approve/deny permission prompts.
   */
  type PermissionMode = 'default' | 'acceptEdits' | 'bypassPermissions' | 'plan' | 'dontAsk' | 'auto';

  /**
   * A `classic.PermissionRequest` answer's `decision`, as the classic hook's
   * `hookSpecificOutput.decision`: allow (with a rewrite or rules) or deny.
   */
  export type PermissionRequestDecision = {
      behavior: 'allow';
      updatedInput?: Record<string, unknown>;
      updatedPermissions?: PermissionUpdates;
  } | {
      behavior: 'deny';
      message?: string;
      interrupt?: true;
  };

  type PermissionRequestHookInput = BaseHookInput & {
      hook_event_name: 'PermissionRequest';
      tool_name: string;
      tool_input: unknown;
      permission_suggestions?: PermissionUpdate[];
  };

  type PermissionRuleValue = {
      toolName: string;
      ruleContent?: string;
  };

  type PermissionUpdate = {
      type: 'addRules';
      rules: PermissionRuleValue[];
      behavior: PermissionBehavior;
      destination: PermissionUpdateDestination;
  } | {
      type: 'replaceRules';
      rules: PermissionRuleValue[];
      behavior: PermissionBehavior;
      destination: PermissionUpdateDestination;
  } | {
      type: 'removeRules';
      rules: PermissionRuleValue[];
      behavior: PermissionBehavior;
      destination: PermissionUpdateDestination;
  } | {
      type: 'setMode';
      mode: PermissionMode;
      destination: PermissionUpdateDestination;
  } | {
      type: 'addDirectories';
      directories: string[];
      destination: PermissionUpdateDestination;
  } | {
      type: 'removeDirectories';
      directories: string[];
      destination: PermissionUpdateDestination;
  };

  type PermissionUpdateDestination = 'userSettings' | 'projectSettings' | 'localSettings' | 'session' | 'cliArg';

  /**
   * The permission rules a PermissionRequest allow may add: the shape of the
   * request's own `permission_suggestions` (the SDK's PermissionUpdate list).
   */
  type PermissionUpdates = NonNullable<ClassicHookInputs['PermissionRequest']['permission_suggestions']>;

  /**
   * How `$.audio.play` plays a clip: looped until `signal` aborts, or once.
   *
   * A loop needs the signal that ends it; a single play takes one as an option.
   */
  export type PlayOptions = {
      /**
       * Repeat the clip until `signal` aborts (the promise then resolves).
       */
      shouldLoop: true;
      /**
       * Linear gain, 0.4; default 1.
       */
      gain?: number;
      /**
       * Stops the clip: playback ends at once and the promise resolves.
       *
       * A page ramps the gain down over ~30 ms to avoid a click; from a
       * worker the abort crosses the boundary as a frame.
       */
      signal: AbortSignal;
  } | {
      /**
       * Play once.
       */
      shouldLoop?: false;
      /**
       * Linear gain, 0.4; default 1.
       */
      gain?: number;
      /**
       * Stops the clip early, as above.
       */
      signal?: AbortSignal;
  };

  /**
   * The nouns a plugin declared on `$` by merging into EngineInterface; never
   * one the engine's own events are under (`tool`, `flag`: isPluginEventName).
   */
  type PluginNoun = Exclude<keyof EngineInterface & string, keyof CoreEngineInterface | Namespace<CoreEventName>>;

  /**
   * A plugin's options as `register(on, options)` receives them: the values of
   * the fields its manifest's `userConfig` declares, defaults filled in.
   *
   * Stored in settings.json `pluginConfigs[<plugin>].options` (sensitive ones
   * in secure storage), validated against the declared `type` before the module
   * loads; a required field with no value fails the load, naming the field. A
   * `--plugin-dir` plugin's key is its plugin.json `<name>` (or `<name>@inline`).
   */
  export type PluginOptions = Readonly<Record<string, string | number | boolean | readonly string[]>>;

  type PostCompactHookInput = BaseHookInput & {
      hook_event_name: 'PostCompact';
      trigger: 'manual' | 'auto';
      /**
       * The conversation summary produced by compaction
       */
      compact_summary: string;
  };

  type PostModelSwitchHookInput = (BaseHookInput & {
      hook_event_name: 'PostModelSwitch';
  }) & {
      /**
       * Resolved model id the session was running before the switch
       */
      from_model: string;
      /**
       * Resolved model id the session runs after the switch
       */
      to_model: string;
      /**
       * What was asked for (alias such as "opus", a full id, or null for "default")
       */
      requested_model: string | null;
      /**
       * command: /model <name>, the /config Model row, or enabling fast mode when that promotes the model; picker: an interactive model picker; sdk: headless set_model (SDK, Remote Control, IDE); auto: automatic fallback or other programmatic change; resume: model restored while resuming a session
       */
      source: 'command' | 'picker' | 'sdk' | 'auto' | 'resume';
      /**
       * Prompt tokens the next request re-sends: the last main-thread response's input + cache_read + cache_creation + output tokens (0 before the first response; for a server-side tool loop, its last iteration's window, not the summed totals)
       */
      context_tokens: number;
      /**
       * Whether the current model's prompt cache is likely still warm (a switch then forfeits it)
       */
      prompt_cache_warm: boolean;
      cache_ttl: '5m' | '1h';
      /**
       * Estimated cost of re-caching context_tokens on to_model at its cache-write rate - the managed modelPricing when set, otherwise list price; excludes the response
       */
      estimated_cache_write_usd: number;
      /**
       * configured: priced at the managed modelPricing setting; catalog: list price; default: to_model unknown, the default tier was assumed
       */
      pricing: 'configured' | 'catalog' | 'default';
  };

  /**
   * Hook input for the PostToolBatch event. Fired once after every tool call in a batch has resolved, before the next model request. PostToolUse fires per-tool and may run concurrently for parallel tool calls; PostToolBatch fires exactly once with the full batch.
   */
  type PostToolBatchHookInput = BaseHookInput & {
      hook_event_name: 'PostToolBatch';
      tool_calls: PostToolBatchToolCall[];
  };

  type PostToolBatchToolCall = {
      tool_name: string;
      tool_input: unknown;
      tool_use_id: string;
      tool_response?: unknown;
  };

  type PostToolUseFailureHookInput = BaseHookInput & {
      hook_event_name: 'PostToolUseFailure';
      tool_name: string;
      tool_input: unknown;
      tool_use_id: string;
      error: string;
      is_interrupt?: boolean;
      /**
       * Tool execution time in milliseconds. Excludes permission-prompt and hook time.
       */
      duration_ms?: number;
  };

  type PostToolUseHookInput = BaseHookInput & {
      hook_event_name: 'PostToolUse';
      tool_name: string;
      tool_input: unknown;
      tool_response: unknown;
      tool_use_id: string;
      /**
       * Tool execution time in milliseconds. Excludes permission-prompt and hook time.
       */
      duration_ms?: number;
  };

  type PreCompactHookInput = BaseHookInput & {
      hook_event_name: 'PreCompact';
      trigger: 'manual' | 'auto';
      custom_instructions: string | null;
  };

  type PreModelSwitchHookInput = (BaseHookInput & {
      hook_event_name: 'PreModelSwitch';
  }) & {
      /**
       * Resolved model id the session was running before the switch
       */
      from_model: string;
      /**
       * Resolved model id the session runs after the switch
       */
      to_model: string;
      /**
       * What was asked for (alias such as "opus", a full id, or null for "default")
       */
      requested_model: string | null;
      /**
       * command: /model <name>, the /config Model row, or enabling fast mode when that promotes the model; picker: an interactive model picker; sdk: headless set_model (SDK, Remote Control, IDE)
       */
      source: 'command' | 'picker' | 'sdk';
      /**
       * Prompt tokens the next request re-sends: the last main-thread response's input + cache_read + cache_creation + output tokens (0 before the first response; for a server-side tool loop, its last iteration's window, not the summed totals)
       */
      context_tokens: number;
      /**
       * Whether the current model's prompt cache is likely still warm (a switch then forfeits it)
       */
      prompt_cache_warm: boolean;
      cache_ttl: '5m' | '1h';
      /**
       * Estimated cost of re-caching context_tokens on to_model at its cache-write rate - the managed modelPricing when set, otherwise list price; excludes the response
       */
      estimated_cache_write_usd: number;
      /**
       * configured: priced at the managed modelPricing setting; catalog: list price; default: to_model unknown, the default tier was assumed
       */
      pricing: 'configured' | 'catalog' | 'default';
  };

  /**
   * The decision of a `classic.PreToolUse` result: `allow`, `ask`, `deny`, or
   * none.
   */
  export type PreToolUseDecision = {
      /**
       * Lets the call run without a permission prompt (the managed-settings
       * hooks ran first; a deny from them ended the chain above).
       */
      allow: true;
      ask?: undefined;
      deny?: undefined;
  } | {
      /**
       * Asks the user before the call runs; the text is shown as the reason.
       */
      ask: string;
      allow?: undefined;
      deny?: undefined;
  } | {
      /**
       * Refuses the call; the model receives the text as the reason.
       */
      deny: string;
      allow?: undefined;
      ask?: undefined;
  } | {
      allow?: undefined;
      ask?: undefined;
      deny?: undefined;
  };

  type PreToolUseHookInput = BaseHookInput & {
      hook_event_name: 'PreToolUse';
      tool_name: string;
      tool_input: unknown;
      tool_use_id: string;
  };

  /**
   * What a `classic.PreToolUse` hook returns: one of `allow`, `ask`, `deny`,
   * or none of them, which passes the call on to the normal permission flow.
   */
  export type PreToolUseResult = PreToolUseDecision & {
      /**
       * Replaces the tool's arguments; validated against the tool's schema before
       * the tool runs.
       */
      updatedInput?: Record<string, unknown>;
      /**
       * Extra context handed to the model with the call, one entry per note.
       */
      additionalContext?: string[];
  };

  /**
   * Options of `$.process.run`.
   */
  type ProcessRunInit = {
      /**
       * The child's working directory, relative to the session's or absolute;
       * absent, the session's working directory.
       */
      cwd?: string;
      /**
       * Variables set over the host process's own environment.
       */
      env?: Record<string, string>;
      /**
       * Text written to the child's standard input, then closed.
       */
      stdin?: string;
      /**
       * How long the child may run before it is killed and the call rejects,
       * in milliseconds; 30 seconds when absent, ten minutes at most.
       */
      timeoutMs?: number;
  };

  /**
   * What `$.process.run` resolves with once the child has exited.
   */
  type ProcessRunResult = {
      /**
       * The child's exit status; a child ended by a signal reads as 1.
       */
      exitCode: number;
      /**
       * What the child wrote to standard output, as text, cut at the output
       * limit.
       */
      stdout: string;
      /**
       * What the child wrote to standard error, as text, cut at the output
       * limit.
       */
      stderr: string;
  };

  /**
   * A pasted or attached non-text item of a prompt; its kind, never its bytes.
   */
  export type PromptAttachment = {
      /**
       * The item's kind.
       */
      type: 'image' | 'audio' | 'document';
      /**
       * The item's MIME type (`image/png`), when known.
       */
      mediaType?: string;
      /**
       * The pasted file's name, when it had one.
       */
      filename?: string;
  };

  /**
   * One block of the context the first user message carries: a name the
   * engine keys it by and the text under it.
   */
  export type PromptContextBlock = {
      /**
       * The key the block renders under (`# name`): `claudeMd`, `userEmail`,
       * `attachedProject`, `currentDate`, or a plugin's own.
       *
       * The field a matcher narrows on; unique among one context's blocks.
       */
      name: string;
      /**
       * The block's text; `claudeMd`'s is the instruction files framed as the
       * engine frames them, empty when it announces none.
       */
      text: string;
  };

  /**
   * The context blocks of a conversation's first user message, in the order
   * the engine renders them: what `prompt.context` takes and answers alike.
   */
  export type PromptContextBlocks = {
      /**
       * From core: `claudeMd` (when instruction files are loaded), `userEmail`,
       * `attachedProject`, `currentDate`, each only when present.
       */
      blocks: readonly PromptContextBlock[];
  };

  /**
   * The input of `prompt.context`: the context blocks the engine prepends to
   * a conversation's first user message, at the moment it computes them.
   */
  export type PromptContextInput = PromptContextBlocks;

  /**
   * What a `prompt.context` hook returns: the blocks the conversation
   * carries, in order; one left out is not sent.
   */
  export type PromptContextResult = PromptContextBlocks;

  /**
   * Where a `prompt.submit` submission came from, as the engine knows it at
   * the site it was queued from; a closed set, never a text prefix.
   *
   * A hooks module reads `e.origin.kind` to tell the user's own Enter from a
   * notification, a peer session, a schedule or another plugin. `next(e)`
   * passes it on as received; an answer may leave it out; no hook sets one.
   */
  export type PromptOrigin = {
      /**
       * The user's own gesture at the terminal, as the engine stamped it
       * (never presumed from an unstamped command).
       *
       * Enter at the prompt, typed or queued, or a click on a transcript
       * link; a channel the engine cannot attest (a same-user socket) is
       * never stamped, and arrives as `unclassified`.
       */
      kind: 'composer';
  } | {
      /**
       * The user's message through the Remote Control bridge (a phone or
       * web client).
       */
      kind: 'bridge';
  } | {
      /**
       * The SDK host's own turn (`claude -p`, the Agent SDK), not typed at
       * a terminal.
       */
      kind: 'sdk';
  } | {
      /**
       * A background task's notification, dequeued when the session went
       * idle or delivered into a running turn (`turnId` set).
       */
      kind: 'task-notification';
  } | {
      /**
       * A scheduled task, routine or /loop firing its stored prompt.
       */
      kind: 'scheduled-trigger';
  } | {
      /**
       * Another Claude session's message ("Another Claude session sent a
       * message"), as a turn of its own or delivered into a running one.
       */
      kind: 'peer';
  } | {
      /**
       * A coordinator co-member's SendMessage delivery, model-authored and
       * framed as a notification.
       */
      kind: 'peer-send-message';
  } | {
      /**
       * A delivery a coordinator session composed for one of its threads.
       */
      kind: 'projects-relay';
  } | {
      /**
       * A message from a channel an MCP server relays (Slack, Telegram).
       */
      kind: 'channel';
      /**
       * The channel server's name.
       */
      server: string;
  } | {
      /**
       * The coordinator session's hand-off to a worker.
       */
      kind: 'coordinator';
  } | {
      /**
       * A background observer agent's report to the agent it observes.
       */
      kind: 'observer';
  } | {
      /**
       * An activity digest delivered to an observer agent.
       */
      kind: 'observer-activity';
  } | {
      /**
       * A programmatic follow-up to a user's UI action (an ultraplan
       * implement), user-initiated but not typed this turn.
       */
      kind: 'auto-continuation';
  } | {
      /**
       * A turn with no provenance the engine can name: one the ingress
       * could not classify, or a command queued with no stamp at all.
       *
       * An idle notice or a delivery receipt the engine queued isMeta with
       * no stamp is one too; the engine frames that shape as a non-user
       * source.
       */
      kind: 'unclassified';
  } | {
      /**
       * The session's owner pinging it from Slack.
       */
      kind: 'slack-ping';
  } | {
      /**
       * A plugin's `$.prompt.submit`; the model reads the prompt under the
       * plugin's name unless a hook leaves the origin out of its answer.
       */
      kind: 'plugin';
      /**
       * The submitting plugin's name.
       */
      name: string;
  };

  /**
   * The input of `prompt.section`: one named section of the system prompt, at
   * the moment the engine assembles it.
   */
  export type PromptSectionInput = {
      /**
       * As the engine names the section (`env_info_simple`, `memory`, ...); the
       * key a matcher narrows on.
       */
      name: string;
      /**
       * The section's text as core computed it, or null when core omits it.
       */
      text: string | null;
  };

  /**
   * What a `prompt.section` hook returns: the text the prompt carries for that
   * section, or null to leave it out.
   */
  export type PromptSectionResult = {
      text: string | null;
  };

  /**
   * `prompt.submit`'s input as a plugin's call takes it: `origin`, `turnId`
   * and `wait` are the engine's to set.
   *
   * `origin` is the calling plugin's name; `turnId` is the turn a prompt typed
   * mid-turn ran over; `wait` is false, as a plugin's prompt runs once idle.
   */
  export type PromptSubmitArgs = Omit<PromptSubmitInput, 'origin' | 'turnId' | 'wait'>;

  /**
   * The input of `prompt.submit` (prompt-submit/): the prompt as typed, after
   * the input became a user message and before the turn starts.
   */
  export type PromptSubmitInput = {
      /**
       * The prompt's text as it will reach the model (pastes already expanded).
       */
      text: string;
      /**
       * Present only when the submission carried images or other non-text items.
       */
      attachments?: readonly PromptAttachment[];
      /**
       * The id of the model turn that was running when the prompt was submitted
       * (`turn.start`'s `turnId`): typed over that turn, or delivered into it.
       *
       * A queued delivery (a peer session's message) reaches the model inside a
       * running turn. Absent for a prompt submitted while the session was idle,
       * and for a plugin's own (`$.prompt.submit`), which runs once it is idle.
       */
      turnId?: string;
      /**
       * Whether the user asked the prompt to wait its turn (`chat:queueSubmit`,
       * `ctrl+x enter` by default): true for that submission, false otherwise.
       *
       * The engine queues every prompt typed mid-turn either way; the flag is
       * for hooks, so one that cancels the running turn on a plain Enter can
       * leave a waiting prompt alone. False for a prompt a plugin submitted.
       */
      wait: boolean;
      /**
       * Where the submission came from (PromptOrigin), set by the engine where
       * it was queued: the user's Enter, a notification, a peer, a plugin.
       *
       * `next(e)` passes it on as received; a hook that wants the prompt to
       * proceed as the user's own answers `{ text }` without it. No hook may
       * set one.
       */
      origin: PromptOrigin;
  };

  /**
   * What a `prompt.submit` hook returns and what `next(e)` resolves to: the
   * prompt that proceeds, `{ text, context?, origin? }`, or `{ drop: reason }`.
   */
  export type PromptSubmitResult = {
      /**
       * The prompt the turn proceeds with; from core, the text as the chain
       * left it.
       */
      text: string;
      /**
       * What the model reads beside the prompt and the user never sees: each
       * entry one block, attached after the prompt as typed. From core, none.
       *
       * A hook adds to the context its `next` gave it (`{ ...r, context:
       * [...(r.context ?? []), mine] }`); it may not leave an entry out. The
       * context is capped whole as a text is (PROMPT_TEXT_MAX), no entry empty.
       */
      context?: readonly string[];
      /**
       * Where the prompt proceeds from: from core, `e.origin` as received;
       * absent, the prompt is the user's own (no plugin's name on it).
       *
       * A hook may put back the origin it received (`{ ...r, origin:
       * e.origin }`) over a hook below that left it out; it may not set
       * another.
       */
      origin?: PromptOrigin;
      drop?: undefined;
  } | {
      /**
       * Stops the turn before the model runs: the prompt is not sent and the
       * text is shown to the user as the reason.
       */
      drop: string;
      text?: undefined;
      context?: undefined;
      origin?: undefined;
  };

  /**
   * The hooks module's entry: `export function register(on, options)`. `on`
   * registers hooks; `options` is the plugin's configuration (PluginOptions).
   *
   * The options are fixed for this activation: a change to them reloads the
   * plugin and `register` runs again with the new object. Hooks close over it.
   * Its return is dropped, a promise awaited: `on => on(...)` is a module.
   *
   * @example
   * on("tool.call", ($, e, next) => e.tool === "Bash" ? { deny: "no" } : next(e))
   */
  export type Register = (on: On, options: PluginOptions) => unknown;

  /**
   * What `on(...)` returns for a hook of type `F`: the registration, which
   * takes one `.catch` (CatchHandler); without it a failed hook is absent.
   *
   * A second `.catch` on one registration throws, as does one after
   * register() returned and one on `engine.create`, whose hook has no budget
   * and whose failure is the load's.
   */
  export type Registration<F> = {
      /**
       * Sets the handler run when the hook throws or overruns its budget; its
       * answer within the grace stands as the hook's result for the dispatch.
       */
      readonly catch: (handler: CatchHandler<F>) => void;
  };

  /**
   * How a site instance asks for its `ui.render` answer: the version it is
   * on, whether a static frame is drawing, and whose submit it serves.
   */
  export type RenderAnswerOptions = {
      version: string;
      staticFrame: boolean;
      submittedBy?: string;
  };

  /**
   * What an element takes as `children`: a node, or a list of children that
   * may nest, as JSX passes `{items.map(row)}` beside a sibling.
   *
   * The factory flattens it (render-jsx/): the element holds a flat list.
   */
  export type RenderChildren = RenderNode | readonly RenderChildren[];

  /**
   * Everything `ui.render` can draw: one name per component that has a render
   * site (render-site/); a matcher narrows on it.
   *
   * The permission dialog is drawn by the engine alone, since its answer
   * authorises an action; a plugin adds context with `$.ui.notice`. `Pane` is
   * the one component whose instances a plugin opens (`$.ui.open`).
   */
  export type RenderComponent = 'AskUserQuestion' | 'UserMessage' | 'AssistantMessage' | 'ToolUse' | 'ToolResult' | 'ToolGroup' | 'Spinner' | 'TurnDuration' | 'InfoNotice' | 'SessionMode' | 'PromptHint' | 'AbovePrompt' | 'Pane';

  /**
   * What a render hook returns, and what `next(e)` resolves to: a plain-data
   * tree of elements, strings allowed as children of Text and Box.
   *
   * Props are an allowlisted subset of Ink's Box/Text props (render-site/
   * RENDER_PROPS); a tree with any other prop fails validation as a whole and
   * the engine's own component is drawn with the original props.
   */
  export type RenderElement = {
      /**
       * `Box`: layout, and with a `key` a hover scope; every surface draws
       * it, Ink's Box on the terminal, a flex div on the desktop.
       */
      type: 'Box';
      /**
       * Layout, margin, padding and border props, and the `key` that makes
       * the Box a hover scope; any other prop fails the whole tree.
       */
      props?: Record<string, string | number | boolean>;
      /**
       * Style overrides the surface applies while the pointer is over the
       * nearest Box with a `key`, this one included; plain data, no hook.
       *
       * A hover never moves layout: `borderStyle` only restyles a border the
       * Box already has, and `display` only reveals (`"flex"` on a Box drawn
       * `display: "none"` inside a visible keyed Box).
       */
      hover?: BoxHoverProps;
      /**
       * In order: elements and strings (core wraps each string in a Text).
       */
      children?: RenderNode[];
  } | {
      /**
       * `Text`: a styled string, inline; every surface draws it, Ink's Text
       * on the terminal, a styled span on the desktop.
       */
      type: 'Text';
      /**
       * Color and style props; any other prop fails the whole tree.
       */
      props?: Record<string, string | number | boolean>;
      /**
       * Style overrides the surface applies while the pointer is over the
       * nearest enclosing Box with a `key`; plain data, no hook runs.
       */
      hover?: TextHoverProps;
      /**
       * In order: strings and inline elements; never an engine node.
       */
      children?: RenderNode[];
  } | {
      /**
       * A button, on every surface: `[ label ]` on the terminal, a native
       * button on a desktop; a press raises `ui.press` (`e.element` the key).
       *
       * Built by `<Button>` or the table's `t.Button`. The `onPress` closure
       * stays in the plugin's own environment under `press.handle`; the host
       * holds the handle for the lifetime of the drawing. A leaf: no children.
       */
      type: 'Button';
      props: {
          /**
           * The element's address: what `e.element` carries and what a matcher
           * names (`{ element: "explain" }`).
           */
          key: string;
          /**
           * The text drawn on the button.
           */
          label: string;
          /**
           * One digit (`"1"`) or one lowercase letter (`"w"`) that presses it
           * where the site honours one; anything else is refused.
           *
           * A bare digit in an empty composer presses, as a survey is answered;
           * while one of the band's Buttons has the focus a digit or a letter
           * presses on keydown, lowercased. Two on one hotkey: the later wins.
           */
          hotkey?: string;
          /**
           * Drawn without chrome: the hotkey in the accent color, a colon,
           * then the label (`1: Yes`), as a survey's row reads.
           *
           * In JSX the label may be the one string child
           * (`<Button hotkey="1" plain onPress={...}>Yes</Button>`); the key
           * defaults to the label.
           */
          plain?: true;
      };
      /**
       * Where the handler lives: the plugin whose hook drew the element, and
       * the handle its environment keeps the `onPress` closure under.
       *
       * The runtime stamps the plugin as the tree leaves that hook.
       */
      press: {
          plugin: string;
          handle: number;
      };
      /**
       * Label style overrides (the Text set) the surface applies while the
       * pointer is over the nearest enclosing Box with a `key`; plain data.
       */
      hover?: TextHoverProps;
  } | {
      /**
       * A one-line text field on every surface; a change and Enter raise
       * `ui.input` (`e.element` the key, `e.kind` which, `e.value` the text).
       *
       * Built by `<Input>` or the table's `t.Input`. The `onInput` and
       * `onSubmit` closures stay in the plugin's own environment under
       * `press.handle`, held as a Button's is. A leaf: no children.
       */
      type: 'Input';
      props: {
          /**
           * The element's address: what `e.element` carries and what a matcher
           * names (`{ element: "reply" }`).
           */
          key: string;
          /**
           * Text drawn before the field.
           */
          label?: string;
          /**
           * Text drawn dim in an empty field.
           */
          placeholder?: string;
          /**
           * The text the field holds when drawn.
           */
          value?: string;
          /**
           * What Enter does, drawn beside the field while it has focus.
           */
          submitLabel?: string;
      };
      /**
       * Where the handlers live: the plugin whose hook drew the element, and
       * the handle its environment keeps the closures under.
       *
       * The runtime stamps the plugin as the tree leaves that hook.
       */
      press: {
          plugin: string;
          handle: number;
      };
      children?: undefined;
  } | {
      /**
       * A one-of-several picker on every surface; a pick raises `ui.select`
       * (`e.element` the key, `e.value` the option's value).
       *
       * Built by `<Select>` or the table's `t.Select`. The `onSelect` closure
       * stays in the plugin's own environment under `press.handle`, held as
       * a Button's is. A leaf: no children.
       */
      type: 'Select';
      props: {
          /**
           * The element's address: what `e.element` carries and what a matcher
           * names (`{ element: "peer" }`).
           */
          key: string;
          /**
           * Text drawn before the current value.
           */
          label?: string;
          /**
           * What can be picked, in the order drawn: each a value and the text
           * drawn for it.
           */
          options: readonly SelectOption[];
          /**
           * Which option is selected when drawn.
           */
          value?: string;
      };
      /**
       * Where the handler lives: the plugin whose hook drew the element, and
       * the handle its environment keeps the closure under.
       *
       * The runtime stamps the plugin as the tree leaves that hook.
       */
      press: {
          plugin: string;
          handle: number;
      };
      children?: undefined;
  } | {
      /**
       * A hyperlink both surfaces draw: an OSC 8 span on the terminal (its
       * text then the URL in dim where unsupported), an anchor on desktop.
       *
       * Inline: its children are the text, strings and inline elements;
       * absent children the label, absent both the URL. `href` is `https:`
       * (or `http://localhost`) and bounded, or the tree is refused.
       */
      type: 'Link';
      props: LinkProps;
      children?: RenderNode[];
  } | {
      /**
       * Source code both surfaces draw with the engine's highlighter, tokens
       * coloured by language; under `format: 'diff'`, unified-diff hunks.
       *
       * A leaf: a dim gutter numbers the lines from `startLine`; a diff has
       * both gutters, markers, add and remove backgrounds. `source` is
       * bounded as a Text's string is, or the tree is refused (validateTree).
       */
      type: 'Code';
      props: CodeProps;
      children?: undefined;
  } | {
      /**
       * A region the plugin's SURFACE MODULE draws and handles input for, on
       * the drawing thread, without `$` (types/ ClientModule); a leaf.
       *
       * `Client` from the table. One instance per plugin, drawing
       * and `key` lives while the node stays in the tree, and talks to the
       * plugin's hooks through `ui.message`. The desktop carries it as data.
       */
      type: 'Client';
      props: ClientProps;
      /**
       * Whose surface module runs here: the plugin whose hook drew the
       * element, stamped by the runtime as the tree leaves that hook.
       */
      client: {
          plugin: string;
      };
      children?: undefined;
  } | {
      /**
       * A vector drawing, the desktop surface's alone: the SVG markup is the
       * element's data, drawn in an isolated box, never as part of the page.
       *
       * A leaf: hooks above wrap or replace it whole, nothing reaches inside;
       * a press other plugins should see goes on an enclosing Button. On a
       * surface whose table lacks it the tree is refused (validateTree).
       */
      type: 'Svg';
      props: SvgProps;
      children?: undefined;
  } | {
      /**
       * The component core draws itself, with the props held under `ref`.
       */
      type: 'engine';
      /**
       * Which drawing: the number core answered from `next(e)`, under which
       * it holds the props it received; 0 draws the original props.
       */
      ref: number;
  };

  /**
   * The render event: `ui.render`, one event for every component that has a
   * render site.
   */
  export type RenderEventName = 'ui.render';

  /**
   * The input of `ui.render`: a union discriminated by `component`, one member
   * per RenderComponent and per RenderSurface.
   */
  export type RenderInput<C extends RenderComponent = RenderComponent, P extends RenderSurface = RenderSurface> = C extends RenderComponent ? P extends RenderSurface ? RenderInputOf<C, P> : never : never;

  /**
   * One `ui.render` input, for a component narrowed to one surface.
   */
  export type RenderInputOf<C extends RenderComponent, P extends RenderSurface> = {
      /**
       * Where the component is drawn; one literal per member, so
       * `if (e.surface === "terminal")` narrows `e` and `$.ui.resolve(e)`.
       */
      surface: P;
      /**
       * Which component this instance is; the key a matcher narrows on.
       */
      component: C;
      /**
       * The instance: the tool_use_id for a dialog or tool row, the message id
       * for a message, the agent id for a spinner.
       *
       * Two drawings of one component are two instances.
       */
      requestId: string;
      /**
       * The size of what the surface draws into, in character cells: on the
       * terminal, the interactive screen's size, where a change of width re-draws
       * every hooked site once the resize settles (a hook that sized its tree to
       * `columns` runs again); on a DOM surface, what the page reported. Absent
       * where no surface has measured. Part of the envelope: a rewrite keeps it.
       */
      viewport?: RenderViewport;
      /**
       * The component's plain-data props.
       */
      props: RenderPropsOf[C];
  };

  /**
   * A node of a render tree: an element, or a string (text).
   */
  export type RenderNode = RenderElement | string;

  /**
   * The plain-data props of each renderable component, as `ui.render` sees
   * them under `e.props`; a hook rewrites them with `next({ ...e, props })`.
   *
   * A rewrite is validated by the component and an invalid one draws the
   * original. This table is the plugin-facing render contract: the terminal
   * and the Code session renderer draw these components from these props.
   */
  export type RenderPropsOf = {
      /**
       * The dialog the AskUserQuestion tool opens.
       */
      AskUserQuestion: {
          /**
           * The name of the tool whose call opened the dialog (`AskUserQuestion`).
           */
          toolName: string;
          /**
           * The tool's `questions` input, as the dialog will draw them; a rewrite
           * must still fit the tool's schema or the original is drawn.
           */
          questions: unknown[];
          /**
           * The call's `metadata.source` (who asked; `remember` for /remember) when
           * the model gave one. Analytics only; never drawn.
           */
          metadataSource?: string;
      };
      /**
       * The user's own prompt in the transcript (the `> ...` row); a rewrite is
       * drawn there and nowhere else (the stored message is untouched).
       */
      UserMessage: {
          /**
           * The prompt's text, as the row draws it.
           */
          text: string;
          /**
           * Where the stored message came from, as `prompt.submit` named it
           * (PromptOrigin): the composer's, a peer's, a notification's, a plugin's.
           *
           * Read-only: a rewrite carries it on as received; one that changes or
           * drops it is refused and the engine draws its own row.
           */
          origin: PromptOrigin;
      };
      /**
       * One text block of an assistant reply in the transcript; a rewrite
       * changes the drawing and leaves the stored message alone (ctrl+o).
       */
      AssistantMessage: {
          /**
           * The block's text, markdown, as the transcript will draw it.
           */
          text: string;
          /**
           * True on the block that draws the bullet opening a reply.
           */
          firstOfReply: boolean;
      };
      /**
       * A tool call's row in the transcript (`Bash(ls -la)` and its result); the
       * call was decided by `tool.call`, so a rewrite here changes the row alone.
       */
      ToolUse: {
          /**
           * The id `tool.call` carried for this call (`e.tool_use_id` there); the
           * same value as the row's `requestId`, where it is looked for. Read-only.
           */
          tool_use_id: string;
          /**
           * The tool's name as the row draws it (`Bash`, `Read`, a plugin's tool).
           */
          toolName: string;
          /**
           * The call's input, as the model sent it.
           */
          input: unknown;
          /**
           * True while the call is still running.
           */
          running: boolean;
          /**
           * True when the call ended in an error (a refusal at the dialog is one).
           */
          errored: boolean;
          /**
           * True when an abort ended the call: the user's Esc or a plugin's
           * `$.turn.abort` cut it while it ran, or dropped it before it ran.
           *
           * The row draws `Interrupted` for it, as the transcript marker does.
           */
          interrupted: boolean;
          /**
           * The stored result once the call has resolved (`{ stdout, stderr, ... }`
           * for Bash: `BuiltinToolResults[toolName]`); undefined while it runs.
           *
           * For a call that errored, was refused or an abort cut, it is the text
           * the model read (an `interrupted` call: the abort's own). An expanded
           * group's rows draw it inline; a standalone row's is its own `ToolResult`.
           */
          output?: unknown;
      };
      /**
       * The result block drawn under a standalone tool row in the transcript,
       * which the tool's own result renderer draws from `output`.
       *
       * A rewrite of `output` is checked against the tool's output schema (one
       * that does not fit draws nothing; one the renderer cannot read hits the
       * row's error boundary). The stored result is untouched.
       */
      ToolResult: {
          /**
           * The id `tool.call` carried for the call this result belongs to
           * (`e.tool_use_id` there); the same value as `requestId`. Read-only.
           */
          tool_use_id: string;
          /**
           * The tool the result belongs to (`Bash`, `Read`, a plugin's tool).
           * Read-only.
           */
          toolName: string;
          /**
           * The tool's own result object (`{ stdout, stderr, interrupted, ... }` for
           * Bash), the same one `ToolUse.output` carries; a rewrite is drawn.
           *
           * A built-in tool's is `BuiltinToolResults[toolName]`, the record
           * `tool.call` resolved as `result`.
           */
          output: unknown;
          /**
           * True when the call ended in an error, which draws the error text and not
           * `output`. Read-only.
           */
          errored: boolean;
      };
      /**
       * A run of tool calls the transcript folds into one count line (`Read 3
       * files, ran 2 shell commands`): reads, searches, listings.
       *
       * A hook that sets `expanded` unfolds the group where it is, and each row
       * it unfolds into is a `ToolUse` drawing a `ToolUse` hook then sees.
       */
      ToolGroup: {
          /**
           * In the order the model made them.
           */
          calls: ReadonlyArray<ToolGroupCall>;
          /**
           * True while the group is the live one: a call in it may still be
           * running and the model's next call may join it.
           */
          active: boolean;
          /**
           * Whether each call draws as its own `ToolUse` row (true under
           * `--verbose` and in the ctrl+o transcript) or the group draws one line.
           *
           * The one prop of the three a rewrite changes on the screen.
           */
          expanded: boolean;
      };
      /**
       * The line that animates while a turn runs (`Sauteing... (12s, 300
       * tokens)`). Terminal only: the Code session renderer draws its own.
       */
      Spinner: {
          /**
           * Animated by the line (`Sauteing`), as sampled for this turn.
           */
          word: string;
          /**
           * The text drawn instead of the word while a state overrides it, else null.
           */
          message: string | null;
          /**
           * What the turn is doing.
           */
          mode: 'requesting' | 'responding' | 'thinking' | 'tool-input' | 'tool-use';
      };
      /**
       * The line that closes a turn in the transcript (`Baked for 3s`).
       * Terminal only: the Code session renderer draws its own footer.
       */
      TurnDuration: {
          /**
           * The past-tense word the line drew (`Baked`), as sampled for this line.
           */
          word: string;
          /**
           * The turn's duration in milliseconds, as the line formats it (`3s`,
           * `1m 4s`).
           */
          durationMs: number;
      };
      /**
       * One dim status line under the logo (the model source, an experiment
       * enrollment, a settings hint), with a trailing `/command`. Terminal only.
       */
      InfoNotice: {
          /**
           * The notice's text, flattened to one string.
           */
          text: string;
          /**
           * The slash command appended after the text, or null when the notice has
           * none.
           */
          command: string | null;
      };
      /**
       * The dim mode labels at the right of the prompt footer (`focus`, `memory
       * paused`), joined by ` & `. One instance; terminal only.
       *
       * A hook adds a mode by rewriting `modes`, removes one by filtering, or
       * draws its own tree.
       */
      SessionMode: {
          /**
           * The labels the footer shows, in order; empty when there are none.
           */
          modes: readonly string[];
      };
      /**
       * The dim hint line under the prompt (`? for shortcuts`, `esc to
       * interrupt`, the pills beside them). One instance; terminal only.
       *
       * A hook rewrites `hint` and the rewrite is drawn in the line's place, or
       * draws its own tree; `isDraft` and `isWorking` say what the line is for.
       */
      PromptHint: {
          /**
           * True while the prompt holds typed text. Read-only.
           */
          isDraft: boolean;
          /**
           * True while a model turn is running. Read-only.
           */
          isWorking: boolean;
          /**
           * The line's text as the engine draws it; one string, so a rewrite
           * replaces the line.
           *
           * Read from the drawn line the way the screen reader reads it, one space
           * between parts.
           */
          hint: string;
      };
      /**
       * The band directly above the prompt input, where the surveys draw; the
       * engine draws nothing of its own here.
       *
       * A hook draws a tree, or passes; one instance, terminal only. The person
       * collapses it (ctrl+x ctrl+a, `[-]`) or focuses it (a click, ctrl+x tab):
       * an Input types, a Button arms the hotkeys, a tree taller than it scrolls.
       */
      AbovePrompt: {
          /**
           * True while a survey holds the band; a hook yields to it. Read-only.
           */
          hasSurvey: boolean;
          /**
           * True while a model turn is running. Read-only.
           */
          isWorking: boolean;
          /**
           * Rows the band may take: in fullscreen, what the bottom slot has left
           * above the prompt; otherwise the terminal's height. Read-only.
           *
           * A tree of at most `maxRows` rows shows whole; a taller one scrolls in a
           * window of `scroll.bodyRows` (one fewer, over a dim `n more` row), and a
           * bare digit arms none of its Buttons' hotkeys.
           */
          maxRows: number;
          /**
           * The band's window over a tree taller than `maxRows`: engine-owned,
           * moved by the wheel, and by the person's keys while the band is focused.
           *
           * `bodyRows` is `maxRows` less the `n more` row. Read-only.
           */
          scroll: SiteScroll;
      };
      /**
       * The framed region a plugin opened with `$.ui.open({ id })`: one instance
       * per id (`requestId`), its body the hook's tree under the engine's header.
       *
       * Placement, order and size are the surface's (docked beside the transcript
       * in fullscreen, above the prompt otherwise; one shown, the rest tabs); the
       * keyboard is the person's (ctrl+x tab, Esc); a tall tree scrolls.
       */
      Pane: {
          /**
           * The header's text: the `title` the pane was opened with, or its id.
           * Read-only here; another `$.ui.open` (or a hook on `ui.open`) retitles.
           */
          title: string;
          /**
           * True while the person has given the pane the keyboard. Read-only.
           */
          focused: boolean;
          /**
           * Cells across the body, inside the frame. Read-only.
           */
          bodyColumns: number;
          /**
           * The body's window over the tree: engine-owned, moved by the person's
           * keys while the pane is focused. Read-only.
           */
          scroll: SiteScroll;
      };
  };

  /**
   * What a `ui.render` hook returns and what `next(e)` resolves to: a
   * RenderElement tree, the same for every component.
   */
  export type RenderResultOf = {
      [C in RenderComponent]: RenderElement;
  };

  /**
   * Where a render event's component is drawn: `terminal` is Ink, which draws
   * the hook's whole tree; `desktop` is a surface that draws its own DOM.
   *
   * The desktop surface (the Code session renderer) draws with the props the
   * hook handed core and draws the tree as DOM where it has a slot for it. Each
   * surface's ask is its own evaluation, since a tree may hold an element only
   * one surface draws (Svg).
   */
  export type RenderSurface = 'terminal' | 'desktop';

  /**
   * The size of what a surface draws into, in character cells of the
   * surface's monospace metric: on the terminal, the screen's columns and
   * rows; on a DOM surface, the pane's width and height divided by the
   * advance and line height of its code font. A pixel-sized companion
   * arrives with the first element that lays out in pixels; until then
   * every element on every surface is cell-based, and so is this.
   */
  export type RenderViewport = {
      /**
       * Cells across. A tree wider than this wraps or truncates, as its Text
       * props say.
       */
      columns: number;
      /**
       * Cells down the whole surface, not the room left for this component.
       * Informational: a change of height alone re-draws nothing and keys no
       * new evaluation, so a hook reads it as of the last width or props change.
       */
      rows: number;
  };

  /**
   * The input of `ui.resolve`: which surface's elements, for which component;
   * a union with one member per surface (ResolveInputOf).
   *
   * Resolved when the plugins load, ahead of any drawing, so it names the
   * surface and the component and not the props; a `ui.render` argument is
   * one (it carries both), which is what `$.ui.resolve(e)` takes.
   */
  export type ResolveInput<C extends RenderComponent = RenderComponent, P extends RenderSurface = RenderSurface> = P extends RenderSurface ? ResolveInputOf<C, P> : never;

  /**
   * One `ui.resolve` input, for a component on one surface.
   */
  export type ResolveInputOf<C extends RenderComponent, P extends RenderSurface> = {
      /**
       * Where the table draws; one literal per member, so a hook that narrows
       * it narrows the table `next(e)` resolves to.
       */
      surface: P;
      /**
       * Which drawing the table is resolved for; the key a matcher narrows on.
       */
      component: C;
  };

  /**
   * What each event's hook returns, and what its `next(e)` resolves to, by event
   * name.
   */
  export type ResultOf = EngineResultOf & ClassicResultOf & {
      [N in OpEventName]: OpEventResult<N>;
  } & {
      [N in NounEventName]: NounEventResult<N>;
  };

  type SDKAssistantMessageError = 'authentication_failed' | 'oauth_org_not_allowed' | 'account_on_hold' | 'billing_error' | 'rate_limit' | 'overloaded' | 'invalid_request' | 'model_not_found' | 'server_error' | 'unknown' | 'max_output_tokens' | 'cloud_credential_error';

  /**
   * The members of `T` assignable to `S`; all of `T` when none is.
   */
  type Select<T, S> = [Extract<T, S>] extends [never] ? T : Extract<T, S>;

  /**
   * The events a pattern selects, as a union of names: the one named, every
   * one under a glob's namespace, or every one a negation does not exclude.
   */
  export type Selected<P extends string> = P extends '*' ? EventName : P extends `!${infer Negated}` ? Exclude<EventName, Selected<Negated>> : P extends `${infer Prefix}.*` ? Extract<EventName, `${Prefix}.${string}`> : Extract<EventName, P>;

  /**
   * The literal each tag key of `I` is held to by matcher `M`: one-of arrays
   * flattened, RegExps widened to `unknown`.
   */
  type Selection<I, M> = {
      [K in keyof M & TagKeys<I>]: Literal<M[K] extends readonly (infer One)[] ? One : M[K]>;
  };

  /**
   * One option of a `Select`: the value `onSelect` and `ui.select` carry, and
   * the text drawn for it (the value when absent).
   */
  export type SelectOption = {
      value: string;
      label?: string;
  };

  /**
   * The props of `Select`, every surface's one-of-several picker: an address,
   * a label, the options, the one selected, the closure a pick runs. A leaf.
   *
   * Focused through the same ring as `Button` (`abovePrompt:focus`); keys reach
   * it only while it has focus (arrows move, Enter picks) and Esc always
   * returns to the prompt; a pick raises `ui.select`, its bottom `onSelect`.
   */
  export type SelectProps = {
      /**
       * The element's address: `e.element` at `ui.select`, what a matcher names.
       */
      key: string;
      /**
       * Text drawn before the current value.
       */
      label?: string;
      /**
       * What can be picked, in the order drawn; at least one, values unique.
       */
      options: readonly SelectOption[];
      /**
       * Which option is selected when drawn; the person's pick replaces it
       * until the hook draws another.
       */
      value?: string;
      /**
       * Runs on a pick with the option's value, in the plugin's own environment:
       * the bottom of a `ui.select` chain. No model turn unless it asks one.
       */
      onSelect: (value: string, e: UiSelectArgument) => void;
  };

  /**
   * `session.compact`'s input as a plugin's `$.session.compact(args)` takes
   * it: `trigger` (`plugin`), `messages` and `agentId` are the engine's.
   */
  export type SessionCompactArgs = {
      /**
       * What the summary should keep or stress, as typed after `/compact`;
       * absent, the engine's own compaction prompt alone.
       */
      instructions?: string;
  };

  /**
   * A compaction that stands: the conversation as it reads afterwards, and
   * the token counts the engine recorded when it was the one compacting.
   */
  export type SessionCompacted = {
      /**
       * The conversation after the compaction, oldest first: from core, its
       * summary and the messages it kept; from a hook, whatever it hands up.
       *
       * What the transcript becomes (kept, on `precompute`, for the compaction
       * that comes). A message with the engine's `handle` stands as the engine
       * has it; one without is built from its `role`, `text` and tool blocks.
       */
      messages: readonly SessionMessage[];
      /**
       * The conversation's size before, in tokens; absent when core did not
       * record it.
       */
      tokensBefore?: number;
      /**
       * Its size afterwards, in tokens; absent on `precompute` and when core
       * did not record it.
       */
      tokensAfter?: number;
      skip?: undefined;
  };

  /**
   * The input of `session.compact`: one compaction of the conversation, about
   * to run; `messages` is the transcript it runs over.
   */
  export type SessionCompactInput = {
      /**
       * What is compacting (SessionCompactTrigger); the key a matcher narrows
       * on. Pinned: `next(e)` passes it on as received.
       */
      trigger: SessionCompactTrigger;
      /**
       * The id of the loop compacting, for a subagent's or a fork's own
       * transcript; absent for the main conversation (tool.call's `agentId`).
       *
       * Pinned: left out of a rewrite it is put back, changed it fails the hook.
       * `$.session.messages()` is the main conversation whatever this names.
       */
      agentId?: string;
      /**
       * What the summary should keep or stress: the text after `/compact`, a
       * plugin's, or absent.
       *
       * `next({ ...e, instructions })` changes what the summarizer is told.
       */
      instructions?: string;
      /**
       * The transcript being compacted, in `$.session.messages()`'s shape, each
       * message carrying the engine's `handle`; a subagent's own under `agentId`.
       *
       * `next({ ...e, messages })` changes what is summarized: a message kept
       * with its handle is the engine's own, whole; one without is read as built.
       */
      messages: readonly SessionMessage[];
  };

  /**
   * What a `session.compact` hook returns and what `next(e)` resolves to: the
   * compaction (`{ messages, tokensBefore?, tokensAfter? }`) or `{ skip }`.
   *
   * There is no summary string: the summary is a message.
   */
  export type SessionCompactResult = SessionCompacted | SessionCompactSkipped;

  /**
   * A compaction vetoed: on `precompute` nothing is computed or kept; on any
   * other trigger the conversation stays as it is and one line says why.
   *
   * Core answers it too, when a classic PreCompact hook blocks.
   */
  export type SessionCompactSkipped = {
      /**
       * Why, as the notice reads.
       */
      skip: string;
      messages?: undefined;
  };

  /**
   * Who compacts: the person's `/compact` (`manual`), the engine at its
   * threshold or on a prompt too long (`auto`), a plugin, or a `precompute`.
   *
   * `precompute` is the one dispatch that installs nothing: its result is kept
   * for the compaction that comes, if the conversation it ran over still leads.
   */
  export type SessionCompactTrigger = 'manual' | 'auto' | 'plugin' | 'precompute';

  /**
   * The live context window as the status line reads it: the last API
   * response's input side against the model's window.
   *
   * `tokens` and `percent` are absent until the first response of the live
   * window: a fresh session, or one just compacted, until its next response.
   */
  type SessionContextUsage = {
      /**
       * Input tokens the last response was answered over: uncached, cache-written
       * and cache-read together (the status line's `total_input_tokens`).
       */
      tokens?: number;
      /**
       * The context window of the session's model, in tokens (the status line's
       * `context_window_size`).
       */
      window: number;
      /**
       * `tokens` over `window` as a whole percentage, 0 to 100 (the status
       * line's `used_percentage`).
       */
      percent?: number;
  };

  /**
   * What the session has cost, as `/cost` and the status line total it.
   */
  type SessionCost = {
      /**
       * US dollars, summed over every priced API response this session.
       */
      usd: number;
  };

  type SessionCronSummary = {
      id: string;
      /**
       * Cron expression, e.g. "0 9 * * 1-5".
       */
      schedule: string;
      /**
       * False for one-shot wakeups whose cron field encodes a single fire time; true for tasks that re-fire on every match.
       */
      recurring: boolean;
      /**
       * Prompt text submitted when the cron fires. Capped at 1000 chars; clipped values append an in-string "... [+N chars]" marker.
       */
      prompt: string;
  };

  type SessionEndHookInput = BaseHookInput & {
      hook_event_name: 'SessionEnd';
      reason: ExitReason;
  };

  /**
   * One message of the transcript as `$.session.messages()` returns it.
   */
  export type SessionMessage = {
      /**
       * Who wrote it.
       */
      role: 'user' | 'assistant';
      /**
       * Its text blocks joined; '' when it has none.
       */
      text: string;
      /**
       * The tool_use blocks of an assistant message: `{ id, name, input }`, plus
       * `{ result, text, isError }` once the transcript holds the call's result.
       */
      toolUses: ToolUseSummary[];
      /**
       * The tool_result blocks of a user message: `{ id, text, isError, result }`.
       */
      toolResults?: ToolResultSummary[];
      /**
       * An opaque token the engine stamps on a message it hands a
       * `session.compact` hook, so a list handed back maps to its own messages.
       *
       * Absent on `$.session.messages()` and on a message a hook built.
       */
      handle?: string;
  };

  /**
   * One rate-limit window as the rate-limit notices read it.
   */
  type SessionRateLimit = {
      /**
       * Which window: `five_hour`, `seven_day`, or a Claude gateway's
       * `spend_limit`.
       */
      kind: string;
      /**
       * How much of the window is used, 0 to 100 (above 100 once a spend limit
       * is exceeded).
       */
      percentUsed: number;
      /**
       * When the window resets, as an ISO 8601 timestamp.
       */
      resetsAt?: string;
  };

  /**
   * An external-event wake the delivery's text parsed as (a GitHub relay
   * event, a signal's notice): the envelope's attributes and its JSON body.
   */
  export type SessionReceiveEvent = {
      /**
       * The producing service (`github`).
       */
      source: string;
      /**
       * The event's discriminator (`pull_request.closed`, `check_suite`).
       */
      kind: string;
      /**
       * The envelope's JSON body (`{ pr: "acme/app#12", outcome: "merged" }`).
       */
      data: Record<string, unknown>;
      /**
       * The `data` keys whose values are free text a third party wrote (a
       * commenter's `author` and `comment`), as the producer marked them.
       *
       * Empty when none; the server asserts every other key's value, not these.
       */
      untrustedKeys: readonly string[];
  };

  /**
   * The input of `session.receive`: one inbound delivery (a relay's event, a
   * peer's message, a Remote Control prompt), sanitized, before it is queued.
   */
  export type SessionReceiveInput = {
      /**
       * Where the delivery came from, as the bridge classified it; the key a
       * matcher narrows on. `next(e)` passes it on as received.
       */
      origin: SessionReceiveOrigin;
      /**
       * The delivery's body as the model would read it (a content-block
       * delivery's text blocks, joined).
       */
      text: string;
      /**
       * The external-event wake the text parsed as (`source` `github` for a
       * subscribed pull request's event); passed on as received.
       *
       * Present only for a delivery the server itself rendered as a wake (a
       * webhook relay, the session inbox), by its asserted origin; anyone else's
       * wake-shaped text stays `text`. Its `untrustedKeys` name third-party text.
       */
      event?: SessionReceiveEvent;
  };

  /**
   * Where an inbound delivery came from, as the bridge classified it from the
   * server's stamps; `prompt.submit`'s `e.origin.kind`, less what never arrives.
   *
   * `bridge` the user's own from a Remote Control client; `task-notification`
   * a relay's event (a GitHub webhook) or a trigger; `scheduled-trigger` a
   * routine; `peer` another session; `unclassified` one it could not place.
   */
  export type SessionReceiveOrigin = 'bridge' | 'task-notification' | 'scheduled-trigger' | 'peer' | 'peer-send-message' | 'projects-relay' | 'slack-ping' | 'unclassified';

  /**
   * What a `session.receive` hook returns and what `next(e)` resolves to: the
   * delivery that proceeds, `{ text }`, or `{ consumed: reason }`.
   */
  export type SessionReceiveResult = {
      /**
       * The body the delivery is queued with; from core, `e.text` as the
       * chain left it.
       */
      text: string;
      consumed?: undefined;
  } | {
      /**
       * Takes the delivery: it is not queued, not written to the transcript
       * and never reaches the model; the reason is logged, the plugin named.
       */
      consumed: string;
      text?: undefined;
  };

  /**
   * What `$.session.repo()` answers: the repository's root and its origin remote,
   * when the session is in one.
   */
  export type SessionRepo = {
      /**
       * The repository's root, absolute: the main working tree's for a worktree.
       */
      root: string;
      /**
       * The `origin` remote's URL as git has it (push URL preferred), or null when
       * the repository has none.
       */
      remote: string | null;
      /**
       * Whether the remote is one of the repositories this build treats as its
       * own; false in a build that has none or when the remote is unrecognized.
       *
       * The engine matches the build's own list of repositories with its
       * hardened remote parser. A plugin reads this to behave differently in a
       * public repository; which repositories are the build's is its to say.
       */
      internal: boolean;
      /**
       * The repository the allowlist matched, as `owner/name`; null when
       * `internal` is false.
       *
       * A working copy without a remote that the engine still recognises is
       * named by its own checkout configuration; a remote's name is its path.
       */
      name: string | null;
  };

  type SessionStartHookInput = BaseHookInput & {
      hook_event_name: 'SessionStart';
      source: 'startup' | 'resume' | 'clear' | 'compact' | 'fork';
      agent_type?: string;
      model?: string;
      session_title?: string;
      /**
       * resume/fork: seconds since the resumed transcript's last assistant response
       */
      seconds_since_last_response?: number;
      /**
       * resume/fork: the resumed transcript's last response input + cache_read + cache_creation + output tokens (for a server-side tool loop, its last iteration's window, not the summed totals)
       */
      context_tokens?: number;
      /**
       * resume/fork: seconds_since_last_response exceeds the prompt-cache TTL, so the first request re-caches context_tokens
       */
      prompt_cache_likely_expired?: boolean;
      /**
       * resume/fork: estimated cost of re-caching context_tokens on the session model - the managed modelPricing when set, otherwise list price; excludes the response
       */
      estimated_cache_write_usd?: number;
  };

  /**
   * The input of `session.start`: the session the process starts with, read the
   * way `$.session` reads it at that moment.
   */
  export type SessionStartInput = {
      /**
       * The directory the session runs in, absolute (`$.session.cwd()`).
       */
      cwd: string;
      /**
       * Where the session draws (`$.session.surface()`): `terminal` under the
       * REPL; null for a `-p` run or the SDK, which draw nowhere at start.
       */
      surface: RenderSurface | null;
      /**
       * Whether a person is at the prompt: true under the REPL, false for a `-p`
       * run or the SDK.
       */
      interactive: boolean;
  };

  /**
   * What a `session.start` hook returns and what `next(e)` resolves to:
   * `{ cwd }`, echoed by core; a hook's own value does not change the session.
   */
  export type SessionStartResult = {
      cwd: string;
  };

  /**
   * What `$.session.usage()` answers: the context window's fill, the account's
   * rate-limit windows and the session's cost, as the status line has them.
   *
   * A figure the engine does not have is left out, never zeroed: `rateLimits`
   * is empty off a subscription, `cost` absent where the host keeps no ledger.
   */
  type SessionUsage = {
      /**
       * The live context window: the status line's `context_window` figures.
       */
      context: SessionContextUsage;
      /**
       * The rate-limit windows the last API response reported (`five_hour`,
       * `seven_day`, a gateway's `spend_limit`); empty when none has a reading.
       */
      rateLimits: SessionRateLimit[];
      /**
       * What the session has cost so far, as /cost totals it; absent only where
       * the host keeps no cost ledger (the CLI always has one).
       */
      cost?: SessionCost;
  };

  /**
   * What `$.settings.read` answers: an object keyed as a settings.json is
   * (`permissions`, `env`, `hooks`, `model`, `enabledPlugins`, ...).
   *
   * Each key is as https://code.claude.com/docs/en/settings documents it and
   * https://json.schemastore.org/claude-code-settings.json types it. A
   * snapshot in plain data: a write to it changes nothing the engine reads.
   */
  type Settings = Readonly<Record<string, unknown>>;

  /**
   * What `$.settings.read(args)` takes.
   */
  type SettingsReadArgs = {
      /**
       * The one source read, as loaded; absent, the settings merged over every
       * source, as the engine runs under them.
       */
      source?: SettingsSource;
  };

  /**
   * One source of settings by the name a plugin gives it, lowest precedence
   * first; the engine's own name is the same word with `Settings` appended.
   *
   * `user` is ~/.claude/settings.json, `project` .claude/settings.json,
   * `local` .claude/settings.local.json, `flag` what `--settings` and the
   * SDK's inline settings carry, and `policy` the managed settings, every
   * managed tier merged.
   */
  type SettingsSource = 'user' | 'project' | 'local' | 'flag' | 'policy';

  type SetupHookInput = BaseHookInput & {
      hook_event_name: 'Setup';
      trigger: 'init' | 'maintenance';
  };

  /**
   * Where a site's window sits over the tree a hook drew in it (a pane's body,
   * the band): the engine's to move (the person scrolls), the plugin's to read.
   */
  type SiteScroll = {
      /**
       * The first row of the tree the window shows; 0 at the top. Read-only.
       */
      offset: number;
      /**
       * How many rows of the tree the window shows at once: the rows the
       * surface gave the body. Read-only.
       */
      bodyRows: number;
  };

  /**
   * The input of `skill.prompt`: one skill's prompt, at the moment the engine
   * expanded it for the model.
   *
   * Typed as `/name`, called through the Skill tool, or preloaded into a
   * subagent: the same event at each.
   */
  export type SkillPromptInput = {
      /**
       * Which skill (`commit`); the key a matcher narrows on.
       */
      skill: string;
      /**
       * The prompt's text as the skill computed it (its text blocks, joined).
       */
      text: string;
  };

  /**
   * What a `skill.prompt` hook returns: the text the model reads for that
   * skill.
   */
  export type SkillPromptResult = {
      text: string;
  };

  /**
   * Options of `$.clock.sleep`.
   */
  export type SleepOptions = {
      /**
       * Aborting it rejects the sleep at once.
       */
      signal?: AbortSignal;
  };

  /**
   * Options of `$.audio.speak`.
   */
  export type SpeakOptions = {
      /**
       * The system voice's exact name as the platform lists it (`Samantha`, or the
       * name of a voice you installed). Absent: the synthesizer's default voice.
       */
      voice?: string;
  };

  /**
   * `$.audio.speak` as it crosses the worker boundary (protocol/ OpRequest).
   */
  type SpeakRequest = SpeakOptions & {
      /**
       * What to say, as plain text, of at most UI_TEXT_MAX characters.
       */
      text: string;
  };

  /**
   * What `$.audio.speak` resolves with once the utterance has ended.
   */
  export type SpeakResult = {
      /**
       * Which synthesizer spoke: `system`, the platform's own (speechSynthesis in a
       * page, `say` on macOS).
       */
      via: 'system';
  };

  /**
   * `next` in a `*` hook: the set of events is open at runtime, so `e` is
   * `unknown` until `next.is(pattern, e)` narrows it to events it knows.
   *
   * The callable is an overload per known event (OrderedOverloads), then
   * `(e: unknown) => Promise<unknown>` last: `next(e)` with `e` still unknown
   * resolves to `unknown`.
   */
  export type StarNext = OrderedOverloads<EventName> & {
      (e: unknown): Promise<unknown>;
      /**
       * Continues this dispatch at a tier, as Next's `to` (a managed hook's):
       * `e` still unknown resolves to `unknown`.
       */
      readonly to: (e: unknown, tier: TargetTier) => Promise<unknown>;
      readonly signal: AbortSignal;
      readonly is: <M extends Pattern>(pattern: M, e: unknown) => e is Args<Selected<M>>;
      readonly event: EventName;
      readonly origin: Origin;
      readonly trace: readonly TraceEntry<EventName, unknown, unknown>[];
  };

  type StopFailureHookInput = BaseHookInput & {
      hook_event_name: 'StopFailure';
      error: SDKAssistantMessageError;
      error_details?: string;
      last_assistant_message?: string;
  };

  type StopHookInput = BaseHookInput & {
      hook_event_name: 'Stop';
      stop_hook_active: boolean;
      /**
       * Text content of the last assistant message before stopping. Avoids the need to read and parse the transcript file.
       */
      last_assistant_message?: string;
      /**
       * In-flight background work (running/pending + backgrounded) registered in this session. Lets hooks distinguish "session is done" from "session is paused waiting for background work to wake it". Empty array when nothing is in flight.
       */
      background_tasks?: BackgroundTaskSummary[];
      /**
       * Session-scoped cron tasks (CronCreate, ScheduleWakeup, /loop) that will wake this session later. Empty array when none are scheduled.
       */
      session_crons?: SessionCronSummary[];
  };

  type SubagentStartHookInput = BaseHookInput & {
      hook_event_name: 'SubagentStart';
      agent_id: string;
      agent_type: string;
  };

  type SubagentStopHookInput = BaseHookInput & {
      hook_event_name: 'SubagentStop';
      stop_hook_active: boolean;
      agent_id: string;
      agent_transcript_path: string;
      agent_type: string;
      /**
       * Text content of the last assistant message before stopping. Avoids the need to read and parse the transcript file.
       */
      last_assistant_message?: string;
      /**
       * In-flight background work (running/pending + backgrounded) registered in this session. Lets hooks distinguish "session is done" from "session is paused waiting for background work to wake it". Empty array when nothing is in flight.
       */
      background_tasks?: BackgroundTaskSummary[];
      /**
       * Session-scoped cron tasks (CronCreate, ScheduleWakeup, /loop) that will wake this session later. Empty array when none are scheduled.
       */
      session_crons?: SessionCronSummary[];
  };

  /**
   * The props of `Svg`, the desktop surface's vector leaf: the markup is the
   * element's data, as a string is a Text's, drawn in an isolated box.
   *
   * A leaf: no children. The surface never lets the markup reach the page
   * (render-site/ svgProblem bounds it; the desktop draws it as an image, or in
   * a sandboxed frame when `interactive`).
   */
  export type SvgProps = {
      /**
       * The SVG document, `<svg ...>...</svg>`, at most MAX_SVG_SOURCE_CHARS.
       */
      source: string;
      /**
       * What the drawing says, for a reader that cannot see it; required, since
       * a surface without the element draws nothing else of it.
       */
      alt: string;
      /**
       * CSS pixels; absent, the box takes the markup's own width up to the slot.
       */
      width?: number;
      /**
       * CSS pixels; absent, the markup's own height at the drawn width.
       */
      height?: number;
      /**
       * `true` draws the SVG in a script-less sandboxed frame so hover, CSS
       * `:hover`, SMIL animation and `<title>` tooltips work; absent, an image.
       *
       * It never enables script or event-handler attributes (the frame has no
       * allow-scripts and the scrub strips them); presses that other plugins
       * should observe go on an enclosing element.
       */
      interactive?: boolean;
  };

  /**
   * The keys of `I` a matcher may select variants by: literal-valued in every
   * variant, and one literal per variant (IsDiscriminant).
   */
  type TagKeys<I> = {
      [K in MatcherKeys<I>]: IsLiteralValued<MatcherValueOf<I, K>> extends true ? IsDiscriminant<I, K> extends true ? K : never : never;
  }[MatcherKeys<I>];

  /**
   * A tier `next.to(e, tier)` may name: one a floor can reach past a tier of
   * less authority to, so never `prepend` or `user`, which nothing skips to.
   */
  export type TargetTier = Exclude<Tier, 'prepend' | 'user'>;

  type TaskCompletedHookInput = BaseHookInput & {
      hook_event_name: 'TaskCompleted';
      task_id: string;
      task_subject: string;
      task_description?: string;
      teammate_name?: string;
      /**
       * @deprecated Sessions have a single implicit team; this carries the session-derived team name and will be removed in a future release.
       */
      team_name?: string;
  };

  type TaskCreatedHookInput = BaseHookInput & {
      hook_event_name: 'TaskCreated';
      task_id: string;
      task_subject: string;
      task_description?: string;
      teammate_name?: string;
      /**
       * @deprecated Sessions have a single implicit team; this carries the session-derived team name and will be removed in a future release.
       */
      team_name?: string;
  };

  type TeammateIdleHookInput = BaseHookInput & {
      hook_event_name: 'TeammateIdle';
      teammate_name: string;
      /**
       * @deprecated Sessions have a single implicit team; this carries the session-derived team name and will be removed in a future release.
       */
      team_name: string;
  };

  /**
   * The `Text` props a `hover` may override: its colors and styles, not its
   * wrapping. A `Button` takes the same set for its label.
   */
  export type TextHoverProps = {
      color?: string;
      backgroundColor?: string;
      dimColor?: boolean;
      bold?: boolean;
      italic?: boolean;
      underline?: boolean;
      strikethrough?: boolean;
      inverse?: boolean;
  };

  /**
   * The props of `Text`: the color and style props of Ink's Text a tree may set
   * (render-site/ RENDER_PROPS). Colors are a theme key or a raw color.
   */
  export type TextProps = {
      /**
       * Style overrides applied by the surface while the pointer is over the
       * nearest enclosing `Box` that carries a `key` (the hover scope).
       *
       * No hook runs and nothing crosses to the plugin. Refused outside a keyed
       * Box (render-site/ hoverProblem).
       */
      hover?: TextHoverProps;
      color?: string;
      backgroundColor?: string;
      dimColor?: boolean;
      bold?: boolean;
      italic?: boolean;
      underline?: boolean;
      strikethrough?: boolean;
      inverse?: boolean;
      wrap?: 'wrap' | 'end' | 'middle' | 'truncate' | 'truncate-start' | 'truncate-middle' | 'truncate-end';
  };

  /**
   * One of the chain's five tiers (TIERS), outermost first; on every
   * `next.trace` entry, and what `next.to(e, tier)` names.
   *
   * `prepend` and `append` are the managed plugins an administrator lists,
   * `user` everything a person installs, `builtin` the plugins bundled in the
   * binary, `core` the engine's innermost link.
   */
  export type Tier = (typeof TIERS)[number];

  /**
   * The chain's five tiers, outermost first: earlier is outer is more
   * authority, and same-event hooks nest in this order and no other way.
   *
   * The managed plugins an administrator prepends, everything a person
   * installs, the managed plugins appended, the plugins bundled in the binary,
   * the engine's innermost link; a built-in's `$` calls still raise everywhere.
   */
  const TIERS: readonly ["prepend", "user", "append", "builtin", "core"];

  /**
   * A pending timer from `$.clock.after` / `$.clock.every`.
   */
  export type Timer = {
      /**
       * Stops it; a stopped timer never fires again.
       */
      cancel: () => void;
  };

  /**
   * A timer on `$.clock` (`after`, `every`): `fn` runs after `ms` milliseconds,
   * once or until `cancel()`.
   */
  export type TimerCall = (ms: number, fn: () => void) => Timer;

  /**
   * Options of `$.ui.toast`.
   */
  export type ToastOptions = {
      /**
       * How long the line stays, in milliseconds; default 4000.
       */
      timeoutMs?: number;
  };

  /**
   * `tool.call`'s input as the call takes it: `tool_use_id` and `agentId` may
   * ride along (a hook passing its event's input on) and are dropped.
   *
   * The run gets its own id and runs in the session's loop.
   */
  export type ToolCallArgs = ToolCallEnvelope extends infer I ? I extends ToolCallEnvelope ? Omit<I, 'tool_use_id'> & ToolCallReserved<I['tool']> : never : never;

  /**
   * The envelope the two tool events share: the tool, the id of this call, and
   * the tool's arguments spread beside them (`e.command` for Bash).
   *
   * A union discriminated by `tool`: after `if (e.tool === "Bash")`, `e.command`
   * is a string and a rewrite is checked against Bash's schema. The `e` of
   * `classic.PreToolUse` exactly; `tool.call`'s adds the loop (ToolCallInput).
   */
  export type ToolCallEnvelope = BuiltinToolCallInput | McpToolCallInput;

  /**
   * The input of `tool.call`: the tool, the id of this call, the tool's
   * arguments beside them (`e.command` for Bash), and `agentId` in a subagent.
   *
   * A union discriminated by `tool`: after `if (e.tool === "Bash")`, `e.command`
   * is a string and a rewrite is checked against Bash's schema. `tool`,
   * `tool_use_id` and `agentId` are reserved: a rewrite of any is refused.
   */
  export type ToolCallInput = ToolCallEnvelope & AgentLoop;

  /**
   * `$.tool.call(input)`: resolves with `result` typed for the tool `input`
   * names (ToolCallResult), or loosely for an input that names none literally.
   */
  type ToolCallOverloads = {
      <T extends string>(input: ToolCallArgs & ToolNamed<T>): Promise<ToolCallResult<T>>;
      (input: ToolCallArgs): Promise<ToolCallResult>;
  };

  /**
   * The keys `tool.call`'s input carries beside the tool's own arguments, none
   * of which the tool sees (tool-event/ toolArgsOf strips them).
   *
   * `consent` is the person's own words for the press that raised the call
   * (`The user pressed "1: Yes" on ...`): the run's context carries it as a human
   * turn, which the permission path reads as the user's request.
   */
  export type ToolCallReserved<T> = {
      tool: T;
      tool_use_id?: string;
      consent?: string;
  };

  /**
   * What a `tool.call` hook returns and what `next(e)` and `$.tool.call(input)`
   * resolve to: the tool's result (`{ result, context? }`) or `{ deny }`.
   *
   * From core the result is `{ ref, result, text }` or, when the tool reported
   * an error, `{ ref, result, text, isError }`; `ref` names core's messages.
   *
   * @template Name the tool the call went to, typing `result` per built-in
   *   tool (BuiltinToolResults) once `e.tool` is narrowed; else `unknown`
   */
  export type ToolCallResult<Name extends string = string> = {
      /**
       * Refuses the call: the model receives the text as an error result.
       * Absent when the call was answered.
       */
      deny: string;
      result?: undefined;
      context?: undefined;
      ref?: undefined;
      text?: undefined;
      isError?: undefined;
  } | {
      /**
       * The tool's output: from core the tool's record, typed per built-in
       * tool once `e.tool` and `isError` are narrowed; from a hook, its own.
       *
       * Core validates a hook's answer against the tool's output schema when
       * it has one, maps it for the model with the tool's own mapper, and
       * records it in the transcript as the tool's result. Absent on a deny.
       */
      result: ToolResultOf<Name>;
      /**
       * What the model reads after the tool's result and the user never
       * sees. From core, none.
       *
       * One newline-joined reminder, as a PostToolUse hook's additional
       * context is, after the managed tier's review of it; none on a plugin's
       * own `$.tool.call`. Kept whole from `next`; capped (PROMPT_TEXT_MAX).
       */
      context?: readonly string[];
      /**
       * Set by core on what `next(e)` resolves to: names the messages core
       * produced for the call (they stay on the host side).
       *
       * A hook that returns the object it got makes core use them verbatim.
       * Absent on a hook's own `{ result }` and on a deny.
       */
      ref?: number;
      /**
       * Set by core: the result as the model reads it (text blocks joined),
       * present whatever the tool, where `result`'s shape varies per tool.
       *
       * Absent on a hook's own `{ result }`.
       */
      text?: string;
      isError?: undefined;
      deny?: undefined;
  } | {
      /**
       * Set by core, present only when the tool reported an error (it threw,
       * was interrupted, or answered an error): `text` is what the model read.
       */
      isError: true;
      /**
       * What the transcript stored for the errored call: the error text, or
       * undefined when nothing was stored; never the tool's typed record.
       */
      result: unknown;
      /**
       * The error as the model reads it.
       */
      text?: string;
      /**
       * As on an answered result: names the messages core produced.
       */
      ref?: number;
      /**
       * As on an answered result.
       */
      context?: readonly string[];
      deny?: undefined;
  };

  /**
   * The input of `tool.describe`: one tool's description, at the moment the
   * engine first renders the tool's schema for the model.
   */
  export type ToolDescribeInput = {
      /**
       * As the model sees the name (`Bash`, `mcp__server__tool`); the key a
       * matcher narrows on.
       */
      tool: string;
      /**
       * The tool's description as it computed it.
       */
      description: string;
      /**
       * Who provides this tool: the plugin and its tier; `{ plugin: "engine",
       * tier: "core" }` for a built-in. Pinned: a rewrite is refused.
       *
       * A configured MCP server's tool is `mcp:<server>`, in `prepend` when the
       * policy settings source configures the server, else `user`.
       */
      provider: Origin;
  };

  /**
   * What a `tool.describe` hook returns: the description the model sees for that
   * tool.
   */
  export type ToolDescribeResult = {
      description: string;
  };

  /**
   * `{ tool, tool_use_id, ...args }` as one flat object type, generic over
   * the tool name and its parsed arguments.
   */
  type ToolEnvelope<Name, Arguments> = {
      /**
       * The name of the tool being called (`Bash`, `mcp__<server>__<tool>`);
       * comparing it narrows `e`. Reserved: a rewrite of it is ignored by core.
       */
      tool: Name;
      /**
       * The tool_use block's id: the same at every event of the call and in
       * `$.ui.notice`. Reserved: a rewrite of it is ignored by core.
       */
      tool_use_id: string;
  } & Arguments;

  /**
   * One tool call of a ToolGroup, as `ui.render` sees it under `calls`.
   */
  export type ToolGroupCall = {
      /**
       * The id `tool.call` carried for this call (`e.tool_use_id` there), so a
       * hook that saw the call finds its row in the group. Read-only.
       *
       * Absent on a desktop host that predates it.
       */
      tool_use_id?: string;
      /**
       * The tool's name (`Bash`, `Read`, `Grep`, ...).
       */
      toolName: string;
      /**
       * The call's input, as the model sent it.
       */
      input: unknown;
      /**
       * True while the call is still running.
       */
      running: boolean;
      /**
       * True when the call ended in an error.
       */
      errored: boolean;
      /**
       * True when an abort ended the call, as on `ToolUse`.
       */
      interrupted: boolean;
      /**
       * As on `ToolUse`; undefined while the call runs.
       */
      output?: unknown;
  };

  /**
   * One tool as `$.tool.list()` returns it.
   */
  export type ToolInfo = {
      /**
       * What the model calls it by.
       */
      name: string;
      /**
       * What it does, in the tool's own words (its description; a first sentence at
       * most for MCP tools without one).
       */
      description: string;
      /**
       * True for an MCP server's tool.
       */
      mcp: boolean;
  };

  /**
   * `{ tool, tool_use_id, ...args }` as one flat object type.
   *
   * The docs of `tool` and `tool_use_id` live on the `keyof` operand: a mapped
   * type takes its properties' docs from there.
   */
  export type ToolInputOf<Name extends string, Arguments> = {
      [K in keyof ToolEnvelope<Name, Arguments>]: ToolEnvelope<Name, Arguments>[K];
  };

  /**
   * An input that names its tool as the literal `T`: what `next` and
   * `$.tool.call` read to type the call's result per tool (NextResultFor).
   */
  type ToolNamed<T extends string> = {
      /**
       * The name of the tool being called (`Bash`).
       */
      readonly tool: T;
  };

  /**
   * The structured result of the tool named `Name`: its BuiltinToolResults
   * entry for a built-in tool, else `unknown`.
   *
   * Agent's is its entry or an AgentCallRecord (what a plugin-raised call
   * answers). `unknown` covers an MCP tool, a name the results table lacks
   * (one merged into the inputs table alone too), and `Name` left at `string`.
   */
  export type ToolResultOf<Name extends string> = string extends Name ? unknown : Name extends keyof BuiltinToolResults & string ? BuiltinToolResults[Name] | (Name extends 'Agent' ? AgentCallRecord : never) : unknown;

  /**
   * One tool_result block of a user message.
   */
  export type ToolResultSummary = {
      id: string;
      /**
       * The result as the model read it (text blocks joined).
       */
      text: string;
      isError: boolean;
      /**
       * What the transcript stored for the call: the tool's record on an answered
       * one (`tool.call`'s `result`), the error text when `isError`.
       *
       * Absent when nothing was stored. Headless (`-p`), a tool may store the
       * record less its bulk (Bash blanks `stdout`); `text` is what the model
       * read either way.
       */
      result?: unknown;
  };

  /**
   * What `$.tool.register` takes.
   */
  export type ToolSpec = {
      /**
       * The tool's short name (letters, digits, `_`, `-`; up to 64); the model
       * calls it as `mcp__<plugin>__<name>`.
       */
      name: string;
      /**
       * What the tool does, for the model.
       */
      description: string;
      /**
       * A JSON schema object for the input (`{ type: "object", properties,
       * required }`); default `{ type: "object" }`.
       */
      inputSchema?: Record<string, unknown>;
  };

  /**
   * One tool_use block of an assistant message, with its outcome once the
   * transcript holds the call's tool_result (paired by `id`).
   */
  export type ToolUseSummary = {
      id: string;
      name: string;
      input: Record<string, unknown>;
      /**
       * What the transcript stored for the call: the tool's record on an answered
       * one (`tool.call`'s `result`), the error text on a refused or errored one.
       *
       * Absent while the call is in flight or when nothing was stored. Headless
       * (`-p`), a tool may store the record less its bulk (Bash blanks `stdout`);
       * `text` holds either way.
       */
      result?: unknown;
      /**
       * The result as the model read it; absent while the call is in flight.
       */
      text?: string;
      /**
       * Present only when the tool reported an error, as on `tool.call`'s result.
       */
      isError?: true;
  };

  /**
   * One settled run of a link beneath the caller, as `next.trace` lists it:
   * data, not a handle.
   *
   * `received` and `returned` are the live references where the hook runs
   * beside the chain; in a hooks module its own copies, as `e` is.
   */
  export type TraceEntry<N extends EventName = EventName, E = Args<N>, O = NextResult<N>> = {
      /**
       * The link's place in the chain, 0 the outermost.
       */
      readonly index: number;
      /**
       * The hook's plugin; `"engine"` for the engine's own core or bottom.
       */
      readonly plugin: string;
      /**
       * The link's tier (Tier); `"core"` for the engine's own core or bottom.
       */
      readonly tier: Tier;
      readonly event: N;
      readonly outcome: TraceOutcome;
      /**
       * Why the link was skipped without running, when it was: `bypassed by
       * <plugin>`, whose `next.to` went beneath this tier. Absent when it ran.
       */
      readonly reason?: string;
      /**
       * Its own wall time, its `next()` calls' time in flight taken out.
       *
       * The engine entry's is everything beneath the last hook: in a hooks
       * module, the host round trip.
       */
      readonly ms: number;
      readonly received: E;
      /**
       * What the link settled on; undefined when it was skipped or rejected.
       */
      readonly returned: O | undefined;
  };

  /**
   * What the chain decided for one link, as `next.trace` names it.
   *
   * `returned`: its result stood; `passed`: it returned, by reference, what its
   * last `next()` resolved to (a hooks module's hook answers with a copy of its
   * own, so it reads `returned`); `skipped`: it failed before `next`, or a
   * `next.to` above continued beneath its tier (`reason` says which), and
   * beneath ran in its place; `kept`: it failed after `next`, and that run's
   * result stands; `expired`: its budget ran out (what stands follows
   * skipped/kept); `caught`: it threw or its budget ran out, and its `.catch`
   * handler's result stands; `rejected`: the link rejected; the deepest such
   * entry is where the rejection came from, and the ones above it let it pass.
   */
  type TraceOutcome = 'caught' | 'expired' | 'kept' | 'passed' | 'rejected' | 'returned' | 'skipped';

  /**
   * What every `turn.complete` carries whatever its reason: the answer, the
   * duration, the interrupt flag, the turn's id and what the turn cost.
   */
  type TurnCompleteFields = {
      /**
       * The assistant's final visible text this turn ("" if none, e.g.
       * thinking-only).
       */
      answer: string;
      /**
       * Wall-clock length of the turn in milliseconds.
       */
      durationMs: number;
      /**
       * True when the turn ended by interruption (`reason === 'aborted'`).
       */
      aborted: boolean;
      /**
       * The turn's id, the same one its `turn.start` and every `turn.step` carried.
       */
      turnId: string;
      /**
       * What the turn cost: its responses' token counts summed and the model of
       * the last, read off the API responses the engine already holds.
       *
       * Absent when the turn got no response (interrupted before one, an API
       * error).
       */
      usage?: TurnUsage;
  };

  /**
   * The input of `turn.complete`: the assistant's final message of a turn, at
   * the moment the turn ends (where the turn's duration is reported).
   *
   * `reason` says why it ended; `refusal` exists on a refusal alone.
   */
  export type TurnCompleteInput = TurnCompleteFields & (TurnCompleteRefused | TurnCompleteUnrefused);

  /**
   * Why a turn ended: the model answered, the user interrupted it, the model
   * refused with no fallback model to retry on, or an API error ended it.
   */
  export type TurnCompleteReason = 'answer' | 'aborted' | 'refusal' | 'error';

  /**
   * The end of a turn the model refused with no fallback model to retry on:
   * what the API said of the refusal rides along.
   */
  type TurnCompleteRefused = {
      reason: 'refusal';
      refusal: TurnRefusal;
  };

  /**
   * What a `turn.complete` hook returns and what `next(e)` resolves to:
   * `{ text }`; a text other than the answer's is shown beneath it.
   *
   * Core fills `usage` from `e.usage` when the turn had one; a hook above reads
   * it, and one that answers its own may leave it out.
   */
  export type TurnCompleteResult = {
      text: string;
      usage?: TurnUsage;
  };

  /**
   * The end of a turn that was not a refusal: answered, interrupted, or dead
   * on an API error (retries exhausted, the context limit), nothing more.
   */
  type TurnCompleteUnrefused = {
      reason: Exclude<TurnCompleteReason, 'refusal'>;
  };

  /**
   * What the API said about a refusal that ended a turn: the classifier's
   * category and its explanation, each null when the API sent none.
   */
  export type TurnRefusal = {
      category: string | null;
      explanation: string | null;
  };

  /**
   * The input of `turn.start`: the prompt a model turn begins with, after
   * `prompt.submit` settled the text and the UserPromptSubmit settings hooks ran.
   */
  export type TurnStartInput = {
      /**
       * The user's text as the turn proceeds with it ("" for a turn started without
       * a typed prompt, e.g. a continuation).
       */
      text: string;
      /**
       * The turn's id, minted here; the same one every `turn.step` and the
       * `turn.complete` of this turn carry.
       */
      turnId: string;
  };

  /**
   * What a `turn.start` hook returns and what `next(e)` resolves to:
   * `{ turnId }`, echoed by core; a hook's own value does not change the turn.
   */
  export type TurnStartResult = {
      turnId: string;
  };

  /**
   * The input of `turn.step`: one model response inside a turn, once its
   * blocks are all in: at its first tool result, or at the turn's end.
   */
  export type TurnStepInput = {
      /**
       * The turn this step belongs to (`turn.start`'s id).
       */
      turnId: string;
      /**
       * The step's position in the turn, from 0.
       */
      index: number;
      /**
       * The visible text of this response ("" when it only called tools or only
       * thought).
       */
      answer: string;
      /**
       * The tool calls this response made, in order; empty for a text-only step.
       */
      toolUses: readonly TurnStepToolUse[];
      /**
       * Why the model stopped.
       */
      stopReason: 'end_turn' | 'max_tokens' | 'stop_sequence' | 'tool_use' | 'pause_turn' | 'compaction' | 'refusal' | 'model_context_window_exceeded';
      /**
       * What this response cost as the API reported it, and its model; absent
       * for a response that carried no usage.
       */
      usage?: TurnUsage;
  };

  /**
   * What a `turn.step` hook returns and what `next(e)` resolves to, echoed by
   * core with the step's `usage`; a hook's value does not change the step.
   */
  export type TurnStepResult = {
      turnId: string;
      index: number;
      usage?: TurnUsage;
  };

  /**
   * One tool call the model asked for in a step: the tool's name and its
   * arguments.
   */
  export type TurnStepToolUse = {
      /**
       * The tool's name (`Read`, `Bash`, `mcp__server__tool`).
       */
      name: string;
      /**
       * The arguments the model gave it, as the tool schema shapes them.
       */
      input: unknown;
  };

  /**
   * What a model turn, or one response inside it, cost as the API reported it:
   * the four token counts (`$.model.fork`'s usage shape) and the model's id.
   *
   * A turn's counts are its responses' summed; its model is the last response's.
   */
  type TurnUsage = ModelForkUsage & {
      /**
       * Which model answered, by the id the API reports.
       */
      model: string;
  };

  /**
   * The argument of `ui.input`: a change of, or a submit from, an `Input` a
   * render hook drew. Flat and frozen like every event's.
   *
   * Another plugin addresses one field by matcher:
   * `on("ui.input", { plugin: "roster", element: "reply" }, ...)`.
   */
  type UiInputArgument = {
      /**
       * Whose `ui.render` hook drew the element.
       */
      plugin: string;
      /**
       * The `key` the hook gave its `Input`: its address, what a matcher names.
       */
      element: string;
      /**
       * The render component the element was drawn in (`AbovePrompt`,
       * `ToolUse`, ...).
       */
      component: RenderComponent;
      /**
       * Where the typing came from, one literal per member, so
       * `if (e.surface === "terminal")` narrows `e`.
       */
      surface: RenderSurface;
      /**
       * `change` after every edit of the text; `submit` on Enter.
       */
      kind: 'change' | 'submit';
      /**
       * The field's whole text at that moment; a hook above may rewrite it for
       * the plugins beneath and the element's own handler.
       */
      value: string;
  };

  /**
   * What a `ui.input` hook returns and what `next(e)` resolves to.
   *
   * Beneath every hook, core runs the element's `onInput` (kind `change`) or
   * `onSubmit` (kind `submit`) closure in its plugin's environment with the
   * value as the chain left it, and answers `{ element, value }`.
   */
  type UiInputResult = {
      /**
       * Which handler the input reached, by its Input's `key`.
       */
      element: string;
      /**
       * The text the handler received.
       */
      value: string;
  };

  /**
   * The argument of `ui.message`: what a `Client` instance's surface module
   * posted (`surface.post(data)`), addressed by where the instance is drawn.
   *
   * The origin is `client`: code sent it, on nobody's behalf, so `data` is
   * input to validate, not a fact. Everything but `data` is the engine's word
   * and a hook may not rewrite it.
   */
  export type UiMessageArgument = {
      /**
       * Where the instance is drawn: `terminal`, or `desktop` once it has them.
       */
      surface: RenderSurface;
      /**
       * The render component the `Client` was drawn in (`AbovePrompt`, `Pane`,
       * ...).
       */
      component: RenderComponent;
      /**
       * The engine's id for the drawing the `Client` sits in: the `requestId` the
       * `ui.render` hook that drew it saw.
       */
      requestId: string;
      /**
       * The `Client`'s `key`: which instance posted.
       */
      element: string;
      /**
       * The `Client`'s `module`: which export of the surface module runs there.
       */
      module: string;
      /**
       * What the instance posted: plain data (JsonValue), bounded as a tree's
       * text is; typed `unknown` since it came from code. Rewritable.
       */
      data: unknown;
  };

  /**
   * What a `ui.message` hook returns and what `next(e)` resolves to.
   *
   * Core answers `{}`: the message was heard and nothing changes. A hook that
   * answers `{ props }` hands the posting instance its next props directly, its
   * local state kept, with no `ui.render` run; the plugin's next redraw hands
   * props again as usual.
   */
  export type UiMessageResult = {
      /**
       * The instance's next props, plain data (JsonValue) bounded as a `Client`'s
       * props are; absent leaves the instance's props as they were.
       */
      props?: unknown;
  };

  /**
   * The argument of `ui.press`: a press on a `Button` a render hook drew.
   * Flat and frozen like every event's.
   *
   * Another plugin addresses one button by matcher:
   * `on("ui.press", { plugin: "explainer", element: "explain" }, ...)`.
   */
  export type UiPressInput = {
      /**
       * Whose `ui.render` hook drew the element.
       */
      plugin: string;
      /**
       * The `key` the hook gave its `Button`: its address, what a matcher names.
       */
      element: string;
      /**
       * The render component the element was drawn in (`ToolUse`,
       * `AssistantMessage`, ...).
       */
      component: RenderComponent;
      /**
       * Where the press came from, one literal per member, so
       * `if (e.surface === "terminal")` narrows `e`.
       */
      surface: RenderSurface;
  };

  /**
   * What a `ui.press` hook returns and what `next(e)` resolves to.
   *
   * Beneath every hook, core runs the element's `onPress` closure in its
   * plugin's environment with `e` as the chain left it, and answers
   * `{ element }`.
   */
  export type UiPressResult = {
      /**
       * Which handler the press reached, by its Button's `key`.
       */
      element: string;
  };

  /**
   * The argument of `ui.select`: a pick from a `Select` a render hook drew.
   * Flat and frozen like every event's.
   *
   * Another plugin addresses one picker by matcher:
   * `on("ui.select", { plugin: "roster", element: "peer" }, ...)`.
   */
  type UiSelectArgument = {
      /**
       * Whose `ui.render` hook drew the element.
       */
      plugin: string;
      /**
       * The `key` the hook gave its `Select`: its address, what a matcher names.
       */
      element: string;
      /**
       * The render component the element was drawn in (`AbovePrompt`,
       * `ToolUse`, ...).
       */
      component: RenderComponent;
      /**
       * Where the pick came from, one literal per member, so
       * `if (e.surface === "terminal")` narrows `e`.
       */
      surface: RenderSurface;
      /**
       * The picked option's value; a hook above may rewrite it for the plugins
       * beneath and the element's own handler.
       */
      value: string;
  };

  /**
   * What a `ui.select` hook returns and what `next(e)` resolves to.
   *
   * Beneath every hook, core runs the element's `onSelect` closure in its
   * plugin's environment with the value as the chain left it, and answers
   * `{ element, value }`.
   */
  type UiSelectResult = {
      /**
       * Which handler the pick reached, by its Select's `key`.
       */
      element: string;
      /**
       * What the handler received: the option's value as the chain left it.
       */
      value: string;
  };

  /**
   * The intersection of a union's members (`A | B` to `A & B`), by inferring
   * one parameter type from the contravariant positions.
   */
  type UnionToIntersection<U> = (U extends unknown ? (member: U) => void : never) extends (member: infer I) => void ? I : never;

  type UserPromptExpansionHookInput = BaseHookInput & {
      hook_event_name: 'UserPromptExpansion';
      expansion_type: 'slash_command' | 'mcp_prompt';
      command_name: string;
      command_args: string;
      command_source?: string;
      prompt: string;
  };

  type UserPromptSubmitHookInput = BaseHookInput & {
      hook_event_name: 'UserPromptSubmit';
      prompt: string;
      /**
       * Who authored/injected the prompt: `user` = submitted from the interactive composer, `sdk` = non-interactive entrypoint (`-p` / Agent SDK), `loop_wakeup` = dynamic /loop wakeup, `schedule_wakeup` = scheduled-task fire (CronCreate/routine), `system` = other machine-injected turns (peer/channel messages, task notifications, auto-continuation), `poll_event` = the poll-event channel enqueue-time pass (the hook fires when the host submits an event, before its delivery ack exists - a blocking verdict rejects the event). Payloads may omit it while the field rolls out.
       */
      source?: 'user' | 'sdk' | 'system' | 'loop_wakeup' | 'schedule_wakeup' | 'poll_event';
      session_title?: string;
  };

  /**
   * The result of a call on `$` as the hooks on its event see it: `{ value }`,
   * the call's answer, or `{ deny }`, the reason the caller's promise rejects.
   */
  type ValueOrDeny<Value> = {
      value: Value;
      deny?: undefined;
  } | {
      deny: string;
      value?: undefined;
  };

  type WorktreeCreateHookInput = BaseHookInput & {
      hook_event_name: 'WorktreeCreate';
      name: string;
  };

  type WorktreeRemoveHookInput = BaseHookInput & {
      hook_event_name: 'WorktreeRemove';
      worktree_path: string;
  };

  /**
   * The globals of a hooks module's environment: these and no others (no DOM,
   * no Node).
   */
  global {
    /**
     * The JSX factory (classic runtime, `@jsx h`; the engine prepends the
     * pragma): a plain-data element from a string tag or a component.
     */
    const h: (
      tag: string | ((props: never) => RenderNode | null | undefined),
      props: Record<string, unknown> | null | undefined,
      ...children: unknown[]
    ) => RenderNode | null | undefined

    /**
     * `<>...</>`: a column Box around the children.
     */
    const Fragment: (props: { children?: RenderNode[] }) => RenderElement

    /**
     * JSX over the element table: every tag is a constructor from
     * `$.ui.resolve(e)` (`const { Box, Text } = $.ui.resolve(e)`), typed by
     * its props; there are no intrinsic (string) tags.
     */
    namespace JSX {
      type Element = RenderElement
      type Children = RenderChildren
      type ElementType = (props: never) => RenderNode | null | undefined
      interface IntrinsicElements {}
      interface ElementChildrenAttribute {
        children: unknown
      }
      interface IntrinsicAttributes {
        key?: string
      }
    }

    interface AbortSignal {
      readonly aborted: boolean
      readonly reason: unknown
      throwIfAborted(): void
      addEventListener(
        type: 'abort',
        listener: () => void,
        options?: { once?: boolean },
      ): void
      removeEventListener(type: 'abort', listener: () => void): void
    }
    var AbortSignal: {
      prototype: AbortSignal
      abort(reason?: unknown): AbortSignal
      timeout(milliseconds: number): AbortSignal
      any(signals: AbortSignal[]): AbortSignal
    }
    interface AbortController {
      readonly signal: AbortSignal
      abort(reason?: unknown): void
    }
    var AbortController: {
      prototype: AbortController
      new (): AbortController
    }
    interface TextEncoder {
      readonly encoding: string
      encode(input?: string): Uint8Array
    }
    var TextEncoder: { prototype: TextEncoder; new (): TextEncoder }
    interface TextDecoder {
      readonly encoding: string
      decode(input?: ArrayBufferView | ArrayBuffer): string
    }
    var TextDecoder: { prototype: TextDecoder; new (label?: string): TextDecoder }
    interface URLSearchParams {
      append(name: string, value: string): void
      delete(name: string): void
      get(name: string): string | null
      getAll(name: string): string[]
      has(name: string): boolean
      set(name: string, value: string): void
      toString(): string
      forEach(callback: (value: string, key: string) => void): void
    }
    var URLSearchParams: {
      prototype: URLSearchParams
      new (init?: string | Record<string, string> | string[][]): URLSearchParams
    }
    interface URL {
      hash: string
      host: string
      hostname: string
      href: string
      readonly origin: string
      password: string
      pathname: string
      port: string
      protocol: string
      search: string
      readonly searchParams: URLSearchParams
      username: string
      toString(): string
      toJSON(): string
    }
    var URL: {
      prototype: URL
      new (url: string, base?: string | URL): URL
      canParse(url: string, base?: string): boolean
    }
    function atob(data: string): string
    function btoa(data: string): string
    function structuredClone<T>(value: T): T
    var crypto: {
      readonly subtle: {
        digest(
          algorithm: string | { name: string },
          data: ArrayBufferView | ArrayBuffer,
        ): Promise<ArrayBuffer>
      }
      randomUUID(): string
      getRandomValues<T extends ArrayBufferView>(array: T): T
    }
    var performance: { now(): number }
  }
}

// The inputs of the built-in tools this build has, from each tool's
// input schema. Merges into ToolCallInput (BuiltinToolInputs) so
// `e.tool === "Bash"` narrows to the tool's arguments.
declare module 'claude-code' {
  interface BuiltinToolInputs {
    Agent: {
      /** A short (3-5 word) description of the task */
      description: string
      /** The task for the agent to perform */
      prompt: string
      /** The type of specialized agent to use for this task */
      subagent_type?: string
      /** Agents run in the background by default; you will be notified when one completes. Set to false only when your very next action depends on this agent's result and nothing else could usefully happen while it runs — otherwise leave it in the background so the user can hand you other work. */
      run_in_background?: boolean
      /** Name for the spawned agent. Makes it addressable via SendMessage({to: name}) while running. */
      name?: string
      /** Deprecated; ignored. The session has a single implicit team. */
      team_name?: string
      /** Deprecated; ignored. Subagents inherit the parent session's permission mode; agent-definition frontmatter may override it. */
      mode?: "acceptEdits" | "auto" | "bypassPermissions" | "default" | "dontAsk" | "plan"
      /** Isolation mode. "worktree" creates a temporary git worktree so the agent works on an isolated copy of the repo. "remote" launches the agent in a remote cloud environment (always runs in background; availability is gated). */
      isolation?: "worktree" | "remote"
    }
    Bash: {
      /** The command to execute */
      command: string
      /** Optional timeout in milliseconds (max 600000) */
      timeout?: number
      /** Clear, concise description of what this command does in active voice. Never use words like "complex" or "risk" in the description - just describe what it does. Say what the command does in plain words: do not echo the command's text, its flags, or file paths - the user reads this description, often without seeing the command. For simple commands (git, npm, standard CLI tools), keep it brief (5-10 words): - ls → "List files in current directory" - git status → "Show working tree status" - npm install → "Install package dependencies" For commands that are harder to parse at a glance (piped commands, obscure flags, etc.), add enough context to clarify what it does: - find . -name "*.tmp" -exec rm {} \; → "Find and delete all .tmp files recursively" - git reset --hard origin/main → "Discard all local changes and match remote main" - curl -s url | jq '.data[]' → "Fetch JSON from URL and extract data array elements" */
      description?: string
      /** Set to true to run this command in the background. */
      run_in_background?: boolean
      /** Set this to true to dangerously override sandbox mode and run commands without sandboxing. */
      dangerouslyDisableSandbox?: boolean
    }
    CronCreate: {
      /** Standard 5-field cron expression in local time: "M H DoM Mon DoW" (e.g. "* /5 * * * *" = every 5 minutes, "30 14 28 2 *" = Feb 28 at 2:30pm local once). */
      cron: string
      /** The prompt to enqueue at each fire time. */
      prompt: string
      /** true (default) = fire on every cron match until deleted or auto-expired after 7 days. false = fire once at the next match, then auto-delete. Use false for "remind me at X" one-shot requests with pinned minute/hour/dom/month. */
      recurring?: boolean
      /** Has no effect — durable persistence is not available. All jobs are session-only (in-memory, gone when this Claude session ends). */
      durable?: boolean
    }
    CronDelete: {
      /** Job ID returned by CronCreate. */
      id: string
    }
    CronList: {}
    DesignSync: {
      method: "list_projects" | "get_project" | "list_files" | "get_file" | "finalize_plan" | "write_files" | "delete_files" | "register_assets" | "unregister_assets" | "create_project" | "report_validate"
      /** Required for all methods except list_projects and create_project */
      projectId?: string
      /** get_file: file path to read */
      path?: string
      /** finalize_plan: exact paths or glob patterns that will be written. `*` matches within a single segment, `**` matches any depth (e.g. `ui_kits/acme/** /*.html`). Max 3 `*`/`**` wildcards per pattern and max 256 entries — use broader globs to cover more files rather than enumerating paths. */
      writes?: string[]
      /** finalize_plan: exact paths or glob patterns that will be deleted (same syntax and limits as writes). */
      deletes?: string[]
      /** write_files/delete_files/register_assets/unregister_assets: token from a prior finalize_plan call */
      planId?: string
      /** write_files: file contents to write (max 256 per call — split larger bundles across multiple write_files calls under the same planId). */
      files?: Array<{
        /** Path within the project, e.g. components/button/index.html */
        path: string
        /** Path on disk to read file contents from, relative to the localDir approved at finalize_plan. Preferred for anything you have on disk: the tool reads, encodes, and uploads directly so the contents never enter the model context. Mutually exclusive with data. */
        localPath?: string
        /** Inline file contents (UTF-8 text, or base64 when encoding is "base64"). For small dynamic content only — anything you have on disk should use localPath instead. */
        data?: string
        /** Set to "base64" for binary inline data */
        encoding?: "base64"
        mimeType?: string
      }>
      /** delete_files: paths to delete. unregister_assets: paths whose Design System pane card should be removed. Max 256 per call — split larger batches across multiple calls under the same planId. */
      paths?: string[]
      /** create_project: name for the new design-system project */
      name?: string
      /** register_assets: cards to register in the Design System pane. Each path must be in the finalized plan. Run after write_files succeeds. Max 256 per call. */
      assets?: Array<{
        /** Short human-readable label ("Primary buttons"), not a path */
        name: string
        /** Project-relative path to the preview/spec file this card renders */
        path: string
        /** Variants shown ("Primary / secondary / ghost, 3 sizes") */
        subtitle?: string
        /** Card dimensions in the Design System pane */
        viewport?: {
          width: number
          height?: number
        }
        /** Free-form section label for the Design System pane (max 64 chars). Use the source design system's own categorization if it has one — e.g. Material has Buttons/Cards/Forms/etc., a corporate kit might have Actions/Forms/Navigation. Common foundational labels: "Type", "Colors", "Spacing", "Components", "Brand". The pane groups by the value you send. */
        group?: string
      }>
      /** finalize_plan: directory the bundle was built into. write_files with localPath may only read files inside this directory. Defaults to the current working directory. Resolved to an absolute path and shown in the permission prompt. */
      localDir?: string
      /** report_validate: aggregate from the final .render-check.json — counts only, no component names or paths. */
      counts?: {
        total: number
        bad: number
        thin: number
        variantsIdentical: number
        iterations: number
      }
    }
    Edit: {
      /** The absolute path to the file to modify */
      file_path: string
      /** The text to replace */
      old_string: string
      /** The text to replace it with (must be different from old_string) */
      new_string: string
      /** Replace all occurrences of old_string (default false) */
      replace_all?: boolean
    }
    EnterWorktree: {
      /** Optional name for a new worktree. Each "/"-separated segment may contain only letters, digits, dots, underscores, and dashes; max 64 chars total. A random name is generated if not provided. Mutually exclusive with `path`. */
      name?: string
      /** Path to an existing worktree to switch into instead of creating a new one. Must appear in `git worktree list` for the current repo — or, on first entry from the launch directory, for a repo nested inside it (multi-repo workspace). Mutually exclusive with `name`. */
      path?: string
    }
    ExitWorktree: {
      /** "keep" leaves the worktree and branch on disk; "remove" deletes both. */
      action: "keep" | "remove"
      /** Required true when action is "remove" and the worktree has uncommitted files or unmerged commits. The tool will refuse and list them otherwise. */
      discard_changes?: boolean
    }
    ListAgents: {
      /** Not available in this build; leave unset. */
      channel?: string
      /** Not available in this build; leave unset. */
      q?: string
    }
    ListMcpResourcesTool: {
      /** Optional server name to filter resources by */
      server?: string
    }
    Monitor: {
      /** Short human-readable description of what you are monitoring (shown in notifications). */
      description: string
      /** Kill the monitor after this deadline. Default 300000ms, max 3600000ms. Ignored when persistent is true. */
      timeout_ms: number
      /** Run for the lifetime of the session (no timeout). Use for session-length watches like PR monitoring or log tails. Stop with TaskStop. */
      persistent: boolean
      /** Shell command or script. Each stdout line is an event; exit ends the watch. */
      command?: string
      /** WebSocket to open. Each text frame is an event; binary frames are reported as a placeholder line. Socket close ends the watch. Cannot be combined with command. */
      ws?: {
        url: string
        protocols?: string[]
      }
    }
    NotebookEdit: {
      /** The absolute path to the Jupyter notebook file to edit (must be absolute, not relative) */
      notebook_path: string
      /** The ID of the cell to edit. When inserting a new cell, the new cell will be inserted after the cell with this ID, or at the beginning if not specified. */
      cell_id?: string
      /** The new source for the cell */
      new_source: string
      /** The type of the cell (code or markdown). If not specified, it defaults to the current cell type. If using edit_mode=insert, this is required. */
      cell_type?: "code" | "markdown"
      /** The type of edit to make (replace, insert, delete). Defaults to replace. */
      edit_mode?: "replace" | "insert" | "delete"
    }
    PushNotification: {
      /** The notification body. Keep it under 200 characters; mobile OSes truncate. */
      message: string
      status: "proactive"
    }
    Read: {
      /** The absolute path to the file to read */
      file_path: string
      /** The line number to start reading from. Only provide if the file is too large to read at once */
      offset?: number
      /** The number of lines to read. Only provide if the file is too large to read at once. */
      limit?: number
      /** Page range for PDF files (e.g., "1-5", "3", "10-20"). Only applicable to PDF files. Maximum 20 pages per request. */
      pages?: string
    }
    ReadMcpResourceDirTool: {
      /** The MCP server name */
      server: string
      /** The directory resource URI to list */
      uri: string
    }
    ReadMcpResourceTool: {
      /** The MCP server name */
      server: string
      /** The resource URI to read */
      uri: string
    }
    ReportFindings: {
      /** Effort level the review ran at */
      level?: "low" | "medium" | "high" | "xhigh" | "max"
      /** Verified findings, most-severe first; empty if none survived */
      findings: Array<{
        /** Repo-relative path of the file the finding is in */
        file: string
        /** 1-indexed line the finding anchors to */
        line?: number
        /** One-sentence statement of the defect */
        summary: string
        /** Compressed label for compact UI (≤60 chars): the claim alone, no rationale or consequence clause */
        short_summary?: string
        /** Concrete inputs/state → wrong output/crash */
        failure_scenario: string
        /** Short kebab-case slug of the finding type, e.g. "correctness", "simplification", "efficiency", "test-coverage" */
        category?: string
        /** Set when a verify pass ran; absent on inline-only reviews */
        verdict?: "CONFIRMED" | "PLAUSIBLE"
        /** Set ONLY when re-reporting after applying fixes: what happened to this finding */
        outcome?: "fixed" | "skipped" | "no_change_needed"
      }>
    }
    ScheduleWakeup: {
      /** Seconds from now to wake up. Clamped to [60, 3600] by the runtime. Required unless `stop` is true. */
      delaySeconds?: number
      /** One short sentence explaining the chosen delay. Goes to telemetry and is shown to the user. Be specific. Required unless `stop` is true. */
      reason?: string
      /** The /loop input to fire on wake-up. Pass the same /loop input verbatim each turn so the next firing re-enters the skill and continues the loop. For autonomous /loop (no user prompt), pass the literal sentinel `<<autonomous-loop-dynamic>>` instead (the dynamic-pacing variant, not the CronCreate-mode `<<autonomous-loop>>`). Required unless `stop` is true. */
      prompt?: string
      /** Set to true to end the dynamic loop immediately instead of scheduling another wakeup. When true, all other fields are ignored and no further wakeups fire. */
      stop?: boolean
      /** true = nothing changed (you checked and there is nothing to report). false = something happened worth keeping (edited a file, posted a message, advanced state, surfaced a finding). Consecutive noop:true ticks are collapsed in the user's terminal view and tracked as a streak. Required unless `stop` is true. */
      noop?: boolean
    }
    SendMessage: {
      /** Recipient: a name from ListAgents (append its " [ref]" only when a listing or an error shows one), a teammate name, "main", or a background agent's agentId */
      to: unknown & unknown
      /** A 5-10 word label for your own transcript row (not transmitted — the recipient previews the first line of `message`). Truncated to 200 characters rather than rejected. */
      summary?: string
      /** Plain text message content. The recipient's human sees only the FIRST LINE as a one-line preview until they expand it, so make the first line a clear, self-contained sentence saying what this is about — not a greeting, preamble, or bare @-mention. */
      message: string
      /** Ask a session ON THIS MACHINE to send you ONE notice when it next goes idle (finishes its turn with nothing queued) or exits — opt-in, one-shot, no polling. With a message: deliver it now AND subscribe. Without a message (omit it): a pure subscription that costs the other session nothing. */
      notify_when_idle?: boolean
    }
    Skill: {
      /** The name of a skill from the available-skills list. Do not guess names. */
      skill: string
      /** Optional arguments for the skill */
      args?: string
    }
    TaskOutput: {
      /** The task ID to get output from */
      task_id: string
      /** Whether to wait for completion */
      block: boolean
      /** Max wait time in ms */
      timeout: number
    }
    TaskStop: {
      /** The ID of the background task to stop. Agent-team teammates and named background agents are also accepted by agent ID or name. */
      task_id?: string
      /** Deprecated: use task_id instead */
      shell_id?: string
    }
    ToolSearch: {
      /** Query to find deferred tools. Use "select:<tool_name>" for direct selection, or keywords to search. */
      query: string
      /** Maximum number of results to return (default: 5) */
      max_results: number
    }
    Workflow: {
      /** Self-contained workflow script. Must begin with `export const meta = { name, description, phases }` (pure literal, no computed values) followed by the script body using agent()/parallel()/pipeline()/phase(). */
      script?: string
      /** Name of a predefined workflow (built-in or from .claude/workflows/). Resolves to a self-contained script. */
      name?: string
      /** Ignored — set the workflow description in the script's `meta` block. */
      description?: string
      /** Ignored — set the workflow title in the script's `meta` block. */
      title?: string
      /** Optional input value exposed to the script as the global `args`, verbatim. Pass arrays/objects as actual JSON values, NOT as a JSON-encoded string — a stringified list breaks `args.filter`/`args.map` in the script. Use for parameterized named workflows (e.g. a research question). */
      args?: unknown
      /** Path to a workflow script file on disk. Every Workflow invocation persists its script under the session directory and returns the path in the tool result. To iterate, edit that file with Write/Edit and re-invoke Workflow with the same `scriptPath` instead of re-sending the full script. Takes precedence over `script` and `name`. */
      scriptPath?: string
      /** Run ID of a prior Workflow invocation to resume from. Completed agent() calls with unchanged (prompt, opts) return their cached results instantly; only edited or new calls re-run. Same-session only. Stop the prior run first (TaskStop) before resuming. */
      resumeFromRunId?: string
    }
    Write: {
      /** The absolute path to the file to write (must be absolute, not relative) */
      file_path: string
      /** The content to write to the file */
      content: string
    }
  }
}

// The structured results of the same tools, from each tool's output
// schema. Merges into ToolCallResult (BuiltinToolResults) so after
// `e.tool === "Bash"` the `result` of `next(e)` is the tool's record.
declare module 'claude-code' {
  interface BuiltinToolResults {
    Agent: {
      agentId: string
      /** @internal Count of leading harness-authored content blocks (hand-back provenance bookkeeping; not a stable consumer field) */
      harnessNoteCount?: number
      /** @internal Count of trailing harness-authored content blocks (hand-back provenance bookkeeping; not a stable consumer field) */
      harnessTailCount?: number
      /** @internal Fingerprint binding the harness section counts to the exact content they were computed against; a hook rewrite invalidates the counts rather than misplacing rewritten bytes */
      harnessSectionHash?: string
      agentType?: string
      /** @internal How the report reached this result under the subagent hand-back contract: 'send' = the child's classified SubagentHandback delivery, 'flagged' = that delivery under a SECURITY WARNING, 'withheld' = nothing was delivered (not a stable consumer field) */
      handback?: "send" | "flagged" | "withheld"
      content: Array<{
        type: "text"
        text: string
        citations?: unknown[] | null
      }>
      resolvedModel?: string
      modelsUsed?: string[]
      totalToolUseCount: number
      totalDurationMs: number
      totalTokens: number
      usage: {
        input_tokens: number
        output_tokens: number
        cache_creation_input_tokens: number | null
        cache_read_input_tokens: number | null
        server_tool_use: {
          web_search_requests: number
          web_fetch_requests: number
        } | null
        service_tier: string | null
        cache_creation: {
          ephemeral_1h_input_tokens: number
          ephemeral_5m_input_tokens: number
        } | null
        inference_geo?: string | null
        speed?: string | null
        iterations?: unknown
        output_tokens_details?: {
          thinking_tokens?: number | null
        } | null
      }
      toolStats?: {
        readCount: number
        searchCount: number
        bashCount: number
        editFileCount: number
        linesAdded: number
        linesRemoved: number
        otherToolCount: number
        frameCount?: number
      }
      status: "completed"
      prompt: string
      worktreePath?: string
      worktreeBranch?: string
    } | {
      status: "async_launched"
      isAsync?: true
      /** The ID of the async agent */
      agentId: string
      /** The description of the task */
      description: string
      /** Model in use at the backgrounding transition (a pre-background swap is reflected here) */
      resolvedModel?: string
      /** Ordered distinct models used before backgrounding (length > 1 means a mid-run swap) */
      modelsUsed?: string[]
      /** The prompt for the agent */
      prompt: string
      /** Path to the output file for checking agent progress */
      outputFile: string
      /** Whether the calling agent has Read/Bash tools to check progress */
      canReadOutputFile?: boolean
    } | {
      status: "remote_launched"
      /** The ID of the remote agent task */
      taskId: string
      /** The URL of the cloud session */
      sessionUrl: string
      /** The description of the task */
      description: string
      /** The prompt for the agent */
      prompt: string
      /** Path to the output file for checking agent progress */
      outputFile: string
    }
    Bash: {
      /** The standard output of the command */
      stdout: string
      /** The standard error output of the command */
      stderr: string
      /** Path to raw output file for large MCP tool outputs */
      rawOutputPath?: string
      /** Whether the command was interrupted */
      interrupted: boolean
      /** Flag to indicate if stdout contains image data */
      isImage?: boolean
      /** ID of the background task if command is running in background */
      backgroundTaskId?: string
      /** True if the user manually backgrounded the command with Ctrl+B */
      backgroundedByUser?: boolean
      /** @internal True if a plugin's turn abort moved the running command to the background */
      backgroundedByTurnAbort?: boolean
      /** @internal True if the command was moved to the background so a message queued for the model could reach it */
      backgroundedToDeliverMessage?: boolean
      /** Set when the command hit its timeout and was auto-backgrounded; the timeout value in ms */
      timedOutAfterMs?: number
      /** Model-facing note that the session cwd was not changed by a backgrounded command containing a directory-change builtin (cd/pushd/popd/chdir) */
      backgroundCwdHint?: string
      /** True when this backgrounded command is owned by a synchronous subagent and is therefore terminated when that agent gives its final response; absent when the command survives (main loop, async subagents) */
      backgroundEndsWithFinalResponse?: true
      /** Flag to indicate if sandbox mode was overridden */
      dangerouslyDisableSandbox?: boolean
      /** Semantic interpretation for non-error exit codes with special meaning */
      returnCodeInterpretation?: string
      /** Whether the command is expected to produce no output on success */
      noOutputExpected?: boolean
      /** Structured content blocks */
      structuredContent?: unknown[]
      /** Path to the persisted full output in tool-results dir (set when output is too large for inline) */
      persistedOutputPath?: string
      /** Total size of the output in bytes (set when output is too large for inline) */
      persistedOutputSize?: number
      /** Model-facing note listing readFileState entries whose mtime bumped during this command (set when WRITE_COMMAND_MARKERS matches) */
      staleReadFileStateHint?: string
      /** Model-facing system-reminder appended when a gh command reports a GitHub API rate-limit error */
      ghRateLimitHint?: string
      /** Structured classification of git/gh operations detected in this command (commit/push/merge/rebase/PR). Client-facing — lets clients render git activity without re-parsing stdout; not surfaced to the model. */
      gitOperation?: {
        commit?: {
          sha: string
          kind: "committed" | "amended" | "cherry-picked"
          branch?: string
        }
        push?: {
          branch: string
        }
        branch?: {
          ref: string
          action: "merged" | "rebased"
        }
        pr?: {
          number: number
          url?: string
          action: "created" | "edited" | "merged" | "commented" | "closed" | "reopened" | "ready" | "draft" | "auto-merge-enabled" | "auto-merge-disabled"
        }
      }
    }
    CronCreate: {
      id: string
      humanSchedule: string
      recurring: boolean
      durable?: boolean
    }
    CronDelete: {
      id: string
    }
    CronList: {
      jobs: {
        id: string
        cron: string
        humanSchedule: string
        prompt: string
        recurring?: boolean
        durable?: boolean
      }[]
    }
    DesignSync: {
      method: "list_projects"
      notice?: string
      projects: {
        projectId: string
        name: string
        ownerDisplayName?: string
        isOwned?: boolean
        updatedAt?: string
      }[]
    } | {
      method: "get_project"
      notice?: string
      projectId: string
      name: string
      type?: string
      ownerDisplayName?: string
      isOwned?: boolean
      canEdit?: boolean
    } | {
      method: "list_files"
      notice?: string
      paths: string[]
    } | {
      method: "get_file"
      notice?: string
      path: string
      content: string
      contentType: string
      isBase64: boolean
      truncated: boolean
    } | {
      method: "finalize_plan"
      notice?: string
      planId: string
      writes: string[]
      deletes: string[]
    } | {
      method: "write_files"
      notice?: string
      written: number
    } | {
      method: "delete_files"
      notice?: string
      deleted: number
    } | {
      method: "register_assets"
      notice?: string
      registered: number
    } | {
      method: "unregister_assets"
      notice?: string
      unregistered: number
    } | {
      method: "create_project"
      notice?: string
      projectId: string
      name: string
    } | {
      method: "report_validate"
      notice?: string
    }
    Edit: {
      /** The file path that was edited */
      filePath: string
      /** The original string that was replaced */
      oldString: string
      /** The new string that replaced it */
      newString: string
      /** The original file contents before editing */
      originalFile: string | null
      /** Diff patch showing the changes */
      structuredPatch: {
        oldStart: number
        oldLines: number
        newStart: number
        newLines: number
        lines: string[]
      }[]
      /** Whether the user modified the proposed changes */
      userModified: boolean
      /** Whether all occurrences were replaced */
      replaceAll: boolean
      gitDiff?: {
        filename: string
        status: "modified" | "added"
        additions: number
        deletions: number
        changes: number
        patch: string
        /** GitHub owner/repo when available */
        repository?: string | null
      }
    }
    EnterWorktree: {
      worktreePath: string
      worktreeBranch?: string
      message: string
    }
    ExitWorktree: {
      action: "keep" | "remove"
      originalCwd: string
      worktreePath: string
      worktreeBranch?: string
      tmuxSessionName?: string
      discardedFiles?: number
      discardedCommits?: number
      message: string
    }
    ListAgents: {
      /** Formatted list of reachable agents */
      listing: string
    }
    ListMcpResourcesTool: Array<{
      /** Resource URI */
      uri: string
      /** Resource name */
      name: string
      /** MIME type of the resource */
      mimeType?: string
      /** Resource description */
      description?: string
      /** Server that provides this resource */
      server: string
    }>
    Monitor: {
      /** ID of the background monitor task. */
      taskId: string
      /** Timeout deadline in milliseconds (0 when persistent). */
      timeoutMs: number
      /** No timeout — runs until TaskStop or session end. */
      persistent?: boolean
    }
    NotebookEdit: {
      /** The new source code that was written to the cell */
      new_source: string
      /** The previous cell source (replace/delete only). Enables cell-relative diff rendering without re-reading the notebook. */
      old_source?: string
      /** The ID of the cell that was edited */
      cell_id?: string
      /** The type of the cell */
      cell_type: "code" | "markdown"
      /** The programming language of the notebook */
      language: string
      /** The edit mode that was used */
      edit_mode: string
      /** Error message if the operation failed */
      error?: string
      /** The path to the notebook file */
      notebook_path: string
      /** The original notebook content before modification */
      original_file: string
      /** The updated notebook content after modification */
      updated_file: string
    }
    PushNotification: {
      message: string
      pushSent?: boolean
      localSent?: boolean
      disabledReason?: "config_off" | "user_present" | "no_transport"
      /** ISO timestamp captured at tool execution on the emitting process. Optional — resumed sessions replay pre-sentAt outputs verbatim. */
      sentAt?: string
    }
    Read: {
      type: "text"
      file: {
        /** The path to the file that was read */
        filePath: string
        /** The content of the file */
        content: string
        /** Number of lines in the returned content */
        numLines: number
        /** The starting line number */
        startLine: number
        /** Total number of lines in the file */
        totalLines: number
        /** True when a whole-file read was auto-paginated because it exceeded the token cap (the content is a partial first page). A programmatic signal for internal consumers; survives output reconstruction (unlike the render-time banner). */
        truncatedByTokenCap?: boolean
      }
      /** Set when this Read completed a saved Artifact source file: the Artifact and the version of it that now counts as viewed. */
      artifactRead?: {
        slug: string
        ver: string
      }
    } | {
      type: "image"
      file: {
        /** Base64-encoded image data */
        base64: string
        /** The MIME type of the image */
        type: "image/jpeg" | "image/png" | "image/gif" | "image/webp"
        /** Original file size in bytes */
        originalSize: number
        /** Image dimension info for coordinate mapping */
        dimensions?: {
          /** Original image width in pixels */
          originalWidth?: number
          /** Original image height in pixels */
          originalHeight?: number
          /** Displayed image width in pixels (after resizing) */
          displayWidth?: number
          /** Displayed image height in pixels (after resizing) */
          displayHeight?: number
        }
      }
    } | {
      type: "notebook"
      file: {
        /** The path to the notebook file */
        filePath: string
        /** Array of notebook cells */
        cells: unknown[]
      }
    } | {
      type: "pdf"
      file: {
        /** The path to the PDF file */
        filePath: string
        /** Base64-encoded PDF data */
        base64: string
        /** Original file size in bytes */
        originalSize: number
      }
    } | {
      type: "parts"
      file: {
        /** The path to the PDF file */
        filePath: string
        /** Original file size in bytes */
        originalSize: number
        /** Number of pages extracted */
        count: number
        /** Directory containing extracted page images */
        outputDir: string
      }
      /** Document page number of the first extracted page (1 when no range was requested); labels the page images in the model-facing tool_result */
      firstPage?: number
      /** Extracted page images, in page order. Present only transiently in-process: the page image bytes are delivered solely as image blocks in the model-facing tool_result content and are not retained on the tool_use_result, so this key is absent on the emitted/persisted result */
      pages?: Array<{
        /** Base64-encoded page image; empty when the page could not be processed */
        base64: string
        /** The MIME type of the image */
        mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp"
        /** Why the page could not be processed as an image; set only when base64 is empty */
        error?: string
      }>
    } | {
      type: "file_unchanged"
      file: {
        /** The path to the file */
        filePath: string
      }
      /** Set when the dedup matched a startup-seeded entry (CLAUDE.md / nested memory) rather than a prior Read tool_result */
      source?: "seeded"
    }
    ReadMcpResourceDirTool: {
      /** Direct children of the directory resource. Subdirectories appear with mimeType "inode/directory". */
      resources: Array<{
        /** Child resource URI */
        uri: string
        /** Child resource name */
        name: string
        /** Child MIME type */
        mimeType?: string
      }>
      /** Human-readable error when the server could not list the directory */
      error?: string
    }
    ReadMcpResourceTool: {
      contents: Array<{
        /** Resource URI */
        uri: string
        /** MIME type of the content */
        mimeType?: string
        /** Text content of the resource */
        text?: string
        /** Path where binary blob content was saved */
        blobSavedTo?: string
      }>
      /** Human-readable error when the server could not read the resource */
      error?: string
    }
    ReportFindings: {
      /** Number of findings reported */
      count: number
      /** Effort level the review ran at */
      level?: "low" | "medium" | "high" | "xhigh" | "max"
      /** Echoed for the result body */
      findings: Array<{
        /** Repo-relative path of the file the finding is in */
        file: string
        /** 1-indexed line the finding anchors to */
        line?: number
        /** One-sentence statement of the defect */
        summary: string
        /** Compressed label for compact UI (≤60 chars): the claim alone, no rationale or consequence clause */
        short_summary?: string
        /** Concrete inputs/state → wrong output/crash */
        failure_scenario: string
        /** Short kebab-case slug of the finding type, e.g. "correctness", "simplification", "efficiency", "test-coverage" */
        category?: string
        /** Set when a verify pass ran; absent on inline-only reviews */
        verdict?: "CONFIRMED" | "PLAUSIBLE"
        /** Set ONLY when re-reporting after applying fixes: what happened to this finding */
        outcome?: "fixed" | "skipped" | "no_change_needed"
      }>
    }
    ScheduleWakeup: {
      /** Epoch ms timestamp when the next wakeup will fire */
      scheduledFor: number
      /** Actual delay used after clamping to runtime bounds */
      clampedDelaySeconds: number
      /** True if the requested delaySeconds was outside [60, 3600] */
      wasClamped: boolean
      /** True when the model ended the loop via `stop: true` */
      stopped?: boolean
      /** How many pending dynamic-loop wakeups stop:true cancelled. 0 means nothing was pending — a recurring /loop cron is not cancelled by stop:true. */
      cancelledWakeups?: number
    }
    SendMessage: unknown
    Skill: {
      /** Whether the skill is valid */
      success: boolean
      /** The name of the skill */
      commandName: string
      /** Tools allowed by this skill */
      allowedTools?: string[]
      /** Resolved model the skill turn runs on when a frontmatter model override took effect; omitted otherwise */
      model?: string
      /** Execution status */
      status?: "inline"
      /** True when the skill instructions were loaded read-only (nothing was executed) */
      readOnly?: boolean
    } | {
      /** Whether the skill completed successfully */
      success: boolean
      /** The name of the skill */
      commandName: string
      /** Execution status */
      status: "forked"
      /** The ID of the sub-agent that executed the skill */
      agentId: string
      /** The result from the forked skill execution */
      result: string
      /** True when the sub-agent was launched in the background: `result` describes the launch, and the skill outcome arrives later as a task notification. */
      background?: boolean
    }
    TaskOutput: unknown
    TaskStop: {
      /** Status message about the operation */
      message: string
      /** The ID of the task that was stopped */
      task_id: string
      /** The type of the task that was stopped */
      task_type: string
      /** The command or description of the stopped task */
      command?: string
    }
    ToolSearch: {
      matches: string[]
      query: string
      total_deferred_tools: number
      pending_mcp_servers?: string[]
      failed_mcp_servers?: {
        name: string
        errorCode?: string
        error?: string
      }[]
    }
    Workflow: {
      status: "async_launched" | "remote_launched"
      taskId: string
      /** TaskType of the registered background task — 'local_workflow' for in-process runs, 'remote_agent' when remote:true dispatches to CCR. Set on all new writes; absent only on transcripts written before this field existed. */
      taskType?: "local_workflow" | "remote_agent"
      /** meta.name from the workflow script — same value as task_started.workflow_name. Set on all new writes; absent only on transcripts written before this field existed. */
      workflowName?: string
      /** Local workflow run identifier for resumeFromRunId. Absent for remote_launched (the CCR session URL is the resume handle there) and on transcripts written before this field existed. */
      runId?: string
      summary?: string
      /** Directory where subagent transcripts are written during execution */
      transcriptDir?: string
      /** Path to the persisted workflow script for this invocation. Editable via Write/Edit; pass back as `scriptPath` to re-run without resending the script. */
      scriptPath?: string
      /** CCR session URL when status is remote_launched */
      sessionUrl?: string
      /** Non-blocking heads-up (e.g. local git state diverges from the pushed branch the cloud session will clone) */
      warning?: string
      /** Set if syntax check failed */
      error?: string
    }
    Write: {
      /** Whether a new file was created or an existing file was updated */
      type: "create" | "update"
      /** The path to the file that was written */
      filePath: string
      /** The content that was written to the file */
      content: string
      /** Diff patch showing the changes (empty when nothing changed, the diff timed out, or — with originalFile null on an update — the previous content was too large to diff) */
      structuredPatch: {
        oldStart: number
        oldLines: number
        newStart: number
        newLines: number
        lines: string[]
      }[]
      /** The original file content before the write (null for new files, or when the previous content was too large to include) */
      originalFile: string | null
      gitDiff?: {
        filename: string
        status: "modified" | "added"
        additions: number
        deletions: number
        changes: number
        patch: string
        /** GitHub owner/repo when available */
        repository?: string | null
      }
      /** True when the user edited the proposed content in the permission dialog before accepting */
      userModified?: boolean
    }
  }
}
