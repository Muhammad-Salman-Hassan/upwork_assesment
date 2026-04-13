import { useState } from 'react';
import { Trash2, CheckCircle2, ImageIcon } from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { removeOfferCard } from '../../store/slices/pageSlice';
import type { Language, PageNode, FrameNode } from '../../types';
import ImageField from '../../components/fields/ImageField';
import TextField from '../../components/fields/TextField';
import LinkField from '../../components/fields/LinkField';
import SectionTwoPanel from './SectionTwoPanel';

interface OffersSectionEditorProps {
  readonly sectionIndex: number;
  readonly section: PageNode;
  readonly language: Language;
  readonly pageId?: number;
  readonly subPageId?: number;
  readonly onTextChange: (si: number, path: number[], val: string) => void;
  readonly onImageChange: (si: number, path: number[], src: string) => void;
  readonly onCtaChange: (si: number, path: number[], field: 'label_en' | 'label_ar' | 'link_en' | 'link_ar', val: string) => void;
}

export default function OffersSectionEditor({
  sectionIndex, section, language, pageId, subPageId,
  onTextChange, onImageChange, onCtaChange,
}: OffersSectionEditorProps) {
  const dispatch = useAppDispatch();
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  if (section.type !== 'frame') return null;

 
  const cardRow = section.params.children[1];
  const cards: FrameNode[] = cardRow?.type === 'frame'
    ? (cardRow.params.children.filter((c) => c.type === 'frame') as FrameNode[])
    : [];

  const safeIndex = Math.min(selectedIndex, Math.max(cards.length - 1, 0));
  const selectedCard = cards[safeIndex] ?? null;

 
  const cardPath = (cardIdx: number) => [1, cardIdx];

  const imgPath = (cardIdx: number) => [...cardPath(cardIdx), 0];
  
  const titlePath = (cardIdx: number) => [...cardPath(cardIdx), 1, 0];

  const btnPath = (cardIdx: number) => [...cardPath(cardIdx), 1, 1];

  function getCardThumbnail(card: FrameNode) {
    const img = card.params.children[0];
    if (img?.type === 'image') {
      return (language === 'en' ? img.params.src_en : img.params.src_ar) ?? img.params.src ?? '';
    }
    return '';
  }

  function getCardTitle(card: FrameNode) {
    const footer = card.params.children[1];
    if (footer?.type === 'frame') {
      const txt = footer.params.children[0];
      if (txt?.type === 'text') {
        return (language === 'en' ? txt.params.content_en : txt.params.content_ar) ?? '';
      }
    }
    return '';
  }

  const leftPanel = (
    <div className="flex flex-col">
      {cards.map((card, i) => {
        const thumb = getCardThumbnail(card);
        const title = getCardTitle(card);
        const isSelected = safeIndex === i;
        return (
          <button
            key={card.id ?? i}
            type="button"
            onClick={() => setSelectedIndex(i)}
            className={[
              'flex items-center gap-3 px-3 py-2.5 w-full text-left border-b border-gray-100 transition-colors',
              isSelected ? 'bg-blue-50' : 'hover:bg-gray-50',
            ].join(' ')}
          >
            <div className="w-12 h-8 rounded overflow-hidden bg-gray-100 flex-shrink-0 relative">
              {thumb ? (
                <img src={thumb} alt={title || `Offer ${i + 1}`} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <ImageIcon size={14} className="text-gray-300" />
                </div>
              )}
              {isSelected && (
                <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                  <CheckCircle2 size={14} className="text-blue-500" />
                </div>
              )}
            </div>
            <span className={`text-xs flex-1 truncate ${isSelected ? 'font-medium text-blue-600' : 'text-gray-600'}`}>
              {title || `Offer ${i + 1}`}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                dispatch(removeOfferCard({ offerSectionIndex: sectionIndex, cardIndex: i, pageId, subPageId }));
                if (safeIndex >= i && safeIndex > 0) setSelectedIndex(safeIndex - 1);
              }}
              className="flex-shrink-0 p-1 rounded text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </button>
        );
      })}
      {cards.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-8 px-4">No offers yet. Use the + Add button above.</p>
      )}
    </div>
  );

  const langLabel = language.toUpperCase();
  const ctaLabelField = language === 'en' ? 'label_en' : 'label_ar';
  const ctaLinkField = language === 'en' ? 'link_en' : 'link_ar';

  const rightPanel = selectedCard ? (() => {
    const thumb = getCardThumbnail(selectedCard);
    const footer = selectedCard.params.children[1];
    const titleNode = footer?.type === 'frame' ? footer.params.children[0] : null;
    const btnNode = footer?.type === 'frame' ? footer.params.children[1] : null;
    const titleVal = titleNode?.type === 'text'
      ? ((language === 'en' ? titleNode.params.content_en : titleNode.params.content_ar) ?? '')
      : '';
    const cta = btnNode?.type === 'button' ? btnNode.params.cta : undefined;
    const ctaLabel = (cta?.[ctaLabelField] as string) ?? '';
    const ctaLink = (cta?.[ctaLinkField] as string) ?? '';

    return (
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Offer Image ({langLabel})</p>
          <ImageField key={`offer-img-${safeIndex}-${language}`} src={thumb} onImageChange={(src) => onImageChange(sectionIndex, imgPath(safeIndex), src)} />
        </div>
        <TextField
          label={`Offer Title (${langLabel})`}
          value={titleVal}
          onChange={(val) => onTextChange(sectionIndex, titlePath(safeIndex), val)}
        />
        <div className="flex flex-col gap-3 border border-gray-200 rounded-lg p-3">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Button CTA</span>
          <TextField
            label={`Button Label (${langLabel})`}
            value={ctaLabel}
            onChange={(val) => onCtaChange(sectionIndex, btnPath(safeIndex), ctaLabelField, val)}
          />
          <LinkField
            label={`Button Link (${langLabel})`}
            value={ctaLink}
            onChange={(val) => onCtaChange(sectionIndex, btnPath(safeIndex), ctaLinkField, val)}
          />
        </div>
      </div>
    );
  })() : (
    <div className="flex items-center justify-center h-full">
      <p className="text-sm text-gray-400">No offers available</p>
    </div>
  );

  return (
    <SectionTwoPanel
      leftTitle="Offer Management"
      rightTitle={selectedCard ? `Edit Offer ${safeIndex + 1}` : 'Edit Offer'}
      left={leftPanel}
      right={rightPanel}
    />
  );
}
