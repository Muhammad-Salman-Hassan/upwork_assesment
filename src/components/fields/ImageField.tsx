import { useRef, useState } from "react";
import { fileService } from "../../services/fileService";

interface ImageFieldProps {
  readonly src: string;
  readonly onImageChange: (src: string) => void;
}

export default function ImageField({ src, onImageChange }: ImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewSrc, setPreviewSrc] = useState<string>(src);
  const [hasError, setHasError] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewSrc(URL.createObjectURL(file));
    setHasError(false);
    setUploading(true);

    try {
      const url = await fileService.uploadFile(file);
      setPreviewSrc(url);
      onImageChange(url);
    } catch {
      setHasError(true);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 border border-gray-200 rounded-lg p-3 bg-white">
      <div className="flex items-center justify-center min-h-[220px] bg-gray-100 rounded-lg overflow-hidden">
        {!hasError && previewSrc ? (
          <img
            src={previewSrc}
            alt="Section"
            className="w-full h-full object-cover max-h-64"
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="flex items-center justify-center w-full min-h-[220px] bg-gray-200 rounded-lg">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white text-sm px-4 py-1.5 rounded transition-colors self-start"
      >
        {uploading ? "Uploading..." : "Change Image"}
      </button>
    </div>
  );
}
