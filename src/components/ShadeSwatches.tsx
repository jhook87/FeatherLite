/**
 * ShadeSwatches component renders a row of colored dots representing available
 * shades for a product. Each shade requires a name and a hex color code. If
 * no shades are provided the component renders nothing.
 */
export type Shade = {
  /**
   * Display name of the shade (e.g. "Ivory", "Warm Beige"). The name is
   * attached to the title attribute of the swatch for accessibility.
   */
  name: string;
  /**
   * Hex code representing the shade colour. Should include the leading '#'.
   */
  hex: string;
};

export default function ShadeSwatches({ shades }: { shades: Shade[] }) {
  if (!shades || shades.length === 0) return null;
  return (
    <div className="mt-2 flex gap-2" aria-label="Available shades">
      {shades.map((s) => (
        <span
          key={s.name}
          title={s.name}
          className="h-4 w-4 rounded-full border border-white/70 shadow-sm ring-1 ring-border/40"
          style={{ backgroundColor: s.hex }}
        />
      ))}
    </div>
  );
}