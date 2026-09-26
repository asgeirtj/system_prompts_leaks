/**
 * The `user` capability -- facts about the person viewing this page, and
 * about the people your shared state refers to. Obtain the namespace with
 * `const user = await claude.use("user")`; `null` (no viewer here, or the
 * view cannot run the capability) matches the all-absent defaults for
 * boolean and string reads -- `user?.isOwner() ?? false` gives the same
 * answer they would. Object reads need their own null branch: the
 * defaults' `profiles(ids)` resolves renderable entries, while a `null`
 * namespace has nothing to call.
 *
 * ONE rule for the whole namespace: every read resolves a value and NEVER
 * REJECTS -- a display string ("" when not available to this viewer), an
 * optional datum (null when not available), [] for a search, booleans false,
 * or an object whose fields follow those same rules. "Not available" covers
 * every reason at once (no viewer, scope not declared, organization policy,
 * viewer outside the organization, degraded session) and there is nothing to
 * catch. The spelling is fixed: display strings (name) are "" when withheld or
 * unknown -- falsy, so `p.name || "Someone"` renders and `if (p.name)`
 * discriminates (note: ?? does NOT catch "" -- use ||); optional data (id,
 * email) is null; never an absent key, never undefined.
 *
 * Scopes gate FIELDS, uniformly, everywhere those fields appear -- me(),
 * profiles(), search() and the per-field accessors alike:
 *
 *   (nothing)                                                // isOwner, canEdit, can; me() with id/email null, name ""
 *   capabilities: { user: {} }                               // + id (yours); profiles() resolves, names stay ""
 *   capabilities: { user: { scopes: ["profile"] } }          // + names, avatars, search()
 *   capabilities: { user: { scopes: ["profile","email"] } }  // + email (yours and theirs)
 *
 * "profile" is OIDC-profile-shaped: display identity only -- it never
 * includes email. A declared scope is a ceiling, not a guarantee: any governed
 * field may still be "" / null for a given viewer (each also needs the
 * viewer's organization to allow it).
 *
 * Every viewer receives IDENTICAL HTML: these reads change what you RENDER,
 * never what a viewer can extract from source. STORE ONLY IDS -- from id(),
 * (await me()).id, or a search() hit's .id -- never a name, avatar, email or
 * Profile object: names differ per viewer, freeze at write time, and outlive
 * people. Names and emails are OTHER PEOPLE'S INPUT: set them with textContent.
 */
declare namespace Claude {
  namespace user {
    // -- universal: no declaration needed --------------------------------------

    /** This person owns the artifact. false when there is no viewer. */
    function isOwner(): Promise<boolean>;

    /** This person can publish new PAGE VERSIONS -- i.e. artifact publish would
     *  not reject not_writer; read it up front instead of waiting for the
     *  rejection. For `db` it is the `admin` level: gate the controls a
     *  declared rule reserves for `admin` on this. It does NOT mean "may
     *  write SHARED db documents" -- by default the `interact` level writes
     *  them too -- and neither does id(): a view-only member has an id and
     *  cannot write, while an editor invited from outside the organization
     *  writes and has none. For that question ask can("data.write"); when
     *  it resolves null, keep the control and let a refused write decide
     *  rather than falling back to this. false when there is no viewer. */
    function canEdit(): Promise<boolean>;

    /** Whether this person can do one named thing on this artifact, as the
     *  platform decided it for this view: true or false. null = the platform
     *  told this page nothing (for example an older host, a page opened
     *  top-level, a viewer from outside the organization, or no viewer), and
     *  then every name resolves null: null is NOT "cannot", so decide without
     *  can(): keep a shared-data control and let a refused write decide;
     *  for the two file-writing names, canEdit(). The names:
     *    "data.write"      change the artifact's SHARED `db` documents
     *    "files.write"     publish the artifact's own files and page versions
     *    "assets.write"    upload and delete assets
     *  When the platform answers at all, any other string resolves false, so
     *  a page written for a name a later host adds simply does not offer that
     *  control on this one. The answer is advice about what to OFFER; the
     *  server enforces every real action regardless, and may refuse one.
     *  "data.write" is about shared documents only: a viewer's own
     *  data/users/<id>/ subtree follows that path's own `db` rule, so write
     *  there and handle the rejection. Fixed for the life of a view. can()
     *  changes no other member's answer. Needs no declaration. */
    function can(capability: string): Promise<boolean | null>;

    /** The viewer, in ONE await. NEVER null and never rejects: each field is
     *  ""/null/false exactly when the accessor of the same name would be, so
     *  (await me()).id === await id(), always, and a Profile's isMe is exactly
     *  p.id === that. avatarUrl and color are ALWAYS renderable (a generic
     *  mark and a neutral color when this viewer has no identity here); name
     *  is "" then -- render `me.name || "you"`. Works with no declaration at
     *  all (id/email null, name ""; isOwner/canEdit still real). The per-field
     *  accessors below are projections of this object -- use whichever reads
     *  better. */
    function me(): Promise<Viewer>;

    interface Viewer {
      /** Your id in this artifact's organization: an opaque token (u_...);
       *  needs capabilities:{user:{}}. null = no identity on this page (signed
       *  out, outside the organization, or the capability undeclared). The
       *  value `db` recognizes in data/users/<id>/. */
      id: string | null;
      /** Your display name; needs scope "profile". "" when not available to
       *  this viewer -- falsy on purpose: `me.name || "you"`. */
      name: string;
      /** Always an <img>-able URL: your profile photo, served from this
       *  artifact's own origin, when you have one and claude.ai shows it here;
       *  otherwise a data: URL (initials drawn on `color`, or a generic mark
       *  when you have no identity here). Opaque and viewer-relative: render
       *  it, never parse or store it. */
      avatarUrl: string;
      /** Stable per account across every artifact, viewer and session; shell
       *  palette; contrast-safe in light and dark. Cursors, chips, borders. */
      color: string;
      /** Needs scope "email" AND the viewer's organization allowing it. */
      email: string | null;
      isOwner: boolean;
      canEdit: boolean;
    }

