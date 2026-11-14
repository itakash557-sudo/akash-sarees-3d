const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const Svg = ({ children, size = 20, vb = '0 0 24 24' }: any) => <svg width={size} height={size} viewBox={vb} {...S} aria-hidden="true">{children}</svg>;
export const IconSearch = (p: any) => <Svg {...p}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></Svg>;
export const IconHeart = ({ filled, ...p }: any) => <Svg {...p}><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z" fill={filled ? 'currentColor' : 'none'} /></Svg>;
export const IconUser = (p: any) => <Svg {...p}><circle cx="12" cy="8" r="3.6" /><path d="M4.5 20c.8-4 3.8-6 7.5-6s6.7 2 7.5 6" /></Svg>;
export const IconBag = (p: any) => <Svg {...p}><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></Svg>;
export const IconMenu = (p: any) => <Svg {...p}><path d="M4 8h16M4 16h16" /></Svg>;
export const IconClose = (p: any) => <Svg {...p}><path d="m6 6 12 12M18 6 6 18" /></Svg>;
export const IconArrow = (p: any) => <Svg {...p}><path d="M4 12h16M14 6l6 6-6 6" /></Svg>;
export const IconLeft = (p: any) => <Svg {...p}><path d="M15 5l-7 7 7 7" /></Svg>;
export const IconRight = (p: any) => <Svg {...p}><path d="m9 5 7 7-7 7" /></Svg>;
export const IconPlay = (p: any) => <Svg {...p}><path d="M8 5.5v13l11-6.5z" fill="currentColor" /></Svg>;
export const IconPlus = (p: any) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>;
export const IconMinus = (p: any) => <Svg {...p}><path d="M5 12h14" /></Svg>;
export const IconEye = (p: any) => <Svg {...p}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="2.8" /></Svg>;
export const IconWhatsApp = ({ size = 20, className = '' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M19.05 4.91A10.02 10.02 0 0 0 12.04 2c-5.52 0-10 4.48-10 10 0 1.77.46 3.49 1.34 5.01L2 22l5.16-1.35c1.47.8 3.12 1.23 4.88 1.23h.01c5.51 0 10-4.48 10-10 0-2.67-1.04-5.18-3-6.97zM12.05 20.15h-.01a8.3 8.3 0 0 1-4.24-1.16l-.3-.18-3.15.83.84-3.07-.2-.31a8.33 8.33 0 0 1-1.28-4.42c0-4.59 3.74-8.33 8.34-8.33 2.23 0 4.32.87 5.89 2.44a8.27 8.27 0 0 1 2.44 5.89c0 4.6-3.74 8.31-8.33 8.31zm4.57-6.23c-.25-.13-1.48-.73-1.71-.81-.23-.08-.4-.12-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.22.89 2.4 1.02 2.57.12.17 1.76 2.68 4.26 3.76.6.26 1.06.41 1.42.53.6.19 1.14.16 1.57.1.48-.07 1.48-.6 1.69-1.19.21-.58.21-1.08.15-1.19-.06-.11-.23-.17-.48-.3z" />
  </svg>
);
export const IconPhone = (p: any) => (
  <svg width={p.size || 20} height={p.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
export const IconCheck = (p: any) => (
  <svg width={p.size || 16} height={p.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
export const IconDownload = (p: any) => (
  <svg width={p.size || 16} height={p.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
