type BreakpointAliases = "xs" | "sm" | "md" | "lg" | "xl";

type BreakpointRange = {
  min?: number | BreakpointAliases;
  max?: number | BreakpointAliases;
};

const DEFAULT_BREAKPOINTS: Record<BreakpointAliases, number> = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
};

/**
 * Utility class for common CSS operations.
 */
export class CssUtils {
  /**
   * Get the root font size (default 16px if not in browser environment)
   * @returns Root font size in pixels
   */
  static getRootFontSize(): number {
    if (typeof window !== "undefined" && window.getComputedStyle) {
      const root = window.document.documentElement;
      const fontSize = window.getComputedStyle(root).fontSize;
      return parseFloat(fontSize) || 16;
    }
    return 16;
  }

  /**
   * Convert pixels to rem units, using the current root font size by default.
   * @param px Pixels value
   * @param base Optional base font size in pixels
   * @returns Rem string, e.g. "1.5rem"
   */
  static pxToRem(px: number, base?: number): string {
    const root = base ?? CssUtils.getRootFontSize();
    return `${px / root}rem`;
  }

  /**
   * Convert rem units to pixels, using the current root font size by default.
   * @param rem Rem value
   * @param base Optional base font size in pixels
   * @returns Pixel number
   */
  static remToPx(rem: number, base?: number): number {
    const root = base ?? CssUtils.getRootFontSize();
    return rem * root;
  }

  /**
   * Convert em units to pixels.
   * @param em Em value.
   * @param base Base font size in pixels (default 16).
   * @returns Pixel number.
   */
  static emToPx(em: number, base = 16): number {
    return em * base;
  }

  /**
   * Convert a CSS object to a string.
   * @param styles Object with CSS properties.
   * @returns CSS string suitable for style attribute.
   * @example
   * ```ts
   * CssUtils.stringify({ color: '#fff', margin: '16px' })
   * // "color: #fff; margin: 16px;"
   * ```
   */
  static stringify(styles: Record<string, string | number>): string {
    return Object.entries(styles)
      .map(([key, value]) => `${CssUtils.camelToKebab(key)}: ${value};`)
      .join(" ");
  }

  /**
   * Convert camelCase to kebab-case.
   * @param str CamelCase string.
   * @returns Kebab-case string.
   */
  static camelToKebab(str: string): string {
    return str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
  }

  /**
   * Parse shorthand CSS (margin, padding) into individual sides.
   * @param value Shorthand string, e.g. "10px 20px".
   * @returns Object with top, right, bottom, left.
   * @example
   * ```ts
   * CssUtils.parseShorthand('10px 20px')
   * // { top: '10px', right: '20px', bottom: '10px', left: '20px' }
   * ```
   */
  static parseShorthand(value: string): {
    top: string;
    right: string;
    bottom: string;
    left: string;
  } {
    const parts = value.trim().split(/\s+/);
    switch (parts.length) {
      case 1:
        return {
          top: parts[0],
          right: parts[0],
          bottom: parts[0],
          left: parts[0],
        };
      case 2:
        return {
          top: parts[0],
          right: parts[1],
          bottom: parts[0],
          left: parts[1],
        };
      case 3:
        return {
          top: parts[0],
          right: parts[1],
          bottom: parts[2],
          left: parts[1],
        };
      case 4:
        return {
          top: parts[0],
          right: parts[1],
          bottom: parts[2],
          left: parts[3],
        };
      default:
        throw new Error(`Invalid shorthand value: ${value}`);
    }
  }

  /**
   * Parse CSS size strings (px, rem, %, vh, vw).
   * @param value e.g. "12px", "1.5rem", "50%", "10vw"
   * @returns { value: number, unit: string }
   */
  static parseSize(value: string | number): { value: number; unit: string } {
    if (typeof value === "number") return { value, unit: "px" };
    const match = /^([\d.]+)(px|rem|em|%|vw|vh)$/i.exec(value.trim());
    if (!match) throw new Error(`Cannot parse size: ${value}`);
    return { value: parseFloat(match[1]), unit: match[2] };
  }

  /**
   * Remove units from a CSS size string.
   * @param value e.g. "12px", "1.5rem"
   * @returns numeric value
   */
  static stripUnits(value: string | number): number {
    return CssUtils.parseSize(value).value;
  }

  /**
   * Create a CSS clamp() expression for responsive sizes.
   * @param min Minimum size (px/rem)
   * @param preferred Preferred size (px/rem) or calc expression
   * @param max Maximum size (px/rem)
   * @returns clamp string
   * @example
   * CssUtils.clamp("12px", "2vw", "24px") // "clamp(12px, 2vw, 24px)"
   */
  static clamp(
    min: string | number,
    preferred: string,
    max: string | number
  ): string {
    return `clamp(${min}, ${preferred}, ${max})`;
  }

  /**
   * Get responsive value based on breakpoints.
   * @param breakpoints Object with keys like sm, md, lg
   * @param currentWidth Current viewport width in px
   * @param defaultValue Fallback value if no breakpoint matches
   */
  static responsiveValue<T>(
    breakpoints: Record<string, T>,
    currentWidth: number,
    defaultValue?: T
  ): T | undefined {
    const keys = Object.keys(breakpoints).sort(
      (a, b) => parseInt(a) - parseInt(b)
    );
    let result: T | undefined = defaultValue;
    for (const key of keys) {
      const bp = parseInt(key);
      if (currentWidth >= bp) result = breakpoints[key];
    }
    return result;
  }

