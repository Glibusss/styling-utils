type RGBA = {
  r: number;
  g: number;
  b: number;
  a: number;
};

type HSLA = {
  h: number;
  s: number;
  l: number;
  a: number;
};

const NAMED_COLORS: Record<string, string> = {
  black: "#000000",
  white: "#ffffff",
  red: "#ff0000",
  green: "#00ff00",
  blue: "#0000ff",
  transparent: "#00000000",
};

/**
 * Utility class for color parsing and conversion.
 * Supports HEX, RGB(A), HSL(A), and named colors.
 */
export class Color {
  private rgba: RGBA;

  /**
   * Create a new Color instance from a color string.
   * @param input A color string in HEX, RGB(A), HSL(A), or named format.
   */
  constructor(input: string) {
    this.rgba = this.parse(input.trim());
  }

  /** Red channel (0–255) */
  get r(): number {
    return this.rgba.r;
  }
  /** Green channel (0–255) */
  get g(): number {
    return this.rgba.g;
  }
  /** Blue channel (0–255) */
  get b(): number {
    return this.rgba.b;
  }
  /** Alpha channel (0–1) */
  get a(): number {
    return this.rgba.a;
  }

  // ===============================
  //   Static Factories
  // ===============================

  /**
   * Create a Color from a HEX string.
   * @example
   * ```ts
   * const c = Color.fromHex('#ff0000')
   * ```
   */
  static fromHex(hex: string): Color {
    return new Color(hex);
  }

  /**
   * Create a Color from RGB(A) numeric values.
   * @example
   * ```ts
   * const c = Color.fromRgb(255, 0, 0, 0.5)
   * ```
   * @param r Red channel (0–255)
   * @param g Green channel (0–255)
   * @param b Blue channel (0–255)
   * @param a Alpha channel (0–1), default 1
   */
  static fromRgb(r: number, g: number, b: number, a = 1): Color {
    return new Color(`rgba(${r}, ${g}, ${b}, ${a})`);
  }

  /**
   * Create a Color from HSL(A) numeric values.
   * @example
   * ```ts
   * const c = Color.fromHsl(200, 50, 50, 1)
   * ```
   * @param h Hue (0–360)
   * @param s Saturation (0–100)
   * @param l Lightness (0–100)
   * @param a Alpha channel (0–1), default 1
   */
  static fromHsl(h: number, s: number, l: number, a = 1): Color {
    return new Color(`hsla(${h}, ${s}%, ${l}%, ${a})`);
  }

  /**
   * Create a Color from a CSS named color.
   * @example
   * ```ts
   * const c = Color.fromName('red')
   * ```
   */
  static fromName(name: string): Color {
    return new Color(name);
  }

  /**
   * Create a Color from an RGBA object.
   * @example
   * ```ts
   * const c = Color.fromObject({ r: 100, g: 150, b: 200, a: 0.8 })
   * ```
   */
  static fromObject(rgba: RGBA): Color {
    const { r, g, b, a } = rgba;
    return Color.fromRgb(r, g, b, a);
  }

  // ===============================
  //   Parsing
  // ===============================

  private parse(input: string): RGBA {
    if (NAMED_COLORS[input.toLowerCase()]) {
      return this.parseHex(NAMED_COLORS[input.toLowerCase()]);
    }

    if (input.startsWith("#")) return this.parseHex(input);
    if (input.startsWith("rgb")) return this.parseRgb(input);
    if (input.startsWith("hsl")) return this.hslToRgba(this.parseHsl(input));

    throw new Error(`Unsupported color format: ${input}`);
  }

  private parseHex(hex: string): RGBA {
    let clean = hex.replace("#", "");

    if (clean.length === 3) {
      clean = clean
        .split("")
        .map((c) => c + c)
        .join("");
    }

    if (clean.length === 8) {
      const r = parseInt(clean.slice(0, 2), 16);
      const g = parseInt(clean.slice(2, 4), 16);
      const b = parseInt(clean.slice(4, 6), 16);
      const a = parseInt(clean.slice(6, 8), 16) / 255;
      return { r, g, b, a };
    }

    if (clean.length === 6) {
      const r = parseInt(clean.slice(0, 2), 16);
      const g = parseInt(clean.slice(2, 4), 16);
      const b = parseInt(clean.slice(4, 6), 16);
      return { r, g, b, a: 1 };
    }

    throw new Error(`Incorrect HEX format: ${hex}`);
  }

