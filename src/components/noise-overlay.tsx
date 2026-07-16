/**
 * A faint, full-viewport film-grain texture (SVG fractal noise) that sits above
 * backgrounds but below content. Adds tactile depth so large areas never feel flat.
 */
const NOISE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'>
      <filter id='n'>
        <feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/>
        <feColorMatrix type='saturate' values='0'/>
      </filter>
      <rect width='100%' height='100%' filter='url(#n)'/>
    </svg>`
  );

export function NoiseOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] opacity-[0.04] mix-blend-soft-light"
      style={{ backgroundImage: `url("${NOISE}")`, backgroundRepeat: "repeat" }}
    />
  );
}
