import { useState, useEffect } from "react";
import type { PageData, PageNode, Language } from "../types";
import Toggle from "./ui/Toggle";

interface MarkerMeta {
  address_en: string;
  address_ar: string;
  working_hours_en: string;
  working_hours_ar: string;
  videoDirUrl: string;
  mapsUrl?: string;
}

interface Marker {
  lat: string;
  long: string;
  name_en: string;
  name_ar: string;
  place_id: string;
  enabled?: boolean;
  meta: MarkerMeta;
}

interface MapsSection {
  id?: number;
  key?: string;
  type: "maps";
  styles: Record<string, unknown>;
  params: {
    center: { lat: string; long: string };
    markers: Marker[];
    zoom: number;
  };
}

function parseMarkers(pageData: PageData): { section: MapsSection | null; markers: Marker[] } {
  const section = pageData.sections?.[0] as unknown as MapsSection;
  if (section?.type !== "maps") return { section: null, markers: [] };
  return {
    section,
    markers: (section.params.markers ?? []).map((m) => ({ ...m, enabled: m.enabled !== false })),
  };
}

function buildSection(original: MapsSection, markers: Marker[]): PageNode {
  return { ...original, params: { ...original.params, markers } } as unknown as PageNode;
}

function emptyMarker(): Marker {
  return {
    lat: "",
    long: "",
    name_en: "",
    name_ar: "",
    place_id: "",
    enabled: true,
    meta: {
      address_en: "",
      address_ar: "",
      working_hours_en: "",
      working_hours_ar: "",
      videoDirUrl: "",
      mapsUrl: "",
    },
  };
}

interface BranchesTabProps {
  readonly pageData: PageData;
  readonly language: Language;
  readonly onSectionsChange: (sections: PageNode[]) => void;
}

