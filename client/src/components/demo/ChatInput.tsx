import { motion } from "framer-motion";
import { Send, Square } from "lucide-react";
import { useState } from "react";

interface ChatInputProps {
  onSubmit: (text: string) => void;
  onCancel: () => void;
  isPlaying: boolean;
  disabled?: boolean;
  connectionError?: string | null;
}

export default function ChatInput({
  onSubmit,
  onCancel,
  isPlaying,
  disabled,
  connectionError,
}: ChatInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue("");
  };

  return (
    <div className="border-t border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-sm px-4 sm:px-6 py-3">
      <div className="max-w-3xl mx-auto flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={
              isPlaying
                ? "Scan running..."
                : "Enter a target to scan, e.g. 'scan example.com' or just 'example.com'..."
            }
            disabled={isPlaying || disabled}
            rows={1}
            className="w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-[13px] text-white placeholder:text-[#444] focus:outline-none focus:border-[#00d4ff]/30 focus:ring-1 focus:ring-[#00d4ff]/20 disabled:opacity-40 transition-colors"
          />
        </div>
        {isPlaying ? (
          <motion.button
            onClick={onCancel}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="shrink-0 p-2.5 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] hover:bg-[#ef4444]/20 transition-colors"
            title="Stop scan"
          >
            <Square className="w-4 h-4" />
          </motion.button>
        ) : (
          <motion.button
            onClick={handleSubmit}
            disabled={!value.trim() || disabled}
            whileHover={
              value.trim() && !disabled ? { scale: 1.05 } : undefined
            }
            whileTap={
              value.trim() && !disabled ? { scale: 0.95 } : undefined
            }
            className="shrink-0 p-2.5 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/20 text-[#00d4ff] hover:bg-[#00d4ff]/20 transition-colors disabled:opacity-30 disabled:hover:bg-[#00d4ff]/10"
            title="Start scan"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        )}
      </div>
      {connectionError ? (
        <p className="max-w-3xl mx-auto mt-1.5 text-[10px] text-[#ef4444]">
          {connectionError}
        </p>
      ) : (
        <p className="max-w-3xl mx-auto mt-1.5 text-[10px] text-[#333]">
          Requires backend on port 8080. Real agents will spawn Docker containers and stream live results.
        </p>
      )}
    </div>
  );
}
