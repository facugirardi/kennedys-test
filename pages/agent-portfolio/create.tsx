import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import {
  AlignCenter, AlignLeft, AlignRight, ArrowRight, Bold, ChevronDown, ChevronUp, Copy, EyeOff, ExternalLink, GripVertical,
  ImagePlus, Italic, List, ListOrdered, Plus, Redo2, SlidersHorizontal, Star, Strikethrough,
  Underline as UnderlineIcon, Undo2, X,
} from "lucide-react";
import { useAuth } from "@/src/contexts/AuthContext";
import { SeoHead } from "@/components/seo/SeoHead";
import { getAllProperties, getFilterOptions } from "@/lib/api/properties";
import { getAgentRateQuote } from "@/lib/api/agentRates";
import { getLibraryServices } from "@/lib/api/services";
import { createShareProperty, updateShareProperty, uploadShareImage, getShareProperty } from "@/app/lib/api/sharePropertiy";
import { normalizePropertiesResponse, resolveMediaUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import AgentPortfolioLayout from "@/components/custom/AgentPortfolioLayout";
import AgentPortfolioLoggedOut from "@/components/custom/AgentPortfolioLoggedOut";
import { fieldInputClass, fieldLabelClass, SelectField, GOLD, INK, STONE, HAIRLINE } from "@/components/custom/AgentPortfolioFormKit";
import StayDatesPicker from "@/components/custom/AgentPortfolioStayDatesPicker";

type Block = { id: string; title: string; content: string };
type VillaItem = Record<string, any>;
type ConciergeItem = Record<string, any>;
type Step = "select" | "complete";
type CatalogTab = "villas" | "concierge";

const currencyOptions = ["EUR", "USD"];
const FLEXIBLE_STAY_DAY_OPTIONS = [7, 14, 20, 21, 30];

// Same curated lists as kennedys-loggia's offer catalogue filters (app/(dashboard)/offers/filters.jsx)
const OUTDOOR_OPTIONS = [
  "Pool", "Rooftop Pool", "Plunge Pool", "Pool Bar", "Heated pool", "Jacuzzi",
  "Outdoor kitchen", "Outdoor Gym", "Dining & Lounge Area", "Cinema", "Ice plunge", "Sauna",
  "Playground", "Helipad", "Private Dock", "Access to a dock", "Private Parking",
  "BBQ", "Tennis Court", "Basketball Court", "Ski in/out", "Sun Deck", "Fire Pit",
  "Outdoor Fireplace", "Roof Terrace", "Yoga Shala", "Landscaped Gardens", "Boxing Ring",
  "Golf", "Beach Volleyball Court", "Children's Play Area", "Outdoor Shower",
  "Sound System", "Gated Property", "Table tennis",
];
const LUXURY_OPTIONS = [
  "Helipad", "Private Dock", "Private Beach Access", "Private Sea Access",
  "Beach Access", "Sea Access", "Ski in/out", "Sun Deck", "Fire Pit",
  "Outdoor Fireplace", "Roof Terrace", "Yoga Shala", "Outdoor Kitchen", "BBQ",
  "Tennis Court", "Landscaped Gardens", "Boxing Ring", "Basketball Court",
  "Golf", "Gym", "Paddle court", "Beach Volleyball Court", "Children's Play Area",
];
const PROPERTY_TYPE_OPTIONS = [
  { value: "VILLA", label: "Villa" },
  { value: "CHALET", label: "Chalet" },
  { value: "APARTMENT", label: "Apartment" },
  { value: "SEASONAL_PROPERTY", label: "Seasonal Property" },
  { value: "HOUSE", label: "House" },
  { value: "PENTHOUSE", label: "Penthouse" },
  { value: "MAISONETTE", label: "Maisonette" },
  { value: "DETACHED_VILLA", label: "Detached Villa" },
  { value: "SEMI_DETACHED_VILLA", label: "Semi-detached Villa" },
  { value: "HOTEL", label: "Hotel" },
];
const LOCATION_FEATURE_OPTIONS = [
  "Waterfront", "Beachfront", "Resort Access", "Walking distance to a village", "Private",
  "Walking distance to the beach", "Walking distance to town", "Private beach/ sea access",
];
const VIEW_OPTIONS = [
  "Sea View", "City View", "Nature View", "Panoramic View", "Lake View", "Forest View",
  "Sunset View", "Sunrise View", "Mountain View", "Town View", "Ocean View", "Water View", "Jungle View",
];

// Concierge tab shows only the "Concierge Package" product from Loggia's unified library-services
// catalogue (kennedys-api's `productType=conciergepackage`) — not chef/chauffeur/yacht/etc.
const CONCIERGE_PACKAGE_PRODUCT_TYPE = "conciergepackage";

/** One consistent "back" link style — used to stay in sync across the three back-navigation spots
 * in this flow (offer-not-found, header, and the select→complete step) instead of three different
 * Button variants for the same kind of action. */
const backLinkClass = "font-haas text-sm text-[#9CA6AD] transition-colors hover:text-[#172338] focus-visible:outline-none focus-visible:text-[#172338]";

/** Same understated "text action, not a bordered button" treatment as offers.tsx's row actions —
 * used for the Remove/Duplicate controls on selected villa/concierge rows. */
const rowActionClass = "font-haas text-sm text-[#9CA6AD] transition-colors hover:text-primary focus-visible:outline-none focus-visible:text-primary";
const rowDangerActionClass = "font-haas text-sm text-[#9CA6AD] transition-colors hover:text-red-600 focus-visible:outline-none focus-visible:text-red-600";

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;

function diffNights(from: string, to: string): number {
  if (!from || !to) return 0;
  const ms = new Date(to).getTime() - new Date(from).getTime();
  return ms > 0 ? Math.round(ms / (1000 * 60 * 60 * 24)) : 0;
}

/** Stable identity for a concierge row — catalog picks key off serviceId, ad-hoc rows off customServiceId. */
const conciergeKey = (item: any): string =>
  item.itemType === "customService" ? `custom-${item.customServiceId}` : `service-${item.serviceId}`;

function normalizeLibraryServicesResponse(res: any): any[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  return [];
}

function getBedrooms(property: any): number {
  const bedrooms = property?.bedrooms ?? property?.classification?.bedrooms;
  return bedrooms != null ? Number(bedrooms) : 0;
}

function getGuests(property: any): number {
  const guests = property?.guests ?? property?.maxGuests ?? property?.classification?.maxPersons;
  return guests != null ? Number(guests) : 0;
}

const VILLA_PLACEHOLDER_IMAGE = "/images/villa-detail@2x.png";
// Agent Portfolio is unbranded — a missing concierge-package photo must not fall back to the
// Kennedys logo. Plain neutral tile instead of any branded asset.
const CONCIERGE_PLACEHOLDER_IMAGE =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="4" height="3"><rect width="4" height="3" fill="#E5E1D8"/></svg>');

/** List results carry images in `property.images[]` (isPrimary/urlImage/url), not a flat `mainImage`
 * field — same resolution logic as pages/villas/list/index.tsx's getVillaImageUrl. */
function getVillaImageUrl(property: any): string {
  const images = property?.images;
  if (property?.mainImage) return resolveMediaUrl(property.mainImage) || VILLA_PLACEHOLDER_IMAGE;
  if (!Array.isArray(images) || images.length === 0) return VILLA_PLACEHOLDER_IMAGE;
  const primary = images.find((img: any) => {
    const p = img?.isPrimary ?? img?.is_primary ?? img?.primary;
    return p === true || p === "true" || p === 1;
  });
  const entry = primary ?? images[0];
  const raw = typeof entry === "string" ? entry : (entry?.urlImage ?? entry?.url ?? entry?.image ?? "");
  if (!raw || String(raw).trim() === "") return VILLA_PLACEHOLDER_IMAGE;
  if (/^https?:\/\//i.test(raw)) return raw;
  const resolved = resolveMediaUrl(raw);
  return resolved && resolved.trim() !== "" ? resolved : VILLA_PLACEHOLDER_IMAGE;
}

type TrayChip = { key: string; label: string; image?: string; kind: "villa" | "concierge"; onRemove: () => void };

/** Bottom "your offer" tray on the select step: a summary of what's been picked, one square chip
 * per item (villas with their photo, concierge with the teal dot used across the portfolio), and the
 * Continue action. Slides away entirely while nothing is selected. */
function SelectionTray({
  chips,
  villaCount,
  conciergeCount,
  onContinue,
}: {
  chips: TrayChip[];
  villaCount: number;
  conciergeCount: number;
  onContinue: () => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [overflowRight, setOverflowRight] = useState(false);
  const visible = chips.length > 0;

  // Fade on the right edge only while there are chips scrolled out of view.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const update = () => setOverflowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [chips.length]);

  const summary = [
    villaCount > 0 ? `${villaCount} villa${villaCount === 1 ? "" : "s"}` : "",
    conciergeCount > 0 ? `${conciergeCount} concierge` : "",
  ].filter(Boolean).join(" · ");

  return (
    // z-30: above the cards' z-10 "view villa" links, below the z-40 filters drawer.
    <div
      aria-hidden={!visible}
      className={`fixed bottom-0 left-0 right-0 md:left-60 z-30 border-t border-[#DDD8CC] bg-[#FBFAF7]/95 backdrop-blur px-6 py-3 transition-transform duration-300 ease-out ${
        visible ? "translate-y-0" : "translate-y-full pointer-events-none"
      }`}
    >
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 md:flex-nowrap">
        <div className="order-1 shrink-0">
          <p className="font-haas text-[10px] uppercase tracking-[0.2em]" style={{ color: GOLD }}>Your offer</p>
          <p className="mt-1 font-haas text-sm" style={{ color: INK }}>{summary}</p>
        </div>

        <div className="relative order-3 w-full min-w-0 md:order-2 md:w-auto md:flex-1">
          <div ref={scrollerRef} className="flex gap-2 overflow-x-auto py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {chips.map((chip) => (
              <span
                key={chip.key}
                className="group inline-flex h-9 flex-shrink-0 items-center gap-2 border border-[#DDD8CC] bg-white pl-1 pr-1.5 font-haas text-xs text-[#172338]"
              >
                {chip.kind === "villa" ? (
                  <span className="h-7 w-9 shrink-0 overflow-hidden bg-[#EDEAE2]">
                    {chip.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={chip.image} alt="" className="h-full w-full object-cover" />
                    )}
                  </span>
                ) : (
                  <span className="flex h-7 w-5 shrink-0 items-center justify-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#48A4B4]" />
                  </span>
                )}
                <span className="max-w-[150px] truncate" title={chip.label}>{chip.label}</span>
                <button
                  type="button"
                  onClick={chip.onRemove}
                  className="flex h-5 w-5 items-center justify-center text-[#9CA6AD] transition-opacity hover:text-[#172338] focus-visible:opacity-100 focus-visible:outline-none md:opacity-0 md:group-hover:opacity-100"
                  aria-label={`Remove ${chip.label}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          {overflowRight && (
            <span className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#FBFAF7] to-transparent" />
          )}
        </div>

        <Button
          type="button"
          className="order-2 ml-auto shrink-0 rounded-none bg-[#172338] font-normal text-white hover:bg-[#172338]/90 md:order-3 md:ml-0"
          disabled={!visible}
          onClick={onContinue}
        >
          Continue to details
          <ArrowRight className="ml-2 h-4 w-4" strokeWidth={1.5} />
        </Button>
      </div>
    </div>
  );
}

function computeVillaFinalPrice(item: any): number {
  const gross = Number(item.grossRate) || 0;
  if (item.discountMode === "fixed") {
    return Math.max(0, gross - (Number(item.discountFixedAmount) || 0));
  }
  const pct = Math.min(100, Math.max(0, Number(item.discountShare) || 0));
  return gross * (1 - pct / 100);
}

// Two-thumb range slider — kennedys-web's own Slider only renders one Thumb, so bedrooms/guests/price
// ranges need this local variant (mirrors kennedys-loggia's PriceRangeSlider).
const RangeSlider = ({
  value,
  max,
  step = 1,
  onValueChange,
}: {
  value: [number, number];
  max: number;
  step?: number;
  onValueChange: (value: number[]) => void;
}) => (
  <SliderPrimitive.Root
    className="relative flex w-full touch-none select-none items-center my-4"
    value={value}
    max={max}
    step={step}
    onValueChange={onValueChange}
  >
    <SliderPrimitive.Track className="relative h-px w-full grow bg-[#DDD8CC]">
      <SliderPrimitive.Range className="absolute h-full bg-[#172338]" />
    </SliderPrimitive.Track>
    {value.map((_, i) => (
      <SliderPrimitive.Thumb
        key={i}
        className="block h-3.5 w-3.5 rounded-full border border-[#172338] bg-white transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D99330] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBFAF7] disabled:pointer-events-none disabled:opacity-50"
      />
    ))}
  </SliderPrimitive.Root>
);

const FilterGroup = ({
  title,
  defaultOpen,
  count = 0,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  /** How many options in this group are active — shown next to the title so a collapsed group
   * still says it's filtering. */
  count?: number;
  children: React.ReactNode;
}) => {
  // <details>'s native open/closed state isn't reliably announced by every screen reader — mirror it
  // into aria-expanded on the summary so the toggle state is explicit either way.
  const [open, setOpen] = useState(Boolean(defaultOpen));
  return (
    <details
      className="group border-t border-[#DDD8CC] py-5"
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
    >
      <summary
        aria-expanded={open}
        className="flex cursor-pointer list-none items-center justify-between [&::-webkit-details-marker]:hidden"
      >
        <span className={filterLabelClass}>
          {title}
          {count > 0 && <span className="ml-2 text-[#D99330]">{count}</span>}
        </span>
        <ChevronDown className="h-4 w-4 text-[#9CA6AD] transition-transform group-open:rotate-180" strokeWidth={1.5} />
      </summary>
      <div className="mt-4 flex flex-wrap gap-2">{children}</div>
    </details>
  );
};

/** Small caps label used for every section of the filters drawer. */
const filterLabelClass = "font-haas text-[10px] uppercase tracking-[0.2em] text-[#9CA6AD]";

/** Square toggle chip for multi-select filter options — a wrapped row of these reads much faster
 * than a long column of checkboxes, and matches the chip language of the rest of the portfolio. */
const FilterChip = ({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) => (
  <button
    type="button"
    aria-pressed={checked}
    onClick={onToggle}
    className={`border px-3 py-1.5 font-haas text-xs transition-colors focus-visible:outline-none focus-visible:border-[#D99330] ${
      checked
        ? "border-[#172338] bg-[#172338] text-white"
        : "border-[#DDD8CC] bg-white text-[#506A70] hover:border-[#9CA6AD] hover:text-[#172338]"
    }`}
  >
    {label}
  </button>
);

const toggleInArray = (arr: string[], value: string) =>
  arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

/** Native <select> styled to match Input/Button focus + border treatment — kennedys-web doesn't ship a
 * headless Select here, and swapping every filter/discount/block picker to Radix Select was out of scope
 * for this pass, so this just brings the raw element to visual parity (border, focus ring, chevron). */
const NativeSelect = ({
  className = "",
  wrapperClassName = "relative inline-block",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { wrapperClassName?: string }) => (
  <div className={wrapperClassName}>
    <select
      {...props}
      className={`h-9 w-full appearance-none bg-none border border-[#DDD8CC] bg-white pl-3 pr-8 font-haas text-sm text-[#172338] shadow-none transition-colors focus:outline-none focus-visible:border-[#D99330] focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA6AD]" />
  </div>
);

/** Underline variant of NativeSelect — no box, just a hairline and a chevron — for the "Block" picker
 * embedded inside an already-bordered villa/concierge row or chip, where a second nested box read as
 * a card-within-a-card. */
const UnderlineSelect = ({
  className = "",
  wrapperClassName = "relative inline-block",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { wrapperClassName?: string }) => (
  <div className={wrapperClassName}>
    <select
      {...props}
      className={`appearance-none border-0 border-b border-[#DDD8CC] bg-transparent px-0 pr-5 font-haas text-[#172338] shadow-none transition-colors focus:outline-none focus-visible:border-[#D99330] bg-[url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%23506A70%22%3E%3Cpath%20d%3D%22M5.25%207.5L10%2012.25%2014.75%207.5H5.25z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0_center] ${className}`}
    >
      {children}
    </select>
  </div>
);

/** Lightweight rich-text field (Bold/Italic/Underline/Strike/lists/align/undo-redo) backing every
 * free-text area in Loggia's offer editor (block content, bottom card text, price note, policies, etc).
 * Link insertion and text color are intentionally left out — kennedys-web doesn't have the extra tiptap
 * extensions those need installed, and adding a new dependency wasn't part of this ask. */
function RichTextEditor({
  value,
  onChange,
  minHeight = "5rem",
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  minHeight?: string;
  placeholder?: string;
}) {
  const editor = useEditor({
    extensions: [StarterKit, Underline, TextAlign.configure({ types: ["heading", "paragraph"] })],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: "prose prose-sm max-w-none focus:outline-none px-3 py-2" },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && !editor.isFocused && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  const ToolbarButton = ({
    onClick,
    active,
    label,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    label: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      aria-label={label}
      className={`p-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${active ? "bg-[#EDEAE2]" : "hover:bg-[#EDEAE2]"}`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-[#DDD8CC]">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-[#DDD8CC] p-1 bg-[#F4F1EA]">
        <ToolbarButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton label="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton label="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton label="Ordered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton label="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton label="Align left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          <AlignLeft className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton label="Align center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          <AlignCenter className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton label="Align right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          <AlignRight className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton label="Insert euro sign" onClick={() => editor.chain().focus().insertContent("€").run()}>
          <span className="text-xs w-3.5 inline-block text-center">€</span>
        </ToolbarButton>
        <ToolbarButton label="Insert dollar sign" onClick={() => editor.chain().focus().insertContent("$").run()}>
          <span className="text-xs w-3.5 inline-block text-center">$</span>
        </ToolbarButton>
        <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 className="h-3.5 w-3.5" />
        </ToolbarButton>
      </div>
      <div className="relative">
        {placeholder && editor.isEmpty && (
          <div className="pointer-events-none absolute top-0 left-0 px-3 py-2 text-sm text-[#9CA6AD]">
            {placeholder}
          </div>
        )}
        <EditorContent editor={editor} style={{ minHeight }} />
      </div>
    </div>
  );
}

export default function AgentPortfolioCreatePage() {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();

  const [step, setStep] = useState<Step>("select");
  const [activeTab, setActiveTab] = useState<CatalogTab>("villas");
  const [showFilters, setShowFilters] = useState(false);

  const [offerName, setOfferName] = useState("");
  const [title, setTitle] = useState("");
  const [welcomeTitle, setWelcomeTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [clientDisplayName, setClientDisplayName] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [showPrice, setShowPrice] = useState(true);
  const [priceEntryUsd, setPriceEntryUsd] = useState(false);
  const [usdPerEur, setUsdPerEur] = useState(1.08);

  // Blocks — Loggia's "sections" concept: a titled, free-text group that villas/concierge items get
  // assigned into. propertiesToPresent is built by grouping items by block on save.
  const [blocks, setBlocks] = useState<Block[]>([{ id: "block-1", title: "Featured Villas", content: "" }]);
  const addBlock = () => {
    markDirty();
    setBlocks((prev) => [...prev, { id: makeId(), title: `Block ${prev.length + 1}`, content: "" }]);
  };
  const updateBlockTitle = (id: string, value: string) => {
    markDirty();
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, title: value } : b)));
  };
  const updateBlockContent = (id: string, value: string) => {
    markDirty();
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, content: value } : b)));
  };
  const removeBlock = (id: string) => {
    if (blocks.length <= 1) return;
    const block = blocks.find((b) => b.id === id);
    const hasContent = Boolean(block?.content?.replace(/<[^>]*>/g, "").trim());
    if (hasContent && !window.confirm("This block has a description written — remove it anyway? Its items will move to the previous block.")) {
      return;
    }
    markDirty();
    const fallbackId = blocks.find((b) => b.id !== id)?.id ?? blocks[0].id;
    setVillaItems((prev) => prev.map((v) => (v.blockId === id ? { ...v, blockId: fallbackId } : v)));
    setConciergeItems((prev) => prev.map((c) => (c.blockId === id ? { ...c, blockId: fallbackId } : c)));
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const [villaItems, setVillaItems] = useState<VillaItem[]>([]);
  const [conciergeItems, setConciergeItems] = useState<ConciergeItem[]>([]);
  // Which villa rows have "Security deposit" / "Bottom card text" expanded — per-row instead of a
  // single all-or-nothing switch, since most offers only need those fields on one or two villas.
  const [expandedVillaIds, setExpandedVillaIds] = useState<Set<string>>(new Set());
  const toggleVillaExpanded = (id: string) =>
    setExpandedVillaIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  const [dragVillaIndex, setDragVillaIndex] = useState<number | null>(null);

  // Villa filters — same fields as kennedys-loggia's PropertyFilters (filters.jsx)
  const [villaQuery, setVillaQuery] = useState("");
  const [villaRegion, setVillaRegion] = useState("");
  const [villaArea, setVillaArea] = useState("");
  const [villaDateFrom, setVillaDateFrom] = useState("");
  const [villaDateTo, setVillaDateTo] = useState("");
  const [villaFlexibleDates, setVillaFlexibleDates] = useState(false);
  const [villaFlexibleDays, setVillaFlexibleDays] = useState(20);
  const [villaBedrooms, setVillaBedrooms] = useState<[number, number]>([1, 20]);
  const [villaGuests, setVillaGuests] = useState<[number, number]>([0, 50]);
  const [villaPriceRange, setVillaPriceRange] = useState<[number, number]>([0, 10000]);
  const [villaMinStars, setVillaMinStars] = useState(0);
  const [villaPublished, setVillaPublished] = useState(false);
  const [villaOutdoor, setVillaOutdoor] = useState<string[]>([]);
  const [villaLuxury, setVillaLuxury] = useState<string[]>([]);
  const [villaPropertyType, setVillaPropertyType] = useState<string[]>([]);
  const [villaLocationFeatures, setVillaLocationFeatures] = useState<string[]>([]);
  const [villaView, setVillaView] = useState<string[]>([]);
  // Hidden context filter (not a togglable chip in the sidebar) — set once from the
  // agent-portfolio home's "Management villas" card (?managed=true): those are villas explicitly
  // flagged as `managedProperty` in kennedys-loggia, not just villas in a given region.
  const [villaManagedOnly, setVillaManagedOnly] = useState(false);
  const [villaResults, setVillaResults] = useState<any[]>([]);
  const [villaSearching, setVillaSearching] = useState(false);
  const [villaSearchError, setVillaSearchError] = useState<string | null>(null);
  const [villaRetryToken, setVillaRetryToken] = useState(0);
  const [villaPage, setVillaPage] = useState(1);
  const [villaPageSize, setVillaPageSize] = useState(30);
  const [villaTotal, setVillaTotal] = useState(0);
  const [regions, setRegions] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  // Areas actually seen within the selected region — the full `areas` list is catalogue-wide and lets
  // you pick an area that doesn't exist in the chosen region (0 results with no clue why). Capped at
  // 100 properties server-side, so a very large region's area list may be incomplete; falls back to
  // the full list if the scoped fetch comes back empty.
  const [areasForRegion, setAreasForRegion] = useState<string[] | null>(null);

  // Concierge filters — same fields as kennedys-loggia's FilterConcierge, locked to "Concierge Package"
  const [conciergeQuery, setConciergeQuery] = useState("");
  const [conciergeCountries, setConciergeCountries] = useState<string[]>([]);
  const [conciergeLocations, setConciergeLocations] = useState<string[]>([]);
  const [conciergeResults, setConciergeResults] = useState<any[]>([]);
  const [conciergeSearching, setConciergeSearching] = useState(false);
  const [conciergeSearchError, setConciergeSearchError] = useState<string | null>(null);
  const [conciergeRetryToken, setConciergeRetryToken] = useState(0);

  // Quick-link prefill: the agent-portfolio home cards deep-link here as
  // /agent-portfolio/create?tab=villas&region=Mykonos (or ?tab=concierge) to land the agent straight
  // on a pre-filtered catalogue instead of the empty picker. Runs once, ignored once an offer is
  // loaded for editing (?id=...) since that flow hydrates its own filters/tab.
  const prefillAppliedRef = useRef(false);
  useEffect(() => {
    if (!router.isReady || prefillAppliedRef.current || router.query.id) return;
    prefillAppliedRef.current = true;
    const tab = router.query.tab === "concierge" ? "concierge" : router.query.tab === "villas" ? "villas" : null;
    const region = typeof router.query.region === "string" ? router.query.region : "";
    if (tab) setActiveTab(tab);
    if (region) {
      setVillaRegion(region);
      setShowFilters(true);
    }
    if (router.query.managed === "true") setVillaManagedOnly(true);
  }, [router.isReady, router.query.id, router.query.tab, router.query.region, router.query.managed]);

  const [offerId, setOfferId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [autosaving, setAutosaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [autosaveError, setAutosaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [publicLink, setPublicLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dirty, setDirty] = useState(false);
  const markDirty = () => setDirty(true);

  // Edit mode — /agent-portfolio/create?id=<offerId> hydrates the whole form from a previously saved
  // offer. Without this the page could only ever create new offers; there was no way back into one.
  const [loadingOffer, setLoadingOffer] = useState(false);
  const [loadOfferError, setLoadOfferError] = useState<string | null>(null);

  const clearVillaFilters = () => {
    setVillaQuery(""); setVillaRegion(""); setVillaArea("");
    setVillaDateFrom(""); setVillaDateTo(""); setVillaFlexibleDates(false);
    setVillaBedrooms([1, 20]); setVillaGuests([0, 50]); setVillaPriceRange([0, 10000]);
    setVillaMinStars(0); setVillaPublished(false);
    setVillaOutdoor([]); setVillaLuxury([]); setVillaPropertyType([]);
    setVillaLocationFeatures([]); setVillaView([]);
  };
  const clearConciergeFilters = () => {
    setConciergeQuery(""); setConciergeCountries([]); setConciergeLocations([]);
  };

  // Drives the badge on the "Filters" toggle so agents can tell at a glance whether anything is
  // applied without having to open the panel.
  const activeVillaFilterCount = useMemo(() => {
    let n = 0;
    if (villaQuery.trim()) n++;
    if (villaRegion) n++;
    if (villaArea) n++;
    if (villaDateFrom || villaDateTo) n++;
    if (villaBedrooms[0] > 1 || villaBedrooms[1] < 20) n++;
    if (villaGuests[0] > 0 || villaGuests[1] < 50) n++;
    if (villaPriceRange[0] > 0 || villaPriceRange[1] < 10000) n++;
    if (villaMinStars > 0) n++;
    if (villaPublished) n++;
    if (villaOutdoor.length > 0) n++;
    if (villaLuxury.length > 0) n++;
    if (villaPropertyType.length > 0) n++;
    if (villaLocationFeatures.length > 0) n++;
    if (villaView.length > 0) n++;
    return n;
  }, [
    villaQuery, villaRegion, villaArea, villaDateFrom, villaDateTo, villaBedrooms, villaGuests,
    villaPriceRange, villaMinStars, villaPublished, villaOutdoor, villaLuxury, villaPropertyType,
    villaLocationFeatures, villaView,
  ]);
  const activeConciergeFilterCount = useMemo(() => {
    let n = 0;
    if (conciergeQuery.trim()) n++;
    if (conciergeCountries.length > 0) n++;
    if (conciergeLocations.length > 0) n++;
    return n;
  }, [conciergeQuery, conciergeCountries, conciergeLocations]);
  const activeFilterCount = activeTab === "villas" ? activeVillaFilterCount : activeConciergeFilterCount;

  useEffect(() => {
    if (!isAuthenticated) return;
    getFilterOptions({ rental: true })
      .then((res: any) => {
        setRegions(Array.isArray(res?.data?.regions) ? res.data.regions : []);
        setAreas(Array.isArray(res?.data?.areas) ? res.data.areas : []);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  // Scope the Area dropdown to areas that actually exist within the selected region, instead of
  // always showing the whole catalogue's area list (which let you pick an impossible combination).
  // Also drop whatever Area was picked under the previous region — it may not exist in this one.
  // pageSize is capped at 30 here (well under the API's own 100 max) — this endpoint's response
  // gets heavy enough per property (full classification/images/amenities) that pageSize 60+
  // reliably times out server-side; 30 is a sample of the region's areas, not exhaustive, but
  // reliable, and still far better than the unscoped catalogue-wide list.
  useEffect(() => {
    setVillaArea("");
    if (!isAuthenticated || !villaRegion) {
      setAreasForRegion(null);
      return;
    }
    let cancelled = false;
    getAllProperties({
      rental: true,
      region: villaRegion,
      pageSize: 30,
      ...(villaManagedOnly ? { managedProperty: true } : {}),
    })
      .then((raw: any) => {
        if (cancelled) return;
        const list = normalizePropertiesResponse(raw);
        const found = Array.from(new Set(list.map((p: any) => p.area).filter(Boolean))).sort() as string[];
        setAreasForRegion(found.length > 0 ? found : null);
      })
      .catch(() => {
        if (!cancelled) setAreasForRegion(null);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, villaRegion, villaManagedOnly]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const handle = setTimeout(async () => {
      setVillaSearching(true);
      setVillaSearchError(null);
      try {
        const q = villaQuery.trim();
        const outdoorAndLuxury = Array.from(new Set([...villaOutdoor, ...villaLuxury]));
        const raw = await getAllProperties({
          rental: true,
          ...(q ? { searchQuery: q } : {}),
          ...(villaRegion ? { region: villaRegion } : {}),
          ...(villaArea ? { area: villaArea } : {}),
          ...(villaBedrooms[0] > 1 ? { minBedrooms: villaBedrooms[0] } : {}),
          ...(villaBedrooms[1] < 20 ? { maxBedrooms: villaBedrooms[1] } : {}),
          ...(villaGuests[0] > 0 ? { guests: villaGuests[0] } : {}),
          ...(villaPriceRange[0] > 0 ? { minPrice: villaPriceRange[0] } : {}),
          ...(villaPriceRange[1] < 10000 ? { maxPrice: villaPriceRange[1] } : {}),
          ...(villaDateFrom ? { dateFrom: villaDateFrom } : {}),
          ...(villaDateTo ? { dateTo: villaDateTo } : {}),
          ...(villaFlexibleDates ? { dateFlexDays: villaFlexibleDays } : {}),
          ...(villaMinStars > 0 ? { stars: String(villaMinStars) } : {}),
          ...(villaPublished ? { published: true } : {}),
          ...(outdoorAndLuxury.length ? { amenities: outdoorAndLuxury.join(",") } : {}),
          ...(villaView.length ? { view: villaView.join(",") } : {}),
          ...(villaLocationFeatures.length ? { locationFeatures: villaLocationFeatures.join(",") } : {}),
          ...(villaPropertyType.length ? { propertyType: villaPropertyType.join(",") } : {}),
          ...(villaManagedOnly ? { managedProperty: true } : {}),
          page: villaPage,
          pageSize: villaPageSize,
        });
        if (raw?.success === false) {
          setVillaSearchError(raw?.message || "Could not load villas. Please try again.");
          setVillaResults([]);
          setVillaTotal(0);
        } else {
          setVillaResults(normalizePropertiesResponse(raw));
          setVillaTotal(typeof raw?.data?.total === "number" ? raw.data.total : 0);
        }
      } catch {
        setVillaSearchError("Could not load villas. Please try again.");
      } finally {
        setVillaSearching(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [
    villaQuery, villaRegion, villaArea, villaBedrooms, villaGuests, villaPriceRange,
    villaDateFrom, villaDateTo, villaFlexibleDates, villaFlexibleDays, villaMinStars,
    villaPublished, villaOutdoor, villaLuxury, villaView, villaLocationFeatures, villaPropertyType,
    villaManagedOnly, villaPage, villaPageSize, isAuthenticated, villaRetryToken,
  ]);

  // Any filter change (not the page/pageSize themselves) jumps back to page 1 — same as Loggia.
  useEffect(() => {
    setVillaPage(1);
  }, [
    villaQuery, villaRegion, villaArea, villaBedrooms, villaGuests, villaPriceRange,
    villaDateFrom, villaDateTo, villaFlexibleDates, villaFlexibleDays, villaMinStars,
    villaPublished, villaOutdoor, villaLuxury, villaView, villaLocationFeatures, villaPropertyType,
    villaManagedOnly,
  ]);

  const villaTotalPages = Math.max(1, Math.ceil(villaTotal / villaPageSize));

  useEffect(() => {
    if (!isAuthenticated) return;
    const handle = setTimeout(async () => {
      setConciergeSearching(true);
      setConciergeSearchError(null);
      try {
        const q = conciergeQuery.trim();
        const raw = await getLibraryServices({
          productType: CONCIERGE_PACKAGE_PRODUCT_TYPE,
          ...(q ? { name: q } : {}),
          ...(conciergeCountries.length ? { country: conciergeCountries.join(",") } : {}),
          ...(conciergeLocations.length ? { location: conciergeLocations.join(",") } : {}),
        });
        if (raw?.success === false) {
          setConciergeSearchError(raw?.message || "Could not load concierge packages. Please try again.");
          setConciergeResults([]);
        } else {
          setConciergeResults(normalizeLibraryServicesResponse(raw));
        }
      } catch {
        setConciergeSearchError("Could not load concierge packages. Please try again.");
      } finally {
        setConciergeSearching(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [conciergeQuery, conciergeCountries, conciergeLocations, isAuthenticated, conciergeRetryToken]);

  // Options for the Country/Location pickers derive from the current result set, same as Loggia's
  // conciergeCountryOptions/conciergeLocationOptions (there's no dedicated distinct-values endpoint).
  const conciergeCountryOptions = useMemo(
    () => Array.from(new Set(conciergeResults.map((s) => s.country).filter(Boolean))).sort(),
    [conciergeResults]
  );
  const conciergeLocationOptions = useMemo(
    () => Array.from(new Set(conciergeResults.map((s) => s.location || s.area).filter(Boolean))).sort(),
    [conciergeResults]
  );

  const handleHeaderImageUpload = async (file: File) => {
    setImageUploadError(null);
    setImageUploading(true);
    try {
      const result = await uploadShareImage(file);
      if (!result?.success || !result?.data?.url) {
        setImageUploadError(result?.message || "Could not upload the image. Please try again.");
        return;
      }
      setImageUrl(result.data.url);
      markDirty();
    } finally {
      setImageUploading(false);
    }
  };

  const toggleVilla = (property: any) => {
    markDirty();
    const alreadyAdded = villaItems.some((v) => String(v.propertyId ?? v.id) === String(property.id));
    if (alreadyAdded) {
      setVillaItems((prev) => prev.filter((v) => String(v.propertyId ?? v.id) !== String(property.id)));
      return;
    }
    const grossRate = Number(property.grossRate ?? property.officialPrice ?? 0);
    setVillaItems((prev) => [
      ...prev,
      {
        ...property,
        propertyId: property.id,
        itemType: "property",
        blockId: blocks[0]?.id ?? "block-1",
        checkIn: "",
        checkOut: "",
        grossRate,
        discountMode: "percent",
        discountShare: 0,
        discountFixedAmount: 0,
        securityDeposit: Number(property.securityDeposit ?? 0),
        bottomCardText: "",
        finalPrice: grossRate,
      },
    ]);
  };

  const removeVilla = (propertyId: string) => {
    markDirty();
    setVillaItems((prev) => prev.filter((v) => String(v.propertyId ?? v.id) !== String(propertyId)));
  };

  const updateVillaField = (propertyId: string, field: string, value: any) => {
    markDirty();
    setVillaItems((prev) =>
      prev.map((v) => {
        if (String(v.propertyId ?? v.id) !== String(propertyId)) return v;
        const next = { ...v, [field]: value };
        if (["grossRate", "discountMode", "discountShare", "discountFixedAmount"].includes(field)) {
          next.finalPrice = computeVillaFinalPrice(next);
        }
        // Markup only recomputes grossRate when we actually have a Net-to-Agent figure to work
        // from (i.e. a quote was fetched) — editing markup before dates are set does nothing yet.
        // The field stores whatever the user typed as-is (including "" while clearing it to type a
        // new value) — coercing straight to `Number(value) || 0` on every keystroke would snap an
        // emptied field back to 0 before they can type the replacement digit.
        if (field === "markupPct" && next._netToAgentTotal != null) {
          const parsedPct = Number(value);
          if (value !== "" && !isNaN(parsedPct)) {
            next.grossRate = Math.round(next._netToAgentTotal * (1 + parsedPct / 100));
            next.finalPrice = computeVillaFinalPrice(next);
          }
        }
        return next;
      })
    );
  };

  // Auto-suggests grossRate from the same Net-to-Agent calculation as the standalone Rates page,
  // applying the recommended 20% markup, whenever a villa item's check-in/check-out are both set —
  // deliberately overwrites a manually-typed grossRate if dates are changed afterward (explicit
  // product decision: automatic, not a "suggest" button the agent has to click). The markup % itself
  // stays editable afterward (see the input next to Gross rate below), recomputing without refetching.
  useEffect(() => {
    villaItems.forEach((item) => {
      const propertyId = item.propertyId ?? item.id;
      if (!item.checkIn || !item.checkOut || item.checkOut <= item.checkIn) return;
      if (item._autoRateCheckIn === item.checkIn && item._autoRateCheckOut === item.checkOut) return;

      setVillaItems((prev) =>
        prev.map((v) =>
          String(v.propertyId ?? v.id) === String(propertyId)
            ? { ...v, _autoRateCheckIn: item.checkIn, _autoRateCheckOut: item.checkOut }
            : v
        )
      );

      getAgentRateQuote(propertyId, item.checkIn, item.checkOut)
        .then((res: any) => {
          if (res?.success === false || !res?.data) return;
          const netToAgent = Number(res.data.netToAgentTotal) || 0;
          // Setting _netToAgentTotal first, then markupPct, lets updateVillaField's own markup
          // recompute (below) derive grossRate — no need to also set it explicitly here.
          updateVillaField(propertyId, "_netToAgentTotal", netToAgent);
          updateVillaField(propertyId, "markupPct", 20);
        })
        .catch(() => {});
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [villaItems]);

  const reorderVillaItems = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= villaItems.length) return;
    markDirty();
    setVillaItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const toggleConciergeService = (service: any) => {
    markDirty();
    const alreadyAdded = conciergeItems.some((c) => String(c.serviceId) === String(service.id));
    if (alreadyAdded) {
      setConciergeItems((prev) => prev.filter((c) => String(c.serviceId) !== String(service.id)));
      return;
    }
    const dailyPrice = Number(service.price ?? service.grossRate ?? 0);
    setConciergeItems((prev) => [
      ...prev,
      {
        ...service,
        serviceId: service.id,
        itemType: "service",
        title: service.serviceName || service.name || service.title || "Concierge Package",
        blockId: blocks[0]?.id ?? "block-1",
        dateFrom: "",
        dateTo: "",
        days: 1,
        dailyPrice,
        totalHtml: dailyPrice ? String(dailyPrice) : "",
        priceNoteHtml: "",
        openText2Html: "",
        policiesHtml: "",
        hiddenFromClient: false,
        finalPrice: dailyPrice,
        currency,
      },
    ]);
  };

  const removeConciergeItem = (item: ConciergeItem) => {
    markDirty();
    const key = conciergeKey(item);
    setConciergeItems((prev) => prev.filter((c) => conciergeKey(c) !== key));
  };

  const updateConciergeField = (item: ConciergeItem, field: string, value: any) => {
    markDirty();
    const key = conciergeKey(item);
    setConciergeItems((prev) => prev.map((c) => (conciergeKey(c) === key ? { ...c, [field]: value } : c)));
  };

  const updateConciergeNumericField = (item: ConciergeItem, field: "dailyPrice" | "days", value: string) => {
    markDirty();
    const key = conciergeKey(item);
    setConciergeItems((prev) =>
      prev.map((c) => {
        if (conciergeKey(c) !== key) return c;
        const next = { ...c, [field]: Number(value) || 0 };
        next.finalPrice = Number(next.dailyPrice || 0) * Number(next.days || 1);
        return next;
      })
    );
  };

  const duplicateConciergeItem = (item: ConciergeItem) => {
    markDirty();
    const key = conciergeKey(item);
    setConciergeItems((prev) => {
      const idx = prev.findIndex((c) => conciergeKey(c) === key);
      const clone = {
        ...item,
        itemType: "customService",
        customServiceId: makeId(),
        serviceId: undefined,
        title: `${item.title || item.name} (copy)`,
      };
      const next = [...prev];
      next.splice(idx + 1, 0, clone);
      return next;
    });
  };

  const totalSelected = villaItems.length + conciergeItems.length;

  const missingOfferName = !offerName.trim();

  const canSave = useMemo(
    () => (villaItems.length > 0 || conciergeItems.length > 0) && !saving && !missingOfferName,
    [villaItems, conciergeItems, saving, missingOfferName]
  );

  const saveOffer = async (options?: { silent?: boolean }): Promise<string | null> => {
    const silent = options?.silent ?? false;
    if (!silent) {
      setSaveError(null);
      setSaving(true);
    } else {
      setAutosaveError(null);
      setAutosaving(true);
    }
    try {
      const villaProps: any[] = villaItems.map(({ _autoRateCheckIn, _autoRateCheckOut, _suggestedRateNote, _netToAgentTotal, ...v }) => ({
        ...v,
        officialPrice: v.finalPrice,
        finalPrice: v.finalPrice,
        grossRate: v.grossRate ?? 0,
        discount: v.discountMode === "fixed" ? v.discountFixedAmount ?? 0 : v.discountShare ?? 0,
        discountShare: v.discountShare ?? 0,
        discountMode: v.discountMode ?? "percent",
        discountFixedAmount: v.discountFixedAmount ?? 0,
        calculationCommission: 0,
        totalCommission: 0,
        securityDeposit: v.securityDeposit ?? 0,
        bottomCardText: v.bottomCardText || undefined,
        startDate: v.checkIn || undefined,
        endDate: v.checkOut || undefined,
        nights: diffNights(v.checkIn, v.checkOut),
      }));
      const conciergeProps: any[] = conciergeItems.map((c) => ({
        ...c,
        finalPrice: c.finalPrice,
        grossRate: c.totalHtml || c.finalPrice,
        openText1: c.priceNoteHtml || "",
        openText2: c.openText2Html || "",
        policies: c.policiesHtml || "",
        hiddenFromClient: Boolean(c.hiddenFromClient),
        startDate: c.dateFrom || undefined,
        endDate: c.dateTo || undefined,
        days: c.days || undefined,
      }));

      const sections = blocks
        .map((block) => ({
          title: block.title,
          text: block.content,
          properties: [
            ...villaProps.filter((v) => v.blockId === block.id),
            ...conciergeProps.filter((c) => c.blockId === block.id),
          ],
        }))
        .filter((s) => s.properties.length > 0);

      const payload = {
        title: title || offerName || "Property Proposal",
        description,
        welcomeTitle,
        imageUrl,
        branded: false,
        createdViaAgentPortfolio: true,
        showPrice,
        currency,
        priceEntryUsd,
        usdPerEur: priceEntryUsd ? usdPerEur : null,
        offerName,
        clientDisplayName,
        propertiesToPresent: sections,
      };

      const result = offerId
        ? await updateShareProperty(offerId, payload)
        : await createShareProperty(payload);
      if (!result?.success || !result?.data?.slug) {
        const message = result?.message || "Could not save the offer. Please try again.";
        if (!silent) {
          setSaveError(message);
        } else {
          setAutosaveError(message);
        }
        return null;
      }
      setOfferId(result.data.id ?? offerId);
      setLastSavedAt(new Date());
      setDirty(false);
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      return `${origin}/agent-offers/${encodeURIComponent(result.data.slug)}`;
    } catch (err: any) {
      const message = err?.message || "Could not save the offer. Please try again.";
      if (!silent) {
        setSaveError(message);
      } else {
        setAutosaveError(message);
      }
      return null;
    } finally {
      if (!silent) {
        setSaving(false);
      } else {
        setAutosaving(false);
      }
    }
  };

  const handleGetLink = async () => {
    const link = await saveOffer();
    if (link) {
      setPublicLink(link);
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  // Autosave every 2 minutes once the offer has been saved at least once — always calls the latest
  // saveOffer via a ref so it reflects current form state without resetting the timer on every edit.
  const saveOfferRef = useRef(saveOffer);
  useEffect(() => {
    saveOfferRef.current = saveOffer;
  });
  useEffect(() => {
    if (!offerId) return;
    const interval = setInterval(() => {
      saveOfferRef.current({ silent: true });
    }, 120000);
    return () => clearInterval(interval);
  }, [offerId]);

  // Warn on tab close/refresh with unsaved edits — a stray reload used to silently drop the whole
  // in-progress offer since nothing here persists to localStorage.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  // Edit mode: /agent-portfolio/create?id=<offerId> loads a previously saved offer and hydrates the
  // whole form from it. Sections (propertiesToPresent) become blocks; each section's properties are
  // split back into villaItems/conciergeItems by itemType, using the same field names saveOffer wrote.
  useEffect(() => {
    if (!router.isReady || !isAuthenticated) return;
    const editId = typeof router.query.id === "string" ? router.query.id : null;
    if (!editId || offerId) return;

    setLoadingOffer(true);
    setLoadOfferError(null);
    getShareProperty(editId)
      .then((res: any) => {
        if (!res?.success || !res?.data) {
          setLoadOfferError(res?.message || "Could not load this offer.");
          return;
        }
        const data = res.data;
        const sections = Array.isArray(data.propertiesToPresent) ? data.propertiesToPresent : [];
        const loadedBlocks: Block[] = sections.length
          ? sections.map((s: any) => ({ id: makeId(), title: s.title || "Block", content: s.text || "" }))
          : [{ id: "block-1", title: "Featured Villas", content: "" }];

        const loadedVillaItems: VillaItem[] = [];
        const loadedConciergeItems: ConciergeItem[] = [];
        sections.forEach((section: any, i: number) => {
          const blockId = loadedBlocks[i]?.id ?? loadedBlocks[0].id;
          (Array.isArray(section.properties) ? section.properties : []).forEach((item: any) => {
            if (item.itemType === "service" || item.itemType === "customService") {
              loadedConciergeItems.push({
                ...item,
                blockId,
                dateFrom: item.startDate || "",
                dateTo: item.endDate || "",
                totalHtml: item.grossRate != null ? String(item.grossRate) : "",
                priceNoteHtml: item.openText1 || "",
                openText2Html: item.openText2 || "",
                policiesHtml: item.policies || "",
              });
            } else {
              loadedVillaItems.push({
                ...item,
                blockId,
                checkIn: item.startDate || "",
                checkOut: item.endDate || "",
              });
            }
          });
        });

        setOfferName(data.offerName || "");
        setTitle(data.title || "");
        setWelcomeTitle(data.welcomeTitle || "");
        setDescription(data.description || "");
        setImageUrl(data.imageUrl || null);
        setClientDisplayName(data.clientDisplayName || "");
        setCurrency(data.currency || "EUR");
        setShowPrice(data.showPrice ?? true);
        setPriceEntryUsd(Boolean(data.priceEntryUsd));
        setUsdPerEur(data.usdPerEur && Number(data.usdPerEur) > 0 ? Number(data.usdPerEur) : 1.08);
        setBlocks(loadedBlocks);
        setVillaItems(loadedVillaItems);
        setConciergeItems(loadedConciergeItems);
        setOfferId(data.id ?? editId);
        setLastSavedAt(new Date(data.updatedAt || data.createdAt || Date.now()));
        setStep("complete");
        setDirty(false);
      })
      .finally(() => setLoadingOffer(false));
  }, [router.isReady, router.query.id, isAuthenticated, offerId]);

  const handleCopyLink = async () => {
    if (!publicLink) return;
    try {
      await navigator.clipboard.writeText(publicLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — user can still select/copy the visible link manually
    }
  };

  if (loading) {
    return null;
  }

  if (!isAuthenticated || !user?.isAgentPortfolioAccount) {
    return <AgentPortfolioLoggedOut returnTo={router.asPath} />;
  }

  if (loadingOffer) {
    return (
      <AgentPortfolioLayout>
        <SeoHead title="Loading offer... | Agent Portfolio" description="" canonicalPath="/agent-portfolio/create" noindex suppressSiteBranding />
        <div className="flex items-center justify-center py-24">
          <p className="font-haas text-sm text-[#506A70]">Loading offer...</p>
        </div>
      </AgentPortfolioLayout>
    );
  }

  if (loadOfferError) {
    return (
      <AgentPortfolioLayout>
        <SeoHead title="Offer not found | Agent Portfolio" description="" canonicalPath="/agent-portfolio/create" noindex suppressSiteBranding />
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <p className="font-haas text-sm text-red-600">{loadOfferError}</p>
          <button type="button" className={backLinkClass} onClick={() => router.push("/agent-portfolio/offers")}>
            Back to my offers
          </button>
        </div>
      </AgentPortfolioLayout>
    );
  }

  return (
    <AgentPortfolioLayout>
      <SeoHead
        title="Create Offer | Agent Portfolio"
        description=""
        canonicalPath="/agent-portfolio/create"
        noindex
        suppressSiteBranding
      />
      {/* Header + catalogue toolbar stick together as one block — keeping them in separate sticky
          elements with a hardcoded top offset left a gap once the header scrolled past its own height.
          Only sticky on md+: on mobile this would stack on top of the layout's own sticky top bar and
          eat too much of the viewport. */}
      <div className="md:sticky md:top-0 z-20 bg-[#FBFAF7]/95 backdrop-blur border-b border-[#DDD8CC]">
        <div className="px-6 py-4">
          <button
            type="button"
            onClick={() => {
              if (dirty && !window.confirm("Discard unsaved changes and leave this offer?")) return;
              router.push("/agent-portfolio/offers");
            }}
            className={backLinkClass}
          >
            Back to my offers
          </button>
          <h1 className="font-gtsuper-ds text-xl md:text-2xl font-light text-[#172338] mt-1">
            {step === "select" ? "Select villas & concierge packages" : "Complete offer"}
          </h1>
        </div>

        {step === "select" && (
          <div className="px-6 py-3 border-t border-[#DDD8CC]">
            <div className="flex items-center justify-between gap-8 flex-wrap">
              <div className="flex items-center gap-6" role="group" aria-label="Catalogue">
                <button
                  type="button"
                  onClick={() => setActiveTab("villas")}
                  aria-pressed={activeTab === "villas"}
                  className={`font-haas text-sm leading-none pb-px border-b transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                    activeTab === "villas" ? "border-[#D99330] text-[#172338]" : "border-transparent text-[#9CA6AD] hover:text-[#172338]"
                  }`}
                >
                  Villas
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("concierge")}
                  aria-pressed={activeTab === "concierge"}
                  className={`font-haas text-sm leading-none pb-px border-b transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                    activeTab === "concierge" ? "border-[#D99330] text-[#172338]" : "border-transparent text-[#9CA6AD] hover:text-[#172338]"
                  }`}
                >
                  Concierge
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                aria-pressed={showFilters}
                className={`flex items-center gap-1.5 font-haas text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                  showFilters ? "text-[#D99330]" : "text-[#9CA6AD] hover:text-[#172338]"
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center bg-[#172338] px-1 text-[10px] tabular-nums text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {step === "select" ? (
        <div className="flex flex-col">
          {/* Filters overlay — slides in over the catalogue instead of pushing it out of the way;
              same drawer on mobile and desktop, closed by the backdrop, the X, or "Show results". */}
          <div
            className={`fixed inset-0 z-40 transition-opacity duration-300 ${
              showFilters ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
            }`}
            aria-hidden={!showFilters}
          >
            <div className="absolute inset-0 bg-[#172338]/40" onClick={() => setShowFilters(false)} />
            <aside
              role="dialog"
              aria-modal="true"
              aria-label="Filters"
              className={`absolute right-0 top-0 h-full w-full sm:w-[380px] bg-[#FBFAF7] flex flex-col transition-transform duration-300 ease-out ${
                showFilters ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="flex items-start justify-between px-6 pt-7 pb-5 border-b border-[#DDD8CC] flex-shrink-0">
                <div>
                  <p className="font-haas text-[10px] uppercase tracking-[0.22em] text-[#D99330]">Filters</p>
                  <p className="mt-2 font-gtsuper-ds text-2xl font-light text-[#172338]">
                    {activeTab === "villas" ? "Refine villas" : "Refine concierge"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  aria-label="Close filters"
                  className="flex h-8 w-8 items-center justify-center text-[#9CA6AD] transition-colors hover:text-[#172338] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D99330]"
                >
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6">
                {activeTab === "villas" ? (
                  <>
                    {/* Search, region/area and dates are all underlined fields — grouped with spacing
                        only, since a section rule under each one read as double lines. */}
                    <div className="pt-5">
                      <p className={filterLabelClass}>Search</p>
                      <div className="relative mt-1">
                        <Input
                          className={`${fieldInputClass} pr-8`}
                          value={villaQuery}
                          onChange={(e) => setVillaQuery(e.target.value)}
                          placeholder="Search villas..."
                        />
                        {villaQuery && (
                          <button
                            type="button"
                            onClick={() => setVillaQuery("")}
                            aria-label="Clear search"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9CA6AD] hover:text-[#506A70]"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-5 pt-6">
                      <div>
                        <p className={filterLabelClass}>Region</p>
                        <SelectField value={villaRegion} onChange={setVillaRegion} options={regions} placeholder="All" />
                      </div>
                      <div>
                        <p className={filterLabelClass}>Area</p>
                        <SelectField
                          value={villaArea}
                          onChange={setVillaArea}
                          options={villaRegion ? areasForRegion ?? areas : areas}
                          placeholder="All"
                        />
                      </div>
                    </div>

                    <div className="pt-6 pb-6">
                      <p className={filterLabelClass}>Availability</p>
                      <StayDatesPicker
                        placeholder="Any dates"
                        checkIn={villaDateFrom}
                        checkOut={villaDateTo}
                        onChange={(from, to) => {
                          setVillaDateFrom(from);
                          setVillaDateTo(to);
                        }}
                      />
                      {/* Flexibility only means something once there are dates to flex around. */}
                      {villaDateFrom && (
                        <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Date flexibility">
                          <FilterChip label="Exact dates" checked={!villaFlexibleDates} onToggle={() => setVillaFlexibleDates(false)} />
                          {FLEXIBLE_STAY_DAY_OPTIONS.map((d) => (
                            <FilterChip
                              key={d}
                              label={`± ${d} days`}
                              checked={villaFlexibleDates && villaFlexibleDays === d}
                              onToggle={() => {
                                setVillaFlexibleDates(true);
                                setVillaFlexibleDays(d);
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="border-t border-[#DDD8CC] py-5 space-y-6">
                      {([
                        { label: "Bedrooms", value: villaBedrooms, max: 20, step: 1, set: setVillaBedrooms, fmt: (n: number) => `${n}` },
                        { label: "Guests", value: villaGuests, max: 50, step: 1, set: setVillaGuests, fmt: (n: number) => `${n}` },
                        { label: "Price per night", value: villaPriceRange, max: 10000, step: 100, set: setVillaPriceRange, fmt: (n: number) => `€${n.toLocaleString()}` },
                      ] as const).map((r) => (
                        <div key={r.label}>
                          <div className="flex items-baseline justify-between">
                            <p className={filterLabelClass}>{r.label}</p>
                            <p className="font-haas text-xs tabular-nums text-[#172338]">
                              {r.fmt(r.value[0])} – {r.fmt(r.value[1])}
                              {r.value[1] === r.max ? "+" : ""}
                            </p>
                          </div>
                          <RangeSlider
                            value={r.value}
                            max={r.max}
                            step={r.step}
                            onValueChange={(v) => r.set([v[0], v[1]])}
                          />
                        </div>
                      ))}
                    </div>

                    <fieldset className="border-t border-[#DDD8CC] py-5">
                      <div className="flex items-baseline justify-between">
                        <legend className={filterLabelClass}>Minimum stars</legend>
                        <span className="font-haas text-xs text-[#172338]">{villaMinStars > 0 ? `${villaMinStars}+` : "Any"}</span>
                      </div>
                      <div className="mt-3 flex gap-1.5" role="radiogroup" aria-label="Minimum stars">
                        {Array.from({ length: 7 }, (_, i) => i + 1).map((starValue) => (
                          <button
                            key={starValue}
                            type="button"
                            role="radio"
                            aria-checked={starValue === villaMinStars}
                            onClick={() => setVillaMinStars(starValue === villaMinStars ? 0 : starValue)}
                            aria-label={`${starValue} stars`}
                            className="p-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D99330]"
                          >
                            <Star
                              strokeWidth={1.25}
                              className={`h-5 w-5 transition-colors ${
                                starValue <= villaMinStars ? "fill-[#D99330] text-[#D99330]" : "text-[#DDD8CC] hover:text-[#9CA6AD]"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </fieldset>

                    <div className="flex items-center justify-between border-t border-[#DDD8CC] py-5">
                      <div>
                        <p className={filterLabelClass}>Published only</p>
                        <p className="mt-1 font-haas text-xs text-[#506A70]">Hide villas not yet live on the site</p>
                      </div>
                      <Switch
                        checked={villaPublished}
                        onCheckedChange={setVillaPublished}
                        className="data-[state=checked]:bg-[#172338] data-[state=unchecked]:bg-[#DDD8CC]"
                      />
                    </div>

                    <FilterGroup title="Outdoor" count={villaOutdoor.length} defaultOpen={villaOutdoor.length > 0}>
                      {OUTDOOR_OPTIONS.map((o) => (
                        <FilterChip
                          key={o}
                          label={o}
                          checked={villaOutdoor.includes(o)}
                          onToggle={() => setVillaOutdoor((prev) => toggleInArray(prev, o))}
                        />
                      ))}
                    </FilterGroup>

                    <FilterGroup title="Luxury Facilities" count={villaLuxury.length} defaultOpen={villaLuxury.length > 0}>
                      {LUXURY_OPTIONS.map((o) => (
                        <FilterChip
                          key={o}
                          label={o}
                          checked={villaLuxury.includes(o)}
                          onToggle={() => setVillaLuxury((prev) => toggleInArray(prev, o))}
                        />
                      ))}
                    </FilterGroup>

                    <FilterGroup title="Property Type" count={villaPropertyType.length} defaultOpen={villaPropertyType.length > 0}>
                      {PROPERTY_TYPE_OPTIONS.map((o) => (
                        <FilterChip
                          key={o.value}
                          label={o.label}
                          checked={villaPropertyType.includes(o.value)}
                          onToggle={() => setVillaPropertyType((prev) => toggleInArray(prev, o.value))}
                        />
                      ))}
                    </FilterGroup>

                    <FilterGroup title="Location features" count={villaLocationFeatures.length} defaultOpen={villaLocationFeatures.length > 0}>
                      {LOCATION_FEATURE_OPTIONS.map((o) => (
                        <FilterChip
                          key={o}
                          label={o}
                          checked={villaLocationFeatures.includes(o)}
                          onToggle={() => setVillaLocationFeatures((prev) => toggleInArray(prev, o))}
                        />
                      ))}
                    </FilterGroup>

                    <FilterGroup title="View" count={villaView.length} defaultOpen={villaView.length > 0}>
                      {VIEW_OPTIONS.map((o) => (
                        <FilterChip
                          key={o}
                          label={o}
                          checked={villaView.includes(o)}
                          onToggle={() => setVillaView((prev) => toggleInArray(prev, o))}
                        />
                      ))}
                    </FilterGroup>
                  </>
                ) : (
                  <>
                    <div className="py-5">
                      <p className={filterLabelClass}>Search by name</p>
                      <div className="relative mt-1">
                        <Input
                          className={`${fieldInputClass} pr-8`}
                          value={conciergeQuery}
                          onChange={(e) => setConciergeQuery(e.target.value)}
                          placeholder="Search concierge packages..."
                        />
                        {conciergeQuery && (
                          <button
                            type="button"
                            onClick={() => setConciergeQuery("")}
                            aria-label="Clear search"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9CA6AD] hover:text-[#506A70]"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <FilterGroup title="Country" count={conciergeCountries.length} defaultOpen={conciergeCountries.length > 0}>
                      {conciergeCountryOptions.length === 0 && (
                        <p className="text-xs text-[#9CA6AD]">No countries available</p>
                      )}
                      {conciergeCountryOptions.map((c) => (
                        <FilterChip
                          key={c}
                          label={c}
                          checked={conciergeCountries.includes(c)}
                          onToggle={() => setConciergeCountries((prev) => toggleInArray(prev, c))}
                        />
                      ))}
                    </FilterGroup>

                    <FilterGroup title="Location" count={conciergeLocations.length} defaultOpen={conciergeLocations.length > 0}>
                      {conciergeLocationOptions.length === 0 && (
                        <p className="text-xs text-[#9CA6AD]">No locations available</p>
                      )}
                      {conciergeLocationOptions.map((l) => (
                        <FilterChip
                          key={l}
                          label={l}
                          checked={conciergeLocations.includes(l)}
                          onToggle={() => setConciergeLocations((prev) => toggleInArray(prev, l))}
                        />
                      ))}
                    </FilterGroup>
                  </>
                )}
              </div>

              <div className="flex items-center gap-4 px-6 py-4 border-t border-[#DDD8CC] flex-shrink-0">
                <button
                  type="button"
                  onClick={activeTab === "villas" ? clearVillaFilters : clearConciergeFilters}
                  disabled={activeFilterCount === 0}
                  className="font-haas text-sm text-[#506A70] underline decoration-transparent underline-offset-4 transition-colors hover:text-[#172338] hover:decoration-[#172338] disabled:pointer-events-none disabled:opacity-40"
                >
                  Clear all
                </button>
                <Button
                  type="button"
                  className="ml-auto rounded-none bg-[#172338] px-6 font-normal text-white hover:bg-[#172338]/90"
                  onClick={() => setShowFilters(false)}
                >
                  Show results
                </Button>
              </div>
            </aside>
          </div>

          <div
            className={`flex flex-col flex-1 gap-6 px-6 py-6 transition-[padding] ${
              totalSelected > 0 ? "pb-40 md:pb-28" : "pb-10"
            }`}
          >
            <div className="flex-1 min-w-0 space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-sm font-medium text-[#506A70]">
                  {(activeTab === "villas" ? villaSearching : conciergeSearching) ? "Loading..." : ""}
                </p>
                {activeTab === "villas" && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#506A70]">Show</span>
                    <NativeSelect
                      wrapperClassName="relative inline-block min-w-[4.5rem]"
                      className="h-8 pl-2 pr-7"
                      value={villaPageSize}
                      onChange={(e) => setVillaPageSize(Number(e.target.value))}
                    >
                      {[9, 18, 30, 60, 90].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </NativeSelect>
                  </div>
                )}
              </div>

              {activeTab === "villas" && villaSearchError && (
                <div className="flex items-center justify-between gap-3 bg-red-50 border border-red-200 px-4 py-3">
                  <p className="text-sm text-red-600">{villaSearchError}</p>
                  <Button type="button" variant="outline" size="sm" className="font-normal rounded-none" onClick={() => setVillaRetryToken((n) => n + 1)}>
                    Retry
                  </Button>
                </div>
              )}
              {activeTab === "concierge" && conciergeSearchError && (
                <div className="flex items-center justify-between gap-3 bg-red-50 border border-red-200 px-4 py-3">
                  <p className="text-sm text-red-600">{conciergeSearchError}</p>
                  <Button type="button" variant="outline" size="sm" className="font-normal rounded-none" onClick={() => setConciergeRetryToken((n) => n + 1)}>
                    Retry
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                {activeTab === "villas" && villaSearching &&
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={`villa-skeleton-${i}`} className="w-full flex flex-col animate-pulse">
                      <div className="aspect-[4/3] bg-[#EDEAE2]" />
                      <div className="pt-4 space-y-2">
                        <div className="h-5 bg-[#EDEAE2] w-2/3" />
                        <div className="h-3 bg-[#EDEAE2] w-1/2" />
                        <div className="h-3 bg-[#EDEAE2] w-1/3" />
                      </div>
                    </div>
                  ))}
                {activeTab === "concierge" && conciergeSearching &&
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={`concierge-skeleton-${i}`} className="w-full flex flex-col animate-pulse">
                      <div className="w-full aspect-[4/3] bg-[#EDEAE2]" />
                      <div className="pt-4 space-y-2">
                        <div className="h-5 bg-[#EDEAE2] w-2/3" />
                        <div className="h-3 bg-[#EDEAE2] w-1/2" />
                      </div>
                    </div>
                  ))}

                {activeTab === "villas" && !villaSearching && !villaSearchError && villaResults.length === 0 && (
                  <div className="col-span-full flex flex-col items-center gap-2 py-10 text-center">
                    <p className="text-sm text-[#9CA6AD]">No villas found for these filters.</p>
                    {showFilters && (
                      <Button type="button" variant="outline" size="sm" className="font-normal rounded-none" onClick={clearVillaFilters}>
                        Clear filters
                      </Button>
                    )}
                  </div>
                )}
                {activeTab === "concierge" && !conciergeSearching && !conciergeSearchError && conciergeResults.length === 0 && (
                  <div className="col-span-full flex flex-col items-center gap-2 py-10 text-center">
                    <p className="text-sm text-[#9CA6AD]">No concierge packages found for these filters.</p>
                    {showFilters && (conciergeQuery || conciergeCountries.length > 0 || conciergeLocations.length > 0) && (
                      <Button type="button" variant="outline" size="sm" className="font-normal rounded-none" onClick={clearConciergeFilters}>
                        Clear filters
                      </Button>
                    )}
                  </div>
                )}

                {activeTab === "villas" && !villaSearching &&
                  villaResults.map((property) => {
                      const isSelected = villaItems.some(
                        (v) => String(v.propertyId ?? v.id) === String(property.id)
                      );
                      const cardSubtitle = property.visibleLocation || property.location;
                      return (
                        <div
                          key={property.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => toggleVilla(property)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              toggleVilla(property);
                            }
                          }}
                          aria-pressed={isSelected}
                          aria-label={isSelected ? `Deselect ${property.title || "villa"}` : `Select ${property.title || "villa"}`}
                          className={`group relative w-full flex flex-col cursor-pointer p-3 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                            isSelected ? "bg-[#D99330]/10 ring-1 ring-[#D99330]" : ""
                          }`}
                        >
                          <div className="relative flex-shrink-0 w-full aspect-[4/3] overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                              src={getVillaImageUrl(property)}
                              alt={property.title || "Villa"}
                            />
                            {/* Opens the villa's own page in a new tab without selecting it — stopPropagation
                                keeps this from also toggling the card underneath it. */}
                            <a
                              href={`/agent-property/${property.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              aria-label={`View ${property.title || "villa"}`}
                              className="absolute z-10 top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/90 border border-[#DDD8CC] hover:border-[#9CA6AD] transition-colors"
                            >
                              <ExternalLink className="h-3.5 w-3.5 text-[#172338]" />
                            </a>
                          </div>
                          <div className="pt-4 flex-1 flex flex-col gap-1">
                            <h2 className="font-gtsuper-ds text-lg font-light text-[#172338] leading-snug">
                              {property.title || "Villa"}
                            </h2>
                            {cardSubtitle ? (
                              <p className="font-haas text-sm text-[#506A70] leading-snug">{cardSubtitle}</p>
                            ) : null}
                            <p className="font-haas text-sm text-[#D99330] mt-0.5">
                              {getBedrooms(property)} bedrooms · {getGuests(property)} guests
                            </p>
                          </div>
                        </div>
                      );
                    })}
                {activeTab === "concierge" && !conciergeSearching &&
                  conciergeResults.map((service) => {
                      const isSelected = conciergeItems.some((c) => String(c.serviceId) === String(service.id));
                      const image = service.mainImage || service.images?.[0]?.urlImage || service.images?.[0]?.url;
                      const finalTitle = service.serviceName || service.name || service.title || "Concierge Package";
                      const finalSubtitle = [service.area || service.location, service.country].filter(Boolean).join(", ");
                      return (
                        <div
                          key={service.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => toggleConciergeService(service)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              toggleConciergeService(service);
                            }
                          }}
                          aria-pressed={isSelected}
                          aria-label={isSelected ? `Deselect ${finalTitle}` : `Select ${finalTitle}`}
                          className={`group w-full flex flex-col cursor-pointer p-3 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                            isSelected ? "bg-[#D99330]/10 ring-1 ring-[#D99330]" : ""
                          }`}
                        >
                          <div className="relative flex-shrink-0 w-full aspect-[4/3] overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={image ? resolveMediaUrl(image) : CONCIERGE_PLACEHOLDER_IMAGE}
                              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                              alt={finalTitle}
                            />
                          </div>
                          <div className="pt-4 flex-1 flex flex-col gap-1">
                            <h2 className="font-gtsuper-ds text-lg font-light text-[#172338] leading-snug">{finalTitle}</h2>
                            <p className="font-haas text-sm text-[#D99330]">Concierge package</p>
                            {finalSubtitle && <p className="font-haas text-sm text-[#506A70] leading-snug">{finalSubtitle}</p>}
                          </div>
                        </div>
                      );
                    })}
              </div>

              {activeTab === "villas" && villaTotalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-4 font-haas text-sm">
                  <button
                    type="button"
                    onClick={() => setVillaPage((p) => Math.max(1, p - 1))}
                    disabled={villaPage === 1}
                    className="text-[#9CA6AD] hover:text-[#172338] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-[#506A70] whitespace-nowrap">
                    Page {villaPage} of {villaTotalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setVillaPage((p) => Math.min(villaTotalPages, p + 1))}
                    disabled={villaPage === villaTotalPages}
                    className="text-[#9CA6AD] hover:text-[#172338] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Selected items tray — review/remove picks without leaving the catalogue, same pattern as Loggia */}
          <SelectionTray
            villaCount={villaItems.length}
            conciergeCount={conciergeItems.length}
            onContinue={() => setStep("complete")}
            chips={[
              ...villaItems.map((item): TrayChip => {
                const image = getVillaImageUrl(item);
                return {
                  key: `villa-chip-${item.propertyId ?? item.id}`,
                  label: item.title || "Villa",
                  // The generic placeholder photo would read as this villa's own picture — show the
                  // empty sand tile instead.
                  image: image !== VILLA_PLACEHOLDER_IMAGE ? image : undefined,
                  kind: "villa",
                  onRemove: () => removeVilla(item.propertyId ?? item.id),
                };
              }),
              ...conciergeItems.map((item): TrayChip => ({
                key: `concierge-chip-${conciergeKey(item)}`,
                label: item.title || item.name || "Service",
                kind: "concierge",
                onRemove: () => removeConciergeItem(item),
              })),
            ]}
          />
        </div>
      ) : (
        <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
          <button type="button" className={backLinkClass} onClick={() => setStep("select")}>
            Back to selection
          </button>

          <section className="space-y-4">
            <div>
              <h2 className="font-gtsuper-ds text-lg font-light text-[#172338]">Offer details</h2>
              <p className="font-haas text-sm text-[#506A70]">Reference and client this offer is for.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className={fieldLabelClass}>Reference code</Label>
                <Input
                  className={`${fieldInputClass}`}
                  value={offerName}
                  onChange={(e) => { setOfferName(e.target.value); markDirty(); }}
                  placeholder="e.g. Villa Maria - Summer 2025"
                />
              </div>
              <div>
                <Label className={fieldLabelClass}>Client name</Label>
                <Input className={`${fieldInputClass}`} value={clientDisplayName} onChange={(e) => { setClientDisplayName(e.target.value); markDirty(); }} placeholder="Type client name..." />
              </div>
            </div>
          </section>

          <section className="border-t border-[#DDD8CC] pt-8 space-y-4">
            <div>
              <h2 className="font-gtsuper-ds text-lg font-light text-[#172338]">Pricing</h2>
              <p className="font-haas text-sm text-[#506A70]">How rates are entered and which currency the offer uses.</p>
            </div>
            <div>
              <Label className={fieldLabelClass}>Currency</Label>
              <div className="flex items-center gap-3 mt-1">
                <NativeSelect
                  wrapperClassName="relative inline-block min-w-[6.5rem]"
                  className="h-10"
                  value={currency}
                  onChange={(e) => { setCurrency(e.target.value); markDirty(); }}
                >
                  {currencyOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </NativeSelect>
                <span className="text-sm text-[#506A70]">Table prices and the public offer use this.</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={priceEntryUsd} onCheckedChange={(v) => { setPriceEntryUsd(v); markDirty(); }} id="price-entry-usd" />
              <Label htmlFor="price-entry-usd" className={fieldLabelClass}>Enter villa prices in USD (stored as EUR in the offer)</Label>
              {priceEntryUsd && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#506A70]">USD per EUR</span>
                  <Input
                    type="number"
                    step="0.01"
                    className={`${fieldInputClass} w-24`}
                    value={usdPerEur}
                    onChange={(e) => { setUsdPerEur(Number(e.target.value) || 1); markDirty(); }}
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={showPrice} onCheckedChange={(v) => { setShowPrice(v); markDirty(); }} id="show-price" />
              <Label htmlFor="show-price" className={fieldLabelClass}>Show prices to client</Label>
            </div>
          </section>

          <section className="border-t border-[#DDD8CC] pt-8 space-y-4">
            <h2 className="font-gtsuper-ds text-lg font-light text-[#172338]">Welcome section</h2>
            <div>
              <Label className={fieldLabelClass}>Header image</Label>
              <p className="text-xs text-[#506A70] mb-2">
                Suggested size: 1600×500 (ratio 3.2:1) to fill the container without shrinking.
              </p>
              <div
                onClick={() => imageInputRef.current?.click()}
                className="relative flex aspect-[16/6] w-full cursor-pointer items-center justify-center overflow-hidden border-2 border-dashed border-[#DDD8CC] bg-[#F4F1EA] hover:bg-[#EDEAE2]"
              >
                {imageUploading ? (
                  <span className="text-sm text-[#9CA6AD]">Uploading...</span>
                ) : imageUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={resolveMediaUrl(imageUrl)} alt="Header" className="h-full w-full object-cover" />
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="absolute right-3 top-3 font-normal rounded-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageUrl(null);
                      }}
                    >
                      Remove
                    </Button>
                  </>
                ) : (
                  <span className="flex flex-col items-center gap-2 text-sm text-[#9CA6AD]">
                    <ImagePlus className="h-6 w-6" />
                    Click to upload header image
                  </span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                ref={imageInputRef}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleHeaderImageUpload(file);
                  e.target.value = "";
                }}
              />
              {imageUploadError && <p className="text-sm text-red-600 mt-2">{imageUploadError}</p>}
            </div>
            <div>
              <Label className={fieldLabelClass}>Headline shown to client</Label>
              <Input className={`${fieldInputClass}`} value={title} onChange={(e) => { setTitle(e.target.value); markDirty(); }} placeholder="Your Mykonos Escape" />
            </div>
            <div>
              <Label className={fieldLabelClass}>Welcome title</Label>
              <Input className={`${fieldInputClass}`} value={welcomeTitle} onChange={(e) => { setWelcomeTitle(e.target.value); markDirty(); }} />
            </div>
            <div>
              <Label className={fieldLabelClass}>Welcome message</Label>
              <RichTextEditor value={description} onChange={(html) => { setDescription(html); markDirty(); }} placeholder="Write a short welcome message for your client..." />
            </div>
          </section>

          <section className="border-t border-[#DDD8CC] pt-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-gtsuper-ds text-lg font-light text-[#172338]">Blocks</h2>
              <Button type="button" variant="outline" size="sm" className="font-normal rounded-none" onClick={addBlock}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add block
              </Button>
            </div>
            <p className="font-haas text-sm text-[#506A70]">
              Each block is its own titled section on the public offer. Reassign an item to a different
              block right from its chip below — no need to scroll down to the villa/concierge rows.
            </p>
            {blocks.map((block) => (
              <div key={block.id} className="border border-[#DDD8CC] p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Input
                    className={`${fieldInputClass} flex-1`}
                    value={block.title}
                    onChange={(e) => updateBlockTitle(block.id, e.target.value)}
                    placeholder="Block title"
                  />
                  {blocks.length > 1 && (
                    <button type="button" onClick={() => removeBlock(block.id)} className={`${rowDangerActionClass} flex-shrink-0`}>
                      Remove block
                    </button>
                  )}
                </div>
                <RichTextEditor
                  value={block.content}
                  onChange={(html) => updateBlockContent(block.id, html)}
                  minHeight="3.5rem"
                  placeholder="Optional description shown under this section's title..."
                />
                <div>
                  <Label className={fieldLabelClass}>Items in this block</Label>
                  {(() => {
                    const items = [
                      ...villaItems
                        .filter((v) => v.blockId === block.id)
                        .map((v) => ({
                          key: `villa-${v.propertyId ?? v.id}`,
                          name: v.title || "Villa",
                          image: getVillaImageUrl(v),
                          onMove: (newBlockId: string) => updateVillaField(v.propertyId ?? v.id, "blockId", newBlockId),
                        })),
                      ...conciergeItems
                        .filter((c) => c.blockId === block.id)
                        .map((c) => ({
                          key: `concierge-${conciergeKey(c)}`,
                          name: c.title || c.name || "Concierge package",
                          image:
                            c.mainImage || c.images?.[0]?.urlImage || c.images?.[0]?.url
                              ? resolveMediaUrl(c.mainImage || c.images?.[0]?.urlImage || c.images?.[0]?.url)
                              : CONCIERGE_PLACEHOLDER_IMAGE,
                          onMove: (newBlockId: string) => updateConciergeField(c, "blockId", newBlockId),
                        })),
                    ];
                    if (items.length === 0) {
                      return <p className="text-xs text-[#9CA6AD] mt-1">No items assigned yet.</p>;
                    }
                    return (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {items.map((it) => (
                          <span
                            key={it.key}
                            className="inline-flex items-center gap-1.5 bg-[#EDEAE2] text-[#172338] text-xs pl-1 pr-1.5 py-1"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={it.image} alt="" className="w-5 h-5 object-cover flex-shrink-0" />
                            <span className="max-w-[120px] truncate">{it.name}</span>
                            {blocks.length > 1 && (
                              <UnderlineSelect
                                wrapperClassName="relative inline-block"
                                className="text-[11px]"
                                value={block.id}
                                onChange={(e) => it.onMove(e.target.value)}
                                aria-label={`Move ${it.name} to a different block`}
                              >
                                {blocks.map((b) => (
                                  <option key={b.id} value={b.id}>{b.title}</option>
                                ))}
                              </UnderlineSelect>
                            )}
                          </span>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            ))}
          </section>

          <section className="border-t border-[#DDD8CC] pt-8 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="font-gtsuper-ds text-lg font-light text-[#172338]">Villas in this offer</h2>
                  <p className="font-haas text-sm text-[#506A70]">
                    {villaItems.length > 0 ? `${villaItems.length} villa(s) · drag rows to reorder` : "No villas yet."}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="font-normal rounded-none"
                  onClick={() => {
                    setActiveTab("villas");
                    setStep("select");
                  }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add more villas
                </Button>
              </div>
              {villaItems.length > 0 && (
                <>
              <div className="space-y-4">
                {villaItems.map((item, index) => {
                  const id = item.propertyId ?? item.id;
                  const nights = diffNights(item.checkIn, item.checkOut);
                  return (
                    <div
                      key={id}
                      draggable
                      onDragStart={() => setDragVillaIndex(index)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (dragVillaIndex !== null) reorderVillaItems(dragVillaIndex, index);
                        setDragVillaIndex(null);
                      }}
                      className="border border-[#DDD8CC] p-5 space-y-5 cursor-grab"
                    >
                      <div className="flex items-center gap-3 flex-wrap">
                        <GripVertical className="h-5 w-5 text-gray-300 flex-shrink-0 hidden sm:block" />
                        <div className="flex flex-col flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => reorderVillaItems(index, index - 1)}
                            disabled={index === 0}
                            aria-label="Move up"
                            className="p-0.5 text-[#9CA6AD] hover:text-[#172338] disabled:opacity-20 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => reorderVillaItems(index, index + 1)}
                            disabled={index === villaItems.length - 1}
                            aria-label="Move down"
                            className="p-0.5 text-[#9CA6AD] hover:text-[#172338] disabled:opacity-20 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getVillaImageUrl(item)}
                          alt=""
                          className="w-16 h-16 object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-[120px]">
                          <p className="text-sm font-medium text-[#172338] truncate">{item.title}</p>
                          <p className="text-xs text-[#506A70] truncate">{item.visibleLocation || item.location}</p>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                          <UnderlineSelect
                            wrapperClassName="relative inline-block min-w-[9rem]"
                            className="text-sm"
                            value={item.blockId}
                            onChange={(e) => updateVillaField(id, "blockId", e.target.value)}
                            aria-label={`Block for ${item.title || "villa"}`}
                          >
                            {blocks.map((b) => (
                              <option key={b.id} value={b.id}>{b.title}</option>
                            ))}
                          </UnderlineSelect>
                          <button type="button" onClick={() => removeVilla(id)} className={rowDangerActionClass}>
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <Label className={fieldLabelClass}>Check-in</Label>
                          <Input
                            type="date"
                            className={`${fieldInputClass}`}
                            value={item.checkIn}
                            onChange={(e) => updateVillaField(id, "checkIn", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className={fieldLabelClass}>Check-out</Label>
                          <Input
                            type="date"
                            className={`${fieldInputClass}`}
                            value={item.checkOut}
                            min={item.checkIn || undefined}
                            onChange={(e) => updateVillaField(id, "checkOut", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className={fieldLabelClass}>Nights</Label>
                          <div className="mt-1.5 h-9 flex items-center border border-[#DDD8CC] px-3 text-sm text-[#506A70]">
                            {nights || "—"}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <Label className={fieldLabelClass}>Gross rate</Label>
                          <Input
                            type="number"
                            className={`${fieldInputClass}`}
                            value={item.grossRate}
                            onChange={(e) => updateVillaField(id, "grossRate", Number(e.target.value) || 0)}
                          />
                          {item._netToAgentTotal != null && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-[#9CA6AD] whitespace-nowrap">
                              <span>Net to Agent {currency} {Number(item._netToAgentTotal).toLocaleString()} +</span>
                              <input
                                type="number"
                                className="w-12 h-5 border border-[#DDD8CC] px-1 text-xs text-[#172338] text-center focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={item.markupPct ?? 20}
                                onChange={(e) => updateVillaField(id, "markupPct", e.target.value)}
                                onBlur={(e) => {
                                  if (e.target.value === "" || isNaN(Number(e.target.value))) {
                                    updateVillaField(id, "markupPct", 20);
                                  }
                                }}
                              />
                              <span>% markup</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <Label className={fieldLabelClass}>Discount</Label>
                          <div className="mt-1.5 flex">
                            <NativeSelect
                              wrapperClassName="relative flex-shrink-0"
                              className="h-9 rounded-none border-r-0 pl-2 pr-6"
                              value={item.discountMode}
                              onChange={(e) => updateVillaField(id, "discountMode", e.target.value)}
                            >
                              <option value="percent">%</option>
                              <option value="fixed">{currency}</option>
                            </NativeSelect>
                            <Input
                              type="number"
                              className="h-9 flex-1 min-w-0 rounded-none border border-l-0 border-[#DDD8CC] bg-white px-3 font-haas text-sm text-[#172338] shadow-none focus-visible:border-[#D99330] focus-visible:ring-0"
                              value={item.discountMode === "fixed" ? item.discountFixedAmount : item.discountShare}
                              onChange={(e) =>
                                updateVillaField(
                                  id,
                                  item.discountMode === "fixed" ? "discountFixedAmount" : "discountShare",
                                  Number(e.target.value) || 0
                                )
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <Label className={fieldLabelClass}>Final price</Label>
                          <div className="mt-1.5 h-9 flex items-center border border-[#DDD8CC] px-3 text-base font-medium text-[#172338]">
                            {currency} {Number(item.finalPrice || 0).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleVillaExpanded(id)}
                        className={rowActionClass}
                      >
                        {expandedVillaIds.has(id) ? "Fewer options" : "More options (deposit, card text)"}
                      </button>

                      {expandedVillaIds.has(id) && (
                        <div className="space-y-4 pt-1 border-t border-[#DDD8CC]">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                              <Label className={fieldLabelClass}>Security deposit</Label>
                              <Input
                                type="number"
                                className={`${fieldInputClass}`}
                                value={item.securityDeposit}
                                onChange={(e) => updateVillaField(id, "securityDeposit", Number(e.target.value) || 0)}
                              />
                            </div>
                          </div>
                          <div>
                            <Label className={fieldLabelClass}>Bottom card text</Label>
                            <RichTextEditor
                              value={item.bottomCardText}
                              placeholder="e.g. Includes daily housekeeping"
                              onChange={(html) => updateVillaField(id, "bottomCardText", html)}
                              minHeight="2.5rem"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
                </>
              )}
            </section>

          <section className="border-t border-[#DDD8CC] pt-8 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="font-gtsuper-ds text-lg font-light text-[#172338]">Concierge packages</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="font-normal rounded-none"
                onClick={() => {
                  setActiveTab("concierge");
                  setStep("select");
                }}
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add more concierge packages
              </Button>
            </div>
            {conciergeItems.length === 0 && <p className="font-haas text-sm text-[#506A70]">No concierge packages yet.</p>}

            {conciergeItems.map((item) => (
              <div key={conciergeKey(item)} className="border border-[#DDD8CC] p-4 space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      item.mainImage || item.images?.[0]?.urlImage || item.images?.[0]?.url
                        ? resolveMediaUrl(item.mainImage || item.images?.[0]?.urlImage || item.images?.[0]?.url)
                        : CONCIERGE_PLACEHOLDER_IMAGE
                    }
                    alt=""
                    className="w-14 h-14 object-cover flex-shrink-0"
                  />
                  <p className="flex-1 min-w-[140px] text-sm font-medium text-[#172338]">{item.title || item.name}</p>
                  <div className="flex items-center gap-1.5">
                    <EyeOff className="h-4 w-4 text-[#9CA6AD]" />
                    <Switch
                      checked={item.hiddenFromClient}
                      onCheckedChange={(v) => updateConciergeField(item, "hiddenFromClient", v)}
                    />
                    <span className="text-xs text-[#506A70]">Hidden from client</span>
                  </div>
                  <UnderlineSelect
                    wrapperClassName="relative inline-block min-w-[7rem]"
                    className="text-xs"
                    value={item.blockId}
                    onChange={(e) => updateConciergeField(item, "blockId", e.target.value)}
                    aria-label={`Block for ${item.title || item.name || "concierge package"}`}
                  >
                    {blocks.map((b) => (
                      <option key={b.id} value={b.id}>{b.title}</option>
                    ))}
                  </UnderlineSelect>
                  <button type="button" onClick={() => duplicateConciergeItem(item)} className={rowActionClass}>
                    <Copy className="h-3.5 w-3.5 inline mr-1 -mt-0.5" /> Duplicate
                  </button>
                  <button type="button" onClick={() => removeConciergeItem(item)} className={rowDangerActionClass}>
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <Label className={fieldLabelClass}>From</Label>
                    <Input
                      type="date"
                      className={`${fieldInputClass}`}
                      value={item.dateFrom}
                      onChange={(e) => updateConciergeField(item, "dateFrom", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className={fieldLabelClass}>To</Label>
                    <Input
                      type="date"
                      className={`${fieldInputClass}`}
                      value={item.dateTo}
                      min={item.dateFrom || undefined}
                      onChange={(e) => updateConciergeField(item, "dateTo", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className={fieldLabelClass}>Days</Label>
                    <Input
                      type="number"
                      className={`${fieldInputClass}`}
                      value={item.days}
                      onChange={(e) => updateConciergeNumericField(item, "days", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className={fieldLabelClass}>Daily price</Label>
                    <Input
                      type="number"
                      className={`${fieldInputClass}`}
                      value={item.dailyPrice}
                      onChange={(e) => updateConciergeNumericField(item, "dailyPrice", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label className={fieldLabelClass}>Total ({currency} {Number(item.finalPrice || 0).toLocaleString()})</Label>
                  <RichTextEditor
                    value={item.totalHtml}
                    onChange={(html) => updateConciergeField(item, "totalHtml", html)}
                    minHeight="2.5rem"
                    placeholder="e.g. 1,200 or Price on request"
                  />
                </div>
                <div>
                  <Label className={fieldLabelClass}>Price note</Label>
                  <RichTextEditor
                    value={item.priceNoteHtml}
                    onChange={(html) => updateConciergeField(item, "priceNoteHtml", html)}
                    minHeight="2.5rem"
                    placeholder="e.g. Price on request, VAT included"
                  />
                </div>
                <div>
                  <Label className={fieldLabelClass}>Open text</Label>
                  <RichTextEditor
                    value={item.openText2Html}
                    onChange={(html) => updateConciergeField(item, "openText2Html", html)}
                    placeholder="Additional details for the client..."
                  />
                </div>
                <div>
                  <Label className={fieldLabelClass}>Policies (reservation &amp; cancellation)</Label>
                  <RichTextEditor
                    value={item.policiesHtml}
                    onChange={(html) => updateConciergeField(item, "policiesHtml", html)}
                    placeholder="Terms & conditions"
                  />
                </div>
              </div>
            ))}
          </section>

          <section className="border-t border-[#DDD8CC] pt-8 space-y-4">
            {missingOfferName && (
              <p className="font-haas text-sm text-[#506A70]">Add a reference code above before saving.</p>
            )}
            {saveError && <p className="font-haas text-sm text-red-600">{saveError}</p>}
            {autosaveError && (
              <p className="font-haas text-sm text-amber-600">Last autosave failed: {autosaveError} — save manually to be sure your changes are kept.</p>
            )}
            <div className="flex items-center gap-4 flex-wrap">
              <Button type="button" className="font-normal rounded-none" disabled={!canSave || saving} onClick={handleGetLink}>
                {saving ? "Getting link..." : "Get link to share"}
              </Button>
              <button type="button" disabled={!canSave || saving} onClick={() => saveOffer()} className={`${rowActionClass} disabled:opacity-40 disabled:pointer-events-none`}>
                {saving ? "Saving..." : "Save without sharing"}
              </button>
              {lastSavedAt && (
                <span className="font-haas text-xs text-[#9CA6AD]">
                  {autosaving ? "Autosaving..." : dirty ? "Unsaved changes" : `Saved at ${lastSavedAt.toLocaleTimeString()}`}
                </span>
              )}
            </div>
            {publicLink && (
              <div className="space-y-2">
                <p className="text-sm text-[#172338]">Public link:</p>
                <div className="flex items-center gap-2">
                  <Input className={`${fieldInputClass}`} value={publicLink} readOnly />
                  <Button type="button" className="font-normal rounded-none" onClick={handleCopyLink}>
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                  <Button type="button" variant="outline" className="font-normal rounded-none" asChild>
                    <a href={publicLink} target="_blank" rel="noreferrer">
                      Open
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </section>
        </main>
      )}
    </AgentPortfolioLayout>
  );
}
