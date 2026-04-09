import { UserProfile } from "@/types/profile";
import { MatchResult } from "./matcher";

function setNativeValue(el: HTMLElement, value: string): void {
  if (el.getAttribute("contenteditable") === "true") {
    el.textContent = value;
    el.dispatchEvent(new InputEvent("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new Event("blur", { bubbles: true }));
    return;
  }

  const proto =
    el instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : el instanceof HTMLSelectElement
        ? HTMLSelectElement.prototype
        : HTMLInputElement.prototype;

  const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
  if (descriptor?.set) {
    descriptor.set.call(el, value);
  } else {
    (el as HTMLInputElement).value = value;
  }

  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  el.dispatchEvent(new Event("blur", { bubbles: true }));
}

function highlightField(el: HTMLElement): void {
  const original = el.style.transition;
  const originalBg = el.style.backgroundColor;

  el.style.transition = "background-color 0.3s ease";
  el.style.backgroundColor = "#dbeafe";

  setTimeout(() => {
    el.style.backgroundColor = originalBg;
    setTimeout(() => {
      el.style.transition = original;
    }, 300);
  }, 1500);
}

export interface FillResult {
  readonly filled: number;
  readonly total: number;
  readonly undoSnapshot: ReadonlyMap<HTMLElement, string>;
}

export function fillFields(
  matches: readonly MatchResult[],
  profile: UserProfile,
  selectedKeys: ReadonlySet<string>,
): FillResult {
  let filled = 0;
  const snapshot = new Map<HTMLElement, string>();

  for (const match of matches) {
    if (!selectedKeys.has(match.profileKey)) continue;

    const value = profile[match.profileKey];
    if (!value) continue;

    const el = match.field.element;
    // Capture current value before overwriting
    const previousValue =
      el.getAttribute("contenteditable") === "true"
        ? el.textContent ?? ""
        : (el as HTMLInputElement).value;
    snapshot.set(el, previousValue);

    setNativeValue(el, value);
    highlightField(el);
    filled++;
  }

  return { filled, total: selectedKeys.size, undoSnapshot: snapshot };
}

export function undoFill(snapshot: ReadonlyMap<HTMLElement, string>): void {
  for (const [el, previousValue] of snapshot) {
    setNativeValue(el, previousValue);
    highlightField(el);
  }
}
