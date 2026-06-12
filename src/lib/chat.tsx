import { AbsoluteFill, Audio, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, sf, HEADER_H, INPUT_TOP, IND_H, NavBar, NavAvatar, ThreadHead, InputBar, TypingIndicator, TailCurl, TapbackBalloon } from "./ios26";

/* ──────────────────────────────────────────────────────────────────────────
   Chat engine — declarative conversation → deterministic frame timeline.

   Cadence is research-derived (see README for sources):
   - reply delay ≈ 50ms × chars of the previous message (reading time),
     compressed ×0.7, clamped 0.6–1.5s
   - typing-indicator duration ≈ 50ms × chars of the reply, ×0.85, 0.9–2.6s
   - input-bar typing: 2 frames/char (≈5× the 3 chars/s human mobile baseline)
   - bubble pop: damping 18 / stiffness 190 (Apple's bounce≈0.2 zone)
   `pace` divides every delay: 1 = realistic, ~1.8 fits a story in <15s.
   ────────────────────────────────────────────────────────────────────────── */

export type SenderDef = { name: string; initial: string; grad: [string, string]; me?: boolean };
export type Senders = Record<string, SenderDef>;

export type ChatMessage = {
  from: string;
  /** bubble text; for linkCard messages this is also what gets typed in the input bar */
  text?: string;
  /** manual wrapped-line count for deterministic layout (default 1; ~27 chars/line, CAPS count ~1.2×) */
  lines?: number;
  /** photo/screenshot bubble — your own ReactNode rendered inside the clipped rounded frame */
  image?: { content: React.ReactNode; height?: number };
  /** iMessage link preview card */
  linkCard?: { title: string; domain: string; content?: React.ReactNode; height?: number };
  /** native tapback reaction, fires ~1.5s after the message lands */
  tapback?: { emoji: string; by: string };
  /** extra frames of silence before this message (time passing) */
  wait?: number;
};

export type ChatOptions = {
  fps?: number;
  /** cadence divider: 1 = research-realistic, higher = faster (default 1) */
  pace?: number;
  /** frames before the first event (default 26) */
  intro?: number;
  /** hold after the last message (default 84) */
  outro?: number;
};

// ── layout metrics (1080×1920 canvas) ──
const LINE_H = 60;
const PAD_V = 20;
const BUBBLE_MAX_W = 660;
const RADIUS = 50;
const RADIUS_GROUPED = 16;
const GAP_GROUP = 10;
const GAP_NEW = 32;
const IMG_W = 640;
const IMG_H_DEFAULT = 560;
const CARD_W = 640;
const CARD_H_DEFAULT = 392;
const CARD_FOOTER_H = 104;
const NAME_H = 40;
const AVATAR = 80;
const GUTTER = 104;
const TAP_ROOM = 64;
const RECEIPT_H = 46;

const clampN = (lo: number, v: number, hi: number) => Math.max(lo, Math.min(hi, v));
const clamp01 = (v: number) => clampN(0, v, 1);

type Item = ChatMessage & {
  i: number;
  me: boolean;
  gap: number;
  nameH: number;
  slotStart: number;
  indicatorStart: number;
  inputStart: number;
  inputDur: number;
  pop: number;
  firstOfGroup: boolean;
  lastOfGroup: boolean;
  tapbackAt: number;
  showReceipt: boolean;
  receiptStart: number;
  receiptEnd: number;
  readAt: number;
};

export type Chat = {
  items: Item[];
  duration: number;
  senders: Senders;
  group: boolean;
  fps: number;
};

const contentH = (m: ChatMessage) =>
  m.image ? m.image.height ?? IMG_H_DEFAULT : m.linkCard ? m.linkCard.height ?? CARD_H_DEFAULT : (m.lines ?? 1) * LINE_H + PAD_V * 2;

