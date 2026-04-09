import { useState } from "react";
import { UserProfile, PROFILE_LABELS, ProfileKey } from "@/types/profile";
import { MatchResult } from "@/lib/matcher";

interface FillPreviewProps {
  readonly matches: readonly MatchResult[];
  readonly profile: UserProfile;
  readonly onFill: (selectedKeys: ReadonlySet<string>) => void;
  readonly onCancel: () => void;
}

function FillPreview({ matches, profile, onFill, onCancel }: FillPreviewProps) {
  const [selected, setSelected] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const m of matches) {
      if (profile[m.profileKey]) {
        initial.add(m.profileKey);
      }
    }
    return initial;
  });

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <div className="fixed bottom-20 right-5 z-[99999] w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
        <h3 className="text-sm font-bold text-blue-900">FormEase 미리보기</h3>
        <p className="text-xs text-blue-600 mt-0.5">
          채울 필드를 선택하세요 ({selected.size}개 선택)
        </p>
      </div>

      <div className="max-h-60 overflow-y-auto px-3 py-2">
        {matches.map((match) => {
          const key = match.profileKey as ProfileKey;
          const value = profile[key];
          const hasValue = !!value;
          const label = PROFILE_LABELS[key];

          return (
            <label
              key={key}
              className={`flex items-start gap-2 py-1.5 cursor-pointer ${
                !hasValue ? "opacity-50" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={selected.has(key)}
                onChange={() => toggle(key)}
                disabled={!hasValue}
                className="mt-0.5 accent-blue-600"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-700">
                  {label}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {hasValue ? value : "(프로필에 없음)"}
                </div>
              </div>
            </label>
          );
        })}
      </div>

      <div className="flex gap-2 px-3 py-2.5 border-t border-gray-100">
        <button
          onClick={() => onFill(selected)}
          disabled={selected.size === 0}
          className="flex-1 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          입력하기
        </button>
        <button
          onClick={onCancel}
          className="flex-1 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-md hover:bg-gray-200 transition-colors"
        >
          취소
        </button>
      </div>
    </div>
  );
}

export default FillPreview;
