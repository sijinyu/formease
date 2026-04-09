interface FloatingButtonProps {
  readonly matchCount: number;
  readonly onClick: () => void;
}

function FloatingButton({ matchCount, onClick }: FloatingButtonProps) {
  if (matchCount === 0) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-5 right-5 z-[99999] w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
      title="FormEase - 폼 자동 채우기"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
      {matchCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {matchCount > 9 ? "9+" : matchCount}
        </span>
      )}
    </button>
  );
}

export default FloatingButton;