export default function BranchesTab({ pageData, language, onSectionsChange }: BranchesTabProps) {
  const { section: originalSection, markers: parsed } = parseMarkers(pageData);
  const [markers, setMarkers] = useState<Marker[]>(parsed);
  const [activeIdx, setActiveIdx] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const { markers: m } = parseMarkers(pageData);
    setMarkers(m);
    setActiveIdx(0);
  }, [pageData.id]);

  function commit(updated: Marker[]) {
    setMarkers(updated);
    if (originalSection) onSectionsChange([buildSection(originalSection, updated)]);
  }

  function setMarkerField(idx: number, updated: Marker) {
    commit(markers.map((m, i) => (i === idx ? updated : m)));
  }

  function handleDelete(idx: number) {
    const updated = markers.filter((_, i) => i !== idx);
    setActiveIdx(Math.max(0, Math.min(activeIdx, updated.length - 1)));
    commit(updated);
  }

  function handleAdd(form: Marker) {
    const updated = [...markers, form];
    commit(updated);
    setActiveIdx(updated.length - 1);
    setShowModal(false);
  }

  const [editing, setEditing] = useState(false);

  useEffect(() => { setEditing(false); }, [activeIdx]);

  const active = markers[activeIdx];
  const nameKey: "name_en" | "name_ar" = language === "en" ? "name_en" : "name_ar";

  return (
    <div className="flex flex-col gap-4">
      <div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <span className="text-base leading-none">+</span> Add New Branch
        </button>
      </div>

      {markers.length > 0 && (
        <div className="flex border-b border-gray-200">
          {markers.map((m, i) => (
            <button
              key={m.place_id || m.name_en || i}
              onClick={() => setActiveIdx(i)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-[1px] ${
                activeIdx === i
                  ? "text-blue-500 border-blue-500"
                  : "text-gray-400 border-transparent hover:text-gray-600"
              }`}
            >
              {m[nameKey] || `Branch ${i + 1}`}
            </button>
          ))}
        </div>
      )}

      {active && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-gray-800">
              {editing ? "Edit Address" : "View Address"}
            </span>
            <div className="flex items-center gap-3">
              <Toggle
                checked={active.enabled !== false}
                onChange={(v) => setMarkerField(activeIdx, { ...active, enabled: v })}
              />
              <button
                onClick={() => setEditing((e) => !e)}
                className="text-sm px-3 py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {editing ? "Done" : "Edit"}
              </button>
              <button
                onClick={() => handleDelete(activeIdx)}
                className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>

          <hr className="border-gray-200" />

          <BranchForm
            value={active}
            disabled={!editing}
            onChange={(updated) => setMarkerField(activeIdx, updated)}
          />
        </div>
      )}

      {markers.length === 0 && (
        <div className="text-sm text-gray-400 text-center py-10">
          No branches yet. Click "+ Add New Branch" to add one.
        </div>
      )}

      {showModal && (
        <AddBranchModal onClose={() => setShowModal(false)} onAdd={handleAdd} />
      )}
    </div>
  );
}

interface BranchFormProps {
  readonly value: Marker;
  readonly disabled?: boolean;
  readonly onChange: (updated: Marker) => void;
}

function BranchForm({ value, disabled = false, onChange }: BranchFormProps) {
  function setTop(field: keyof Omit<Marker, "meta">, val: string | boolean) {
    onChange({ ...value, [field]: val });
  }

  function setMeta(field: keyof MarkerMeta, val: string) {
    onChange({ ...value, meta: { ...value.meta, [field]: val } });
  }

  const inputCls = `w-full border rounded-lg px-4 py-2.5 text-sm text-gray-700 outline-none transition-colors ${
    disabled
      ? "border-gray-100 bg-gray-50 text-gray-500 cursor-default"
      : "border-gray-200 bg-white focus:border-blue-400"
  }`;

  const mapsLink =
    value.lat && value.long
      ? `https://maps.google.com/?q=${value.lat},${value.long}`
      : value.meta.mapsUrl ?? "";

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <Field id="bf-name-en" label="Name (EN)">
          <input
            id="bf-name-en"
            disabled={disabled}
            className={inputCls}
            value={value.name_en}
            onChange={(e) => setTop("name_en", e.target.value)}
          />
        </Field>
        <Field id="bf-name-ar" label="Name (AR)">
          <input
            id="bf-name-ar"
            dir="rtl"
            disabled={disabled}
            className={inputCls}
            value={value.name_ar}
            onChange={(e) => setTop("name_ar", e.target.value)}
          />
        </Field>
      </div>

      <Field id="bf-addr-en" label="Address (EN)">
        <input
          id="bf-addr-en"
          disabled={disabled}
          className={inputCls}
          value={value.meta.address_en}
          onChange={(e) => setMeta("address_en", e.target.value)}
        />
      </Field>

      <Field id="bf-addr-ar" label="Address (AR)">
        <input
          id="bf-addr-ar"
          dir="rtl"
          disabled={disabled}
          className={inputCls}
          value={value.meta.address_ar}
          onChange={(e) => setMeta("address_ar", e.target.value)}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field id="bf-wh-en" label="Working Hours (EN)">
          <input
            id="bf-wh-en"
            disabled={disabled}
            className={inputCls}
            value={value.meta.working_hours_en}
            onChange={(e) => setMeta("working_hours_en", e.target.value)}
          />
        </Field>
        <Field id="bf-wh-ar" label="Working Hours (AR)">
          <input
            id="bf-wh-ar"
            dir="rtl"
            disabled={disabled}
            className={inputCls}
            value={value.meta.working_hours_ar}
            onChange={(e) => setMeta("working_hours_ar", e.target.value)}
          />
        </Field>
      </div>

      <Field id="bf-maps-url" label="Google Maps URL">
        {disabled && mapsLink && (
          <a
            href={mapsLink}
            target="_blank"
            rel="noreferrer"
            className="block w-full border border-gray-100 bg-gray-50 rounded-lg px-4 py-2.5 text-sm text-blue-500 underline underline-offset-2 truncate"
          >
            {mapsLink}
          </a>
        )}
        {disabled && !mapsLink && <div className={inputCls}>—</div>}
        {!disabled && (
          <>
            <input
              id="bf-maps-url"
              className={inputCls}
              placeholder="https://maps.google.com/?q=..."
              value={value.meta.mapsUrl ?? ""}
              onChange={(e) => setMeta("mapsUrl", e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">• The link to the location on google map</p>
          </>
        )}
      </Field>

      <Field id="bf-video-url" label="Video / Direction URL">
        <input
          id="bf-video-url"
          disabled={disabled}
          className={inputCls}
          placeholder="https://www.instagram.com/reel/..."
          value={value.meta.videoDirUrl}
          onChange={(e) => setMeta("videoDirUrl", e.target.value)}
        />
      </Field>

      <div className="grid grid-cols-3 gap-4">
        <Field id="bf-lat" label="Latitude">
          <input
            id="bf-lat"
            disabled={disabled}
            className={inputCls}
            placeholder="29.3846"
            value={value.lat}
            onChange={(e) => setTop("lat", e.target.value)}
          />
        </Field>
        <Field id="bf-long" label="Longitude">
          <input
            id="bf-long"
            disabled={disabled}
            className={inputCls}
            placeholder="47.9874"
            value={value.long}
            onChange={(e) => setTop("long", e.target.value)}
          />
        </Field>
        <Field id="bf-place-id" label="Place ID">
          <input
            id="bf-place-id"
            disabled={disabled}
            className={inputCls}
            value={value.place_id}
            onChange={(e) => setTop("place_id", e.target.value)}
          />
        </Field>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  children,
}: {
  readonly id: string;
  readonly label: string;
  readonly children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-800 mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

interface AddBranchModalProps {
  readonly onClose: () => void;
  readonly onAdd: (m: Marker) => void;
}

function AddBranchModal({ onClose, onAdd }: AddBranchModalProps) {
  const [form, setForm] = useState<Marker>(emptyMarker());

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        <h3 className="text-base font-semibold text-gray-800">Add New Branch</h3>

        <BranchForm value={form} onChange={setForm} />

        <div className="flex gap-3 justify-end pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onAdd(form)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
