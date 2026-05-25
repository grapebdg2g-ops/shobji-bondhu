import { useState, type ReactNode } from "react";
import { MapPin, User as UserIcon, Clock, Sprout, Leaf, Wrench, HardHat, Phone } from "lucide-react";
import type { Exchange, ExchangeType } from "@/hooks/use-exchanges";

const TYPE_META: Record<ExchangeType, { label: string; icon: typeof Sprout; tint: string }> = {
  seed: { label: "বীজ", icon: Sprout, tint: "bg-emerald-100 text-emerald-700" },
  sapling: { label: "চারা", icon: Leaf, tint: "bg-lime-100 text-lime-700" },
  tool: { label: "যন্ত্রপাতি", icon: Wrench, tint: "bg-amber-100 text-amber-700" },
  labor: { label: "শ্রমিক", icon: HardHat, tint: "bg-blue-100 text-blue-700" },
};

function timeAgoBn(iso: string) {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return "এইমাত্র";
  if (m < 60) return `${m} মিনিট আগে`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ঘণ্টা আগে`;
  const d = Math.floor(h / 24);
  return `${d} দিন আগে`;
}

function toWaLink(phone?: string | null) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  const intl = digits.startsWith("880") ? digits : digits.startsWith("0") ? `880${digits.slice(1)}` : `880${digits}`;
  return `https://wa.me/${intl}`;
}

function CardRoot({ children }: { children: ReactNode }) {
  return (
    <article className="bg-card border border-border rounded-2xl p-3 shadow-sm">
      <div className="flex gap-3">{children}</div>
    </article>
  );
}

function CardImage({ src, type }: { src?: string | null; type: ExchangeType }) {
  const [loaded, setLoaded] = useState(false);
  const meta = TYPE_META[type];
  const Icon = meta.icon;
  return (
    <div className={`h-20 w-20 shrink-0 rounded-xl overflow-hidden flex items-center justify-center ${meta.tint}`}>
      {src ? (
        <>
          {!loaded && <Icon className="h-8 w-8 opacity-60" />}
          <img
            src={src}
            alt=""
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            className={`h-full w-full object-cover ${loaded ? "block" : "hidden"}`}
          />
        </>
      ) : (
        <Icon className="h-9 w-9" strokeWidth={2.2} />
      )}
    </div>
  );
}

function CardBody({ item }: { item: Exchange }) {
  const meta = TYPE_META[(item.type as ExchangeType) ?? "seed"] ?? TYPE_META.seed;
  const wa = toWaLink(item.user_phone);
  return (
    <div className="flex-1 min-w-0">
      <h3 className="text-base font-bold text-foreground leading-snug line-clamp-2">{item.title}</h3>
      <div className="mt-1 flex items-center gap-2 flex-wrap">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${meta.tint}`}>{meta.label}</span>
        {item.is_free ? (
          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#52B788] text-white">বিনামূল্যে</span>
        ) : (
          <span className="text-base font-bold text-primary">
            ৳{item.price ?? 0}
            {item.unit ? <span className="text-xs text-muted-foreground font-medium">/{item.unit}</span> : null}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
        <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{item.district}</span>
        <span className="inline-flex items-center gap-1"><UserIcon className="h-3 w-3" />{item.user_name || "কৃষক"}</span>
        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgoBn(item.created_at)}</span>
      </div>
      <div className="mt-2 flex justify-end">
        {wa ? (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-[#0E8B8B] text-white text-sm font-bold px-3 py-1.5 rounded-lg active:scale-95"
          >
            <Phone className="h-3.5 w-3.5" /> যোগাযোগ করুন
          </a>
        ) : (
          <span className="text-[11px] text-muted-foreground">নম্বর নেই</span>
        )}
      </div>
    </div>
  );
}

export const ExchangeCard = Object.assign(
  ({ item }: { item: Exchange }) => (
    <CardRoot>
      <CardImage src={item.image_url} type={(item.type as ExchangeType) ?? "seed"} />
      <CardBody item={item} />
    </CardRoot>
  ),
  { Root: CardRoot, Image: CardImage, Body: CardBody, TYPE_META },
);