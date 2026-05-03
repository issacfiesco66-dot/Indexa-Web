interface VisualProps {
  primary: string;
  secondary: string;
}

// ─────────────────────────────────────────────────────────────────
// Sitios Web con IA — orbiting browser windows around a core node
// ─────────────────────────────────────────────────────────────────
export function WebsiteOrbit({ primary, secondary }: VisualProps) {
  return (
    <svg
      viewBox="0 0 500 500"
      className="h-full w-full"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="webOrbCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={primary} stopOpacity="1" />
          <stop offset="60%" stopColor={primary} stopOpacity="0.4" />
          <stop offset="100%" stopColor={primary} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="webOrbStroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={primary} />
          <stop offset="100%" stopColor={secondary} />
        </linearGradient>
        <filter id="webOrbGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer orbit lines */}
      <circle cx="250" cy="250" r="200" fill="none" stroke={primary} strokeOpacity="0.15" strokeWidth="1" strokeDasharray="4 8" />
      <circle cx="250" cy="250" r="150" fill="none" stroke={primary} strokeOpacity="0.2" strokeWidth="1" strokeDasharray="2 6" />
      <circle cx="250" cy="250" r="100" fill="none" stroke={primary} strokeOpacity="0.25" strokeWidth="1" />

      {/* Animated rotating outer orbit */}
      <g style={{ transformOrigin: "250px 250px", animation: "spin 30s linear infinite" }}>
        <circle cx="450" cy="250" r="3" fill={primary} filter="url(#webOrbGlow)" />
        <circle cx="50" cy="250" r="2" fill={secondary} filter="url(#webOrbGlow)" />
      </g>
      <g style={{ transformOrigin: "250px 250px", animation: "spin 20s linear infinite reverse" }}>
        <circle cx="400" cy="250" r="4" fill={secondary} filter="url(#webOrbGlow)" />
      </g>

      {/* Core glow */}
      <circle cx="250" cy="250" r="80" fill="url(#webOrbCore)">
        <animate attributeName="r" values="80;90;80" dur="3s" repeatCount="indefinite" />
      </circle>

      {/* Core browser window */}
      <g transform="translate(180, 180)">
        <rect width="140" height="100" rx="10" fill="#0a0e27" stroke="url(#webOrbStroke)" strokeWidth="2" filter="url(#webOrbGlow)" />
        <circle cx="14" cy="14" r="3" fill="#ff5f57" />
        <circle cx="26" cy="14" r="3" fill="#febc2e" />
        <circle cx="38" cy="14" r="3" fill="#28c840" />
        <line x1="0" y1="28" x2="140" y2="28" stroke={primary} strokeOpacity="0.3" strokeWidth="1" />
        <rect x="14" y="40" width="60" height="6" rx="3" fill={primary} fillOpacity="0.6">
          <animate attributeName="width" values="40;90;60" dur="4s" repeatCount="indefinite" />
        </rect>
        <rect x="14" y="52" width="100" height="4" rx="2" fill={primary} fillOpacity="0.3" />
        <rect x="14" y="62" width="80" height="4" rx="2" fill={primary} fillOpacity="0.3" />
        <rect x="14" y="78" width="50" height="14" rx="3" fill={secondary}>
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
        </rect>
      </g>

      {/* Floating mini windows */}
      <g style={{ animation: "float 6s ease-in-out infinite" }}>
        <rect x="60" y="100" width="60" height="40" rx="6" fill="#0a0e27" stroke={secondary} strokeWidth="1.5" strokeOpacity="0.6" />
        <rect x="68" y="112" width="20" height="3" rx="1.5" fill={secondary} fillOpacity="0.7" />
        <rect x="68" y="120" width="40" height="2" rx="1" fill={secondary} fillOpacity="0.4" />
        <rect x="68" y="126" width="30" height="2" rx="1" fill={secondary} fillOpacity="0.4" />
      </g>
      <g style={{ animation: "float 6s ease-in-out infinite 1.5s" }}>
        <rect x="380" y="320" width="60" height="40" rx="6" fill="#0a0e27" stroke={primary} strokeWidth="1.5" strokeOpacity="0.6" />
        <rect x="388" y="332" width="20" height="3" rx="1.5" fill={primary} fillOpacity="0.7" />
        <rect x="388" y="340" width="40" height="2" rx="1" fill={primary} fillOpacity="0.4" />
        <rect x="388" y="346" width="30" height="2" rx="1" fill={primary} fillOpacity="0.4" />
      </g>
      <g style={{ animation: "float 6s ease-in-out infinite 3s" }}>
        <rect x="380" y="100" width="60" height="40" rx="6" fill="#0a0e27" stroke={primary} strokeWidth="1.5" strokeOpacity="0.6" />
        <rect x="388" y="112" width="20" height="3" rx="1.5" fill={primary} fillOpacity="0.7" />
        <rect x="388" y="120" width="40" height="2" rx="1" fill={primary} fillOpacity="0.4" />
        <rect x="388" y="126" width="30" height="2" rx="1" fill={primary} fillOpacity="0.4" />
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
// Marketing Automatizado — radar pulsing with target acquisitions
// ─────────────────────────────────────────────────────────────────
export function AdsRadar({ primary, secondary }: VisualProps) {
  return (
    <svg viewBox="0 0 500 500" className="h-full w-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="radarSweep" x1="50%" y1="50%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={primary} stopOpacity="0.5" />
          <stop offset="100%" stopColor={primary} stopOpacity="0" />
        </linearGradient>
        <radialGradient id="radarCore">
          <stop offset="0%" stopColor={primary} stopOpacity="0.8" />
          <stop offset="100%" stopColor={primary} stopOpacity="0" />
        </radialGradient>
        <filter id="radarGlow">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* Concentric rings */}
      {[60, 120, 180, 220].map((r, i) => (
        <circle
          key={r}
          cx="250"
          cy="250"
          r={r}
          fill="none"
          stroke={primary}
          strokeOpacity={0.2 + i * 0.05}
          strokeWidth="1"
        >
          <animate attributeName="r" values={`${r};${r + 5};${r}`} dur="3s" repeatCount="indefinite" />
        </circle>
      ))}

      {/* Cross hairs */}
      <line x1="250" y1="30" x2="250" y2="470" stroke={primary} strokeOpacity="0.15" strokeWidth="1" strokeDasharray="3 6" />
      <line x1="30" y1="250" x2="470" y2="250" stroke={primary} strokeOpacity="0.15" strokeWidth="1" strokeDasharray="3 6" />

      {/* Sweeping radar arm */}
      <g style={{ transformOrigin: "250px 250px", animation: "spin 4s linear infinite" }}>
        <path d="M 250 250 L 470 250 A 220 220 0 0 0 363 60 Z" fill="url(#radarSweep)" />
      </g>

      {/* Detection blips (target audience) */}
      <g>
        <circle cx="180" cy="170" r="5" fill={secondary} filter="url(#radarGlow)">
          <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="180" cy="170" r="12" fill="none" stroke={secondary} strokeWidth="1.5">
          <animate attributeName="r" values="5;25;5" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0;1" dur="3s" repeatCount="indefinite" />
        </circle>
      </g>
      <g>
        <circle cx="340" cy="200" r="4" fill={secondary} filter="url(#radarGlow)">
          <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite" begin="1s" />
        </circle>
        <circle cx="340" cy="200" r="10" fill="none" stroke={secondary} strokeWidth="1.5">
          <animate attributeName="r" values="4;22;4" dur="3s" repeatCount="indefinite" begin="1s" />
          <animate attributeName="opacity" values="1;0;1" dur="3s" repeatCount="indefinite" begin="1s" />
        </circle>
      </g>
      <g>
        <circle cx="320" cy="350" r="5" fill={secondary} filter="url(#radarGlow)">
          <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite" begin="2s" />
        </circle>
        <circle cx="320" cy="350" r="12" fill="none" stroke={secondary} strokeWidth="1.5">
          <animate attributeName="r" values="5;25;5" dur="3s" repeatCount="indefinite" begin="2s" />
          <animate attributeName="opacity" values="1;0;1" dur="3s" repeatCount="indefinite" begin="2s" />
        </circle>
      </g>
      <g>
        <circle cx="150" cy="320" r="4" fill={primary} filter="url(#radarGlow)">
          <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite" begin="0.5s" />
        </circle>
      </g>
      <g>
        <circle cx="380" cy="120" r="3" fill={primary} filter="url(#radarGlow)">
          <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite" begin="1.5s" />
        </circle>
      </g>

      {/* Center node */}
      <circle cx="250" cy="250" r="40" fill="url(#radarCore)" />
      <circle cx="250" cy="250" r="14" fill={primary} filter="url(#radarGlow)">
        <animate attributeName="r" values="14;18;14" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* Floating ad cards */}
      <g style={{ animation: "float 5s ease-in-out infinite" }}>
        <rect x="40" y="40" width="80" height="50" rx="6" fill="#0a0e27" stroke={primary} strokeWidth="1.5" />
        <rect x="48" y="48" width="14" height="14" rx="3" fill={primary} fillOpacity="0.6" />
        <rect x="68" y="50" width="40" height="3" rx="1.5" fill={primary} fillOpacity="0.7" />
        <rect x="68" y="58" width="30" height="2" rx="1" fill={primary} fillOpacity="0.4" />
        <rect x="48" y="70" width="64" height="12" rx="2" fill={secondary} fillOpacity="0.8" />
      </g>
      <g style={{ animation: "float 5s ease-in-out infinite 2s" }}>
        <rect x="380" y="380" width="80" height="50" rx="6" fill="#0a0e27" stroke={secondary} strokeWidth="1.5" />
        <text x="420" y="408" textAnchor="middle" fill={primary} fontSize="11" fontWeight="700">+247%</text>
        <text x="420" y="422" textAnchor="middle" fill={primary} fillOpacity="0.5" fontSize="7">conversiones</text>
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
// SEO Inteligente — climbing data flow / search bars
// ─────────────────────────────────────────────────────────────────
export function SeoDataFlow({ primary, secondary }: VisualProps) {
  return (
    <svg viewBox="0 0 500 500" className="h-full w-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="seoBar" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={primary} stopOpacity="1" />
          <stop offset="100%" stopColor={secondary} stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="seoLine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={primary} />
          <stop offset="100%" stopColor={secondary} />
        </linearGradient>
        <filter id="seoGlow">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
      </defs>

      {/* Grid */}
      <g opacity="0.1">
        {[100, 180, 260, 340, 420].map((y) => (
          <line key={y} x1="40" y1={y} x2="460" y2={y} stroke={primary} strokeWidth="1" strokeDasharray="3 6" />
        ))}
      </g>

      {/* Search bar at top */}
      <g transform="translate(80, 60)">
        <rect width="340" height="50" rx="25" fill="#0a0e27" stroke={primary} strokeWidth="2" filter="url(#seoGlow)" />
        <circle cx="30" cy="25" r="10" fill="none" stroke={primary} strokeWidth="2" />
        <line x1="37" y1="32" x2="44" y2="39" stroke={primary} strokeWidth="2.5" strokeLinecap="round" />
        <text x="60" y="30" fill={primary} fillOpacity="0.7" fontSize="14" fontFamily="monospace">
          tu giro + tu ciudad
          <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
        </text>
        <rect x="56" y="33" width="2" height="14" fill={primary}>
          <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" />
        </rect>
      </g>

      {/* Result bars climbing */}
      <g>
        {/* Position 1 - growing tallest */}
        <g transform="translate(80, 200)">
          <rect width="55" height="240" rx="6" fill="url(#seoBar)" filter="url(#seoGlow)">
            <animate attributeName="height" values="60;240;240" dur="3s" repeatCount="indefinite" />
            <animate attributeName="y" values="180;0;0" dur="3s" repeatCount="indefinite" />
          </rect>
          <text x="27.5" y="260" textAnchor="middle" fill={primary} fontSize="14" fontWeight="700">#1</text>
        </g>
        {/* Position 2 */}
        <g transform="translate(155, 240)">
          <rect width="55" height="200" rx="6" fill="url(#seoBar)" fillOpacity="0.85">
            <animate attributeName="height" values="80;200;200" dur="3s" repeatCount="indefinite" begin="0.3s" />
            <animate attributeName="y" values="120;0;0" dur="3s" repeatCount="indefinite" begin="0.3s" />
          </rect>
          <text x="27.5" y="220" textAnchor="middle" fill={primary} fillOpacity="0.85" fontSize="13" fontWeight="700">#2</text>
        </g>
        {/* Position 3 */}
        <g transform="translate(230, 270)">
          <rect width="55" height="170" rx="6" fill="url(#seoBar)" fillOpacity="0.7">
            <animate attributeName="height" values="100;170;170" dur="3s" repeatCount="indefinite" begin="0.6s" />
          </rect>
          <text x="27.5" y="190" textAnchor="middle" fill={primary} fillOpacity="0.7" fontSize="13" fontWeight="700">#3</text>
        </g>
        {/* Position 4 */}
        <g transform="translate(305, 320)">
          <rect width="55" height="120" rx="6" fill="url(#seoBar)" fillOpacity="0.5" />
          <text x="27.5" y="140" textAnchor="middle" fill={primary} fillOpacity="0.5" fontSize="12">#4</text>
        </g>
        {/* Position 5 */}
        <g transform="translate(380, 360)">
          <rect width="55" height="80" rx="6" fill="url(#seoBar)" fillOpacity="0.3" />
          <text x="27.5" y="100" textAnchor="middle" fill={primary} fillOpacity="0.3" fontSize="12">#5</text>
        </g>
      </g>

      {/* Up arrow trend */}
      <g style={{ animation: "float 4s ease-in-out infinite" }}>
        <path d="M 30 410 L 90 350 L 150 380 L 220 280 L 290 240 L 360 180 L 430 130" fill="none" stroke="url(#seoLine)" strokeWidth="3" strokeLinecap="round" filter="url(#seoGlow)" />
        <polygon points="430,130 410,140 425,150" fill={secondary} filter="url(#seoGlow)" />
      </g>

      {/* "TOP 3" badge */}
      <g style={{ animation: "float 5s ease-in-out infinite 1s" }}>
        <rect x="350" y="50" width="100" height="40" rx="20" fill={primary} filter="url(#seoGlow)" />
        <text x="400" y="76" textAnchor="middle" fill="#0a0e27" fontSize="14" fontWeight="800">TOP 3</text>
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
// Analíticas — pulse heartbeat with floating metric cards
// ─────────────────────────────────────────────────────────────────
export function AnalyticsPulse({ primary, secondary }: VisualProps) {
  return (
    <svg viewBox="0 0 500 500" className="h-full w-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="analyticsLine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={primary} stopOpacity="0" />
          <stop offset="50%" stopColor={primary} stopOpacity="1" />
          <stop offset="100%" stopColor={secondary} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="analyticsArea" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={primary} stopOpacity="0.3" />
          <stop offset="100%" stopColor={primary} stopOpacity="0" />
        </linearGradient>
        <filter id="analyticsGlow">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* Grid */}
      <g opacity="0.08">
        {[100, 200, 300, 400].map((y) => (
          <line key={y} x1="40" y1={y} x2="460" y2={y} stroke="white" strokeWidth="1" />
        ))}
        {[100, 200, 300, 400].map((x) => (
          <line key={x} x1={x} y1="40" y2="460" x2={x} stroke="white" strokeWidth="1" />
        ))}
      </g>

      {/* Area chart */}
      <path
        d="M 40 320 L 100 280 L 160 300 L 220 240 L 280 200 L 340 220 L 400 160 L 460 120 L 460 460 L 40 460 Z"
        fill="url(#analyticsArea)"
      />

      {/* Line chart */}
      <path
        d="M 40 320 L 100 280 L 160 300 L 220 240 L 280 200 L 340 220 L 400 160 L 460 120"
        fill="none"
        stroke="url(#analyticsLine)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#analyticsGlow)"
      />

      {/* Pulsing data points */}
      {[
        { x: 100, y: 280 },
        { x: 220, y: 240 },
        { x: 340, y: 220 },
        { x: 460, y: 120 },
      ].map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill={primary} filter="url(#analyticsGlow)" />
          <circle cx={p.x} cy={p.y} r="8" fill="none" stroke={primary} strokeWidth="1.5">
            <animate attributeName="r" values="4;14;4" dur="2s" repeatCount="indefinite" begin={`${i * 0.4}s`} />
            <animate attributeName="opacity" values="1;0;1" dur="2s" repeatCount="indefinite" begin={`${i * 0.4}s`} />
          </circle>
        </g>
      ))}

      {/* Heartbeat pulse line */}
      <g transform="translate(0, 380)">
        <path
          d="M 40 0 L 120 0 L 130 -20 L 140 30 L 150 -40 L 160 20 L 170 0 L 280 0 L 290 -20 L 300 30 L 310 -40 L 320 20 L 330 0 L 460 0"
          fill="none"
          stroke={secondary}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#analyticsGlow)"
        >
          <animate attributeName="stroke-dasharray" values="0 1000;1000 0" dur="3s" repeatCount="indefinite" />
        </path>
      </g>

      {/* Floating metric cards */}
      <g style={{ animation: "float 5s ease-in-out infinite" }}>
        <rect x="60" y="60" width="120" height="60" rx="8" fill="#0a0e27" stroke={primary} strokeWidth="1.5" filter="url(#analyticsGlow)" />
        <text x="72" y="82" fill={primary} fillOpacity="0.6" fontSize="9" fontFamily="sans-serif">VISITAS HOY</text>
        <text x="72" y="106" fill="white" fontSize="22" fontWeight="800" fontFamily="sans-serif">2,847</text>
        <text x="148" y="106" fill={secondary} fontSize="11" fontWeight="700">+18%</text>
      </g>
      <g style={{ animation: "float 5s ease-in-out infinite 2s" }}>
        <rect x="320" y="40" width="140" height="60" rx="8" fill="#0a0e27" stroke={secondary} strokeWidth="1.5" filter="url(#analyticsGlow)" />
        <text x="332" y="62" fill={secondary} fillOpacity="0.6" fontSize="9">CONVERSIÓN</text>
        <text x="332" y="86" fill="white" fontSize="22" fontWeight="800">5.2%</text>
        <text x="408" y="86" fill={primary} fontSize="11" fontWeight="700">+340%</text>
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
// Chatbot — central AI brain with chat bubbles flowing
// ─────────────────────────────────────────────────────────────────
export function ChatbotNetwork({ primary, secondary }: VisualProps) {
  return (
    <svg viewBox="0 0 500 500" className="h-full w-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id="chatCore">
          <stop offset="0%" stopColor={primary} stopOpacity="1" />
          <stop offset="100%" stopColor={primary} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="chatBubble" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={primary} />
          <stop offset="100%" stopColor={secondary} />
        </linearGradient>
        <filter id="chatGlow">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* Connection lines */}
      <g stroke={primary} strokeOpacity="0.2" strokeWidth="1.5" strokeDasharray="4 4">
        <line x1="250" y1="250" x2="100" y2="120">
          <animate attributeName="stroke-dashoffset" values="0;-16" dur="2s" repeatCount="indefinite" />
        </line>
        <line x1="250" y1="250" x2="400" y2="120">
          <animate attributeName="stroke-dashoffset" values="0;-16" dur="2s" repeatCount="indefinite" />
        </line>
        <line x1="250" y1="250" x2="80" y2="280">
          <animate attributeName="stroke-dashoffset" values="0;-16" dur="2s" repeatCount="indefinite" />
        </line>
        <line x1="250" y1="250" x2="420" y2="320">
          <animate attributeName="stroke-dashoffset" values="0;-16" dur="2s" repeatCount="indefinite" />
        </line>
        <line x1="250" y1="250" x2="170" y2="420">
          <animate attributeName="stroke-dashoffset" values="0;-16" dur="2s" repeatCount="indefinite" />
        </line>
        <line x1="250" y1="250" x2="350" y2="420">
          <animate attributeName="stroke-dashoffset" values="0;-16" dur="2s" repeatCount="indefinite" />
        </line>
      </g>

      {/* Center AI brain */}
      <circle cx="250" cy="250" r="80" fill="url(#chatCore)">
        <animate attributeName="r" values="80;90;80" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="250" cy="250" r="50" fill="#0a0e27" stroke="url(#chatBubble)" strokeWidth="2" filter="url(#chatGlow)" />

      {/* Brain icon inside */}
      <g transform="translate(220, 220)">
        <path
          d="M 30 5 C 20 5 12 12 12 22 C 8 25 8 32 12 35 C 12 45 20 52 30 52 C 40 52 48 45 48 35 C 52 32 52 25 48 22 C 48 12 40 5 30 5 Z"
          fill="none"
          stroke={primary}
          strokeWidth="2"
        />
        <circle cx="22" cy="22" r="2" fill={primary}>
          <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="38" cy="22" r="2" fill={primary}>
          <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="22" cy="35" r="2" fill={secondary}>
          <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="0.5s" />
        </circle>
        <circle cx="38" cy="35" r="2" fill={secondary}>
          <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" begin="0.5s" />
        </circle>
      </g>

      {/* Chat bubbles (channels) */}
      {/* WhatsApp */}
      <g style={{ animation: "float 4s ease-in-out infinite" }}>
        <rect x="50" y="80" width="100" height="60" rx="14" fill="#0a0e27" stroke="#25D366" strokeWidth="2" filter="url(#chatGlow)" />
        <circle cx="75" cy="110" r="14" fill="#25D366" />
        <text x="75" y="115" textAnchor="middle" fill="#0a0e27" fontSize="14" fontWeight="800">W</text>
        <rect x="96" y="98" width="40" height="3" rx="1.5" fill="white" fillOpacity="0.5" />
        <rect x="96" y="106" width="50" height="3" rx="1.5" fill="white" fillOpacity="0.4" />
        <rect x="96" y="114" width="35" height="3" rx="1.5" fill="white" fillOpacity="0.3" />
      </g>
      {/* Instagram */}
      <g style={{ animation: "float 4s ease-in-out infinite 1s" }}>
        <rect x="350" y="80" width="100" height="60" rx="14" fill="#0a0e27" stroke={secondary} strokeWidth="2" filter="url(#chatGlow)" />
        <circle cx="375" cy="110" r="14" fill={secondary} />
        <text x="375" y="115" textAnchor="middle" fill="#0a0e27" fontSize="13" fontWeight="800">IG</text>
        <rect x="396" y="98" width="40" height="3" rx="1.5" fill="white" fillOpacity="0.5" />
        <rect x="396" y="106" width="50" height="3" rx="1.5" fill="white" fillOpacity="0.4" />
        <rect x="396" y="114" width="35" height="3" rx="1.5" fill="white" fillOpacity="0.3" />
      </g>
      {/* Web */}
      <g style={{ animation: "float 4s ease-in-out infinite 2s" }}>
        <rect x="30" y="240" width="100" height="60" rx="14" fill="#0a0e27" stroke={primary} strokeWidth="2" filter="url(#chatGlow)" />
        <circle cx="55" cy="270" r="14" fill={primary} />
        <text x="55" y="275" textAnchor="middle" fill="#0a0e27" fontSize="11" fontWeight="800">WEB</text>
        <rect x="76" y="258" width="40" height="3" rx="1.5" fill="white" fillOpacity="0.5" />
        <rect x="76" y="266" width="50" height="3" rx="1.5" fill="white" fillOpacity="0.4" />
        <rect x="76" y="274" width="35" height="3" rx="1.5" fill="white" fillOpacity="0.3" />
      </g>
      {/* Messenger */}
      <g style={{ animation: "float 4s ease-in-out infinite 1.5s" }}>
        <rect x="370" y="280" width="100" height="60" rx="14" fill="#0a0e27" stroke="#0084FF" strokeWidth="2" filter="url(#chatGlow)" />
        <circle cx="395" cy="310" r="14" fill="#0084FF" />
        <text x="395" y="315" textAnchor="middle" fill="#0a0e27" fontSize="11" fontWeight="800">M</text>
        <rect x="416" y="298" width="40" height="3" rx="1.5" fill="white" fillOpacity="0.5" />
        <rect x="416" y="306" width="50" height="3" rx="1.5" fill="white" fillOpacity="0.4" />
        <rect x="416" y="314" width="35" height="3" rx="1.5" fill="white" fillOpacity="0.3" />
      </g>
      {/* User 1 */}
      <g style={{ animation: "float 4s ease-in-out infinite 0.5s" }}>
        <rect x="120" y="380" width="100" height="60" rx="14" fill="#0a0e27" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" />
        <circle cx="145" cy="410" r="14" fill="white" fillOpacity="0.2" />
        <text x="145" y="415" textAnchor="middle" fill="white" fontSize="13" fontWeight="700">👤</text>
        <rect x="166" y="398" width="40" height="3" rx="1.5" fill="white" fillOpacity="0.5" />
        <rect x="166" y="406" width="30" height="3" rx="1.5" fill="white" fillOpacity="0.3" />
      </g>
      {/* User 2 */}
      <g style={{ animation: "float 4s ease-in-out infinite 2.5s" }}>
        <rect x="300" y="380" width="100" height="60" rx="14" fill="#0a0e27" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" />
        <circle cx="325" cy="410" r="14" fill="white" fillOpacity="0.2" />
        <text x="325" y="415" textAnchor="middle" fill="white" fontSize="13" fontWeight="700">👤</text>
        <rect x="346" y="398" width="40" height="3" rx="1.5" fill="white" fillOpacity="0.5" />
        <rect x="346" y="406" width="30" height="3" rx="1.5" fill="white" fillOpacity="0.3" />
      </g>

      {/* Particles flowing along lines */}
      <circle r="3" fill={primary} filter="url(#chatGlow)">
        <animateMotion dur="2s" repeatCount="indefinite" path="M 100 120 L 250 250" />
      </circle>
      <circle r="3" fill={secondary} filter="url(#chatGlow)">
        <animateMotion dur="2s" repeatCount="indefinite" path="M 400 120 L 250 250" begin="0.7s" />
      </circle>
      <circle r="3" fill={primary} filter="url(#chatGlow)">
        <animateMotion dur="2s" repeatCount="indefinite" path="M 80 280 L 250 250" begin="1.4s" />
      </circle>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
// Automatizaciones — interconnected nodes / mesh network
// ─────────────────────────────────────────────────────────────────
export function AutomationMesh({ primary, secondary }: VisualProps) {
  const nodes = [
    { id: "c", x: 250, y: 250, label: "IA", size: 30, color: primary, isCenter: true },
    { id: "wa", x: 100, y: 100, label: "WA", size: 22, color: "#25D366" },
    { id: "cal", x: 400, y: 100, label: "CAL", size: 22, color: secondary },
    { id: "crm", x: 60, y: 250, label: "CRM", size: 22, color: primary },
    { id: "pay", x: 440, y: 250, label: "$", size: 22, color: "#10b981" },
    { id: "mail", x: 100, y: 400, label: "@", size: 22, color: "#f59e0b" },
    { id: "stack", x: 400, y: 400, label: "DB", size: 22, color: primary },
  ];

  const connections = [
    ["c", "wa"], ["c", "cal"], ["c", "crm"], ["c", "pay"], ["c", "mail"], ["c", "stack"],
    ["wa", "cal"], ["crm", "pay"], ["mail", "stack"],
  ];

  return (
    <svg viewBox="0 0 500 500" className="h-full w-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id="autoGlow">
          <stop offset="0%" stopColor={primary} stopOpacity="1" />
          <stop offset="100%" stopColor={primary} stopOpacity="0" />
        </radialGradient>
        <filter id="autoBlur">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* Background hex pattern hint */}
      <g opacity="0.05" stroke={primary} strokeWidth="1" fill="none">
        <polygon points="60,30 110,30 130,75 110,120 60,120 40,75" />
        <polygon points="180,90 230,90 250,135 230,180 180,180 160,135" />
        <polygon points="300,30 350,30 370,75 350,120 300,120 280,75" />
        <polygon points="420,90 470,90 490,135 470,180 420,180 400,135" />
      </g>

      {/* Connection lines */}
      <g stroke={primary} strokeOpacity="0.3" strokeWidth="1.5">
        {connections.map(([a, b], i) => {
          const nodeA = nodes.find((n) => n.id === a)!;
          const nodeB = nodes.find((n) => n.id === b)!;
          return (
            <line key={i} x1={nodeA.x} y1={nodeA.y} x2={nodeB.x} y2={nodeB.y} strokeDasharray="4 4">
              <animate attributeName="stroke-dashoffset" values="0;-16" dur="2s" repeatCount="indefinite" />
            </line>
          );
        })}
      </g>

      {/* Particles flowing */}
      {connections.map(([a, b], i) => {
        const nodeA = nodes.find((n) => n.id === a)!;
        const nodeB = nodes.find((n) => n.id === b)!;
        return (
          <circle key={`p-${i}`} r="3" fill={secondary} filter="url(#autoBlur)">
            <animateMotion
              dur="3s"
              repeatCount="indefinite"
              path={`M ${nodeA.x} ${nodeA.y} L ${nodeB.x} ${nodeB.y}`}
              begin={`${i * 0.4}s`}
            />
          </circle>
        );
      })}

      {/* Nodes */}
      {nodes.map((n) => (
        <g key={n.id} style={{ animation: n.isCenter ? "none" : "float 5s ease-in-out infinite" }}>
          {n.isCenter && (
            <circle cx={n.x} cy={n.y} r={n.size + 30} fill="url(#autoGlow)">
              <animate attributeName="r" values={`${n.size + 30};${n.size + 40};${n.size + 30}`} dur="3s" repeatCount="indefinite" />
            </circle>
          )}
          <circle cx={n.x} cy={n.y} r={n.size + 6} fill="#0a0e27" stroke={n.color} strokeWidth="2" filter="url(#autoBlur)" />
          <circle cx={n.x} cy={n.y} r={n.size} fill={n.color} fillOpacity={n.isCenter ? "1" : "0.9"} />
          <text x={n.x} y={n.y + 5} textAnchor="middle" fill="#0a0e27" fontSize={n.isCenter ? "14" : "11"} fontWeight="800">
            {n.label}
          </text>
          {n.isCenter && (
            <circle cx={n.x} cy={n.y} r={n.size + 12} fill="none" stroke={primary} strokeWidth="1.5">
              <animate attributeName="r" values={`${n.size + 12};${n.size + 25};${n.size + 12}`} dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0;1" dur="2s" repeatCount="indefinite" />
            </circle>
          )}
        </g>
      ))}

      {/* Status badges */}
      <g style={{ animation: "float 4s ease-in-out infinite" }}>
        <rect x="160" y="40" width="180" height="32" rx="16" fill="#0a0e27" stroke={primary} strokeWidth="1.5" />
        <circle cx="180" cy="56" r="4" fill="#10b981">
          <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
        </circle>
        <text x="195" y="61" fill="white" fontSize="11" fontWeight="700">TODO FUNCIONANDO</text>
      </g>
    </svg>
  );
}

export function getServiceVisual(
  visual: string,
  primary: string,
  secondary: string,
) {
  switch (visual) {
    case "websiteOrbit":
      return <WebsiteOrbit primary={primary} secondary={secondary} />;
    case "adsRadar":
      return <AdsRadar primary={primary} secondary={secondary} />;
    case "seoDataFlow":
      return <SeoDataFlow primary={primary} secondary={secondary} />;
    case "analyticsPulse":
      return <AnalyticsPulse primary={primary} secondary={secondary} />;
    case "chatbotNetwork":
      return <ChatbotNetwork primary={primary} secondary={secondary} />;
    case "automationMesh":
      return <AutomationMesh primary={primary} secondary={secondary} />;
    default:
      return null;
  }
}
