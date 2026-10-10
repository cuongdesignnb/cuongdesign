interface YouTubeUrlFieldProps {
  id: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

export default function YouTubeUrlField({ id, value, error, onChange }: YouTubeUrlFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-300">Video YouTube (không bắt buộc)</label>
      <input id={id} name="youtubeUrl" type="text" inputMode="url" value={value}
        onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(error)}
        aria-describedby={`${id}-help${error ? ` ${id}-error` : ""}`}
        className="glass-input w-full px-4 py-2.5 text-sm" />
      <p id={`${id}-help`} className="text-xs text-gray-400">Dán liên kết YouTube. Để trống để không hiển thị video trên trang chi tiết.</p>
      {error && <p id={`${id}-error`} role="alert" className="text-sm text-red-300">{error}</p>}
    </div>
  );
}
