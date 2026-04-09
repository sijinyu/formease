import { useState, useEffect, useCallback, useRef } from "react";
import { UserProfile, EMPTY_PROFILE } from "@/types/profile";
import { loadProfile } from "@/lib/storage";
import { scanFields } from "@/lib/detector";
import { matchFields, MatchResult } from "@/lib/matcher";
import { fillFields, undoFill } from "@/lib/filler";
import FloatingButton from "./components/FloatingButton";
import FillPreview from "./components/FillPreview";

type AppState = "idle" | "ready" | "preview" | "filled";

function ContentApp() {
  const [state, setState] = useState<AppState>("idle");
  const [matches, setMatches] = useState<readonly MatchResult[]>([]);
  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE);
  const [toast, setToast] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const undoSnapshotRef = useRef<ReadonlyMap<HTMLElement, string> | null>(null);

  const detectFields = useCallback(() => {
    try {
      const fields = scanFields();
      const matched = matchFields(fields);
      console.debug("[FormEase] scanFields:", fields.length, "matched:", matched.length);
      setMatches(matched);
      setState(matched.length > 0 ? "ready" : "idle");
    } catch (error) {
      console.error("[FormEase] detectFields failed:", error);
    }
  }, []);

  useEffect(() => {
    loadProfile().then(setProfile);
  }, []);

  useEffect(() => {
    const scheduleDetect = () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(detectFields, 300);
    };

    // 초기 감지: 즉시 + SPA 렌더링 대비 지연 재시도
    detectFields();
    const retryTimer = window.setTimeout(detectFields, 1000);

    // DOM 변경 감시
    const observer = new MutationObserver(scheduleDetect);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class", "hidden"],
    });

    // SPA 라우팅 감지 (pushState/replaceState/popstate)
    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);

    history.pushState = (...args: Parameters<typeof history.pushState>) => {
      originalPushState(...args);
      scheduleDetect();
    };
    history.replaceState = (...args: Parameters<typeof history.replaceState>) => {
      originalReplaceState(...args);
      scheduleDetect();
    };

    const handlePopState = () => scheduleDetect();
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("hashchange", scheduleDetect);

    return () => {
      observer.disconnect();
      clearTimeout(retryTimer);
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("hashchange", scheduleDetect);
    };
  }, [detectFields]);

  const handleFabClick = useCallback(() => {
    loadProfile()
      .then((p) => {
        setProfile(p);
        setState("preview");
      })
      .catch((error) => {
        console.error("[FormEase] Failed to load profile:", error);
        setToast("프로필 로드에 실패했습니다");
        if (toastTimerRef.current !== null) {
          clearTimeout(toastTimerRef.current);
        }
        toastTimerRef.current = window.setTimeout(() => setToast(null), 2500);
      });
  }, []);

  const handleFill = useCallback(
    (selectedKeys: ReadonlySet<string>) => {
      const result = fillFields(matches, profile, selectedKeys);
      undoSnapshotRef.current = result.undoSnapshot;
      setState("filled");
      setToast(`${result.filled}개 필드를 입력했습니다`);
      if (toastTimerRef.current !== null) {
        clearTimeout(toastTimerRef.current);
      }
      toastTimerRef.current = window.setTimeout(() => {
        setToast(null);
        undoSnapshotRef.current = null;
        setState("ready");
      }, 5000);
    },
    [matches, profile],
  );

  const handleUndo = useCallback(() => {
    if (undoSnapshotRef.current) {
      undoFill(undoSnapshotRef.current);
      undoSnapshotRef.current = null;
      setToast("되돌렸습니다");
      if (toastTimerRef.current !== null) {
        clearTimeout(toastTimerRef.current);
      }
      toastTimerRef.current = window.setTimeout(() => {
        setToast(null);
        setState("ready");
      }, 2500);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // Keyboard shortcut command listener
  useEffect(() => {
    const listener = (
      message: { type: string; command: string },
      _sender: chrome.runtime.MessageSender,
      sendResponse: (response?: unknown) => void,
    ) => {
      if (message.type !== "COMMAND") return;

      if (message.command === "open-preview") {
        handleFabClick();
      } else if (message.command === "fill-form") {
        if (matches.length > 0) {
          const allKeys = new Set(matches.map((m) => m.profileKey));
          loadProfile().then((p) => {
            setProfile(p);
            const result = fillFields(matches, p, allKeys);
            undoSnapshotRef.current = result.undoSnapshot;
            setState("filled");
            setToast(`${result.filled}개 필드를 입력했습니다`);
            if (toastTimerRef.current !== null) {
              clearTimeout(toastTimerRef.current);
            }
            toastTimerRef.current = window.setTimeout(() => {
              setToast(null);
              undoSnapshotRef.current = null;
              setState("ready");
            }, 5000);
          });
        }
      }

      sendResponse();
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, [matches, handleFabClick]);

  const handleCancel = useCallback(() => {
    setState("ready");
  }, []);

  return (
    <>
      {state === "ready" && (
        <FloatingButton
          matchCount={matches.length}
          onClick={handleFabClick}
        />
      )}

      {state === "preview" && (
        <FillPreview
          matches={matches}
          profile={profile}
          onFill={handleFill}
          onCancel={handleCancel}
        />
      )}

      {toast && (
        <div className="fixed bottom-5 right-5 z-[99999] bg-green-600 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg animate-pulse flex items-center gap-3">
          <span>{toast}</span>
          {undoSnapshotRef.current && (
            <button
              onClick={handleUndo}
              className="underline font-medium hover:text-green-200 transition-colors"
            >
              되돌리기
            </button>
          )}
        </div>
      )}
    </>
  );
}

export default ContentApp;
