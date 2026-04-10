import { useRef, useState } from 'react';
import { GripVertical, ImageIcon, Upload } from 'lucide-react';
import { fileService } from '../services/fileService';
import type { Language, PageNode } from '../types';

interface SliderEditorProps {
  readonly slides: PageNode[];
  readonly language: Language;
  readonly sectionIndex: number;
  readonly onSlideImageChange: (sectionIndex: number, slideIndex: number, src: string) => void;
  readonly onReorderSlides: (sectionIndex: number, fromIndex: number, toIndex: number) => void;
}

interface SlideCardProps {
  readonly slide: PageNode;
  readonly index: number;
  readonly language: Language;
  readonly isDragOver: boolean;
  readonly onDragStart: () => void;
  readonly onDragOver: (e: React.DragEvent) => void;
  readonly onDrop: (e: React.DragEvent) => void;
  readonly onDragEnd: () => void;
  readonly onImageChange: (src: string) => void;
}

function SlideCard({
  slide,
  index,
  language,
  isDragOver,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onImageChange,
}: SlideCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  // Only used during upload for optimistic preview — cleared on completion
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  const p = slide.params as { alt?: string; src_en?: string; src_ar?: string; src?: string };
  const label = p.alt || `Slide ${index + 1}`;
  // Derived reactively from Redux state — updates correctly on language switch
  const currentSrc = (language === 'en' ? p.src_en : p.src_ar) ?? p.src ?? '';
  const displaySrc = uploadPreview ?? currentSrc;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadPreview(URL.createObjectURL(file));
    setHasError(false);
    setUploading(true);
    try {
      const url = await fileService.uploadFile(file);
      onImageChange(url);
    } catch {
      setHasError(true);
    } finally {
      setUploadPreview(null);
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={[
        'group relative flex flex-col rounded-2xl overflow-hidden border bg-white transition-all duration-150 select-none',
        isDragOver
          ? 'border-blue-400 ring-2 ring-blue-200 shadow-lg scale-[1.02]'
          : 'border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300',
      ].join(' ')}
    >
      {/* Thumbnail area */}
      <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
        {!hasError && displaySrc ? (
          <img
            src={displaySrc}
            alt={label}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full gap-2">
            <ImageIcon size={28} className="text-gray-300" />
            <span className="text-xs text-gray-400">No image</span>
          </div>
        )}

        {/* Drag-over overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
            <span className="text-blue-600 text-xs font-semibold bg-white/90 px-2 py-1 rounded-full">
              Drop here
            </span>
          </div>
        )}

        {/* Position badge — top left */}
        <span className="absolute top-2 left-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-black/50 text-white text-xs font-bold backdrop-blur-sm">
          {index + 1}
        </span>

        {/* Grip — top right */}
        <span
          aria-label="Drag to reorder"
          role="img"
          className="absolute top-2 right-2 cursor-grab active:cursor-grabbing text-white/70 hover:text-white transition-colors bg-black/30 rounded-md p-0.5 backdrop-blur-sm"
        >
          <GripVertical size={16} />
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 px-3 py-2.5 bg-white">
        <span className="text-xs font-medium text-gray-600 truncate flex-1">{label}</span>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-600 transition-colors disabled:opacity-50 flex-shrink-0"
        >
          <Upload size={12} />
          {uploading ? 'Uploading…' : 'Replace'}
        </button>
      </div>
    </div>
  );
}

export default function SliderEditor({
  slides,
  language,
  sectionIndex,
  onSlideImageChange,
  onReorderSlides,
}: SliderEditorProps) {
  const dragIndex = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    dragIndex.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex.current !== null && dragIndex.current !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex.current !== null && dragIndex.current !== index) {
      onReorderSlides(sectionIndex, dragIndex.current, index);
    }
    dragIndex.current = null;
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    dragIndex.current = null;
    setDragOverIndex(null);
  };

  return (
    <div className="flex flex-col gap-4 mb-2 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-gray-800">Slider Images</span>
          <span className="text-xs text-gray-400">Drag cards to reorder · click Replace to upload</span>
        </div>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
          {slides.length} slides
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-3">
        {slides.map((slide, i) => (
          <SlideCard
            key={slide.id ?? i}
            slide={slide}
            index={i}
            language={language}
            isDragOver={dragOverIndex === i}
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDrop={(e) => handleDrop(e, i)}
            onDragEnd={handleDragEnd}
            onImageChange={(src) => onSlideImageChange(sectionIndex, i, src)}
          />
        ))}
      </div>
    </div>
  );
}