  private parseRgb(rgb: string): RGBA {
    const regex =
      /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/i;
    const match = rgb.match(regex);
    if (!match) throw new Error(`Incorrect RGB(A) format: ${rgb}`);

    const r = parseFloat(match[1]);
    const g = parseFloat(match[2]);
    const b = parseFloat(match[3]);
    const a = match[4] !== undefined ? parseFloat(match[4]) : 1;
    return { r, g, b, a };
  }

  private parseHsl(hsl: string): HSLA {
    const regex =
      /hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*([\d.]+)\s*)?\)/i;
    const match = hsl.match(regex);
    if (!match) throw new Error(`Incorrect HSL(A) format: ${hsl}`);

    const h = parseFloat(match[1]);
    const s = parseFloat(match[2]);
    const l = parseFloat(match[3]);
    const a = match[4] !== undefined ? parseFloat(match[4]) : 1;
    return { h, s, l, a };
  }

  private hslToRgba(hsla: HSLA): RGBA {
    const { h, s, l, a } = hsla;
    const sat = s / 100;
    const light = l / 100;

    const c = (1 - Math.abs(2 * light - 1)) * sat;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = light - c / 2;

    let r = 0,
      g = 0,
      b = 0;

    if (0 <= h && h < 60) [r, g, b] = [c, x, 0];
    else if (60 <= h && h < 120) [r, g, b] = [x, c, 0];
    else if (120 <= h && h < 180) [r, g, b] = [0, c, x];
    else if (180 <= h && h < 240) [r, g, b] = [0, x, c];
    else if (240 <= h && h < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
      a,
    };
  }

  private rgbaToHsla(rgba: RGBA): HSLA {
    const r = rgba.r / 255;
    const g = rgba.g / 255;
    const b = rgba.b / 255;
    const a = rgba.a;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    if (delta !== 0) {
      if (max === r) h = ((g - b) / delta) % 6;
      else if (max === g) h = (b - r) / delta + 2;
      else h = (r - g) / delta + 4;
      h *= 60;
      if (h < 0) h += 360;
    }

    const l = (max + min) / 2;
    const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

    return { h, s: s * 100, l: l * 100, a };
  }

  // ===============================
  //   Conversions
  // ===============================

  /**
   * Convert the color to a HEX string.
   * @param withAlpha Whether to include the alpha channel as a two-digit HEX suffix (e.g. #RRGGBBAA).
   * @returns A HEX color string.
   * @example
   * ```ts
   * new Color('red').toHex() // "#ff0000"
   * new Color('rgba(255,0,0,0.5)').toHex(true) // "#ff000080"
   * ```
   */
  toHex(withAlpha = false): string {
    const r = this.rgba.r.toString(16).padStart(2, "0");
    const g = this.rgba.g.toString(16).padStart(2, "0");
    const b = this.rgba.b.toString(16).padStart(2, "0");

    if (withAlpha) {
      const a = Math.round(this.rgba.a * 255)
        .toString(16)
        .padStart(2, "0");
      return `#${r}${g}${b}${a}`;
    }
    return `#${r}${g}${b}`;
  }

  /**
   * Convert the color to an RGB string.
   * @returns An RGB string like `rgb(255, 0, 0)`.
   * @example
   * ```ts
   * new Color('#ff0000').toRgbString() // "rgb(255, 0, 0)"
   * ```
   */
  toRgbString(): string {
    const { r, g, b } = this.rgba;
    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Convert the color to an RGBA string.
   * @returns An RGBA string like `rgba(255, 0, 0, 0.5)`.
   * @example
   * ```ts
   * new Color('red').toRgbaString() // "rgba(255, 0, 0, 1)"
   * ```
   */
  toRgbaString(): string {
    const { r, g, b, a } = this.rgba;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  /**
   * Convert the color to an HSL string.
   * @returns An HSL string like `hsl(0, 100%, 50%)`.
   * @example
   * ```ts
   * new Color('red').toHslString() // "hsl(0, 100%, 50%)"
   * ```
   */
  toHslString(): string {
    const { h, s, l } = this.rgbaToHsla(this.rgba);
    return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
  }

  /**
   * Convert the color to an HSLA string.
   * @returns An HSLA string like `hsla(0, 100%, 50%, 0.5)`.
   * @example
   * ```ts
   * new Color('rgba(255,0,0,0.5)').toHslaString() // "hsla(0, 100%, 50%, 0.5)"
   * ```
   */
  toHslaString(): string {
    const { h, s, l, a } = this.rgbaToHsla(this.rgba);
    return `hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%, ${a})`;
  }

  /**
   * Convert the color to a plain RGBA object.
   * @returns An RGBA object `{ r, g, b, a }`.
   * @example
   * ```ts
   * new Color('blue').toObject() // { r: 0, g: 0, b: 255, a: 1 }
   * ```
   */
  toObject(): RGBA {
    return { ...this.rgba };
  }

  /**
   * Lighten the color by increasing its lightness in HSL space.
   * @param percent Percentage to increase lightness by (0–100).
   * @returns A new `Color` instance with adjusted lightness.
   * @example
   * ```ts
   * new Color('hsl(0, 100%, 50%)').lighten(20).toHslString()
   * // "hsl(0, 100%, 70%)"
   * ```
   */
  lighten(percent: number): Color {
    const hsla = this.rgbaToHsla(this.rgba);
    hsla.l = Math.min(100, hsla.l + percent);
    return new Color(this.hslToString(hsla));
  }

  /**
   * Darken the color by decreasing its lightness in HSL space.
   * @param percent Percentage to decrease lightness by (0–100).
   * @returns A new `Color` instance with adjusted lightness.
   * @example
   * ```ts
   * new Color('hsl(0, 100%, 50%)').darken(20).toHslString()
   * // "hsl(0, 100%, 30%)"
   * ```
   */
  darken(percent: number): Color {
    const hsla = this.rgbaToHsla(this.rgba);
    hsla.l = Math.max(0, hsla.l - percent);
    return new Color(this.hslToString(hsla));
  }

  /**
   * Convert an HSLA object to a valid CSS hsla() string.
   * @param hsla HSLA color object.
   * @returns A valid `hsla(h, s%, l%, a)` string.
   * @private
   */
  private hslToString(hsla: HSLA): string {
    const { h, s, l, a } = hsla;
    return `hsla(${h}, ${s}%, ${l}%, ${a})`;
  }

  /**
   * Convert the color to a string (RGBA by default).
   * @returns RGBA string representation of the color.
   * @example
   * ```ts
   * String(new Color('#00ff00')) // "rgba(0, 255, 0, 1)"
   * ```
   */
  toString(): string {
    return this.toRgbaString();
  }

  /**
   * Convert the color to a string (RGBA by default).
   * @returns RGBA string representation of the color.
   * @example
   * ```ts
   * String(new Color('#00ff00')) // "rgba(0, 255, 0, 1)"
   * ```
   */
  valueOf(): string {
    return this.toRgbaString();
  }

  /**
   * Mix this color with another color.
   * @param other The other Color instance to mix with.
   * @param weight Weight of the other color (0–1). Default 0.5.
   * @returns A new Color instance representing the mixed color.
   * @example
   * ```ts
   * const c1 = Color.fromHex('#ff0000')
   * const c2 = Color.fromHex('#0000ff')
   * const mixed = c1.mix(c2, 0.25) // 25% c2, 75% c1
   * ```
   */
  mix(other: Color, weight = 0.5): Color {
    const w = Math.max(0, Math.min(1, weight));
    const r = Math.round(this.r * (1 - w) + other.r * w);
    const g = Math.round(this.g * (1 - w) + other.g * w);
    const b = Math.round(this.b * (1 - w) + other.b * w);
    const a = this.a * (1 - w) + other.a * w;
    return Color.fromRgb(r, g, b, a);
  }

  /**
   * Invert the color.
   * @returns A new Color instance with inverted RGB channels.
   * @example
   * ```ts
   * Color.fromHex('#00ff00').invert().toHex() // "#ff00ff"
   * ```
   */
  invert(): Color {
    const r = 255 - this.r;
    const g = 255 - this.g;
    const b = 255 - this.b;
    return Color.fromRgb(r, g, b, this.a);
  }

  /**
   * Get the complementary color.
   * @returns A new Color instance representing the complementary color.
   * @example
   * ```ts
   * Color.fromHex('#ff0000').complement().toHex() // "#00ffff"
   * ```
   */
  complement(): Color {
    const hsla = this.rgbaToHsla(this.rgba);
    let h = (hsla.h + 180) % 360;
    return Color.fromHsl(h, hsla.s, hsla.l, hsla.a);
  }
}
