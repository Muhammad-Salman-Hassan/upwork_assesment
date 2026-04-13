import { useState } from "react";
import { CheckCircle2, UserIcon } from "lucide-react";
import type { FrameNode, Language } from "../types";
import ImageField from "./fields/ImageField";
import TextField from "./fields/TextField";
import SectionTwoPanel from "../pages/Home/SectionTwoPanel";

export interface CardEntry {
  card: FrameNode;
  imgPath: number[];
  namePath: number[];
  posPath: number[];
}

interface PersonCardEditorProps {
  cards: CardEntry[];
  sectionIndex: number;
  language: Language;
  onTextChange: (si: number, path: number[], val: string) => void;
  onImageChange: (si: number, path: number[], src: string) => void;
}

export function getCardImage(card: FrameNode, language: Language): string {
  const imageNode = card.params.children[0];
  if (imageNode?.type === "image") {
    return (language === "en" ? imageNode.params.src_en : imageNode.params.src_ar) ?? imageNode.params.src ?? "";
  }
  return "";
}

export function getCardName(card: FrameNode, language: Language): string {
  const infoFrame = card.params.children[1];
  const nameNode = infoFrame?.type === "frame" ? infoFrame.params.children[0] : null;
  if (nameNode?.type === "text") {
    return (language === "en" ? nameNode.params.content_en : nameNode.params.content_ar) ?? nameNode.params.content ?? "";
  }
  return "";
}

export function getCardPosition(card: FrameNode, language: Language): string {
  const infoFrame = card.params.children[1];
  const posNode = infoFrame?.type === "frame" ? infoFrame.params.children[1] : null;
  if (posNode?.type === "text") {
    return (language === "en" ? posNode.params.content_en : posNode.params.content_ar) ?? posNode.params.content ?? "";
  }
  return "";
}

export default function PersonCardEditor({
  cards,
  sectionIndex,
  language,
  onTextChange,
  onImageChange,
}: PersonCardEditorProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const safeIndex = Math.min(selectedIndex, Math.max(cards.length - 1, 0));
  const selectedEntry = cards[safeIndex] ?? null;

  const { card } = selectedEntry;
  
    const name = getCardName(card, language);
  const leftPanel = (
    <div className="flex flex-col">
      {cards.map(({ card }, i) => {
        const thumb = getCardImage(card, language);
        const name = getCardName(card, language);
        const isSelected = safeIndex === i;
        return (
          <button
            key={card.id ?? i}
            type="button"
            onClick={() => setSelectedIndex(i)}
            className={[
              "flex items-center gap-3 px-3 py-2.5 w-full text-left border-b border-gray-100 transition-colors",
              isSelected ? "bg-blue-50" : "hover:bg-gray-50",
            ].join(" ")}
          >
            <div className="w-12 h-8 rounded overflow-hidden bg-gray-100 flex-shrink-0 relative">
              {thumb ? (
                <img src={thumb} alt={name || `Person ${i + 1}`} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <UserIcon size={14} className="text-gray-300" />
                </div>
              )}
              {isSelected && (
                <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                  <CheckCircle2 size={14} className="text-blue-500" />
                </div>
              )}
            </div>
            <span className={`text-xs flex-1 truncate ${isSelected ? "font-medium text-blue-600" : "text-gray-600"}`}>
              {name || `Person ${i + 1}`}
            </span>
          </button>
        );
      })}
      {cards.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-8 px-4">No persons available.</p>
      )}
    </div>
  );

  const rightPanel = selectedEntry ? (() => {
    const { card, imgPath, namePath, posPath } = selectedEntry;
    const thumb = getCardImage(card, language);
    const name = getCardName(card, language);
    const position = getCardPosition(card, language);
    const langLabel = language.toUpperCase();
    return (
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Photo ({langLabel})</p>
          <ImageField
            key={`person-img-${safeIndex}-${language}`}
            src={thumb}
            onImageChange={(src) => onImageChange(sectionIndex, imgPath, src)}
          />
        </div>
        <TextField
          label={`Name (${langLabel})`}
          value={name}
          onChange={(val) => onTextChange(sectionIndex, namePath, val)}
        />
        <TextField
          label={`Position (${langLabel})`}
          value={position}
          onChange={(val) => onTextChange(sectionIndex, posPath, val)}
        />
      </div>
    );
  })() : (
    <div className="flex items-center justify-center h-full">
      <p className="text-sm text-gray-400">No person selected.</p>
    </div>
  );


  console.log(selectedEntry)
  return (
    <SectionTwoPanel
      leftTitle="Person Cards"
      rightTitle={selectedEntry ? `${name}` : "Edit Person"}
      left={leftPanel}
      right={rightPanel}
    />
  );
}
