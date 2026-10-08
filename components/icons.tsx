/** Line icons (stroke 1.5–1.8) from the design references. */
import type { SVGProps } from 'react';

type IconProps = { size?: number } & Omit<SVGProps<SVGSVGElement>, 'width' | 'height'>;

function Icon({ size = 20, strokeWidth = 1.6, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const WhatsappIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 20l1.4-4.2A8 8 0 1 1 8.4 18.7L4 20z" />
    <path d="M9 9.5c.4 2.2 2.3 4.1 4.5 4.5l1.2-1.2-1.6-1-.8.6c-.9-.3-1.7-1.1-2-2l.6-.8-1-1.6L9 9.5z" />
  </Icon>
);

export const ChatIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 20l1.4-4.2A8 8 0 1 1 8.4 18.7L4 20z" />
  </Icon>
);

export const InstagramIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="4" y="4" width="16" height="16" rx="5" />
    <circle cx="12" cy="12" r="3.6" />
    <circle cx="16.8" cy="7.2" r="0.6" />
  </Icon>
);

export const PinIcon = (p: IconProps) => (
  <Icon strokeWidth={1.5} {...p}>
    <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </Icon>
);

export const ClockIcon = (p: IconProps) => (
  <Icon strokeWidth={1.5} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Icon>
);

export const PhoneIcon = (p: IconProps) => (
  <Icon strokeWidth={1.5} {...p}>
    <path d="M6 3.5h3l1.5 4-2 1.3a10 10 0 0 0 5.7 5.7l1.3-2 4 1.5v3a2 2 0 0 1-2 2A14.5 14.5 0 0 1 4 5.5a2 2 0 0 1 2-2z" />
  </Icon>
);

export const MapIcon = (p: IconProps) => (
  <Icon strokeWidth={1.5} {...p}>
    <path d="M9 4.5L3.5 6.5v13L9 17.5l6 2 5.5-2v-13L15 6.5l-6-2z" />
    <path d="M9 4.5v13M15 6.5v13" />
  </Icon>
);

export const MenuIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
);

export const CloseIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
);

/** Points to the inline start/end; flips with the writing direction via CSS. */
export const ChevronIcon = ({ direction, ...p }: IconProps & { direction: 'up' | 'down' | 'left' | 'right' }) => {
  const d = { up: 'M6 15l6-6 6 6', down: 'M6 9l6 6 6-6', left: 'M15 6l-6 6 6 6', right: 'M9 6l6 6-6 6' }[direction];
  return (
    <Icon strokeWidth={1.8} {...p}>
      <path d={d} />
    </Icon>
  );
};

/**
 * Arrow drawn pointing left, the reading direction on Arabic pages; English
 * pages mirror it with CSS so it points right.
 */
export const ArrowIcon = (p: IconProps) => (
  <Icon strokeWidth={2} {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Icon>
);

/** Small filled four-point star used as a separator. */
export const StarIcon = ({ size = 10, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...p}>
    <path d="M12 0c1 6.6 5.4 11 12 12-6.6 1-11 5.4-12 12-1-6.6-5.4-11-12-12C6.6 11 11 6.6 12 0z" />
  </svg>
);

export const PauseIcon = (p: IconProps) => (
  <Icon strokeWidth={1.8} {...p}>
    <path d="M9 6v12M15 6v12" />
  </Icon>
);

export const PlayIcon = (p: IconProps) => (
  <Icon strokeWidth={1.6} {...p}>
    <path d="M8 5.5v13l10-6.5-10-6.5z" />
  </Icon>
);

export const HomeIcon = (p: IconProps) => (
  <Icon strokeWidth={1.5} {...p}>
    <path d="M4 10.5L12 4l8 6.5" />
    <path d="M6 9v10.5h12V9" />
    <path d="M10 19.5v-5h4v5" />
  </Icon>
);

/** A vanity mirror on a stand: the salon. */
export const SalonIcon = (p: IconProps) => (
  <Icon strokeWidth={1.5} {...p}>
    <ellipse cx="12" cy="9" rx="5.5" ry="6" />
    <path d="M12 15v4.5M8 20h8" />
    <path d="M9.5 7.5c.6-1 1.5-1.6 2.5-1.8" />
  </Icon>
);

export const SparkleIcon = (p: IconProps) => (
  <Icon strokeWidth={1.5} {...p}>
    <path d="M12 3.5l1.9 5.1L19 10.5l-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9L12 3.5z" />
    <path d="M18.5 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8z" />
  </Icon>
);

export const LockIcon = (p: IconProps) => (
  <Icon strokeWidth={1.5} {...p}>
    <rect x="5" y="10.5" width="14" height="9.5" rx="2.5" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    <path d="M12 14.5v2" />
  </Icon>
);

export const CheckIcon = (p: IconProps) => (
  <Icon strokeWidth={1.8} {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Icon>
);

export const PlusIcon = (p: IconProps) => (
  <Icon strokeWidth={1.8} {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

export const UploadIcon = (p: IconProps) => (
  <Icon strokeWidth={1.5} {...p}>
    <path d="M12 16V5M7.5 9.5L12 5l4.5 4.5M5 19h14" />
  </Icon>
);

export const GridIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="4" y="4" width="7" height="7" rx="1.5" />
    <rect x="13" y="4" width="7" height="7" rx="1.5" />
    <rect x="4" y="13" width="7" height="7" rx="1.5" />
    <rect x="13" y="13" width="7" height="7" rx="1.5" />
  </Icon>
);

export const SettingsIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
  </Icon>
);

export const VideoIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
    <path d="M10 9.5v5l4.5-2.5z" />
  </Icon>
);

export const ImageIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
    <circle cx="9" cy="10" r="1.6" />
    <path d="M4 17l5-4.5 3.5 3 3-2.5 4.5 4" />
  </Icon>
);

export const ListIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 7h14M5 12h14M5 17h9" />
  </Icon>
);

export const LogoutIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l-4-4 4-4M6 12h10" />
  </Icon>
);

export const ExternalIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
  </Icon>
);
