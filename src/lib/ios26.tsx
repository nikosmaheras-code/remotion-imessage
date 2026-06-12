/* ──────────────────────────────────────────────────────────────────────────
   iOS 26 Messages chrome, matched against Apple Support reference
   screenshots (group thread, tapbacks). Designed for a 1080×1920 canvas
   (≈390pt iPhone width × 2.77).

   Native details reproduced: dynamic island + status bar, circular glass
   nav buttons, single group-photo circle with capsule name chip,
   "iMessage / Today 9:41 AM" thread head, #0A7CFF send blue, mic icon in
   the empty input field, white tapback balloon with thought-trail dots
   and (group chats) a tiny reactor avatar.
   ────────────────────────────────────────────────────────────────────────── */

export const SFP = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif";
export const sf = (wght: number): React.CSSProperties => ({ fontFamily: SFP, fontWeight: wght, fontOpticalSizing: "auto" });

export const C = {
  blue: "#0A7CFF", // iOS 26 send-bubble blue (brighter than legacy #007AFF)
  recv: "#E9E9EB",
  ink: "#000",
  grey: "#8E8E93",
  page: "#fff",
  fill: "rgba(120,120,128,0.12)", // iOS systemFill — chips, glass buttons
};

export const HEADER_H = 350;
export const INPUT_TOP = 1716;
export const IND_H = 124;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// ── Status bar + dynamic island ──
export const StatusBar: React.FC<{ time?: string }> = ({ time = "9:41" }) => (
  <>
    <div style={{ position: "absolute", top: 22, left: "50%", transform: "translateX(-50%)", width: 330, height: 92, background: "#000", borderRadius: 100 }} />
    <span style={{ ...sf(600), position: "absolute", top: 40, left: 86, fontSize: 47, color: C.ink }}>{time}</span>
    <svg width={216} height={36} viewBox="0 0 80 13.3" style={{ position: "absolute", top: 50, right: 56 }}>
      {[0, 1, 2, 3].map((b) => (
        <rect key={b} x={b * 5} y={9 - b * 2.5 - 1.5} width={3.2} height={4 + b * 2.5} rx={1} fill={C.ink} />
      ))}
      <path d="M33 5.2 a 8.4 8.4 0 0 1 11 0 l -1.7 2 a 5.8 5.8 0 0 0 -7.6 0 Z" fill={C.ink} />
      <path d="M35.7 8.2 a 4.2 4.2 0 0 1 5.6 0 l -2.8 3.4 Z" fill={C.ink} />
      <rect x={52} y={2} width={22} height={10.5} rx={3} fill="none" stroke={C.ink} strokeWidth={1} opacity={0.4} />
      <rect x={53.6} y={3.6} width={18.8} height={7.3} rx={1.8} fill={C.ink} />
      <path d="M75.2 5.4 a 2.6 2.6 0 0 1 0 3.8 Z" fill={C.ink} opacity={0.4} />
    </svg>
  </>
);

// ── Circular glass nav buttons (iOS 26 Liquid Glass style) ──
const GlassButton: React.FC<{ side: "left" | "right"; children: React.ReactNode }> = ({ side, children }) => (
  <div
    style={{
      position: "absolute",
      top: 150,
      [side]: 40,
      width: 92,
      height: 92,
      borderRadius: 46,
      background: C.fill,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.5)",
    }}
  >
    {children}
  </div>
);

export type NavAvatar =
  | { kind: "group"; emoji: string; tint: [string, string] }
  | { kind: "contact"; initial: string; grad: [string, string] };