    // -- capabilities: { user: {} } -------------------------------------------

    /** The viewer's id: an opaque per-ORGANIZATION token -- the same for you
     *  on every artifact your organization owns and in every capability
     *  (`db`'s private data/users/<id>/ subtree, rows you attribute, votes you
     *  count); meaningless outside the organization; severed if the account is
     *  deleted. Opaque: never parse, shorten, or show it. null = no identity
     *  here. Resolve it to a person with profiles() -- never store the name it
     *  resolved to. */
    function id(): Promise<string | null>;

    /** One person AS THIS VIEWER SEES THEM, NOW. Persist only `id` -- never
     *  write name / email / avatarUrl / color into `db` or page source (they
     *  differ per viewer, go stale, and outlive people); resolve
     *  again with profiles() when rendering. Two viewers of one page may
     *  legitimately see different names for the same id. */
    interface Profile {
      /** The person's id -- the value THEIR id() returns in this organization
       *  (an opaque token), and the ONLY thing about them to write into state.
       *  Every id you pass to profiles() gets an entry: a person this viewer
       *  cannot resolve comes back with name "". */
      id: string;
      /** Their current display name, or "" when this viewer cannot resolve
       *  them (another organization, no longer resolvable, directory switched
       *  off, scope missing, or a stray id -- deliberately one signal). Falsy
       *  on purpose: render `p.name || "Someone"`, branch with `if (p.name)`.
       *  Note ?? does not catch "" -- use ||. User-set text: set it with
       *  textContent. */
      name: string;
      /** Never null. An <img>-able URL: their profile photo, served from this
       *  artifact's own origin, when they have one and claude.ai shows it to
       *  this viewer; otherwise a data: URL (initials on `color`, or a generic
       *  mark when unresolved). Opaque and viewer-relative: render it, never
       *  parse or store it. */
      avatarUrl: string;
      /** Stable per account; every page and every viewer gets the same value. */
      color: string;
      /** null unless scope "email" is declared AND the viewer's organization
       *  allows it AND the person is resolvable. Guard before rendering. */
      email: string | null;
      /** p.id === (await id()). Never store it. */
      isMe: boolean;
    }

    /** Resolve the people your state refers to. BATCH-ONLY BY DESIGN (there
     *  is deliberately no single-id form): collect the ids you are about to
     *  draw, resolve, then look up synchronously --
     *
     *      const ps = await user.profiles(idsOnScreen);
     *      cell.textContent = ps[id].name || "Someone";  img.src = ps[id].avatarUrl;
     *
     *  Call it INSIDE your render path, every time you render. Repeated calls
     *  are cheap BY CONTRACT: entries are cached for the page's lifetime,
     *  concurrent calls are coalesced into one round-trip, and cached entries
     *  are refreshed in the background -- so "call it again" is always right,
     *  and hoisting one call to load time goes stale the moment someone new
     *  appears in shared state. Keys are EXACTLY the unique ids you passed:
     *  unknown, foreign, erased or junk ids get an unresolved entry (name "",
     *  generic avatar, stable color); nothing is added, nothing is dropped.
     *  Any length (the shell chunks and dedupes; absurd inputs resolve as
     *  unresolved entries with one console warning). A bare string is treated
     *  as [string]. Without scope "profile" every entry is unresolved. A hit
     *  from search() is already warm. Never rejects. */
    function profiles(
      ids: readonly string[] | string,
    ): Promise<Record<string, Profile>>;

    // -- scope "profile" -------------------------------------------------------

    /** (await me()).name -- your display name, or "" when not available to
     *  this viewer (falsy: `(await name()) || "you"`). */
    function name(): Promise<string>;
    /** Your avatar URL (photo, or an initials data: URL), or null when you
     *  have no identity here. Prefer (await me()).avatarUrl, which is never
     *  null. */
    function avatarUrl(): Promise<string | null>;

    /** An inline typeahead over the viewer's ORGANIZATION, for an @-mention
     *  or assignee picker you render yourself. A typeahead, not a roster: at
     *  most 8 Profiles, best match first, relevance-ranked and non-exhaustive;
     *  it will never grow a limit option, a cursor, or a "more" flag.
     *  search("") resolves the audience-relative DEFAULT SET (you, plus ids
     *  this page already resolved) -- call it on focus so the menu opens
     *  pre-seeded; empty on a page that has resolved no one. Any other
     *  query searches the directory by name
     *  or email; email VALUES are returned only under the "email" scope.
     *  [] means no match OR unavailable
     *  (signed out, another organization, a viewer who cannot edit, an
     *  organization that withholds colleagues), never "keep typing". Call it
     *  straight from oninput: the platform debounces, and a call superseded
     *  by a newer search() resolves with the NEWER call's result at the same
     *  moment, so naive handlers always paint the final list. Hits are the
     *  same objects profiles() would return right now. Store hit.id, never
     *  the hit; put hit.name / hit.email into rows with textContent (a hit
     *  always has a non-empty name -- unnamed rows are never offered).
     *  A search finds people to pick from and does nothing else: it notifies
     *  no one and grants no access. Never rejects. */
    function search(query: string): Promise<Profile[]>;

    // -- scope "email" ---------------------------------------------------------

    /** (await me()).email -- your own email, or null. */
    function email(): Promise<string | null>;
  }
}

interface ClaudeCapabilityMap {
  user: typeof Claude.user;
}
