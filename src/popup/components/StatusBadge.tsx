import { UserProfile, PROFILE_KEYS } from "@/types/profile";

interface StatusBadgeProps {
  readonly profile: UserProfile;
}

function StatusBadge({ profile }: StatusBadgeProps) {
  const filled = PROFILE_KEYS.filter((key) => profile[key].trim() !== "").length;
  const total = PROFILE_KEYS.length;
  const percent = Math.round((filled / total) * 100);

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 whitespace-nowrap">
        프로필 완성도: {percent}%
      </span>
    </div>
  );
}

export default StatusBadge;
