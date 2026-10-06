import type { CSSProperties } from 'react';

export interface SocialPreviewProps {
  name: string;
  role: string;
  description: string;
  portrait: string;
  colors: { canvas: string; text: string; muted: string };
}

/** The same introduction content as StudioHero, composed for a share image. */
export const SocialPreview = ({
  name,
  role,
  description,
  portrait,
  colors,
}: SocialPreviewProps) => {
  const column: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };
  return (
    <main
      style={{
        ...column,
        width: 1200,
        height: 630,
        background: colors.canvas,
        color: colors.text,
        fontFamily: 'Inter',
        padding: 40,
        justifyContent: 'center',
        gap: 28,
      }}
    >
      <img
        src={portrait}
        alt={name}
        width={152}
        height={152}
        style={{
          width: 152,
          height: 152,
          flexShrink: 0,
          borderRadius: 76,
          objectFit: 'cover',
        }}
      />
      <div style={{ ...column, maxWidth: 900, textAlign: 'center' }}>
        <h1
          style={{
            margin: 0,
            fontSize: 76,
            fontWeight: 600,
            lineHeight: 1.04,
            letterSpacing: '-0.022em',
          }}
        >
          {name}
        </h1>
        <p style={{ margin: '18px 0 20px', fontSize: 30, lineHeight: 1.2 }}>
          {role}
        </p>
        <p
          style={{
            margin: 0,
            maxWidth: 820,
            fontSize: 22,
            lineHeight: 1.5,
            color: colors.muted,
          }}
        >
          {description}
        </p>
      </div>
    </main>
  );
};
