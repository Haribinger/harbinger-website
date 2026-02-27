import { ScrollArea } from "@/components/ui/scroll-area";
import type { ChatMsg } from "@/lib/demo/types";
import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";

interface ChatMessagesProps {
  messages: ChatMsg[];
}

export default function ChatMessages({ messages }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <ScrollArea className="flex-1 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto py-6 space-y-4">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} msg={msg} />
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
