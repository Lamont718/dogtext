/**
 * Brand illustration system. Stroke-based, brand-orange palette, abstract.
 * Same visual voice across every empty state and error page.
 */

interface IllustrationProps {
  className?: string;
  size?: number;
}

const ORANGE = '#FF8C42';
const PEACH = '#FFB88C';
const CREAM = '#FFF8F0';

/** Two paws + a speech bubble with a heart. Use for "no chat / no messages yet". */
export function PawChatIllustration({ className, size = 200 }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* soft cream background blob */}
      <ellipse cx="120" cy="130" rx="100" ry="70" fill={CREAM} />

      {/* speech bubble */}
      <path
        d="M55 80 Q55 60 80 60 L165 60 Q190 60 190 85 L190 130 Q190 155 165 155 L100 155 L80 175 L82 152 Q55 148 55 130 Z"
        fill="white"
        stroke={ORANGE}
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* heart inside bubble */}
      <path
        d="M122 90 C115 82, 100 84, 100 100 C100 114, 122 130, 122 130 C122 130, 144 114, 144 100 C144 84, 129 82, 122 90 Z"
        fill={ORANGE}
      />

      {/* big paw bottom-left */}
      <g transform="translate(40, 175)">
        <ellipse cx="20" cy="22" rx="13" ry="15" fill={ORANGE} />
        <ellipse cx="6" cy="6" rx="5" ry="7" fill={ORANGE} />
        <ellipse cx="34" cy="6" rx="5" ry="7" fill={ORANGE} />
        <ellipse cx="-2" cy="22" rx="5" ry="6" fill={PEACH} />
        <ellipse cx="42" cy="22" rx="5" ry="6" fill={PEACH} />
      </g>

      {/* small paw top-right */}
      <g transform="translate(190, 30)">
        <ellipse cx="14" cy="15" rx="9" ry="11" fill={PEACH} />
        <ellipse cx="4" cy="4" rx="3.5" ry="5" fill={PEACH} />
        <ellipse cx="24" cy="4" rx="3.5" ry="5" fill={PEACH} />
        <ellipse cx="-2" cy="15" rx="3.5" ry="4" fill={ORANGE} opacity="0.6" />
        <ellipse cx="30" cy="15" rx="3.5" ry="4" fill={ORANGE} opacity="0.6" />
      </g>
    </svg>
  );
}

/** Tilted abstract dog face with question mark. Use for /404 and "not found" states. */
export function LostDogIllustration({ className, size = 200 }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <ellipse cx="120" cy="135" rx="95" ry="60" fill={CREAM} />

      {/* tilted dog head — abstract: round face + two pointy ears */}
      <g transform="translate(120, 130) rotate(-12)">
        {/* ears */}
        <path d="M-55 -50 L-30 -10 L-50 0 Z" fill={ORANGE} />
        <path d="M55 -50 L30 -10 L50 0 Z" fill={ORANGE} />
        {/* head */}
        <circle cx="0" cy="0" r="48" fill={PEACH} stroke={ORANGE} strokeWidth="3" />
        {/* eyes */}
        <circle cx="-15" cy="-5" r="3.5" fill="#2C2C2C" />
        <circle cx="15" cy="-5" r="3.5" fill="#2C2C2C" />
        {/* nose */}
        <ellipse cx="0" cy="14" rx="6" ry="4" fill="#2C2C2C" />
        {/* tongue */}
        <path d="M-4 22 Q0 30 4 22" stroke="#2C2C2C" strokeWidth="2" strokeLinecap="round" fill="none" />
      </g>

      {/* question mark floating */}
      <g transform="translate(190, 50)">
        <circle cx="0" cy="0" r="22" fill="white" stroke={ORANGE} strokeWidth="3" />
        <text
          x="0"
          y="8"
          fontSize="28"
          fontWeight="800"
          textAnchor="middle"
          fill={ORANGE}
          fontFamily="system-ui, sans-serif"
        >
          ?
        </text>
      </g>
    </svg>
  );
}

/** Confetti + sparkle. Use for celebrations empty / success states. */
export function CelebrateIllustration({ className, size = 200 }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <ellipse cx="120" cy="130" rx="95" ry="65" fill={CREAM} />

      {/* heart in center */}
      <path
        d="M120 80 C108 65, 78 70, 78 100 C78 125, 120 160, 120 160 C120 160, 162 125, 162 100 C162 70, 132 65, 120 80 Z"
        fill={ORANGE}
      />

      {/* sparkles around */}
      <g fill={PEACH}>
        <path d="M50 60 L52 50 L54 60 L64 62 L54 64 L52 74 L50 64 L40 62 Z" />
        <path d="M195 75 L196 68 L197 75 L204 76 L197 77 L196 84 L195 77 L188 76 Z" />
        <path d="M55 175 L56.5 168 L58 175 L65 176.5 L58 178 L56.5 185 L55 178 L48 176.5 Z" />
        <path d="M195 180 L196 174 L197 180 L203 181 L197 182 L196 188 L195 182 L189 181 Z" />
      </g>
      <g fill={ORANGE} opacity="0.7">
        <circle cx="35" cy="120" r="4" />
        <circle cx="210" cy="125" r="4" />
        <circle cx="80" cy="40" r="3" />
        <circle cx="170" cy="200" r="3" />
      </g>
    </svg>
  );
}
