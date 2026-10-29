# Comments

Presentation comments use people, threads, replies, reactions, and thread state.

## Current Author

```ts
presentation.comments.setSelf({
  displayName,
  initials,
  email,
});
```

## Person Inline Type

```ts
type PersonConfig = {
  id?: string;
  displayName: string;
  initials?: string;
  email?: string;
  avatarUrl?: string;
  userId?: string;
  providerId?: string;
};
```

## Element Thread

```ts
const thread = presentation.comments.addThread({ element }, bodyText, {
  position,
});

const reply = thread.addReply(replyText);
reply.toggleReaction(reactionText);
thread.resolve();
thread.reopen();
```

## Thread Inline Types

```ts
type CommentTarget =
  | { slide: Slide }
  | { element: Shape | ImageElement | Table | ChartElement }
  | { textRange: TextRange }
  | { textMatch: { element: Shape; query: string; occurrence?: number } };

type ThreadAddOptions = {
  author?: Person | PersonConfig | { id: string };
  createdAt?: string;
  position?: { x: number; y: number; unit?: "px" | "emu" };
};
```

## Slide And Text Threads

```ts
presentation.comments.addThread({ slide }, bodyText, { position });

presentation.comments.addThread(
  { textMatch: { element, query, occurrence } },
  bodyText,
);
```

## Cookbook

```ts
// Add a review comment to exact text.
presentation.comments.setSelf({
  displayName: "Presentation Reviewer",
  initials: "PR",
  email: "reviewer@example.com",
});

const thread = presentation.comments.addThread(
  { textMatch: { element: titleShape, query: "Q4", occurrence: 0 } },
  "Check whether this should be FY2026 Q1.",
);
thread.addReply("Leaving this unresolved for owner review.");
```

```ts
// Resolve an imported thread after an edit.
const self = presentation.comments.setSelf({
  displayName: "Presentation Editor",
  initials: "PE",
  email: "editor@example.com",
});

const thread = presentation.resolve(threadAnchorId);
thread.addReply("Updated the chart title and source note.", { author: self });
thread.resolve(self);

const verified = await presentation.inspect({
  kind: "thread",
  target: { id: threadAnchorId, beforeLines: 0, afterLines: 2 },
  maxChars: 2000,
});
```
