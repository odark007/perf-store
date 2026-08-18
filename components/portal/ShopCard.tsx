'use client';

import { useRef, type ReactNode } from 'react';
import Link from 'next/link';

/* ---------------------------------------------------------
   Shop card with 3D tilt-on-hover (desktop pointer only).
   Ported from: jara landingpage/files/script.js (data-tilt)
--------------------------------------------------------- */
export default function ShopCard({
  href,
  accent,
  icon,
  name,
  tagline,
  description,
}: {
  href: string;
  accent: 'gold' | 'purple';
  icon: ReactNode;
  name: string;
  tagline: string;
  description: string;
}) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const boundsRef = useRef<DOMRect | null>(null);

  const handleEnter = () => {
    const card = cardRef.current;
    if (!card || window.matchMedia('(hover: none)').matches) return;
    boundsRef.current = card.getBoundingClientRect();
    card.style.transition = 'box-shadow 0.3s ease';
  };

  const handleMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card || window.matchMedia('(hover: none)').matches) return;
    const bounds = boundsRef.current ?? card.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;
    const px = x / bounds.width - 0.5;
    const py = y / bounds.height - 0.5;

    card.style.transform = `perspective(900px) rotateX(${(-py * 8).toFixed(2)}deg) rotateY(${(px * 10).toFixed(2)}deg) translateY(-4px)`;

    const glow = glowRef.current;
    if (glow) {
      glow.style.left = `${x - 110}px`;
      glow.style.top = `${y - 110}px`;
      glow.style.right = 'auto';
    }
  };

  const handleLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease';
    card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)';
  };

  const isGold = accent === 'gold';

  return (
    <Link
      ref={cardRef}
      href={href}
      aria-label={`Visit ${name}`}
      onMouseEnter={handleEnter}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="relative block no-underline bg-white rounded-[28px] px-[30px] pt-[30px] pb-7 border border-[#211A2E]/[0.06] shadow-[0_20px_45px_-28px_rgba(33,26,46,0.35)] hover:shadow-[0_28px_55px_-25px_rgba(33,26,46,0.4)] overflow-hidden will-change-transform transition-[box-shadow] duration-300 max-[520px]:px-[22px] max-[520px]:py-6"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Glow blob that follows the cursor */}
      <div
        ref={glowRef}
        className={`absolute w-[220px] h-[220px] rounded-full blur-[50px] -top-20 -right-20 opacity-35 hover:opacity-55 pointer-events-none transition-opacity duration-300 ${
          isGold ? 'bg-[#FFB627]' : 'bg-[#6C4FD6]'
        }`}
      />

      <div className="relative flex items-center justify-between mb-[22px]">
        <div
          className={`w-[46px] h-[46px] rounded-[13px] flex items-center justify-center ${
            isGold ? 'bg-[#FFB627]/[0.16] text-[#C9871A]' : 'bg-[#6C4FD6]/[0.14] text-[#6C4FD6]'
          }`}
        >
          {icon}
        </div>
        <span className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.06em] text-[#0E8074]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0E8074] animate-[portal-pulse_2s_infinite]" />
          Open
        </span>
      </div>

      <h3 className="relative font-portal-display font-bold text-2xl text-[#211A2E] mb-1.5">{name}</h3>
      <p
        className={`relative text-[12.5px] font-bold uppercase tracking-[0.05em] mb-3.5 ${
          isGold ? 'text-[#C9871A]' : 'text-[#6C4FD6]'
        }`}
      >
        {tagline}
      </p>
      <p className="relative text-[15px] leading-relaxed text-[#5B5468] mb-6 max-w-[40ch]">{description}</p>

      <span className="relative inline-flex items-center gap-2 font-bold text-[14.5px] text-[#0E8074] group">
        Visit {name}
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          className="transition-transform duration-[250ms] group-hover:translate-x-1"
        >
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </Link>
  );
}
