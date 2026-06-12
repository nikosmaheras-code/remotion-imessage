import { sf } from "./lib/ios26";
import { ChatScreen, createChat } from "./lib/chat";

/* Group demo — sender names + avatars, an image bubble (any JSX renders
   inside the clipped frame), native tapbacks with reactor avatars,
   pace 1.6 to keep it tight */

const SENDERS = {
  me: { name: "you", initial: "Y", grad: ["#A9B0BB", "#8E959F"] as [string, string], me: true },
  sam: { name: "sam", initial: "S", grad: ["#9BA8C2", "#7E8CA8"] as [string, string] },
  dana: { name: "dana", initial: "D", grad: ["#B4AB9E", "#9A917F"] as [string, string] },
  leo: { name: "leo", initial: "L", grad: ["#A3B5A0", "#86997F"] as [string, string] },
};

// any JSX works as a "screenshot" — build your own card component
const SnowReport: React.FC = () => (
  <div style={{ width: "100%", height: "100%", background: "#15191d", padding: "40px 44px", display: "flex", flexDirection: "column" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ ...sf(700), fontSize: 36, color: "#fff" }}>Snow Report</span>
      <span style={{ ...sf(600), fontSize: 26, color: "rgba(255,255,255,0.4)" }}>6:55 AM</span>
    </div>
    <div style={{ height: 2, background: "rgba(255,255,255,0.08)", margin: "28px 0" }} />
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <span style={{ fontSize: 110, lineHeight: 1 }}>❄️</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ ...sf(700), fontSize: 72, color: "#7DD3FC" }}>14"</span>
        <span style={{ ...sf(400), fontSize: 30, color: "rgba(255,255,255,0.45)" }}>fresh overnight</span>
      </div>
    </div>
    <span style={{ ...sf(400), fontSize: 24, color: "rgba(255,255,255,0.3)", marginTop: "auto" }}>summit-cam.example</span>
  </div>
);

const chat = createChat(
  [
    { from: "sam", text: "who's in for the weekend??", lines: 1 },
    { from: "dana", text: "depends on snow", lines: 1 },
    { from: "me", text: "checked at 6am", lines: 1 },
    { from: "me", image: { content: <SnowReport />, height: 460 }, tapback: { emoji: "🤩", by: "sam" } },
    { from: "leo", text: "LEAVING FRIDAY 😤", lines: 1 },
    { from: "dana", text: "renting a car rn", lines: 1 },
    { from: "me", text: "cabin's booked. let's go", lines: 1 },
  ],
  SENDERS,
  { pace: 1.6 },
);

export const DEMO_GROUP_DURATION = chat.duration;

export const DemoGroup: React.FC = () => (
  <ChatScreen
    chat={chat}
    title="ski trip ⛷️"
    avatar={{ kind: "group", emoji: "⛷️", tint: ["#D6E8F7", "#AFD2EE"] }}
  />
);
