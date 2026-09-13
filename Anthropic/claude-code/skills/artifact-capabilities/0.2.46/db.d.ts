/**
 * The `db` capability — a persistent, realtime document store for this
 * artifact, shared by its viewers.
 *
 * One store per artifact: JSON documents at slash-separated paths
 * (`collection/doc`, nesting deeper as `collection/doc/subcollection/doc`),
 * surviving reloads, republishes, and sessions. The store is created on
 * the first write and erased when the artifact is deleted. Reads and
 * subscriptions see other viewers' writes live. Declare
 * `capabilities: {db: {}}` — a declaring artifact is organization-internal
 * and cannot be shared publicly, so every reader and writer is a
 * signed-in member of the owner's organization.
 *
 * ACCESS RULES. By default every viewer reads and writes shared
 * documents and each viewer's own `data/users/<id>/` subtree is private.
 * To change who may read or write where, declare rules keyed on the
 * viewer's sharing level — `interact` (can view), `admin` (can edit),
 * `owner`, plus `view`, the lowest level, for paths that should stay
 * readable by everyone the server admits (every signed-in viewer of a
 * db artifact is at least `interact`, so `view` only ever widens reads,
 * never writes) — as the minimum level for each action at a path and below:
 *   capabilities: { db: { rules: [
 *     { path: "", read: "interact", write: "admin" },
 *     { path: "data/users/{self}", write: "interact" },
 *   ] } }
 * reads "anyone who can open the page reads shared data, only editors
 * write it, and every viewer writes their own subtree". A rule applies
 * to its path and everything below; a deeper rule overrides it there and
 * may be stricter or looser. A level left unset inherits from the nearest
 * rule above (the root defaults to read: "view", write: "interact").
 * Writing implies reading: a rule's write level is never below its read
 * level. A path ending in `/{self}` names each viewer's own subtree under
 * that prefix: nobody else — the artifact's owner included — sees a
 * sibling's subtree unless a rule at the prefix opens it, and `{self}`
 * must be the last segment. `{self}` works under ANY prefix, not only
 * `data/users`: "everyone reads the votes, each viewer writes only
 * their own" is
 *   { path: "votes", read: "view", write: "admin" },
 *   { path: "votes/{self}", write: "interact" }
 * with each viewer writing `votes/<their id>` (or documents below it) —
 * a rule declared AT the prefix of a `{self}` rule (here `votes`) must
 * set BOTH `read` and `write`, or the declaration is rejected at
 * publish; with no prefix rule, siblings' subtrees stay private as under
 * `data/users`. At most 64 rules; paths follow the
 * document-path grammar below. The owner meets every level, so level
 * rules never limit the owner; only `{self}` privacy does. A call below
 * the minimum fails the same way as a sibling's `{self}` subtree: a read
 * sees a non-existent document and a write rejects `invalid_argument` —
 * so gate controls on the viewer's level up front (the `user`
 * capability's `canEdit()` = admin, `isOwner()` = owner) rather than
 * branching on the code. Rules take effect for
 * the live version on the next call after it goes live; `{db: {}}`
 * restores the defaults.
 * AVAILABILITY is a
 * per-view fact: obtain the namespace with `await claude.use("db")` —
 * it resolves `null` when this view cannot run db (not served, not
 * granted at initialization, or failed to load) — and handle the
 * lifecycle rejection codes on calls and the `onSnapshot` error
 * callback.
 */

/** Rejection shape for every method and the `onSnapshot` error
 * callback. `message` is human-readable but not localized. */
type DbError = {
  code: DbErrorCode;
  message: string;
};

