import { useState, useEffect, useCallback, useRef } from "react";
import { UserProfile, ProfileKey, EMPTY_PROFILE } from "@/types/profile";
import { loadProfile, saveProfile, exportProfile, importProfile } from "@/lib/storage";
import ProfileForm from "./components/ProfileForm";
import StatusBadge from "./components/StatusBadge";

type SaveStatus = "idle" | "saving" | "saved" | "auto-saved" | "error";

function Popup() {
  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const isInitialLoad = useRef(true);
  const autoSaveTimerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProfile().then(setProfile);
  }, []);

  // Auto-save on profile change (debounced 1s)
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    if (autoSaveTimerRef.current !== null) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = window.setTimeout(async () => {
      try {
        await saveProfile(profile);
        setStatus("auto-saved");
      } catch {
        setStatus("error");
      }
    }, 1000);

    return () => {
      if (autoSaveTimerRef.current !== null) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [profile]);

  const handleChange = useCallback((key: ProfileKey, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
    setStatus("idle");
  }, []);

  const handleSave = useCallback(async () => {
    setStatus("saving");
    try {
      await saveProfile(profile);
      setStatus("saved");
    } catch (error) {
      console.error("[FormEase] Failed to save profile:", error);
      setStatus("error");
    }
  }, [profile]);

  const handleExport = useCallback(() => {
    exportProfile();
  }, []);

  const handleImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const imported = await importProfile(file);
        setProfile(imported);
        isInitialLoad.current = true; // Prevent auto-save loop
        setStatus("saved");
      } catch (error) {
        console.error("[FormEase] Failed to import profile:", error);
        setStatus("error");
      }

      // Reset file input so the same file can be re-imported
      e.target.value = "";
    },
    [],
  );

  return (
    <div className="w-96 max-h-[600px] flex flex-col bg-white">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h1 className="text-base font-bold text-gray-900">FormEase</h1>
        {(status === "saved" || status === "auto-saved") && (
          <span className="text-xs text-green-600 font-medium">
            {status === "auto-saved" ? "자동 저장됨 ✓" : "저장됨 ✓"}
          </span>
        )}
        {status === "error" && (
          <span className="text-xs text-red-600 font-medium">저장 실패</span>
        )}
      </div>
      <p className="px-4 pb-2 text-xs text-gray-500">
        내 프로필을 저장하고 폼을 자동으로 채우세요
      </p>

      <div className="flex-1 overflow-y-auto px-4">
        <ProfileForm profile={profile} onChange={handleChange} />
      </div>

      <div className="px-4 py-3 border-t border-gray-100 space-y-2">
        <button
          onClick={handleSave}
          disabled={status === "saving"}
          className="w-full py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {status === "saving" ? "저장 중..." : "저장"}
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex-1 py-1.5 px-3 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            내보내기
          </button>
          <button
            onClick={handleImport}
            className="flex-1 py-1.5 px-3 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            가져오기
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        <StatusBadge profile={profile} />
      </div>
    </div>
  );
}

export default Popup;
