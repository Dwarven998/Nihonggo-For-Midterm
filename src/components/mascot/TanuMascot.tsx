import React, { useState } from 'react';

export type TanuPose =
  | 'idle'
  | 'happy'
  | 'explaining'
  | 'writing'
  | 'thinking'
  | 'encouraging'
  | 'success'
  | 'mistake'
  | 'celebration';

export type MascotSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface TanuMascotProps {
  pose?: TanuPose;
  size?: MascotSize | number;
  message?: React.ReactNode;
  japaneseTitle?: string;
  bubblePosition?: 'right' | 'top' | 'left' | 'bottom';
  alt?: string;
  className?: string;
  animated?: boolean;
  hideOnMobile?: boolean;
  onClick?: () => void;
}

const DEFAULT_ALT_TEXTS: Record<TanuPose, string> = {
  idle: 'Tanu the Tanuki sitting calmly and ready to study',
  happy: 'Tanu the Tanuki waving a friendly paw with sparkles',
  explaining: 'Tanu the Tanuki wearing a scholar cap and pointing to study material',
  writing: 'Tanu the Tanuki holding a calligraphy brush and a kana practice card',
  thinking: 'Tanu the Tanuki thoughtfully resting a paw on his chin pondering a question',
  encouraging: 'Tanu the Tanuki holding a heart offering warm encouragement',
  success: 'Tanu the Tanuki holding a red correct circle sign celebrating your answer',
  mistake: 'Tanu the Tanuki with a gentle sweatdrop offering a supportive retry',
  celebration: 'Tanu the Tanuki cheering with both paws raised surrounded by confetti',
};

const SIZE_MAP: Record<MascotSize, { px: number; containerClass: string }> = {
  xs: { px: 40, containerClass: 'w-10 h-10' },
  sm: { px: 64, containerClass: 'w-16 h-16' },
  md: { px: 96, containerClass: 'w-24 h-24' },
  lg: { px: 136, containerClass: 'w-32 h-32 sm:w-34 sm:h-34' },
  xl: { px: 180, containerClass: 'w-40 h-40 sm:w-44 sm:h-44' },
};

export const TanuMascot: React.FC<TanuMascotProps> = ({
  pose = 'idle',
  size = 'md',
  message,
  japaneseTitle,
  bubblePosition = 'right',
  alt,
  className = '',
  animated = true,
  hideOnMobile = false,
  onClick,
}) => {
  const [imageErrorLevel, setImageErrorLevel] = useState<number>(0);

  // Compute dimensions
  const isNamedSize = typeof size === 'string' && size in SIZE_MAP;
  const sizeConfig = isNamedSize ? SIZE_MAP[size as MascotSize] : { px: typeof size === 'number' ? size : 96, containerClass: '' };
  const customStyle = !isNamedSize && typeof size === 'number' ? { width: `${size}px`, height: `${size}px` } : undefined;

  // Primary URL is PNG, fallback 1 is SVG, fallback 2 is inline vector
  const imageSrc =
    imageErrorLevel === 0
      ? `/mascots/tanu/tanu_${pose}.png`
      : `/mascots/tanu/tanu_${pose}.svg`;

  const accessibleAlt = alt || DEFAULT_ALT_TEXTS[pose] || 'Tanu the Tanuki mascot';

  // Subdued CSS motion: subtle breathing/bobbing that respects prefers-reduced-motion
  const motionClass = animated
    ? 'transition-transform duration-300 hover:scale-105 motion-safe:animate-[pulse_4s_ease-in-out_infinite]'
    : '';

  const mobileVisibilityClass = hideOnMobile ? 'hidden sm:flex' : 'flex';

  return (
    <div
      className={`inline-flex items-center gap-3 select-none ${mobileVisibilityClass} ${
        bubblePosition === 'top' || bubblePosition === 'bottom' ? 'flex-col' : 'flex-row'
      } ${className}`}
      onClick={onClick}
    >
      {/* Speech Bubble (when positioned Top or Left) */}
      {message && (bubblePosition === 'top' || bubblePosition === 'left') && (
        <SpeechBubble message={message} japaneseTitle={japaneseTitle} position={bubblePosition} />
      )}

      {/* Mascot Image Container */}
      <div
        className={`relative shrink-0 flex items-center justify-center ${sizeConfig.containerClass} ${motionClass}`}
        style={customStyle}
      >
        {imageErrorLevel < 2 ? (
          <img
            src={imageSrc}
            alt={accessibleAlt}
            width={sizeConfig.px}
            height={sizeConfig.px}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain drop-shadow-xs pointer-events-none"
            onError={() => setImageErrorLevel((prev) => prev + 1)}
          />
        ) : (
          /* Graceful inline vector fallback if file paths are blocked or unavailable */
          <div
            className="w-full h-full rounded-2xl bg-amber-100/90 border border-amber-300/60 flex flex-col items-center justify-center text-amber-900 p-2 shadow-xs"
            role="img"
            aria-label={accessibleAlt}
          >
            <span className="text-xl">🍃</span>
            <span className="text-[10px] font-bold font-jp">たぬ</span>
          </div>
        )}
      </div>

      {/* Speech Bubble (when positioned Right or Bottom) */}
      {message && (bubblePosition === 'right' || bubblePosition === 'bottom') && (
        <SpeechBubble message={message} japaneseTitle={japaneseTitle} position={bubblePosition} />
      )}
    </div>
  );
};

interface SpeechBubbleProps {
  message: React.ReactNode;
  japaneseTitle?: string;
  position: 'right' | 'top' | 'left' | 'bottom';
}

const SpeechBubble: React.FC<SpeechBubbleProps> = ({ message, japaneseTitle, position }) => {
  return (
    <div
      className={`relative bg-white border border-stone-200/90 rounded-2xl p-3 sm:p-3.5 shadow-sm text-xs text-slate-700 max-w-xs sm:max-w-sm animate-in fade-in zoom-in-95 duration-200`}
    >
      {japaneseTitle && (
        <div className="text-[11px] font-bold text-rose-700 font-jp mb-1 flex items-center gap-1.5">
          <span>🍃</span>
          <span>{japaneseTitle}</span>
        </div>
      )}
      <div className="leading-relaxed">{message}</div>

      {/* Speech bubble pointy arrow */}
      {position === 'right' && (
        <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-white border-l border-b border-stone-200/90 rotate-45" />
      )}
      {position === 'left' && (
        <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white border-r border-t border-stone-200/90 rotate-45" />
      )}
      {position === 'bottom' && (
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t border-l border-stone-200/90 rotate-45" />
      )}
      {position === 'top' && (
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-stone-200/90 rotate-45" />
      )}
    </div>
  );
};
