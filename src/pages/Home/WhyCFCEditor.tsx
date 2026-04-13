import type { Language, PageNode } from '../../types';
import TextField from '../../components/fields/TextField';
import TextareaField from '../../components/fields/TextareaField';
import ImageField from '../../components/fields/ImageField';
import LinkField from '../../components/fields/LinkField';
import { getEditableNodes } from '../../utils/getEditableNodes';

interface WhyCFCEditorProps {
  readonly sectionIndex: number;
  readonly section: PageNode;
  readonly language: Language;
  readonly onTextChange: (si: number, path: number[], val: string) => void;
  readonly onImageChange: (si: number, path: number[], src: string) => void;
  readonly onLinkChange: (si: number, path: number[], field: 'link_en' | 'link_ar', val: string) => void;
}

export default function WhyCFCEditor({
  sectionIndex, section, language,
  onTextChange, onImageChange, onLinkChange,
}: WhyCFCEditorProps) {
  if (section.type !== 'frame') return null;

  const langKey = language === 'en' ? 'en' : 'ar';
  const linkField = langKey === 'en' ? 'link_en' : 'link_ar';
  const editableNodes = getEditableNodes(section.params.children);

  return (
    <div className="flex flex-col gap-4 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-blue-500 border-b border-gray-100 pb-2">
        {section.key?.trim() || 'Why CFC?'}
      </h3>
      {editableNodes.map(({ node, path }) => {
        if (node.type === 'text') {
          const val = (langKey === 'en' ? node.params.content_en : node.params.content_ar) ?? node.params.content ?? '';
          const hasLink = node.params.link_en !== undefined || node.params.link_ar !== undefined;
          return (
            <div key={path.join('-')} className="flex flex-col gap-2">
              <TextField
                label={`Edit ${node.params.label ?? 'Text'}`}
                value={val}
                onChange={(v) => onTextChange(sectionIndex, path, v)}
              />
              {hasLink && (
                <LinkField
                  label={`Link (${language.toUpperCase()})`}
                  value={(node.params[linkField] as string) ?? ''}
                  onChange={(v) => onLinkChange(sectionIndex, path, linkField as 'link_en' | 'link_ar', v)}
                />
              )}
            </div>
          );
        }
        if (node.type === 'textarea') {
          const val = (langKey === 'en' ? node.params.content_en : node.params.content_ar) ?? node.params.content ?? '';
          return (
            <TextareaField
              key={path.join('-')}
              label={`Edit ${node.params.label ?? 'Content'}`}
              value={val}
              onChange={(v) => onTextChange(sectionIndex, path, v)}
            />
          );
        }
        if (node.type === 'image') {
          const src = (langKey === 'en' ? node.params.src_en : node.params.src_ar) ?? node.params.src ?? '';
          return (
            <div key={path.join('-')} className="flex flex-col gap-1">
              <p className="text-xs font-medium text-gray-500">Section Image ({language.toUpperCase()})</p>
              <ImageField src={src} onImageChange={(v) => onImageChange(sectionIndex, path, v)} />
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
