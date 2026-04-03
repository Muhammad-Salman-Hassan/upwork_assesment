import { forwardRef, useImperativeHandle, useRef, useState } from "react";

interface ImageFieldProps {
  src: string;
  onImageChange: (src: string) => void;
}

export interface ImageFieldHandle {
  triggerSelect: () => void;
}

const ImageField = forwardRef<ImageFieldHandle, ImageFieldProps>(
  ({ src, onImageChange }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [previewSrc, setPreviewSrc] = useState<string>(src);
    const [hasError, setHasError] = useState(false);

    useImperativeHandle(ref, () => ({
      triggerSelect: () => inputRef.current?.click(),
    }));

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const objectUrl = URL.createObjectURL(file);
      setPreviewSrc(objectUrl);
      setHasError(false);
      onImageChange(objectUrl);
    };

    return (
      <div className="border border-gray-200 rounded-lg p-3 bg-white">
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
              <span className="text-gray-400 text-sm">Image</span>
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
      </div>
    );
  }
);

ImageField.displayName = "ImageField";

export default ImageField;