export const NavBar: React.FC<{ title: string; avatar: NavAvatar; time?: string }> = ({ title, avatar, time }) => (
  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: HEADER_H, background: "rgba(250,250,250,0.96)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,0,0,0.12)", zIndex: 10 }}>
    <StatusBar time={time} />
    <GlassButton side="left">
      <svg width={32} height={56} viewBox="0 0 12 21">
        <path d="M10.5 1.5 L2 10.5 L10.5 19.5" fill="none" stroke={C.blue} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </GlassButton>
    <GlassButton side="right">
      <svg width={56} height={38} viewBox="0 0 33 22">
        <rect x={0.5} y={1} width={21} height={20} rx={5} fill="none" stroke={C.blue} strokeWidth={2} />
        <path d="M23.5 8.5 L31 4 V18 L23.5 13.5 Z" fill={C.blue} />
      </svg>
    </GlassButton>
    <div style={{ position: "absolute", top: 122, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      {avatar.kind === "group" ? (
        <div style={{ width: 150, height: 150, borderRadius: 75, background: `linear-gradient(180deg, ${avatar.tint[0]} 0%, ${avatar.tint[1]} 100%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 80, lineHeight: 1 }}>{avatar.emoji}</span>
        </div>
      ) : (
        <div style={{ width: 134, height: 134, borderRadius: 67, background: `linear-gradient(180deg, ${avatar.grad[0]} 0%, ${avatar.grad[1]} 100%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ ...sf(500), fontSize: 58, color: "#fff" }}>{avatar.initial}</span>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.fill, borderRadius: 100, padding: "8px 24px" }}>
        <span style={{ ...sf(500), fontSize: 30, color: C.ink, whiteSpace: "nowrap" }}>{title}</span>
        <span style={{ ...sf(500), fontSize: 28, color: "#B0B5BB" }}>›</span>
      </div>
    </div>
  </div>
);

// ── Thread head — "iMessage" over "Today 9:41 AM" (per iOS 26 ref) ──
export const ThreadHead: React.FC<{ time?: string }> = ({ time = "9:41 AM" }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, margin: "0 0 34px" }}>
    <span style={{ ...sf(500), fontSize: 28, color: C.grey }}>iMessage</span>
    <span style={{ ...sf(500), fontSize: 30, color: C.grey }}>
      <span style={{ fontWeight: 700 }}>Today</span> {time}
    </span>
  </div>
);

