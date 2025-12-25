import React, { memo, useCallback, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Calendar, Check, Plus, Sparkles, Users, UserPlus } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useSubscription } from "@/hooks/useSubscriptionGraph";
import { useRouter } from "next/navigation";
import ActionButton from "@/components/ui/ActionButton/ActionButton";
import { THEME_CONFIG } from "@/app/(main)/graphs/GraphView/WaterGraph3D/constants";
import { AnimatePresence, motion } from "framer-motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { colorsRGB } from "@/constants/colors";

const BASE_S3_URL = process.env.NEXT_PUBLIC_S3_URL;

interface GroupBlockProps {
  id: string;
  name: string;
  isSubToGraph: boolean;
  imgPath?: string;
  about?: string;
  subscribersCount?: number;
  specializations?: Array<{ key: string; label: string }>;
  handleScheduleButtonClick: () => void;
  layout?: 'vertical' | 'horizontal';
}

const GroupBlock: React.FC<GroupBlockProps> = memo(({ 
  id, 
  name, 
  isSubToGraph, 
  imgPath, 
  about,
  subscribersCount,
  specializations,
  handleScheduleButtonClick,
  layout = 'vertical',
}) => {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const { isSubscribed, toggleSubscription, isLoading } = useSubscription(isSubToGraph, id);

  const fullImageUrl = imgPath ? `${BASE_S3_URL}/${imgPath}` : "";
  const displayName = name || "Untitled";

  const LABEL_MAP: Record<string, string> = {
    "Наука": "Science",
    "Самоуправление": "Student Gov",
    "Творчество": "Creativity",
    "Спорт": "Sports",
    "Волонтерство": "Volunteering",
    "Волонтёрство": "Volunteering",
    "Медиа": "Media",
    "Отряды": "Teams",
    "Литература": "Literature",
    "Трудоустройство": "Careers",
    "Военно-патриотизм": "Patriotic",
  };

  const themeRgb = useMemo(() => {
    // Берём первую специализацию как "тематику" (обычно это parentGraphId.name)
    const theme = specializations?.[0]?.label ?? "";
    switch (theme) {
      case "Наука":
        return colorsRGB.status.info; // blue
      case "Самоуправление":
        return colorsRGB.primary.DEFAULT; // purple
      case "Творчество":
        return colorsRGB.secondary.accentPink; // pink
      case "Спорт":
        return colorsRGB.status.warning; // yellow
      case "Волонтерство":
      case "Волонтёрство":
        return colorsRGB.status.success; // green
      case "Медиа":
        return colorsRGB.secondary.accentPink; // pink
      case "Отряды":
        return colorsRGB.primary.hover; // deeper purple
      case "Литература":
        return colorsRGB.primary.DEFAULT;
      case "Трудоустройство":
        return colorsRGB.status.info;
      case "Военно-патриотизм":
        return colorsRGB.primary.hover;
      default:
        return colorsRGB.primary.DEFAULT;
    }
  }, [specializations]);

  const formatFollowers = useCallback((n: number) => {
    const abs = Math.max(0, n || 0);
    if (abs >= 1_000_000) return `${(abs / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `${(abs / 1_000).toFixed(1)}k`;
    return `${abs}`;
  }, []);

  const resolvedUserAvatar = useMemo(() => {
    const raw = (user as any)?.avaPath as string | undefined;
    if (!raw) return "";
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    const base = process.env.NEXT_PUBLIC_S3_URL || process.env.NEXT_PUBLIC_API_URL || "";
    if (!base) return raw;
    return `${base.replace(/\/+$/, "")}/${raw.replace(/^\/+/, "")}`;
  }, [user]);

  const joinBtnRef = useRef<HTMLButtonElement>(null);
  const followersRef = useRef<HTMLDivElement>(null);
  const flyKey = useRef(0);
  const [fly, setFly] = useState<null | { key: number; fromX: number; fromY: number; toX: number; toY: number }>(null);

  const startFlyToFollowers = useCallback(() => {
    if (!joinBtnRef.current || !followersRef.current) return;
    const from = joinBtnRef.current.getBoundingClientRect();
    const to = followersRef.current.getBoundingClientRect();
    flyKey.current += 1;
    setFly({
      key: flyKey.current,
      fromX: from.left + from.width * 0.2,
      fromY: from.top + from.height * 0.5,
      toX: to.left + to.width * 0.85,
      toY: to.top + to.height * 0.5,
    });
  }, []);

  const handleJoin = useCallback(() => {
    if (!isLoggedIn) {
      router.push("/signIn");
      return;
    }
    // "fly" only when joining (not when already subscribed)
    if (!isSubscribed) startFlyToFollowers();
    toggleSubscription();
  }, [isLoggedIn, isSubscribed, router, startFlyToFollowers, toggleSubscription]);

  const handleCardClick = () => {
    router.push(`/groups/${id}`);
  };

  const specItems = useMemo(() => {
    const items = (specializations || []).slice(0, 4);
    return items.map((s) => {
      const icon = (THEME_CONFIG as any)?.[s.label] ?? (THEME_CONFIG as any)?.[s.key] ?? null;
      const translated = LABEL_MAP[s.label] ?? s.label;
      return { ...s, icon, translated };
    });
  }, [specializations]);

  // optimistic local display: if initial was not subscribed but now isSubscribed -> +1; vice versa -> -1
  const baseFollowers = typeof subscribersCount === "number" ? subscribersCount : 0;
  const displayedFollowers =
    baseFollowers + (isSubscribed && !isSubToGraph ? 1 : 0) - (!isSubscribed && isSubToGraph ? 1 : 0);
  const followersLabel = `${formatFollowers(displayedFollowers)} Followers`;

  const isMobile = useMediaQuery("(max-width: 768px)");
  const isWide = layout === "horizontal" && !isMobile;

  return (
    <div className="relative">
      {/* Fly avatar -> Followers badge */}
      <AnimatePresence>
        {fly && (
          <motion.div
            key={fly.key}
            className="fixed z-[9999] h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden border border-[var(--color-neutral-border)] bg-[var(--color-neutral-card)] pointer-events-none"
            style={{ left: fly.fromX, top: fly.fromY }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: [0, (fly.toX - fly.fromX) * 0.55, fly.toX - fly.fromX],
              y: [0, -22, fly.toY - fly.fromY],
              opacity: [1, 1, 0],
              scale: [1, 0.95, 0.85],
            }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            onAnimationComplete={() => setFly(null)}
          >
            {resolvedUserAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={resolvedUserAvatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs font-bold text-[rgb(var(--main-Color))]">
                {(user?.username || user?.firstName || "ME").charAt(0).toUpperCase()}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleCardClick();
      }}
      aria-label={`Open group: ${displayName}`}
      style={{ ["--theme-rgb" as any]: themeRgb } as React.CSSProperties}
      className={[
        "w-full rounded-2xl",
        "bg-[rgba(var(--theme-rgb),0.06)]",
        "text-[var(--color-text-primary)]",
        "transition-colors duration-200",
        "hover:bg-[rgba(var(--theme-rgb),0.10)]",
      ].join(" ")}
    >
      <div className={isWide ? "flex gap-6 p-6" : "flex flex-col gap-5 p-4 sm:p-6"}>
        {/* Cover */}
        <div className={isWide ? "w-[156px] flex-shrink-0" : ""}>
          <div className="relative overflow-hidden rounded-2xl bg-[rgba(var(--theme-rgb),0.14)]">
            {fullImageUrl ? (
              <Image
                src={fullImageUrl}
                alt={displayName}
                width={400}
                height={240}
                className={isWide ? "h-[156px] w-[156px] object-cover" : "h-[180px] w-full object-cover"}
                loading="lazy"
              />
            ) : (
              <div className={isWide ? "h-[156px] w-[156px]" : "h-[180px] w-full"}>
                <div className="h-full w-full flex items-center justify-center text-[var(--color-text-muted)]">
                  <Sparkles size={18} />
                </div>
              </div>
            )}

            {/* Followers badge */}
            <div
              ref={followersRef}
              className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-[rgba(var(--theme-rgb),0.14)] px-3 py-1 text-xs font-semibold text-[rgb(var(--theme-rgb))]"
            >
              <Users size={14} className="text-[rgb(var(--theme-rgb))]" />
              <span>{followersLabel}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-[16px] font-semibold tracking-[-0.01em]">
                {displayName}
              </h3>

              {/* Simple pills */}
              {specItems.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {specItems.map((s) => (
                    <div
                      key={s.key}
                      className="inline-flex items-center gap-2 rounded-full bg-[rgba(var(--theme-rgb),0.10)] px-3 py-1 text-xs font-semibold text-[var(--color-text-primary)]"
                    >
                      <span className="text-[12px] leading-none">{s.icon ?? "•"}</span>
                      <span className="truncate">{(s as any).translated ?? s.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Subscribers count + "your slot" */}
            <div className="flex items-center gap-2">
              <div
                className="h-7 min-w-[44px] px-2 rounded-full bg-[rgba(var(--theme-rgb),0.10)] flex items-center justify-center text-[11px] font-bold text-[var(--color-text-secondary)]"
                aria-label={`${displayedFollowers} followers`}
                title={`${displayedFollowers} followers`}
              >
                {formatFollowers(displayedFollowers)}
              </div>
              <div className="h-7 w-7 rounded-full bg-[rgba(var(--theme-rgb),0.14)] flex items-center justify-center">
                {isSubscribed && resolvedUserAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={resolvedUserAvatar} alt="" className="h-full w-full rounded-full object-cover" />
                ) : (
                  <Plus size={14} className="text-[rgb(var(--theme-rgb))]" />
                )}
              </div>
            </div>
          </div>

          <p className="mt-3 text-sm text-[var(--color-text-secondary)]/90 leading-relaxed">
            {about || "No description"}
          </p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              ref={joinBtnRef}
              onClick={(e) => {
                e.stopPropagation();
                handleJoin();
              }}
              // Разрешаем повторный клик -> отписка
              disabled={isLoading}
              className={[
                "w-full rounded-2xl px-3 py-2",
                "bg-[rgba(var(--theme-rgb),0.14)]",
                "text-xs font-semibold text-[rgb(var(--theme-rgb))]",
                "disabled:opacity-60 disabled:cursor-not-allowed",
              ].join(" ")}
            >
              <span className="inline-flex items-center justify-center gap-2">
                {isSubscribed ? <Check size={14} /> : <UserPlus size={14} />}
                <span>{isSubscribed ? "Following" : "Join"}</span>
              </span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleScheduleButtonClick();
              }}
              className={[
                "w-full rounded-2xl px-3 py-2",
                "bg-[rgba(var(--text-color),0.06)]",
                "text-xs font-semibold text-[var(--color-text-primary)]",
              ].join(" ")}
            >
              <span className="inline-flex items-center justify-center gap-2">
                <Calendar size={14} />
                Schedule
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
});

GroupBlock.displayName = 'GroupBlock';

export default GroupBlock;
