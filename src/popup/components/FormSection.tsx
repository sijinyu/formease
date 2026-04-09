import { useState, ReactNode } from "react";

interface FormSectionProps {
  readonly title: string;
  readonly defaultOpen?: boolean;
  readonly children: ReactNode;
}

function FormSection({ title, defaultOpen = false, children }: FormSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-2.5 px-1 text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        <span>{title}</span>
        <span className="text-gray-400 text-xs">{open ? "▼" : "▶"}</span>
      </button>
      {open && <div className="pb-3 px-1">{children}</div>}
    </div>
  );
}

export default FormSection;