/**
 * Stable error codes. Branch on `code`, never on message text; treat
 * unknown codes as `"unavailable"`.
 *
 * Store codes — the complete set for store operations:
 * - `invalid_argument` — the path, body, or query breaks a rule in
 *   the docs below (bad path grammar, non-object body, a document
 *   over 256 KiB or 32 levels deep, too many filters, an
 *   over-limit page size, ...). Surfaces at call time for verbs
 *   and on the error callback at subscribe time. Fix the call;
 *   retrying cannot succeed.
 * - `resource_exhausted` — a budget: the per-viewer call rate, the
 *   subscription cap (64 per view), too many concurrent writes or
 *   active leases, or a query that scans too many documents. Slow
 *   down, subscribe to less, or narrow the query; tightening a loop
 *   on it cannot succeed.
 * - `quota_exceeded` — a count cap is full: documents in the
 *   collection, documents in this artifact's database, or the
 *   organization's databases (the message names which, and the cap
 *   when known). Not transient: creating documents fails until some
 *   are deleted, while writes to existing documents still succeed.
 *   Surface it to the viewer; retrying cannot succeed.
 * - `unavailable` — a transient platform condition. Verbs: retry
 *   once after a short randomized delay. Subscriptions handle this
 *   INTERNALLY — delivery falls back to periodic refresh and
 *   recovers on its own; an `onSnapshot` error callback never
 *   receives it, EXCEPT when the platform bridge itself stops
 *   responding (a subscribe that never reaches the store): that
 *   listener is terminated with `unavailable` and a fresh
 *   `onSnapshot` is the only recovery.
 * - `revoked` — this view's grant was withdrawn while the page was
 *   running (access, sharing, or availability changed). Terminal for
 *   the page load: at most one delivery per listener; calls reject
 *   thereafter. Render the degraded experience; don't editorialize
 *   about why — the surrounding app owns access messaging.
 *
 * There is deliberately NO `permission-denied` and NO not-found code
 * on reads: a document this viewer cannot see behaves exactly like
 * one that does not exist (`exists: false`, omitted from queries).
 *
 * Lifecycle codes (from the runtime itself, not the store):
 * - `not_granted` — this view did not grant db to the frame.
 * - `capability_disabled` — granted but not usable in this view
 *   (the serving runtime predates it or its module failed to load).
 * - `capability_removed` — the called method is not part of the
 *   runtime serving this view; treat like `capability_disabled`.
 * - `transform_error` — the call's arguments could not be prepared;
 *   treat like `invalid_argument`.
 * (`queue_overflow`, from runtimes that queue calls made before they
 * are ready, can also reach an error callback; it is terminal for that
 * listener and falls under the unknown-code rule above.)
 */
type DbErrorCode =
  | "invalid_argument"
  | "resource_exhausted"
  | "quota_exceeded"
  | "unavailable"
  | "revoked"
  | "not_granted"
  | "capability_disabled"
  | "capability_removed"
  | "transform_error";

/**
 * PATH GRAMMAR (shared by every ref). A document path has an EVEN
 * number of slash-separated segments — the last is the document id,
 * the joined rest is its collection (`tasks/t1`, or nested:
 * `boards/b1/columns/c2`). A collection path is the odd-length
 * prefix form (`tasks`, `boards/b1/columns`). Count segments before
 * choosing the builder. `data/users/<id>` (3) is a COLLECTION — the
 * viewer's own — so one document per viewer is
 * `db.doc("data/users/" + uid + "/profile")` (4), and one document per
 * deck is `db.collection("data/users/" + uid).doc(deckId)` (4).
 * `data/users/<id>/decks` (4) is therefore a DOCUMENT path, not a
 * collection: a named per-viewer list is a subcollection under a
 * per-viewer document,
 * `db.doc("data/users/" + uid + "/profile").collection("decks")` (5),
 * each deck `.doc(deckId)` below it (6) — building from a ref like
 * this keeps the parity right for you. Segments use letters, digits,
 * and `_ - . ~ : @ +` only (never `.` or `..` alone); at most
 * 200 bytes per segment, 1000 bytes and 16 segments per path.
 * `doc()`, `collection()` and the builders on refs THROW a
 * `TypeError` synchronously for a path that breaks
 * this grammar (its message names the broken rule; for parity, the
 * segment count) — a programming error to fix where the path is
 * written, not a store condition to handle; building a ref never
 * touches the network. Paths are data you choose — there is no need to
 * pre-create a collection, and deleting a document does NOT delete
 * documents nested under its path.
 *
 * The `data/users/` path prefix is special, platform-side: each
 * viewer's own subtree under it is private per viewer — including
 * from the artifact's owner (the default `data/users/{self}` rule;
 * a declared rule at the `data/users` prefix opens siblings' subtrees
 * at its levels, see ACCESS RULES above). Address the viewer's subtree as
 * `data/users/<id>/...` using the AWAITED value of
 * {@link Claude.user.id} (declare `user` alongside `db` — without
 * the declaration `id()` resolves null; it is async, and an
 * un-awaited promise is not a valid path segment, so the builder
 * throws) — the
 * store recognizes exactly that id as this viewer, no other value
 * works. A null id means no private subtree: disable the per-viewer
 * feature for that visit rather than relocating its data to a
 * shared path. Another viewer's documents under `data/users/`
 * read as non-existent (`exists: false`, omitted from queries and
 * `onSnapshot`) — the "shared by its viewers" default does NOT
 * apply inside this prefix — and a write (`set`/`update`/`delete`)
 * into another viewer's subtree rejects `invalid_argument`.
 * Hidden-until-reveal (sealed votes, planning poker): each viewer
 * writes their pick under their own `data/users/<id>/` path, where by
 * default nobody else can read it, and copies it to a shared path when
 * THEY reveal — rules are fixed at publish, so nothing a page does at
 * run time opens another viewer's subtree.
 */

