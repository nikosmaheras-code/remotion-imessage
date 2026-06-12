import { ChatScreen, createChat } from "./lib/chat";

/* 1:1 demo — typing indicator, input-bar typing, link card, Delivered→Read */

const SENDERS = {
  me: { name: "you", initial: "Y", grad: ["#A9B0BB", "#8E959F"] as [string, string], me: true },
  alex: { name: "Alex", initial: "A", grad: ["#A9B0BB", "#8E959F"] as [string, string] },
};

const chat = createChat(
  [
    { from: "alex", text: "dinner tonight?", lines: 1 },
    { from: "me", text: "obviously 🍜", lines: 1 },
    { from: "alex", text: "8? that new ramen spot", lines: 1 },
    {
      from: "me",
      text: "ramen-ichiban.example",
      linkCard: {
        title: "Ramen Ichiban",
        domain: "ramen-ichiban.example",
        content: <span style={{ fontSize: 120, lineHeight: 1 }}>🍜</span>,
      },
    },
    { from: "me", text: "8 works", lines: 1 },
    { from: "alex", text: "say less 🤝", lines: 1 },
  ],
  SENDERS,
);

export const DEMO_DM_DURATION = chat.duration;

export const DemoDM: React.FC = () => (
  <ChatScreen
    chat={chat}
    title="Alex"
    avatar={{ kind: "contact", initial: "A", grad: ["#A9B0BB", "#8E959F"] }}
    readReceipts
  />
);
