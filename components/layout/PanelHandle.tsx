'use client';

type Props = {
  side: 'left' | 'right';
  isOpen: boolean;
  onToggle: () => void;
  label: string;
};

export default function PanelHandle({ side, isOpen, onToggle, label }: Props) {
  // Chevron direction logic:
  // Left handle: open → ◀ (collapse), closed → ▶ (expand)
  // Right handle: open → ▶ (collapse), closed → ◀ (expand)
  const showLeftChevron = side === 'left' ? isOpen : !isOpen;

  return (
    <button
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-label={label}
      className={`panel-handle panel-handle--${side}`}
    >
      <svg
        width="10"
        height="16"
        viewBox="0 0 10 16"
        fill="none"
        aria-hidden="true"
        className="panel-handle__chevron"
      >
        {showLeftChevron ? (
          <path
            d="M8 1L2 8L8 15"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M2 1L8 8L2 15"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </button>
  );
}
