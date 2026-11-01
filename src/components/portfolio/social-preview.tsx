import type { CSSProperties } from 'react';
import { GLOBE_START, rotate, spherePoints } from './globe-math';

export interface SocialPreviewProps {
  name: string;
  role: string;
  description: string;
  location: string;
  site: string;
  portrait: string;
  /** Tools in the same order as the hero globe, with inlined icon images. */
  tools: { name: string; icon?: string }[];
  colors: {
    canvas: string;
    raised: string;
    text: string;
    muted: string;
    accent: string;
    focus: string;
  };
}

const STAGE = 540;
const TILE = 60;

/**
 * The homepage introduction (StudioHero) frozen into a 1200×630 share image:
 * gradient name, role, description and location on the left, and the 3D tool
 * globe around the portrait on the right, at the globe's starting angle.
 * Inline styles only, so the build can render it with Satori.
 */
export const SocialPreview = ({
  name,
  role,
  description,
  location,
  site,
  portrait,
  tools,
  colors,
}: SocialPreviewProps) => {
  const radius = STAGE * 0.42;
  const perspective = radius * 3.2;
  const items = spherePoints(tools.length)
    .map((point, index) => {
      const p = rotate(point, GLOBE_START.yaw, GLOBE_START.pitch);
      const scale = perspective / (perspective - p.z * radius);
      return {
        tool: tools[index],
        x: STAGE / 2 + p.x * radius * scale,
        y: STAGE / 2 + p.y * radius * scale,
        size: TILE * scale * 0.82,
        opacity: 0.22 + ((p.z + 1) / 2) * 0.78,
        z: p.z,
      };
    })
    .sort((a, b) => a.z - b.z);
  const portraitSize = STAGE * 0.4;
  // Keep the face clear: drop front tiles that would sit on the portrait.
  const clearOfFace = (item: (typeof items)[number]) =>
    Math.hypot(item.x - STAGE / 2, item.y - STAGE / 2) >
    portraitSize / 2 + item.size * 0.35;
  const tile = (item: (typeof items)[number]) => (
    <div
      key={item.tool.name}
      style={{
        position: 'absolute',
        left: item.x - item.size / 2,
        top: item.y - item.size / 2,
        width: item.size,
        height: item.size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: item.size * 0.15,
        borderRadius: item.size * 0.27,
        border: '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(29,29,31,0.92)',
        boxShadow: '0 10px 24px -8px rgba(0,0,0,0.7)',
        opacity: item.opacity,
        color: colors.muted,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {item.tool.icon ? (
        <img
          src={item.tool.icon}
          alt=''
          width={item.size * 0.7}
          height={item.size * 0.7}
          style={{ objectFit: 'contain' }}
        />
      ) : (
        item.tool.name.slice(0, 2)
      )}
    </div>
  );
  const column: CSSProperties = { display: 'flex', flexDirection: 'column' };
  return (
    <main
      style={{
        ...column,
        position: 'relative',
        width: 1200,
        height: 630,
        overflow: 'hidden',
        backgroundColor: colors.canvas,
        backgroundImage:
          'radial-gradient(circle 460px at 900px 315px, rgba(185,28,28,0.30), rgba(185,28,28,0.08) 55%, rgba(0,0,0,0))',
        color: colors.text,
        fontFamily: 'Inter',
      }}
    >
      <div
        style={{
          ...column,
          position: 'absolute',
          left: 72,
          top: 0,
          bottom: 0,
          width: 640,
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            marginBottom: 34,
          }}
        >
          RB.
        </div>
        <h1
          style={{
            ...column,
            margin: 0,
            fontSize: 112,
            fontWeight: 600,
            lineHeight: 0.98,
            letterSpacing: '-0.035em',
          }}
        >
          {name.split(' ').map((word) => (
            <span
              key={word}
              style={{
                backgroundImage:
                  'linear-gradient(180deg, #ffffff 30%, #b9b9bf)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                paddingBottom: 6,
              }}
            >
              {word}
            </span>
          ))}
        </h1>
        <p
          style={{
            margin: '22px 0 14px',
            fontSize: 36,
            fontWeight: 500,
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
          }}
        >
          {role}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 22,
            lineHeight: 1.45,
            maxWidth: 600,
            textWrap: 'balance',
            color: colors.muted,
          }}
        >
          {description}
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: 30,
            fontSize: 18,
            color: colors.muted,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              marginRight: 12,
              borderRadius: 4,
              background: colors.focus,
              boxShadow: `0 0 12px ${colors.focus}`,
            }}
          />
          <span>{location}</span>
          <span
            style={{
              marginLeft: 22,
              padding: '6px 16px',
              borderRadius: 999,
              background: colors.accent,
              color: colors.text,
              fontWeight: 500,
            }}
          >
            {site}
          </span>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          left: 1200 - STAGE - 26,
          top: (630 - STAGE) / 2,
          width: STAGE,
          height: STAGE,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: STAGE * 0.08,
            top: STAGE * 0.08,
            width: STAGE * 0.84,
            height: STAGE * 0.84,
            borderRadius: STAGE,
            border: '1px solid rgba(255,255,255,0.07)',
            backgroundImage:
              'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.03), rgba(0,0,0,0) 65%)',
          }}
        />
        {items.filter((item) => item.z <= 0).map(tile)}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            left: (STAGE - portraitSize) / 2,
            top: (STAGE - portraitSize) / 2,
            width: portraitSize,
            height: portraitSize,
            borderRadius: portraitSize,
            overflow: 'hidden',
            background: colors.raised,
            border: '1px solid rgba(255,255,255,0.22)',
            boxShadow:
              '0 0 0 10px rgba(0,0,0,0.4), 0 0 80px rgba(185,28,28,0.25)',
          }}
        >
          <img
            src={portrait}
            alt={name}
            width={portraitSize}
            height={portraitSize}
            style={{ objectFit: 'cover', objectPosition: '50% 32%' }}
          />
        </div>
        {items.filter((item) => item.z > 0 && clearOfFace(item)).map(tile)}
      </div>
    </main>
  );
};
