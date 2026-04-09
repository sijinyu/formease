interface TextAreaFieldProps {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly rows?: number;
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder = "",
  rows = 3,
}: TextAreaFieldProps) {
  return (
    <div className="mb-2">
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 resize-none"
      />
    </div>
  );
}

export default TextAreaField;
