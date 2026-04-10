import { useRef, useState } from "react";
import { fileService } from "../../services/fileService";
import { ImageIcon, Upload, RefreshCw } from "lucide-react";

interface ImageFieldProps {
  readonly src: string;
  readonly onImageChange: (src: string) => void;
}

export default function ImageField({ src, onImageChange }: ImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewSrc, setPreviewSrc] = useState<string>(src);
  const [hasError, setHasError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const processFile = async (file: File) => {
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
    e.target.value = "";
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith("image/")) await processFile(file);
  };

  const triggerPick = () => { if (!uploading) inputRef.current?.click(); };

  const hasImage = !hasError && previewSrc;

  function dropZoneBorder() {
    if (dragOver) return "border-blue-400 bg-blue-50 scale-[1.01]";
    if (hasImage) return "border-transparent hover:border-blue-300";
    return "border-dashed border-gray-200 hover:border-blue-300 bg-gray-50 hover:bg-blue-50/40";
  }

  function emptyIconClass() {
    return dragOver ? "text-blue-500" : "text-gray-400 group-hover:text-blue-500";
  }

  function emptyIconBg() {
    return dragOver ? "bg-blue-100" : "bg-gray-100 group-hover:bg-blue-100";
  }

  function uploadButtonLabel() {
    if (uploading) return "Uploading…";
    if (hasImage) return "Change Image";
    return "Upload Image";
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Drop zone / preview */}
      <button
        type="button"
        aria-label="Upload image"
        disabled={uploading}
        onClick={triggerPick}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={[
          "relative group flex w-full items-center justify-center rounded-xl overflow-hidden cursor-pointer transition-all duration-200",
          "border-2 min-h-[180px]",
          dropZoneBorder(),
        ].join(" ")}
      >
        {hasImage ? (
          <>
            <img
              src={previewSrc}
              alt="Preview"
              className="w-full h-full object-cover max-h-56"
              onError={() => setHasError(true)}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center gap-1.5">
                <div className="bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-md">
                  <RefreshCw size={16} className="text-gray-700" />
                </div>
                <span className="text-white text-xs font-medium drop-shadow">Replace image</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-8 px-6 text-center">
            <div className={["rounded-full p-3 transition-colors", emptyIconBg()].join(" ")}>
              <ImageIcon size={22} className={emptyIconClass()} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-gray-600">
                {dragOver ? "Drop to upload" : "Click or drag image here"}
              </span>
              <span className="text-xs text-gray-400">PNG, JPG, WEBP supported</span>
            </div>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-xs font-medium text-gray-500">Uploading…</span>
          </div>
        )}
      </button>

      {hasError && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
          <span>Upload failed — please try again</span>
        </p>
      )}

      {/* <button
        type="button"
        onClick={triggerPick}
        disabled={uploading}
        className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all disabled:opacity-40"
      >
        <Upload size={13} />
        {uploadButtonLabel()}
      </button> */}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
