import type { Language, PageNode, FrameNode } from '../../types';
import { getEditableNodes } from '../../utils/getEditableNodes';
import type { EditableNode } from '../../utils/getEditableNodes';
import TextField from '../../components/fields/TextField';
import TextareaField from '../../components/fields/TextareaField';
import ImageField from '../../components/fields/ImageField';
import LinkField from '../../components/fields/LinkField';
import PersonCardEditor, { type CardEntry, getCardImage, getCardName, getCardPosition } from '../../components/PersonCardEditor';
import SliderEditor from '../../components/SliderEditor';

const PERSON_CARD_SLUGS = new Set(['vice-word', 'board-of-directors', 'management-team']);

interface WhyProps {
  readonly sectionIndex: number;
  readonly section: PageNode;
  readonly language: Language;
  readonly slug?: string;
  readonly onTextChange: (sectionIndex: number, path: number[], value: string) => void;
  readonly onImageChange: (sectionIndex: number, path: number[], src: string) => void;
  readonly onSlideImageChange: (sectionIndex: number, slideIndex: number, src: string) => void;
  readonly onReorderSlides: (sectionIndex: number, fromIndex: number, toIndex: number) => void;
  readonly onDeleteSlide: (sectionIndex: number, slideIndex: number) => void;
  readonly onLinkChange: (sectionIndex: number, path: number[], field: "link_en" | "link_ar", value: string) => void;
  readonly onCtaChange: (sectionIndex: number, path: number[], field: "label_en" | "label_ar" | "link_en" | "link_ar", value: string) => void;
}


interface NodeFieldProps {
  node: EditableNode['node'];
  path: number[];
  sectionIndex: number;
  language: Language;
  onTextChange: WhyProps['onTextChange'];
  onImageChange: WhyProps['onImageChange'];
  onLinkChange: WhyProps['onLinkChange'];
  onCtaChange: WhyProps['onCtaChange'];
}

function NodeField({ node, path, sectionIndex, language, onTextChange, onImageChange, onLinkChange, onCtaChange }: NodeFieldProps) {
  const langKey = language === 'en' ? 'en' : 'ar';

  if (node.type === 'text') {
    const value = (langKey === 'en' ? node.params.content_en : node.params.content_ar) ?? node.params.content ?? '';
    const linkField = langKey === 'en' ? 'link_en' : 'link_ar';
    const hasLink = node.params.link_en !== undefined || node.params.link_ar !== undefined;
    return (
      <div className="flex flex-col gap-2">
        <TextField label={`Edit ${node.params.label ?? 'Title'}`} value={value} onChange={(val) => onTextChange(sectionIndex, path, val)} />
        {hasLink && <LinkField label={`Link (${language.toUpperCase()})`} value={(node.params[linkField] as string) ?? ''} onChange={(val) => onLinkChange(sectionIndex, path, linkField as 'link_en' | 'link_ar', val)} />}
      </div>
    );
  }

  if (node.type === 'textarea') {
    const value = (langKey === 'en' ? node.params.content_en : node.params.content_ar) ?? node.params.content ?? '';
    const linkField = langKey === 'en' ? 'link_en' : 'link_ar';
    const hasLink = node.params.link_en !== undefined || node.params.link_ar !== undefined;
    return (
      <div className="flex flex-col gap-2">
        <TextareaField label={`Edit ${node.params.label ?? 'Content'}`} value={value} onChange={(val) => onTextChange(sectionIndex, path, val)} />
        {hasLink && <LinkField label={`Link (${language.toUpperCase()})`} value={(node.params[linkField] as string) ?? ''} onChange={(val) => onLinkChange(sectionIndex, path, linkField as 'link_en' | 'link_ar', val)} />}
      </div>
    );
  }

  if (node.type === 'image') {
    const src = (langKey === 'en' ? node.params.src_en : node.params.src_ar) ?? node.params.src ?? '';
    return <ImageField src={src} onImageChange={(val) => onImageChange(sectionIndex, path, val)} />;
  }

  if (node.type === 'button') {
    const cta = node.params.cta ?? {};
    const labelField = langKey === 'en' ? 'label_en' : 'label_ar';
    const ctaLinkField = langKey === 'en' ? 'link_en' : 'link_ar';
    return (
      <div className="flex flex-col gap-2 border border-gray-200 rounded-lg p-3 bg-white">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Button CTA</span>
        <TextField label={`Label (${language.toUpperCase()})`} value={(cta[labelField] as string) ?? ''} onChange={(val) => onCtaChange(sectionIndex, path, labelField as 'label_en' | 'label_ar', val)} />
        <LinkField label={`Link (${language.toUpperCase()})`} value={(cta[ctaLinkField] as string) ?? ''} onChange={(val) => onCtaChange(sectionIndex, path, ctaLinkField as 'link_en' | 'link_ar', val)} />
      </div>
    );
  }

  return null;
}

function getChildEditableNodes(child: PageNode, childIndex: number): EditableNode[] {
  if (child.type === 'text' || child.type === 'textarea' || child.type === 'image') {
    return [{ node: child, path: [childIndex] }];
  }
  if (child.type === 'frame') {
    return getEditableNodes(child.params.children, [childIndex]);
  }
  return [];
}


function isPersonCard(node: PageNode): node is FrameNode {
  if (node.type !== 'frame') return false;

  const kids = node.params.children;
  return kids.length >= 2 && kids[0].type === 'image' && kids[1].type === 'frame';
}


function isPersonCardRow(node: PageNode): node is FrameNode {
  if (node.type !== 'frame') return false;
  const kids = node.params.children;
  return kids.length > 0 && kids.every(isPersonCard);
}