// ── Input bar — mic when empty, blue send circle when text present ──
export const InputBar: React.FC<{ text: string; placeholder: boolean; sentPulse: boolean; frame: number }> = ({ text, placeholder, sentPulse, frame }) => {
  const caretOn = Math.floor(frame / 8) % 2 === 0;
  const hasText = text.length > 0;
  const sendScale = sentPulse ? 0.82 : 1;
  return (
    <div style={{ position: "absolute", top: INPUT_TOP, left: 0, right: 0, bottom: 0, background: C.page, zIndex: 10 }}>
      <div style={{ position: "absolute", top: 18, left: 36, right: 36, display: "flex", alignItems: "center", gap: 22 }}>
        <div style={{ flexShrink: 0, width: 92, height: 92, borderRadius: 46, background: C.fill, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={40} height={40} viewBox="0 0 16 16"><path d="M8 2 V14 M2 8 H14" stroke={C.grey} strokeWidth={1.8} strokeLinecap="round" /></svg>
        </div>
        <div style={{ flex: 1, height: 92, borderRadius: 46, border: "1.5px solid rgba(0,0,0,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", padding: "0 18px 0 36px", overflow: "hidden", background: C.page }}>
          {placeholder ? (
            <>
              <span style={{ ...sf(400), fontSize: 42, color: "#B0B5BB" }}>iMessage</span>
              <svg width={34} height={50} viewBox="0 0 14 20" style={{ marginLeft: "auto", marginRight: 14 }}>
                <rect x={4.5} y={1} width={5} height={10} rx={2.5} fill="none" stroke={C.grey} strokeWidth={1.4} />
                <path d="M2 9 a 5 5 0 0 0 10 0 M7 14 V17.5 M4.5 17.5 H9.5" fill="none" stroke={C.grey} strokeWidth={1.4} strokeLinecap="round" />
              </svg>
            </>
          ) : (
            <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
              {/* keep the caret/end of long text visible, like iOS (est. ~21.5px/char @42px) */}
              <span style={{ ...sf(400), display: "inline-block", fontSize: 42, color: C.ink, whiteSpace: "nowrap", transform: `translateX(${-Math.max(0, text.length * 21.5 - 700)}px)` }}>
                {text}
                <span style={{ display: "inline-block", width: 5, height: 52, marginLeft: 3, verticalAlign: "-10px", background: C.blue, opacity: caretOn ? 1 : 0 }} />
              </span>
            </div>
          )}
          {hasText && (
            <div style={{ marginLeft: "auto", flexShrink: 0, width: 68, height: 68, borderRadius: 34, background: C.blue, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${sendScale})` }}>
              <svg width={36} height={36} viewBox="0 0 16 16"><path d="M8 13 V3.5 M3.8 7.5 L8 3.2 L12.2 7.5" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          )}
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", width: 380, height: 14, borderRadius: 10, background: "#000" }} />
    </div>
  );
};

/* ── Typing indicator — spec measured from the best open-source iMessage
   replica (nathantannar4/TypingIndicator): dot fade 1→0.5 / 0.5s autoreverse
   (cos, 1s cycle), 0.33s per-dot stagger, bubble breathe 1→1.04 / 1s,
   tail circles pulse 1→1.1 / 0.5s ── */
export const TypingIndicator: React.FC<{ frame: number; start: number; pop: number; fps: number; left?: number }> = ({ frame, start, pop, fps, left = 0 }) => {
  const t = (frame - start) / fps;
  const popOut = frame >= pop ? clamp01((frame - pop) / 6) : 0;
  const breathe = 1.02 + 0.02 * Math.cos((2 * Math.PI * t) / 2.0);
  const circlePulse = 1.05 + 0.05 * Math.cos(2 * Math.PI * t);
  const scale = (1 - popOut) * breathe;

  return (
    <div style={{ position: "absolute", bottom: 0, left, width: 196, height: IND_H, opacity: 1 - popOut, transform: `scale(${scale})`, transformOrigin: "left bottom" }}>
      <div style={{ position: "absolute", top: 0, left: 14, width: 182, height: 96, borderRadius: 48, background: C.recv, display: "flex", alignItems: "center", justifyContent: "center", gap: 13 }}>
        {[0, 1, 2].map((d) => (
          <div
            key={d}
            style={{
              width: 25, height: 25, borderRadius: 13, background: C.grey,
              opacity: 0.75 + 0.25 * Math.cos(2 * Math.PI * (t - d * 0.33)),
            }}
          />
        ))}
      </div>
      <div style={{ position: "absolute", bottom: 12, left: 8, width: 28, height: 28, borderRadius: 14, background: C.recv, transform: `scale(${circlePulse})` }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, width: 13, height: 13, borderRadius: 7, background: C.recv, transform: `scale(${circlePulse})` }} />
    </div>
  );
};

// ── Bubble tail — classic two-circle curl ──
export const TailCurl: React.FC<{ me: boolean }> = ({ me }) => (
  <>
    <div
      style={{
        position: "absolute", bottom: 0, width: 54, height: 64,
        background: me ? C.blue : C.recv,
        ...(me ? { right: -19, borderBottomLeftRadius: "42px 38px" } : { left: -19, borderBottomRightRadius: "42px 38px" }),
      }}
    />
    <div
      style={{
        position: "absolute", bottom: 0, width: 70, height: 64,
        background: C.page,
        ...(me ? { right: -70, borderBottomLeftRadius: 28 } : { left: -70, borderBottomRightRadius: 28 }),
      }}
    />
  </>
);

/* ── Native tapback balloon (iOS 18/26): white balloon w/ large emoji, two
   thought-trail dots stepping toward the reactor's side, optional mini
   reactor avatar (group chats). `side` = which top corner of the message
   it overlaps. ── */
export const TapbackBalloon: React.FC<{
  emoji: string;
  side: "left" | "right";
  pop: number;
  reactor?: { initial: string; grad: [string, string] };
}> = ({ emoji, side, pop, reactor }) => {
  if (pop < 0.01) return null;
  const shadow = "0 6px 24px rgba(0,0,0,0.16)";
  const x = side === "left" ? { left: -34 } : { right: -34 };
  return (
    <div style={{ position: "absolute", top: -78, ...x, transform: `scale(${pop})`, transformOrigin: side === "left" ? "left bottom" : "right bottom", zIndex: 6 }}>
      <div style={{ position: "relative", minWidth: 116, height: 100, borderRadius: 50, background: C.page, boxShadow: shadow, border: "1px solid rgba(0,0,0,0.04)", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px" }}>
        <span style={{ fontSize: 54, lineHeight: 1 }}>{emoji}</span>
      </div>
      {/* thought trail toward the reactor side */}
      <div style={{ position: "absolute", bottom: -12, [side]: 6, width: 26, height: 26, borderRadius: 13, background: C.page, boxShadow: shadow }} />
      <div style={{ position: "absolute", bottom: -26, [side]: -4, width: 13, height: 13, borderRadius: 7, background: C.page, boxShadow: shadow }} />
      {reactor && (
        <div style={{ position: "absolute", bottom: -40, [side]: -38, width: 48, height: 48, borderRadius: 24, background: `linear-gradient(180deg, ${reactor.grad[0]} 0%, ${reactor.grad[1]} 100%)`, border: `3px solid ${C.page}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ ...sf(500), fontSize: 22, color: "#fff" }}>{reactor.initial}</span>
        </div>
      )}
    </div>
  );
};
