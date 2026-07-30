import React from 'react';

const FlagSphere = ({ countryCode, cx, cy, r, isHovered, variant = "circle" }) => {
  if (cx === undefined || cy === undefined || isNaN(cx) || isNaN(cy)) return null;

  // Increase size for rectangular variant to maintain visual weight
  const baseSize = variant === "rect" ? r * 1.5 : r * 2.8;
  const size = isHovered ? baseSize * 1.25 : baseSize;

  // Create unique ID suffix to prevent collisions between chart instances
  const idSuffix = `${countryCode}-${variant}-${Math.round(cx)}`;

  const flags = {
    SA: <text x="50%" y="55%" fontSize="28" textAnchor="middle" dominantBaseline="central">🇸🇦</text>,
    VE: <text x="50%" y="55%" fontSize="28" textAnchor="middle" dominantBaseline="central">🇻🇪</text>,
    IR: <text x="50%" y="55%" fontSize="28" textAnchor="middle" dominantBaseline="central">🇮🇷</text>,
    IQ: <text x="50%" y="55%" fontSize="28" textAnchor="middle" dominantBaseline="central">🇮🇶</text>,
    AE: <text x="50%" y="55%" fontSize="28" textAnchor="middle" dominantBaseline="central">🇦🇪</text>,
    CA: <text x="50%" y="55%" fontSize="28" textAnchor="middle" dominantBaseline="central">🇨🇦</text>,
    KW: <text x="50%" y="55%" fontSize="28" textAnchor="middle" dominantBaseline="central">🇰🇼</text>,
    RU: <text x="50%" y="55%" fontSize="28" textAnchor="middle" dominantBaseline="central">🇷🇺</text>,
    LY: <text x="50%" y="55%" fontSize="28" textAnchor="middle" dominantBaseline="central">🇱🇾</text>,
    US: <text x="50%" y="55%" fontSize="28" textAnchor="middle" dominantBaseline="central">🇺🇸</text>,
  };

  if (variant === "rect") {
    // 3:2 aspect ratio for rectangular flags
    const width = size;
    const height = size * (2 / 3);

    return (
      <g transform={`translate(${cx - width / 2}, ${cy - height / 2})`} style={{ transition: 'transform 0.2s ease-out' }}>
        <svg viewBox="0 0 30 20" width={width} height={height} preserveAspectRatio="none">
          <defs>
            <clipPath id={`clip-${idSuffix}`}>
              <rect width="30" height="20" rx="2" />
            </clipPath>
          </defs>
          <g clipPath={`url(#clip-${idSuffix})`}>
            {flags[countryCode]}
          </g>
          {/* Add a subtle shine effect */}
          <rect width="30" height="20" fill="url(#shine-gradient)" opacity="0.1" style={{ mixBlendMode: 'overlay' }} />
        </svg>
      </g>
    );
  }

  // Original spherical implementation
  return (
    <g transform={`translate(${cx - size / 2}, ${cy - size / 2})`} style={{ transition: 'transform 0.2s ease-out' }}>
      <defs>
        <clipPath id={`clip-${idSuffix}`}>
          <circle cx={size / 2} cy={size / 2} r={size / 2} />
        </clipPath>
        <radialGradient id={`grad-${idSuffix}`} cx="30%" cy="30%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.4" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g clipPath={`url(#clip-${idSuffix})`}>
        <svg viewBox="0 0 30 20" width={size} height={size} preserveAspectRatio="xMidYMid slice">
          {flags[countryCode]}
        </svg>
        <circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#grad-${idSuffix})`} />
      </g>
    </g>
  );
};

export default FlagSphere;
