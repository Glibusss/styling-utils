type BreakpointAliases = "xs" | "sm" | "md" | "lg" | "xl";

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
   * Generate a simple min-width media query string.
   *
   * @param query - Breakpoint value in pixels or alias ('xs' | 'sm' | 'md' | 'lg' | 'xl').
   * @returns A string with the CSS media query, e.g., "@media (min-width: 768px)".
   *
   * @example
   * CssUtils.mediaQuery(768); // "@media (min-width: 768px)"
   * CssUtils.mediaQuery('sm'); // "@media (min-width: 576px)"
   */
  static mediaQuery(query: number | BreakpointAliases): string {
    const value =
      typeof query === "string" && query in DEFAULT_BREAKPOINTS
        ? DEFAULT_BREAKPOINTS[query]
        : Number(query);
    return `@media (min-width: ${value}px)`;
  }

  /**
   * Generate responsive CSS from breakpoints.
   * All style objects automatically pass through `autoPrefix`.
   *
   * @param breakpoints - An object where keys are breakpoint aliases or pixel values,
   *                       and values are objects of CSS properties.
   * @returns A string containing the generated CSS with media queries and vendor prefixes.
   *
   * @example
   * const css = CssUtils.responsive({
   *   sm: { transform: 'rotate(20deg)', userSelect: 'none', fontSize: '14px' },
   *   md: { transform: 'rotate(0deg)', fontSize: '16px' }
   * });
   *
   * // Result:
   * // "@media (min-width: 576px) { transform: rotate(20deg); WebkitTransform: rotate(20deg); ... font-size: 14px; }
   * //  @media (min-width: 768px) { transform: rotate(0deg); WebkitTransform: rotate(0deg); ... font-size: 16px; }"
   */
  static responsive(
    breakpoints: Record<
      number | BreakpointAliases,
      Record<string, string | number>
    >
  ): string {
    let css = "";
    for (const [bp, styles] of Object.entries(breakpoints)) {
      const query = CssUtils.mediaQuery(bp as number | BreakpointAliases);
      const prefixedStyles = CssUtils.autoPrefix(styles);
      const styleString = Object.entries(prefixedStyles)
        .map(([k, v]) => `${CssUtils.camelToKebab(k)}: ${v};`)
        .join(" ");
      css += `${query} { ${styleString} }\n`;
    }
    return css;
  }
}