  /**
   * Add vendor prefixes to a CSS object.
   * Supports Webkit, Moz, and ms for common modern and legacy properties.
   * @param styles Object with CSS properties
   * @returns New object with vendor prefixes
   */
  static autoPrefix(
    styles: Record<string, string | number>
  ): Record<string, string | number> {
    const prefixed: Record<string, string | number> = { ...styles };

    const properties = [
      "appearance",
      "userSelect",
      "transform",
      "transformOrigin",
      "transition",
      "transitionDelay",
      "transitionDuration",
      "transitionProperty",
      "transitionTimingFunction",
      "animation",
      "animationName",
      "animationDuration",
      "animationTimingFunction",
      "animationDelay",
      "animationIterationCount",
      "animationDirection",
      "backfaceVisibility",
      "boxShadow",
      "filter",
      "flex",
      "flexDirection",
      "justifyContent",
      "alignItems",
      "alignSelf",
      "order",
      "perspective",
      "perspectiveOrigin",
      "transformStyle",
      "clipPath",
      "mask",
      "maskImage",
      "maskSize",
      "maskPosition",
      "maskRepeat",
      "textDecorationStyle",
      "textDecorationColor",
      "textDecorationLine",
      "writingMode",
      "scrollSnapType",
      "scrollSnapAlign",
      "scrollSnapStop",
      "hyphens",
      "tabSize",
      "backgroundClip",
      "boxDecorationBreak",
    ];

    const vendors = ["Webkit", "Moz", "ms"];

    for (const prop of properties) {
      if (prop in styles) {
        const value = styles[prop];
        for (const vendor of vendors) {
          const key = `${vendor}${prop.charAt(0).toUpperCase()}${prop.slice(
            1
          )}`;
          prefixed[key] = value;
        }
      }
    }

    return prefixed;
  }

  /**
   * Generate a media query string from a single value or range.
   *
   * @param query - Can be:
   *   - number: min-width in pixels
   *   - alias: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
   *   - object: { min?: number | alias, max?: number | alias } for range queries
   * @returns A string with the CSS media query.
   *
   * @example
   * CssUtils.mediaQuery(768); // "@media (min-width: 768px)"
   * CssUtils.mediaQuery('sm'); // "@media (min-width: 576px)"
   * CssUtils.mediaQuery({ min: 'sm', max: 'lg' }); // "@media (min-width: 576px) and (max-width: 992px)"
   */
  static mediaQuery(
    query: number | BreakpointAliases | BreakpointRange
  ): string {
    if (typeof query === "number") return `@media (min-width: ${query}px)`;
    if (typeof query === "string") {
      const value = DEFAULT_BREAKPOINTS[query as BreakpointAliases] ?? 0;
      return `@media (min-width: ${value}px)`;
    }
    if (typeof query === "object") {
      const min =
        query.min != null
          ? typeof query.min === "string"
            ? DEFAULT_BREAKPOINTS[query.min as BreakpointAliases]
            : query.min
          : null;
      const max =
        query.max != null
          ? typeof query.max === "string"
            ? DEFAULT_BREAKPOINTS[query.max as BreakpointAliases]
            : query.max
          : null;
      const parts: string[] = [];
      if (min != null) parts.push(`(min-width: ${min}px)`);
      if (max != null) parts.push(`(max-width: ${max}px)`);
      return `@media ${parts.join(" and ")}`;
    }
    throw new Error(`Invalid media query: ${JSON.stringify(query)}`);
  }

  /**
   * Generate responsive CSS from breakpoints.
   * Automatically applies vendor prefixes to all style properties.
   * Supports simple aliases, pixel values, or JSON-string ranges for min/max widths.
   *
   * @param breakpoints - An object where:
   *   - Key: a breakpoint identifier, which can be:
   *       - a string alias ('xs', 'sm', 'md', 'lg', 'xl')
   *       - a numeric value in pixels
   *       - a JSON string representing a range, e.g. '{"min":"sm","max":"lg"}'
   *   - Value: an object of CSS properties, e.g. { fontSize: '14px', transform: 'rotate(10deg)' }
   * @returns A string containing CSS with media queries and vendor-prefixed properties.
   *
   * @example
   * const css = CssUtils.responsive({
   *   sm: { fontSize: '14px', transform: 'rotate(10deg)' },
   *   md: { fontSize: '16px', transform: 'rotate(0deg)' },
   *   '{"min":"sm","max":"lg"}': { color: 'blue', boxShadow: '0 0 5px rgba(0,0,0,0.3)' }
   * });
   *
   * // Output:
   * // "@media (min-width: 576px) { font-size: 14px; transform: rotate(10deg); WebkitTransform: rotate(10deg); ... }"
   * // "@media (min-width: 768px) { font-size: 16px; transform: rotate(0deg); WebkitTransform: rotate(0deg); ... }"
   * // "@media (min-width: 576px) and (max-width: 992px) { color: blue; box-shadow: 0 0 5px rgba(0,0,0,0.3); WebkitBoxShadow: ... }"
   */
  static responsive(
    breakpoints: Record<string, Record<string, string | number>>
  ): string {
    let css = "";
    for (const [bp, styles] of Object.entries(breakpoints)) {
      const key: number | BreakpointAliases | BreakpointRange = bp.startsWith(
        "{"
      )
        ? JSON.parse(bp)
        : (bp as any);

      const query = CssUtils.mediaQuery(key);
      const prefixedStyles = CssUtils.autoPrefix(styles);
      const styleString = Object.entries(prefixedStyles)
        .map(([k, v]) => `${CssUtils.camelToKebab(k)}: ${v};`)
        .join(" ");
      css += `${query} { ${styleString} }\n`;
    }
    return css;
  }
}
