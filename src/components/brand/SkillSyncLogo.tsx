/**
 * SkillSync OS brand mark — vortex rings around a central "S".
 * Pure SVG so it stays crisp at any size, works in light + dark themes,
 * and needs no network request during launch.
 */
export function SkillSyncLogo({
  size = 128,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label="SkillSync OS"
      className={className}
    >
      <defs>
        <linearGradient id="ssg-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
        <linearGradient id="ssg-b" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="60%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>

      {/* outer vortex ring */}
      <circle
        cx="60"
        cy="60"
        r="50"
        fill="none"
        stroke="url(#ssg-a)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="220 94"
        strokeDashoffset="10"
        opacity="0.95"
      />
      {/* inner counter ring */}
      <circle
        cx="60"
        cy="60"
        r="39"
        fill="none"
        stroke="url(#ssg-b)"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeDasharray="150 96"
        strokeDashoffset="120"
        opacity="0.8"
      />
      {/* vertical sync beam */}
      <line
        x1="60"
        y1="4"
        x2="60"
        y2="24"
        stroke="url(#ssg-a)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
      <line
        x1="60"
        y1="96"
        x2="60"
        y2="116"
        stroke="url(#ssg-b)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* the S */}
      <text
        x="60"
        y="61"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-foreground"
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontWeight: 600,
          fontSize: "46px",
          letterSpacing: "-0.03em",
        }}
      >
        S
      </text>
    </svg>
  );
}

export default SkillSyncLogo;
