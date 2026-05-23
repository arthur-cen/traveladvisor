'use client';

import type { ChatMessage } from '@/lib/types';

export default function ChatMessageBubble({ message }: { message: ChatMessage }) {
  const isAi = message.role === 'ai';

  return (
    <div className={`flex gap-2 ${isAi ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      {isAi && (
        <div className="w-7 h-7 rounded-full bg-rausch flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
          TA
        </div>
      )}

      {/* Bubble */}
      <div
        className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
          isAi
            ? 'bg-white border border-border text-hof rounded-tl-sm shadow-sm'
            : 'bg-rausch text-white rounded-tr-sm'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
