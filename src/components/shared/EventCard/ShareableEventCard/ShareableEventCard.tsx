'use client';

import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

type ShareableEventCardProps = {
  eventName: string;
  eventDescription?: string;
  eventUrl: string;
  theme: {
    primary: string; // hex
    secondary: string; // hex
    accent?: string; // hex
  };
  user: {
    name: string;
    avatarUrl?: string;
  };
  watermark?: string;
  variant?: 'preview' | 'capture';
  logoSrc?: string;
};

export const ShareableEventCard = forwardRef<HTMLDivElement, ShareableEventCardProps>(
  (
    {
      eventName,
      eventDescription,
      eventUrl,
      theme,
      user,
      watermark = 'Powered by GraphON',
      variant = 'preview',
      logoSrc = '/logo_darkMode.svg',
    },
    ref
  ) => {
    const meshBg = useMemo(() => {
      const accent = theme.accent ?? '#FFFFFF';
      return {
        // Непрозрачная база, чтобы в PNG не было "белой рамки" по краям
        backgroundColor: theme.secondary,
        backgroundImage: `
          radial-gradient(120% 120% at 20% 15%, ${theme.primary}55 0%, transparent 55%),
          radial-gradient(110% 110% at 80% 25%, ${theme.secondary}55 0%, transparent 52%),
          radial-gradient(120% 120% at 55% 85%, ${accent}22 0%, transparent 50%),
          linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)
        `,
      } as React.CSSProperties;
    }, [theme]);

    const isCapture = variant === 'capture';
    const glassClass = isCapture
      ? 'border border-white/20 bg-white/10' // без blur для стабильного экспорта
      : 'border border-white/20 backdrop-blur-xl bg-white/10';

    const avatarCandidates = useMemo(() => {
      const raw = user.avatarUrl?.trim();
      if (!raw) return [];

      // If already absolute, use as-is first
      if (/^https?:\/\//i.test(raw)) return [raw];

      const out: string[] = [raw];

      // Try origin + absolute path
      if (typeof window !== 'undefined' && raw.startsWith('/')) {
        out.push(`${window.location.origin}${raw}`);
      }

      // Try known base URLs used across the app
      const s3 = process.env.NEXT_PUBLIC_S3_URL;
      const api = process.env.NEXT_PUBLIC_API_URL;
      const normalizedPath = raw.replace(/^\/+/, '');

      if (s3) out.push(`${s3.replace(/\/+$/, '')}/${normalizedPath}`);
      if (api) out.push(`${api.replace(/\/+$/, '')}/${normalizedPath}`);

      // De-dupe
      return Array.from(new Set(out));
    }, [user.avatarUrl]);

    const [avatarIdx, setAvatarIdx] = useState(0);
    const [avatarFailed, setAvatarFailed] = useState(false);

    useEffect(() => {
      setAvatarIdx(0);
      setAvatarFailed(false);
    }, [avatarCandidates.join('|')]);

    const resolvedAvatarUrl = avatarCandidates[avatarIdx];

    return (
      <div
        ref={ref}
        className={`relative w-[400px] h-[711px] overflow-hidden text-white ${isCapture ? 'rounded-none' : 'rounded-[28px]'}`}
        style={meshBg}
      >
        {/* GraphON logo */}
        <div className="absolute top-6 left-6 z-20">
          <div className={`${glassClass} rounded-2xl px-3 py-2`}>
            <img src={logoSrc} alt="GraphON" className="h-6 w-auto opacity-95" />
          </div>
        </div>

        {/* Floating Orbs */}
        <motion.div
          className="absolute -top-24 -left-24 w-72 h-72 rounded-full opacity-40"
          style={{ background: theme.primary, filter: 'blur(40px)' }}
          animate={{ x: [0, 30, -10, 0], y: [0, 20, 10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-28 -right-28 w-80 h-80 rounded-full opacity-35"
          style={{ background: theme.secondary, filter: 'blur(48px)' }}
          animate={{ x: [0, -20, 10, 0], y: [0, -25, 12, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full opacity-25"
          style={{ background: theme.accent ?? '#EE82C8', filter: 'blur(52px)' }}
          animate={{ scale: [1, 1.08, 1], rotate: [0, 8, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Content */}
        {/* Важно: отступ сверху увеличен, чтобы заголовок всегда был ниже логотипа и не перекрывался */}
        <div className="relative z-10 h-full w-full px-7 pt-24 pb-8 flex flex-col">
          <div>
            <h1 className="text-[34px] leading-[1.05] font-semibold tracking-[-0.02em]">
              {eventName}
            </h1>
            {eventDescription ? (
              <p className="mt-3 text-white/85 text-[14px] leading-[1.5]">
                {eventDescription.length > 180 ? `${eventDescription.slice(0, 180).trim()}…` : eventDescription}
              </p>
            ) : (
              <p className="mt-3 text-white/85 text-[14px] leading-[1.4]">
                Присоединяйся — отсканируй QR или открой ссылку
              </p>
            )}
          </div>

          {/* Center QR */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className={`relative rounded-[26px] ${glassClass} p-5`}>
              <div
                className={`rounded-[22px] ${glassClass} flex items-center justify-center`}
                style={{ background: '#FFFFFF' }}
              >
                <QRCodeSVG value={eventUrl} width={220} height={220} bgColor="#FFFFFF" fgColor="#2B2A33" />
              </div>
              <div className="mt-3 text-[12px] text-white/85 font-medium text-center">
                Сканируй, чтобы открыть
              </div>
            </div>
          </div>

          {/* Bottom inviter */}
          <div className={`rounded-2xl ${glassClass} px-4 py-3`}>
            <div className="flex items-center gap-3">
              <div className={`h-11 w-11 rounded-full overflow-hidden ${glassClass} flex items-center justify-center`}>
                {/* В capture-режиме отключаем внешние изображения (CORS часто ломает html-to-image) */}
                {!isCapture && resolvedAvatarUrl && !avatarFailed ? (
                  <img
                    src={resolvedAvatarUrl}
                    alt={user.name}
                    className="h-full w-full object-cover"
                    onError={() => {
                      if (avatarIdx < avatarCandidates.length - 1) {
                        setAvatarIdx((i) => i + 1);
                      } else {
                        setAvatarFailed(true);
                      }
                    }}
                  />
                ) : (
                  <div className="text-[14px] font-semibold text-white/90">
                    {(user.name || 'П').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-[12px] text-white/80 font-medium">Приглашает</div>
                <div className="text-[16px] font-semibold truncate">{user.name}</div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center text-[11px] text-white/70">
            {watermark === 'Powered by GraphON' ? 'Сделано в GraphON' : watermark}
          </div>
        </div>
      </div>
    );
  }
);

ShareableEventCard.displayName = 'ShareableEventCard';