/** Snapshot provenance. `fromCache: true` marks a view that is not
 * yet (or not currently) server-definitive — the first pages of a
 * subscription, or delivery during a connectivity gap. A definitive
 * snapshot follows automatically; no action is needed.
 * `hasPendingWrites` is true while the view includes this page's own
 * unconfirmed write (latency compensation). */
type SnapshotMetadata = {
  fromCache: boolean;
  hasPendingWrites: boolean;
};

/** One document, as reads and snapshots deliver it. Delivered
 *  snapshots and their `data()` are frozen; a document that didn't
 *  change is the same object across deliveries — compare with
 *  `===`, don't mutate or accumulate them (clone a body before
 *  editing it for a write). */
type DocumentSnapshot = {
  /** The last segment of the document's path. */
  id: string;
  /** False covers both a missing document and one this viewer cannot
   * see — deliberately indistinguishable. */
  exists: boolean;
  /** The document body; `undefined` when `exists` is false. */
  data(): Record<string, unknown> | undefined;
  metadata: SnapshotMetadata;
};

/** One ordered-view transition inside a query snapshot. Indexes are
 * positions in the snapshot's `docs` order: `oldIndex` is -1 for
 * `added`, `newIndex` is -1 for `removed`. `removed` covers
 * deletion, leaving the query, and losing visibility, identically; its
 * `doc` is the last snapshot the listener saw (`exists: true`,
 * carrying the final body), so a removal handler still has the data. */
type DocumentChange = {
  type: "added" | "modified" | "removed";
  doc: DocumentSnapshot;
  oldIndex: number;
  newIndex: number;
};

/** A query's matched set, in query order. */
type QuerySnapshot = {
  docs: DocumentSnapshot[];
  size: number;
  empty: boolean;
  /** The changes since the previous snapshot of this listener (the
   * first snapshot is all-`added`). */
  docChanges(): DocumentChange[];
  metadata: SnapshotMetadata;
};

/** Stop receiving snapshots. Idempotent; after it returns, the
 * callbacks never fire again. */
type Unsubscribe = () => void;

type AcquireOptions = {
  /** Who holds the lease — any stable string (a viewer id, a tab
   * id). Renewal requires the same holder. */
  holder: string;
  /** Requested lease length in milliseconds. Absent/0 means 30000;
   * values are clamped to [1000, 600000], never rejected. */
  ttlMs?: number;
  /** Merged into the document body when the lease is granted. */
  data?: Record<string, unknown>;
};

type AcquireResult = {
  acquired: boolean;
  /** The document's version after a granted acquire. */
  version?: number;
  /** RFC 3339 expiry of the lease now in force (granted or not). */
  expiresAt?: string;
  /** Your own holder string, echoed on a granted acquire; absent when
   * busy — the platform reveals `expiresAt`, never who holds it. */
  holder?: string;
};

/**
 * A reference to one document. Pure and synchronous to create — a
 * malformed path throws here; nothing reaches the store until a
 * terminal call.
 */
type DocumentReference = {
  /** The last path segment. */
  id: string;
  path: string;

  /** Read once. Absence is NOT an error — branch on `exists`. */
  get(): Promise<DocumentSnapshot>;

  /** Write the WHOLE document, creating it (and the store) if
   * absent — a full replace, Firestore-style. Use `update` to merge
   * into existing fields. Writes are last-writer-wins; there are no
   * transactions. */
  set(data: Record<string, unknown>): Promise<void>;

  /** Merge-write that REQUIRES the document to exist — rejects
   * `invalid_argument` otherwise (creating-on-miss would be a bug
   * for its use cases). Nested objects merge recursively; anything
   * else (arrays included) replaces that field wholesale. Do NOT
   * build monotonic counters from read-modify-update — writes are
   * last-writer-wins and a retried write can apply twice. */
  update(data: Record<string, unknown>): Promise<void>;

  /** Delete this document. Idempotent; nested documents survive. */
  delete(): Promise<void>;

  /**
   * Cooperative short lease on this document — set-if-not-busy, the
   * single-writer primitive (one editor at a time, a migration that
   * should run once, a turn lock). NOT a security boundary: other
   * viewers can still write directly; leases only coordinate
   * callers that all use `acquire`. Busy resolves
   * `{acquired: false}` — a normal outcome, never an error. Leases
   * expire on their own (no release verb): prefer short `ttlMs`
   * and renew while working. There is no create-if-absent write, so
   * "claim a slot" (a seat, a username, first-come ownership) is:
   * `acquire` the slot document (short `ttlMs`, no `data`), `get()`
   * it, and while you hold the lease `set` your claim only if it does
   * not exist yet or its body names no owner, then let the lease
   * lapse; `{acquired: false}` means someone else is mid-claim — treat
   * the slot as taken or re-read after `expiresAt`. Do not carry the
   * claim in `acquire`'s `data` (it merges on every later grant too).
   * A bare get-then-set races and both callers believe they won.
   */
  acquire(options: AcquireOptions): Promise<AcquireResult>;

  /**
   * Subscribe to this document. `next` fires with the current state
   * soon after registration, then on every change — including other
   * viewers' writes, live. Your own writes appear immediately
   * (`hasPendingWrites: true` until confirmed). Delivery rides a
   * realtime stream when available and falls back to periodic
   * refresh (about 30 s foreground) — same callbacks either way.
   * `error` receives at most one terminal {@link DbError}
   * (`invalid_argument`, `resource_exhausted`, `revoked`, or the
   * dead-bridge `unavailable` above), after which the subscription
   * is dead. Pass it: without one a terminal error is reported via
   * `reportError` (your `error` event and console see it) and the
   * listener still dies.
   */
  onSnapshot(
    next: (snap: DocumentSnapshot) => void,
    error?: (e: DbError) => void,
  ): Unsubscribe;

  /** A subcollection under this document. */
  collection(path: string): CollectionReference;
};

