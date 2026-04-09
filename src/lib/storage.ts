import { UserProfile, EMPTY_PROFILE } from "@/types/profile";

const STORAGE_KEY = "formease_profile";

const VALID_KEYS = new Set<string>(Object.keys(EMPTY_PROFILE));

function sanitizeProfile(stored: Record<string, unknown>): UserProfile {
  const sanitized: Record<string, string> = {};
  for (const key of VALID_KEYS) {
    const value = stored[key];
    sanitized[key] = typeof value === "string" ? value : "";
  }
  return sanitized as unknown as UserProfile;
}

export function loadProfile(): Promise<UserProfile> {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      if (chrome.runtime.lastError) {
        console.warn("[FormEase] Failed to load profile:", chrome.runtime.lastError.message);
        resolve(EMPTY_PROFILE);
        return;
      }
      const stored = result[STORAGE_KEY];
      if (stored && typeof stored === "object") {
        resolve(sanitizeProfile(stored as Record<string, unknown>));
      } else {
        resolve(EMPTY_PROFILE);
      }
    });
  });
}

export function saveProfile(profile: UserProfile): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [STORAGE_KEY]: profile }, () => {
      if (chrome.runtime.lastError) {
        console.warn("[FormEase] Failed to save profile:", chrome.runtime.lastError.message);
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve();
    });
  });
}

export function exportProfile(): void {
  loadProfile().then((profile) => {
    const data = JSON.stringify({ version: 1, profile }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().slice(0, 10);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `formease-profile-${date}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  });
}

export function importProfile(file: File): Promise<UserProfile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (!parsed || typeof parsed !== "object" || parsed.version !== 1 || !parsed.profile) {
          reject(new Error("유효하지 않은 프로필 파일입니다"));
          return;
        }
        const profile = sanitizeProfile(parsed.profile as Record<string, unknown>);
        await saveProfile(profile);
        resolve(profile);
      } catch (error) {
        reject(error instanceof Error ? error : new Error("파일을 읽을 수 없습니다"));
      }
    };
    reader.onerror = () => reject(new Error("파일을 읽을 수 없습니다"));
    reader.readAsText(file);
  });
}

export function onProfileChange(
  callback: (profile: UserProfile) => void,
): () => void {
  const listener = (
    changes: Record<string, chrome.storage.StorageChange>,
    area: string,
  ) => {
    if (area === "local" && changes[STORAGE_KEY]) {
      const newValue = changes[STORAGE_KEY].newValue;
      callback({ ...EMPTY_PROFILE, ...newValue });
    }
  };

  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