export default function Why({
  sectionIndex,
  section,
  language,
  slug,
  onTextChange,
  onImageChange,
  onSlideImageChange,
  onReorderSlides,
  onDeleteSlide,
  onLinkChange,
  onCtaChange,
}: WhyProps) {
  const showPersonCards = slug !== undefined && PERSON_CARD_SLUGS.has(slug);

  if (section.type === 'slider') {
    const slides = section.params.slides ?? [];
    return (
      <SliderEditor
        slides={slides}
        language={language}
        sectionIndex={sectionIndex}
        onSlideImageChange={onSlideImageChange}
        onReorderSlides={onReorderSlides}
        onDeleteSlide={onDeleteSlide}
      />
    );
  }

  const children: PageNode[] =
    section.type === 'frame' ? section.params.children : [];

  const allCardEntries: CardEntry[] = showPersonCards
    ? children.flatMap((child, childIndex) => {
        const asFrame = child.type === 'frame' ? child : null;
        if (!asFrame) return [];
        const isDirect: boolean = isPersonCard(asFrame);
        const isRow: boolean = isPersonCardRow(asFrame);
        if (isDirect) {
      
          return [{
            card: asFrame,
            imgPath:  [childIndex, 0],
            namePath: [childIndex, 1, 0],
            posPath:  [childIndex, 1, 1],
          }];
        }
        if (isRow) {
         
          return (asFrame.params.children as FrameNode[]).map((card, cardIdx) => ({
            card,
            imgPath:  [childIndex, cardIdx, 0],
            namePath: [childIndex, cardIdx, 1, 0],
            posPath:  [childIndex, cardIdx, 1, 1],
          }));
        }
        return [];
      })
    : [];

  return (
    <div className='flex flex-col gap-6'>
      {(showPersonCards && allCardEntries.length === 1) && (() => {
        const { card, imgPath, namePath, posPath } = allCardEntries[0];
        const langLabel = language.toUpperCase();
        const name     = getCardName(card, language);
        const position = getCardPosition(card, language);
        const src      = getCardImage(card, language);
        return (
          <div className='flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 p-4 gap-5'>
            {(name || position) && (
              <div className="flex flex-col gap-0.5 border-b border-gray-100 pb-3">
                {name     && <p className="text-sm font-semibold text-gray-700">{name}</p>}
                {position && <p className="text-xs text-gray-400">{position}</p>}
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Photo ({langLabel})</p>
              <ImageField src={src} onImageChange={(val) => onImageChange(sectionIndex, imgPath, val)} />
            </div>
            <TextField label={`Name (${langLabel})`}     value={name}     onChange={(val) => onTextChange(sectionIndex, namePath, val)} />
            <TextField label={`Position (${langLabel})`} value={position} onChange={(val) => onTextChange(sectionIndex, posPath,  val)} />
          </div>
        );
      })()}
      {children.map((child, childIndex) => {
        const asFrame = child.type === 'frame' ? child : null;

        const isCardRow: boolean = asFrame !== null && isPersonCardRow(asFrame);
        const isDirectCard: boolean = asFrame !== null && isPersonCard(asFrame);
        if (isCardRow || isDirectCard) return null;

        const editableNodes = getChildEditableNodes(child, childIndex);
        const frameLinkField = language === 'en' ? 'link_en' : 'link_ar';

        const frameHasLink = asFrame !== null &&
          (asFrame.params.link_en !== undefined || asFrame.params.link_ar !== undefined);
        const frameLinkValue = frameHasLink && asFrame
          ? ((asFrame.params[frameLinkField] as string) ?? '')
          : '';

        const nestedCardLinks = asFrame
          ? asFrame.params.children
            .map((grandchild, gcIdx) => {
              if (
                grandchild.type !== 'frame' ||
                (grandchild.params.link_en === undefined && grandchild.params.link_ar === undefined)
              ) return null;
              const titleNode = grandchild.params.children.find((n: PageNode) => n.type === 'text');
              const titleContent = titleNode?.type === 'text' ? titleNode.params : null;
              const titleLangValue = language === 'en' ? titleContent?.content_en : titleContent?.content_ar;
              const title = titleLangValue ?? '';
              return {
                path: [childIndex, gcIdx] as number[],
                value: (grandchild.params[frameLinkField] as string) ?? '',
                label: title ? `${title} Link` : `Card ${gcIdx + 1} Link`,
              };
            })
            .filter(Boolean)
          : [];

        return (
          <div
            key={child.id ?? childIndex}
            className='flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 p-4 gap-6'
          >
            {editableNodes.map(({ node, path }) => (
              <NodeField
                key={path.join('-')}
                node={node}
                path={path}
                sectionIndex={sectionIndex}
                language={language}
                onTextChange={onTextChange}
                onImageChange={onImageChange}
                onLinkChange={onLinkChange}
                onCtaChange={onCtaChange}
              />
            ))}
            {frameHasLink && (
              <LinkField
                label={`Card Link (${language.toUpperCase()})`}
                value={frameLinkValue}
                onChange={(val) => onLinkChange(sectionIndex, [childIndex], frameLinkField, val)}
              />
            )}
            {nestedCardLinks.map((card) => card && (
              <LinkField
                key={card.path.join('-')}
                label={`${card.label} (${language.toUpperCase()})`}
                value={card.value}
                onChange={(val) => onLinkChange(sectionIndex, card.path, frameLinkField, val)}
              />
            ))}
          </div>
        );
      })}
      
      {showPersonCards && allCardEntries.length > 1 && (
        <PersonCardEditor
          cards={allCardEntries}
          sectionIndex={sectionIndex}
          language={language}
          onTextChange={onTextChange}
          onImageChange={onImageChange}
        />
      )}
    </div>
  );
}
