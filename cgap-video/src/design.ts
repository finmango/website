/**
 * FinMango editorial design system (matches finmango.org).
 */
export const PAPER = '#FAF7F2';
export const INK = '#1A1A1A';
export const ORANGE = '#FF6B35';
export const HAIRLINE = 'rgba(26, 26, 26, 0.6)';

export const SANS = "'DM Sans', sans-serif";
export const MONO = "'JetBrains Mono', monospace";

/** mono label style: uppercase, letterspaced */
export const monoLabel = (size = 16): React.CSSProperties => ({
  fontFamily: MONO,
  fontSize: size,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.14em',
  color: INK,
});

export const hairline = (width: number | string = '100%'): React.CSSProperties => ({
  width,
  height: 1,
  background: HAIRLINE,
});
