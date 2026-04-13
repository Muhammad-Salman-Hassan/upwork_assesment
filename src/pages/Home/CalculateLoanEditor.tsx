import type { Language, PageNode, FrameNode } from '../../types';
import TextField from '../../components/fields/TextField';
import ImageField from '../../components/fields/ImageField';
import LinkField from '../../components/fields/LinkField';

interface CalculateLoanEditorProps {
  readonly sectionIndex: number;
  readonly section: PageNode;
  readonly language: Language;
  readonly onTextChange: (si: number, path: number[], val: string) => void;
  readonly onImageChange: (si: number, path: number[], src: string) => void;
  readonly onLinkChange: (si: number, path: number[], field: 'link_en' | 'link_ar', val: string) => void;
}

export default function CalculateLoanEditor({
  sectionIndex, section, language,
  onTextChange, onImageChange, onLinkChange,
}: CalculateLoanEditorProps) {
  if (section.type !== 'frame') return null;

  const langKey = language === 'en' ? 'en' : 'ar';
  const linkField = (langKey === 'en' ? 'link_en' : 'link_ar') as 'link_en' | 'link_ar';

 
  const headerFrame = section.params.children[0];
  const cardRow = section.params.children[1];
  const cards: FrameNode[] = cardRow?.type === 'frame'
    ? (cardRow.params.children.filter((c) => c.type === 'frame') as FrameNode[])
    : [];

 
  const headerText = headerFrame?.type === 'frame'
    ? headerFrame.params.children.find((n) => n.type === 'text')
    : null;
  const sectionTitle = headerText?.type === 'text'
    ? ((langKey === 'en' ? headerText.params.content_en : headerText.params.content_ar) ?? '')
    : '';

  return (
    <div className="flex flex-col gap-5 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-blue-500 border-b border-gray-100 pb-2">
        {section.key?.trim() || 'Calculate Your Loan'}
      </h3>


      {headerText?.type === 'text' && (
        <TextField
          label={`Section Title (${language.toUpperCase()})`}
          value={sectionTitle}
          onChange={(v) => {
          
            const idx = headerFrame?.type === 'frame'
              ? headerFrame.params.children.findIndex((n) => n === headerText)
              : 0;
            onTextChange(sectionIndex, [0, idx], v);
          }}
        />
      )}

   
      <div className="grid grid-cols-2 gap-4">
        {cards.map((card, cardIdx) => {
          const imgNode = card.params.children[0];
          const txtNode = card.params.children[1];

          const imgSrc = imgNode?.type === 'image'
            ? ((langKey === 'en' ? imgNode.params.src_en : imgNode.params.src_ar) ?? imgNode.params.src ?? '')
            : '';
          const titleVal = txtNode?.type === 'text'
            ? ((langKey === 'en' ? txtNode.params.content_en : txtNode.params.content_ar) ?? '')
            : '';
          const linkVal = (card.params[linkField] as string) ?? '';

         
          const imgPath = [1, cardIdx, 0];
          const txtPath = [1, cardIdx, 1];
          const cardPath = [1, cardIdx];

          return (
            <div
              key={card.id ?? cardIdx}
              className="flex flex-col gap-3 border border-gray-200 rounded-xl p-4 bg-gray-50"
            >
              <p className="text-xs font-semibold text-gray-600">
                {titleVal || `Loan ${cardIdx + 1}`}
              </p>

              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Image ({language.toUpperCase()})</p>
                <ImageField
                  src={imgSrc}
                  onImageChange={(v) => onImageChange(sectionIndex, imgPath, v)}
                />
              </div>

              <TextField
                label={`Title (${language.toUpperCase()})`}
                value={titleVal}
                onChange={(v) => onTextChange(sectionIndex, txtPath, v)}
              />

              <LinkField
                label={`Card Link (${language.toUpperCase()})`}
                value={linkVal}
                onChange={(v) => onLinkChange(sectionIndex, cardPath, linkField, v)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
