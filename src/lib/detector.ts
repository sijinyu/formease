type FillableElement =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement
  | HTMLElement;

export interface FieldSignal {
  readonly element: FillableElement;
  readonly name: string;
  readonly id: string;
  readonly type: string;
  readonly placeholder: string;
  readonly autocomplete: string;
  readonly ariaLabel: string;
  readonly labelText: string;
  readonly siblingText: string;
}

function getAssociatedLabelText(el: HTMLElement): string {
  const id = el.getAttribute("id");
  if (id) {
    const label = document.querySelector(`label[for="${CSS.escape(id)}"]`);
    if (label) return label.textContent?.trim() ?? "";
  }

  const parentLabel = el.closest("label");
  if (parentLabel) return parentLabel.textContent?.trim() ?? "";

  return "";
}

function getSiblingText(el: HTMLElement): string {
  const prev = el.previousElementSibling;
  if (prev && prev.textContent) {
    const text = prev.textContent.trim();
    if (text.length > 0 && text.length < 50) return text;
  }

  const parent = el.parentElement;
  if (parent) {
    for (const child of parent.children) {
      if (child === el) continue;
      if (
        child.tagName === "SPAN" ||
        child.tagName === "DIV" ||
        child.tagName === "P"
      ) {
        const text = child.textContent?.trim() ?? "";
        if (text.length > 0 && text.length < 50) return text;
      }
    }
  }

  return "";
}

function isVisible(el: HTMLElement): boolean {
  const style = getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return false;
  if (el.getAttribute("type") === "hidden") return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function isFillable(el: HTMLElement): boolean {
  if (el instanceof HTMLTextAreaElement) return true;
  if (el instanceof HTMLSelectElement) return true;
  if (el instanceof HTMLInputElement) {
    const skip = new Set([
      "hidden",
      "submit",
      "button",
      "reset",
      "image",
      "file",
      "checkbox",
      "radio",
    ]);
    return !skip.has(el.type);
  }
  if (el.getAttribute("contenteditable") === "true") return true;
  return false;
}

export function scanFields(): readonly FieldSignal[] {
  const elements = document.querySelectorAll<HTMLElement>(
    'input, textarea, select, [contenteditable="true"]',
  );

  const fields: FieldSignal[] = [];

  for (const el of elements) {
    if (!isFillable(el)) continue;
    if (!isVisible(el)) continue;

    fields.push({
      element: el,
      name: el.getAttribute("name") ?? "",
      id: el.getAttribute("id") ?? "",
      type: el instanceof HTMLInputElement ? el.type : el.tagName.toLowerCase(),
      placeholder: el.getAttribute("placeholder") ?? "",
      autocomplete: el.getAttribute("autocomplete") ?? "",
      ariaLabel: el.getAttribute("aria-label") ?? "",
      labelText: getAssociatedLabelText(el),
      siblingText: getSiblingText(el),
    });
  }

  return fields;
}

export function hasFormOnPage(): boolean {
  return scanFields().length >= 2;
}
