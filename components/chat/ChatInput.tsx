'use client';

import { useState, KeyboardEvent } from 'react';

type Props = {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

export default function ChatInput({
  onSend,
  disabled,
  placeholder = 'Adjust your expedition — e.g. "swap Day 2 lunch for seafood"…',
}: Props) {
  const [value, setValue] = useState('');

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  }

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="canvas-chat-dock">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKey}
        disabled={disabled}
        placeholder={placeholder}
        rows={1}
        className="exp-input"
        style={{ minHeight: '38px', maxHeight: '120px' }}
        onInput={(e) => {
          const el = e.currentTarget;
          el.style.height = 'auto';
          el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
        }}
      />
      <button
        onClick={handleSend}
        disabled={!value.trim() || disabled}
        className="canvas-chat-send"
        aria-label="Send refinement"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
      </button>
    </div>
  );
}