/**
 * A filtered, ordered, limited view of one collection. Builders are
 * pure — each returns a NEW query; terminal calls do the work.
 * Filters and `orderBy` evaluate against top-level fields without
 * indexes (the store scans the collection), so keep queried
 * collections modest — hundreds to low thousands of documents.
 */
type Query = {
  /** Add a filter (up to 10). Operators: `==`, `!=`, `<`, `<=`,
   * `>`, `>=`, `in`, `not-in` (value arrays of at most 30), and
   * `array-contains`. */
  where(field: string, op: string, value: unknown): Query;

  /** Order by one top-level field (at most one `orderBy`);
   * `dir` defaults to `"asc"`. Documents missing the field sort
   * last. Without `orderBy`, results are ordered by document id
   * (ascending) — the same on every delivery path. */
  orderBy(field: string, dir?: "asc" | "desc"): Query;

  /** At most `n` documents (1-1000). An ordered, limited query is a
   * window: documents beyond the window are not delivered until
   * they enter it. */
  limit(n: number): Query;

  /** Read the matched set once, in query order. */
  get(): Promise<QuerySnapshot>;

  /** Subscribe to the matched set — same delivery contract as
   * {@link DocumentReference.onSnapshot}, with `docChanges()`
   * describing each transition. At most 64 active subscriptions per
   * view (the 65th rejects `resource_exhausted` on the error
   * callback). */
  onSnapshot(
    next: (snap: QuerySnapshot) => void,
    error?: (e: DbError) => void,
  ): Unsubscribe;
};

/** A collection: a {@link Query} over everything in it, plus
 * document access and creation. */
type CollectionReference = Query & {
  path: string;

  /** A document in this collection. Omit `id` to mint a fresh
   * client-generated id — the retriable-create idiom (the store has
   * no idempotency key; a retried create with a fresh ref leaves at
   * most one document per id). */
  doc(id?: string): DocumentReference;

  /** Create a document under a client-generated id and resolve its
   * ref. Sugar for `.doc().set(data)`. */
  add(data: Record<string, unknown>): Promise<DocumentReference>;
};

/**
 * The store surface. Refs are pure path holders — building them never
 * touches the network; only the calls on them do.
 *
 * DOCUMENT BODIES are plain-JSON OBJECTS (not arrays or scalars at
 * the top level): at most 256 KiB serialized and 32 levels deep.
 * CAPACITY: an artifact's database holds at most 5,000 documents in
 * total. Don't map an unbounded, growing stream (events, log lines,
 * messages) to one document per item — aggregate many items into one
 * document or prune old ones — and when a create rejects with
 * `quota_exceeded`, tell the viewer what happened and what to do.
 * Numbers are JSON numbers (double precision). Writes are
 * last-writer-wins — compare document STATE to reason about
 * concurrency, never row counts or call counts.
 */
type DB = {
  /** A document reference. The path must have an even number of
   * segments (`tasks/t1`); throws `TypeError` for a path that breaks
   * the grammar above. */
  doc(path: string): DocumentReference;

  /** A collection reference. The path must have an odd number of
   * segments (`tasks`, `boards/b1/columns`); throws `TypeError` for a
   * path that breaks the grammar above. */
  collection(path: string): CollectionReference;
};

interface ClaudeCapabilityMap {
  db: DB;
}
