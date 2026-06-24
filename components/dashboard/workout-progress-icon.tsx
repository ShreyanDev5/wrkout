interface WorkoutProgressIconProps {
  className?: string
  size?: number
}

export function WorkoutProgressIcon({ className = "", size = 32 }: WorkoutProgressIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Dark rounded square background */}
      <rect x="0" y="0" width="24" height="24" rx="6" fill="#1C1C1E" />

      {/* Outer Ring (Push) - 100% progress */}
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="#F9D949"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="62.84 0" // 100% of circumference (2 * π * 10 ≈ 62.84)
        strokeDashoffset="0"
      />

      {/* Middle Ring (Pull) - 100% progress */}
      <circle
        cx="12"
        cy="12"
        r="8"
        fill="none"
        stroke="#4CAF50"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="50.27 0" // 100% of circumference (2 * π * 8 ≈ 50.27)
        strokeDashoffset="0"
      />

      {/* Inner Ring (Legs) - 100% progress */}
      <circle
        cx="12"
        cy="12"
        r="6"
        fill="none"
        stroke="#F44336"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="37.70 0" // 100% of circumference (2 * π * 6 ≈ 37.70)
        strokeDashoffset="0"
      />

      {/* Inner hole for negative space */}
      <circle cx="12" cy="12" r="3" fill="#1C1C1E" />
    </svg>
  )
}
