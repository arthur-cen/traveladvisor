'use client';

import { useEffect, useRef, useState } from 'react';
import type { ChatMessage, Itinerary, TripAnswers } from '@/lib/types';
import { FOLLOW_UP_QUESTIONS } from '@/lib/questions';
import { parseItinerary } from '@/lib/parseItinerary';
import ChatMessageBubble from './ChatMessage';
import ChatInput from './ChatInput';

type Props = {
  tripBasics: Pick<TripAnswers, 'origin' | 'destination' | 'travelDates' | 'days'>;
  onItineraryReady: (itinerary: Itinerary) => void;
  onStreamUpdate: (text: string) => void;
  onStreamingChange: (streaming: boolean) => void;
};

function makeId() {
  return Math.random().toString(36).slice(2);
}

export default function ChatPanel({ tripBasics, onItineraryReady, onStreamUpdate, onStreamingChange }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [answers, setAnswers] = useState<Partial<TripAnswers>>({ ...tripBasics });
  const [queueIndex, setQueueIndex] = useState(0);
  const [phase, setPhase] = useState<'qa' | 'generating' | 'done'>('qa');
  const scrollRef = useRef<HTMLDivElement>(null);

  const applicableQuestions = FOLLOW_UP_QUESTIONS.filter(
    (q) => !q.when || q.when(answers)
  );

  // Post the first question on mount
  useEffect(() => {
    const first = getNextQuestion(0, { ...tripBasics });
    if (first) {
      setMessages([{ id: makeId(), role: 'ai', content: first.text }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  function getNextQuestion(idx: number, currentAnswers: Partial<TripAnswers>) {
    const remaining = FOLLOW_UP_QUESTIONS.slice(idx).filter(
      (q) => !q.when || q.when(currentAnswers)
    );
    return remaining[0] ?? null;
  }

  async function handleSend(text: string) {
    if (phase !== 'qa') return;

    const currentQuestion = getNextQuestion(queueIndex, answers);
    if (!currentQuestion) return;

    const newAnswers: Partial<TripAnswers> = { ...answers, [currentQuestion.key]: text };
    setAnswers(newAnswers);

    const userMsg: ChatMessage = { id: makeId(), role: 'user', content: text };

    // Find the next applicable question after recording this answer
    const nextQuestion = FOLLOW_UP_QUESTIONS.slice(
      FOLLOW_UP_QUESTIONS.indexOf(currentQuestion) + 1
    ).find((q) => !q.when || q.when(newAnswers));

    const nextIndex = nextQuestion
      ? FOLLOW_UP_QUESTIONS.indexOf(nextQuestion)
      : FOLLOW_UP_QUESTIONS.length;

    setQueueIndex(nextIndex);

    if (nextQuestion) {
      const aiMsg: ChatMessage = { id: makeId(), role: 'ai', content: nextQuestion.text };
      setMessages((prev) => [...prev, userMsg, aiMsg]);
    } else {
      const thinkingMsg: ChatMessage = {
        id: makeId(),
        role: 'ai',
        content: '✈️ Great! Planning your trip now — this will take a moment…',
      };
      setMessages((prev) => [...prev, userMsg, thinkingMsg]);
      setPhase('generating');
      await generateItinerary(newAnswers as TripAnswers);
    }
  }

  async function generateItinerary(finalAnswers: TripAnswers) {
    onStreamingChange(true);
    let accumulated = '';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: finalAnswers }),
      });

      if (!res.ok || !res.body) throw new Error('API error');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        onStreamUpdate(accumulated);
      }

      onStreamingChange(false);
      const parsed = parseItinerary(accumulated);
      if (parsed) {
        onItineraryReady(parsed);
      } else {
        // Fallback: show raw text as a single-day itinerary with one activity
        onItineraryReady({
          type: 'single-day',
          destination: finalAnswers.destination,
          dates: finalAnswers.travelDates,
          days: [{ number: 1, activities: [{ time: 'Morning', name: 'Your Itinerary', description: accumulated.slice(0, 200) + '…' }] }],
        });
      }
      setPhase('done');
    } catch {
      onStreamingChange(false);
      setMessages((prev) => [
        ...prev,
        { id: makeId(), role: 'ai', content: '⚠️ Something went wrong generating your itinerary. Please try again.' },
      ]);
      setPhase('qa');
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-white flex-shrink-0">
        <h2 className="font-bold text-hof text-sm">TravelAdvisor</h2>
        <p className="text-foggy text-xs">
          {tripBasics.destination} · {tripBasics.travelDates} · {tripBasics.days} {parseInt(tripBasics.days) === 1 ? 'day' : 'days'}
        </p>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {messages.map((msg) => (
          <ChatMessageBubble key={msg.id} message={msg} />
        ))}
        {phase === 'generating' && (
          <div className="flex gap-1 pl-9">
            <span className="w-2 h-2 rounded-full bg-border animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-border animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-border animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        disabled={phase !== 'qa'}
        placeholder={phase === 'generating' ? 'Generating your itinerary…' : 'Type your answer…'}
      />
    </div>
  );
}
