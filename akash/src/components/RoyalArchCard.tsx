import React from 'react';

interface RoyalArchCardProps {
  id: string;
  title: string;
  image: string;
  subtitle?: string;
  onClick?: () => void;
  count?: number;
}

export function RoyalArchCard({ id, title, image, subtitle, onClick, count }: RoyalArchCardProps) {
  const clipId = `jharokha-clip-${id}`;
  const gradId = `jharokha-gold-${id}`;

  return (
    <button
      type="button"
      className="royal-arch-btn"
      onClick={onClick}
      aria-label={`Shop ${title}`}
    >
      <div className="royal-arch-visual">
        <svg
          viewBox="0 0 200 320"
          className="royal-arch-svg"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <defs>
            {/* Multi-stop Luxury Metallic Gold Gradient */}
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c5993d" />
              <stop offset="25%" stopColor="#faeeb3" />
              <stop offset="50%" stopColor="#bf8a2b" />
              <stop offset="78%" stopColor="#edd087" />
              <stop offset="100%" stopColor="#9b6818" />
            </linearGradient>

            {/* Traditional Indian Royal Ogee Arch Clip Path */}
            <clipPath id={clipId}>
              <path
                d="M 100 38
                   C 91 66, 68 88, 44 106
                   C 24 122, 10 146, 10 178
                   L 10 308
                   L 190 308
                   L 190 178
                   C 190 146, 176 122, 156 106
                   C 132 88, 109 66, 100 38 Z"
              />
            </clipPath>
          </defs>

          {/* Saree Image Clipped into Royal Arch */}
          <image
            href={image}
            x="10"
            y="38"
            width="180"
            height="270"
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${clipId})`}
            className="royal-arch-img"
          />

          {/* Subtle Royal Watermark / Monogram at Bottom Center */}
          <g className="royal-arch-monogram" opacity="0.65" transform="translate(100, 284)">
            <circle cx="0" cy="0" r="10" fill="rgba(24, 12, 10, 0.45)" />
            <text
              x="0"
              y="3.5"
              textAnchor="middle"
              fill="#f8e7b9"
              fontSize="8"
              fontFamily="var(--serif, Georgia, serif)"
              letterSpacing="0.05em"
              fontWeight="600"
            >
              AS
            </text>
          </g>

          {/* Gilded Metallic Arch Outline Border */}
          <path
            d="M 100 38
               C 91 66, 68 88, 44 106
               C 24 122, 10 146, 10 178
               L 10 308
               L 190 308
               L 190 178
               C 190 146, 176 122, 156 106
               C 132 88, 109 66, 100 38 Z"
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="3.2"
            strokeLinejoin="round"
            strokeLinecap="round"
            className="royal-arch-border"
          />

          {/* Royal Palace Pinnacle / Kalash Finial */}
          <g fill={`url(#${gradId})`} className="royal-arch-finial">
            {/* Sharp needle tip */}
            <polygon points="100,5 102.2,18 97.8,18" />
            {/* Golden globe / bead */}
            <circle cx="100" cy="20" r="2.8" />
            {/* Kalash body */}
            <path d="M 96.5 23 C 96.5 22, 103.5 22, 103.5 23 C 105.8 26, 105.8 29.5, 103.5 31 C 102 32.2, 98 32.2, 96.5 31 C 94.2 29.5, 94.2 26, 96.5 23 Z" />
            {/* Waist ring */}
            <rect x="95.5" y="32" width="9" height="2" rx="1" />
            {/* Stepped base pedestal touching arch apex */}
            <polygon points="93,37.5 107,37.5 100,34" />
          </g>
        </svg>
      </div>

      {/* Title & Metadata matching uploaded photo */}
      <div className="royal-arch-caption">
        <h3 className="royal-arch-heading">{title}</h3>
        {subtitle && <span className="royal-arch-sub">{subtitle}</span>}
        {typeof count === 'number' && <em className="royal-arch-count">{count} sarees</em>}
      </div>
    </button>
  );
}
