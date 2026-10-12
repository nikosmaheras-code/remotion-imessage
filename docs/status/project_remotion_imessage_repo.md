---
name: remotion-imessage-repo
description: Public GitHub repo github.com/nikosmaheras-code/remotion-imessage — the chat-animation engine extracted as a reusable Remotion toolkit
metadata: 
  node_type: memory
  type: project
  originSessionId: 096952ee-24b3-4825-aef0-ae72e63ba43b
---

`github.com/nikosmaheras-code/remotion-imessage` (public, MIT) — the iMessage chat engine from [[textconvo-imessage-creative]] extracted into a standalone shareable Remotion project at `~/remotion-imessage`. Pushed 2026-06-11.

API: `createChat(messages, senders, {pace, fps, intro, outro})` → `{items, duration, group}`; `<ChatScreen chat title avatar readReceipts receiveSound footnote time/>`. Message types: text (typed in input bar), image (any JSX in clipped photo bubble), linkCard (title+domain footer, content node), tapback {emoji, by}, wait frames. Group mode auto-derives from >1 non-me sender. `pace` divides all research cadence constants (1 = realistic).

Deliberately EXCLUDED from the public repo: all Polymarket brand assets/offers/share-cards, Inter Polymarket font (system SF Pro stack only), and Apple's tritone.m4r (not redistributable — receiveSound is a bring-your-own prop). Demo comps are generic (ramen dinner 1:1 w/ link card + receipts; ski-trip group w/ snow-report image + 🤩 tapback).

Same Remotion 4.0.450 + npm overrides block (registry chain-pin bug). Preview stills committed in assets/. The private polymarket-remotion comps still use their own copies (src/ios26.tsx etc.) — the repo is a fork-point, not a dependency.

**Private companion repo**: `github.com/nikosmaheras-code/polymarket-remotion` (private, pushed 2026-06-11) — the full campaign project with all comps + brand assets/fonts/tritone. Invite collaborators via `gh api repos/nikosmaheras-code/polymarket-remotion/collaborators/USERNAME -X PUT`.