export const createChat = (messages: ChatMessage[], senders: Senders, opts: ChatOptions = {}): Chat => {
  const fps = opts.fps ?? 30;
  const p = opts.pace ?? 1;
  const intro = opts.intro ?? 26;
  const outro = opts.outro ?? 84;

  const isMe = (id: string) => !!senders[id]?.me;
  const group = Object.values(senders).filter((s) => !s.me).length > 1;

  const prevLen = (m?: ChatMessage) => (m?.text ? m.text.length : 20);
  const readGapF = (prev: ChatMessage) => Math.round(clampN(0.6 / p, (prevLen(prev) * 0.05 * 0.7) / p, 1.5 / p) * fps);
  const typingF = (m: ChatMessage) => Math.round(clampN(0.9 / p, ((m.text ?? "").length * 0.05 * 0.85) / p, 2.6 / p) * fps);
  const inputF = (m: ChatMessage) => Math.max(Math.round(24 / p), Math.round(((m.text ?? "").length * 2) / p));

  const items: Item[] = [];
  let f = intro;
  messages.forEach((m, i) => {
    const prev = messages[i - 1];
    const next = messages[i + 1];
    const burst = !!prev && prev.from === m.from;
    const me = isMe(m.from);
    f += (!prev ? 0 : burst ? Math.round(9 / p) : readGapF(prev)) + (m.wait ?? 0);
    let indicatorStart = -1;
    let inputStart = -1;
    let inputDur = 0;
    if (m.image) {
      f += Math.round((me ? 20 : 16) / p); // picking the photo — no indicator, no input text
    } else if (!me) {
      indicatorStart = f;
      f += typingF(m);
    } else {
      inputStart = f;
      inputDur = inputF(m);
      f += inputDur;
    }
    const pop = f;
    items.push({
      ...m, i, me,
      gap: burst ? GAP_GROUP : GAP_NEW,
      nameH: !me && group && !burst ? NAME_H : 0,
      slotStart: indicatorStart >= 0 ? indicatorStart : pop,
      indicatorStart, inputStart, inputDur, pop,
      firstOfGroup: !burst,
      lastOfGroup: !next || next.from !== m.from,
      tapbackAt: m.tapback ? pop + 45 : Infinity,
      showReceipt: me && !group && (!next || !isMe(next.from)),
      receiptStart: 0, receiptEnd: Infinity, readAt: Infinity,
    });
  });
  // Delivered → Read receipts (1:1 only): live under the latest sent group,
  // swap to Read when the other side starts typing, collapse when superseded
  items.forEach((it) => {
    if (!it.showReceipt) return;
    it.receiptStart = it.pop + 8;
    const nextReceipt = items.find((o) => o.i > it.i && o.showReceipt);
    if (nextReceipt) it.receiptEnd = nextReceipt.pop + 8;
    const nextThem = items.find((o) => o.i > it.i && o.indicatorStart >= 0);
    if (nextThem) it.readAt = nextThem.indicatorStart + 4;
  });

  return { items, duration: f + outro, senders, group, fps };
};

// ── springs: pop lands in Apple's bounce≈0.2 zone (ζ≈0.65, ~6% overshoot) ──
const POP = { damping: 18, stiffness: 190, mass: 1 };
const GROW = { damping: 24, stiffness: 190, mass: 1 };
const IND_POP = { damping: 16, stiffness: 240, mass: 0.8 };
const TAP_POP = { damping: 12, stiffness: 230, mass: 0.7 };

export const ChatScreen: React.FC<{
  chat: Chat;
  title: string;
  avatar: NavAvatar;
  /** show Delivered → Read under sent messages (1:1 chats) */
  readReceipts?: boolean;
  /** audio src (e.g. staticFile("receive.mp3")) played on each incoming message */
  receiveSound?: string;
  /** small centered microcopy at the very bottom */
  footnote?: string;
  /** status-bar / thread-head clock */
  time?: string;
}> = ({ chat, title, avatar, readReceipts = false, receiveSound, footnote, time }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const typingItem = chat.items.find((it) => it.me && !it.image && frame >= it.inputStart && frame < it.pop);
  const inputText = typingItem
    ? (typingItem.text ?? "").slice(0, Math.floor(((frame - typingItem.inputStart) / typingItem.inputDur) * (typingItem.text ?? "").length))
    : "";
  const justSent = chat.items.some((it) => it.me && frame >= it.pop && frame < it.pop + 6);

  return (
    <AbsoluteFill style={{ backgroundColor: C.page, overflow: "hidden" }}>
      {/* thread — bottom-anchored; growing slots push older messages up */}
      <div
        style={{
          position: "absolute",
          top: HEADER_H,
          left: 0,
          right: 0,
          height: INPUT_TOP - HEADER_H,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "0 44px 26px",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 9%, #000 100%)",
          maskImage: "linear-gradient(to bottom, transparent 0%, #000 9%, #000 100%)",
        }}
      >
        <ThreadHead time={time ? `${time} AM` : undefined} />
        {chat.items.map((it) => (
          <Slot key={it.i} it={it} chat={chat} frame={frame} fps={fps} readReceipts={readReceipts} />
        ))}
      </div>

      <NavBar title={title} avatar={avatar} time={time} />
      <InputBar text={inputText} placeholder={!typingItem} sentPulse={justSent} frame={frame} />

      {receiveSound &&
        chat.items
          .filter((it) => !it.me)
          .map((it) => (
            <Sequence key={`snd-${it.i}`} from={it.pop} durationInFrames={30}>
              <Audio src={receiveSound} volume={0.55} />
            </Sequence>
          ))}

      {footnote && (
        <p style={{ ...sf(500), position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", margin: 0, fontSize: 17, color: "#c6cad1", whiteSpace: "nowrap" }}>
          {footnote}
        </p>
      )}
    </AbsoluteFill>
  );
};

const Slot: React.FC<{ it: Item; chat: Chat; frame: number; fps: number; readReceipts: boolean }> = ({ it, chat, frame, fps, readReceipts }) => {
  if (frame < it.slotStart) return null;
  const h = contentH(it);

  const sPop = spring({ frame: frame - it.pop, fps, config: POP });
  // tapback landing pushes the stack apart, like iOS relayouts for the balloon
  const tap = frame >= it.tapbackAt ? spring({ frame: frame - it.tapbackAt, fps, config: TAP_POP }) : 0;
  let height = TAP_ROOM * tap;
  // sender name only appears WITH the message (iOS shows no name while typing)
  if (it.indicatorStart >= 0) {
    const sInd = spring({ frame: frame - it.indicatorStart, fps, config: IND_POP });
    const sMorph = spring({ frame: frame - it.pop, fps, config: GROW });
    height += it.gap + IND_H * sInd + (h + it.nameH - IND_H) * sMorph;
  } else {
    height += it.gap + (h + it.nameH) * spring({ frame: frame - it.slotStart, fps, config: POP });
  }

  // Delivered / Read receipt under the latest sent message (1:1)
  let receiptH = 0;
  let receiptIn = 0;
  if (readReceipts && it.showReceipt && frame >= it.receiptStart) {
    receiptIn = spring({ frame: frame - it.receiptStart, fps, config: GROW });
    const out = frame >= it.receiptEnd ? spring({ frame: frame - it.receiptEnd, fps, config: GROW }) : 0;
    receiptH = RECEIPT_H * receiptIn * (1 - out);
  }
  const readSwap = frame >= it.readAt ? clamp01((frame - it.readAt) / 8) : 0;

  const popped = frame >= it.pop;
  const indicatorAlive = it.indicatorStart >= 0 && frame < it.pop + 7;
  const next = chat.items[it.i + 1];
  const showAvatar = !it.me && chat.group && (it.lastOfGroup || frame < (next?.slotStart ?? Infinity));
  const gutter = chat.group ? GUTTER : 0;

  return (
    <div
      style={{
        height: height + receiptH,
        flexShrink: 0,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: it.me ? "flex-end" : "flex-start",
        // tall image bubbles overflow the growing slot and cover prior
        // messages for a few frames — clip them until the slot settles
        overflow: it.image && frame < it.pop + 12 ? "hidden" : "visible",
      }}
    >
      {it.nameH > 0 && popped && (
        <span style={{ ...sf(400), fontSize: 28, color: C.grey, marginLeft: gutter + 26, marginBottom: 4, opacity: clamp01(sPop * 2) }}>
          {chat.senders[it.from]?.name ?? it.from}
        </span>
      )}
      <div style={{ position: "relative", paddingLeft: it.me ? 0 : gutter, alignSelf: it.me ? "flex-end" : "flex-start" }}>
        {showAvatar && <AvatarDot sender={chat.senders[it.from]} />}
        {indicatorAlive && <TypingIndicator frame={frame} start={it.indicatorStart} pop={it.pop} fps={fps} left={gutter} />}
        {popped && <Bubble it={it} chat={chat} pop={sPop} tap={tap} />}
      </div>
      {receiptH > 0.5 && (
        <div style={{ height: receiptH, width: 460, overflow: "hidden", display: "flex", justifyContent: "flex-end", alignItems: "flex-start", paddingTop: 6, paddingRight: 10 }}>
          <div style={{ ...sf(500), position: "relative", fontSize: 31, lineHeight: "38px", color: C.grey, opacity: receiptIn }}>
            <span style={{ opacity: 1 - readSwap }}>Delivered</span>
            <span style={{ position: "absolute", right: 0, top: 0, whiteSpace: "nowrap", opacity: readSwap }}>
              <span style={{ fontWeight: 700 }}>Read</span> 9:41 AM
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const AvatarDot: React.FC<{ sender?: SenderDef }> = ({ sender }) => {
  if (!sender) return null;
  return (
    <div style={{ position: "absolute", left: 0, bottom: 0, width: AVATAR, height: AVATAR, borderRadius: AVATAR / 2, background: `linear-gradient(180deg, ${sender.grad[0]} 0%, ${sender.grad[1]} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 4 }}>
      <span style={{ ...sf(500), fontSize: 38, color: "#fff" }}>{sender.initial}</span>
    </div>
  );
};

const Bubble: React.FC<{ it: Item; chat: Chat; pop: number; tap: number }> = ({ it, chat, pop, tap }) => {
  const me = it.me;
  const tail = it.lastOfGroup && !it.image && !it.linkCard;

  const r = RADIUS;
  const rg = RADIUS_GROUPED;
  const corners: React.CSSProperties = me
    ? { borderRadius: `${r}px ${it.firstOfGroup ? r : rg}px ${it.lastOfGroup ? r : rg}px ${r}px` }
    : { borderRadius: `${it.firstOfGroup ? r : rg}px ${r}px ${r}px ${it.lastOfGroup ? r : rg}px` };

  // sent messages rise from the input bar; received pop from the tail corner
  const transform = me
    ? `translateY(${(1 - pop) * 80}px) scale(${0.7 + 0.3 * pop})`
    : `translateY(${(1 - pop) * 20}px) scale(${0.8 + 0.2 * pop})`;

  return (
    <div
      style={{
        position: "relative",
        maxWidth: it.image ? IMG_W : BUBBLE_MAX_W,
        opacity: clamp01(pop * 2.5),
        transform,
        transformOrigin: me ? "right bottom" : "left bottom",
      }}
    >
      {it.image ? (
        <div style={{ width: IMG_W, height: it.image.height ?? IMG_H_DEFAULT, ...corners, overflow: "hidden", boxShadow: "inset 0 0 0 2px rgba(0,0,0,0.08)" }}>
          {it.image.content}
        </div>
      ) : it.linkCard ? (
        <div style={{ width: CARD_W, height: it.linkCard.height ?? CARD_H_DEFAULT, ...corners, overflow: "hidden", boxShadow: "inset 0 0 0 2px rgba(0,0,0,0.08)", background: C.page }}>
          <div style={{ height: (it.linkCard.height ?? CARD_H_DEFAULT) - CARD_FOOTER_H, background: "#F2F2F7", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {it.linkCard.content}
          </div>
          <div style={{ height: CARD_FOOTER_H, background: "#F2F2F7", borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 36px", gap: 2 }}>
            <span style={{ ...sf(600), fontSize: 34, color: C.ink }}>{it.linkCard.title}</span>
            <span style={{ ...sf(400), fontSize: 28, color: C.grey }}>{it.linkCard.domain}</span>
          </div>
        </div>
      ) : (
        <div style={{ ...corners, background: me ? C.blue : C.recv, padding: `${PAD_V}px 38px` }}>
          <span style={{ ...sf(400), fontSize: 47, lineHeight: `${LINE_H}px`, letterSpacing: "-0.7px", color: me ? "#fff" : C.ink, wordBreak: "break-word" }}>
            {it.text}
          </span>
        </div>
      )}
      {tail && <TailCurl me={me} />}
      {it.tapback && (
        <TapbackBalloon
          emoji={it.tapback.emoji}
          side={me ? "left" : "right"}
          pop={tap}
          reactor={chat.group ? chat.senders[it.tapback.by] : undefined}
        />
      )}
    </div>
  );
};
