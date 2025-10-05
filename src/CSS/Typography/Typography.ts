import { CssUtils } from "../CssUtils";

export type FontWeight = "normal" | "bold" | "bolder" | "lighter" | number;
export type FontUnit = "px" | "rem" | "em" | "%";

/**
 * Utilities for generating consistent and responsive typography styles.
 */
export class Typography {
  static responsiveFontSize(
    min: string,
    max: string,
    preferred: string
  ): string {
    return `clamp(${min}, ${preferred}, ${max})`;
  }

  /**
   * Generate a complete, prefixed CSS object for a text style.
   *
   * @param fontSize - Font size string (can use fixed units or responsive expressions like `clamp()` or `calc()`).
   * @param lineHeight - Line height, can be unitless (e.g. `1.4`) or with units (e.g. `24px`).
   * @param weight - Font weight (e.g. `"normal"`, `"bold"`, or a numeric value).
   * @param letterSpacing - Optional letter spacing (e.g. `"0.02em"`).
   * @param family - Optional font family (e.g. `"Inter, sans-serif"`).
   * @returns A CSS style object with vendor prefixes automatically applied.
   *
   * @example
   * const titleStyle = Typography.textStyle(
   *   'clamp(16px, 2vw, 32px)',
   *   1.3,
   *   700,
   *   '0.02em',
   *   'Inter, sans-serif'
   * );
   *
   * // {
   * //   fontSize: 'clamp(16px, 2vw, 32px)',
   * //   lineHeight: 1.3,
   * //   fontWeight: 700,
   * //   letterSpacing: '0.02em',
   * //   fontFamily: 'Inter, sans-serif'
   * // }
   */
  static textStyle(
    fontSize: string,
    lineHeight: number | string,
    weight: FontWeight = "normal",
    letterSpacing?: string,
    family?: string
  ): Record<string, string | number> {
    const style: Record<string, string | number> = {
      fontSize,
      lineHeight,
      fontWeight: weight,
    };

    if (letterSpacing) style.letterSpacing = letterSpacing;
    if (family) style.fontFamily = family;

    return CssUtils.autoPrefix(style);
  }

  /**
   * Generate a fluid font-size value that scales between two sizes
   * over a specific viewport range using a CSS `calc()` expression.
   *
   * @param minSize - Minimum font size in pixels (applied at `minWidth`).
   * @param maxSize - Maximum font size in pixels (applied at `maxWidth`).
   * @param minWidth - Minimum viewport width where scaling starts.
   * @param maxWidth - Maximum viewport width where scaling stops.
   * @returns A CSS font-size string using `calc()` to scale with viewport width.
   *
   * @example
   * const fontSize = Typography.fluidFontSize(14, 24, 320, 1280);
   * // "calc(14px + (24 - 14) * ((100vw - 320px) / (1280 - 320)))"
   *
   * const style = Typography.textStyle(fontSize, 1.5);
   */
  static fluidFontSize(
    minSize: number,
    maxSize: number,
    minWidth: number,
    maxWidth: number
  ): string {
    return `calc(${minSize}px + (${maxSize} - ${minSize}) * ((100vw - ${minWidth}px) / (${maxWidth} - ${minWidth})))`;
  }

  /**
   * Generate a fluid font-size value that scales between two sizes with arbitrary units.
   * Automatically defaults to "rem" if units are missing (converts px → rem based on root font size).
   *
   * @param minSize - Minimum font size (number in px or string like '14px', '1rem', '80%').
   * @param maxSize - Maximum font size (same unit as minSize or will be converted to rem).
   * @param minWidth - Minimum viewport width where scaling starts (in px).
   * @param maxWidth - Maximum viewport width where scaling stops (in px).
   * @returns A CSS font-size string using `calc()` to scale with viewport width.
   *
   * @example
   * Typography.fluidFontSizeWithUnits(14, 24, 320, 1280);
   * // "calc(0.875rem + (1.5 - 0.875) * ((100vw - 320px) / (1280 - 320)))"
   *
   * Typography.fluidFontSizeWithUnits('1rem', '2rem', 320, 1280);
   * // "calc(1rem + (2 - 1) * ((100vw - 320px) / (1280 - 320)))"
   */
  static fluidFontSizeWithUnits(
    minSize: number | string,
    maxSize: number | string,
    minWidth: number,
    maxWidth: number
  ): string {
    const rootFontSize =
      typeof document !== "undefined"
        ? parseFloat(getComputedStyle(document.documentElement).fontSize)
        : 16; // fallback for SSR

    const parse = (val: number | string) => {
      if (typeof val === "number") {
        return { value: val / rootFontSize, unit: "rem" }; // convert px → rem
      }
      const match = val.match(/^([\d.]+)([a-z%]*)$/i);
      if (!match) throw new Error(`Invalid size format: ${val}`);
      const value = parseFloat(match[1]);
      const unit = match[2];
      if (!unit || unit === "px")
        return { value: value / rootFontSize, unit: "rem" };
      return { value, unit };
    };

    const min = parse(minSize);
    const max = parse(maxSize);

    if (min.unit !== max.unit) {
      throw new Error(
        `Units must match for minSize (${min.unit}) and maxSize (${max.unit})`
      );
    }

    return `calc(${min.value}${min.unit} + (${max.value} - ${min.value}) * ((100vw - ${minWidth}px) / (${maxWidth} - ${minWidth})))`;
  }

  /**
   * Generate a responsive font-size with automatic clamp and fluid scaling.
   * Converts px to rem by default, or respects other units if provided.
   *
   * @param minSize - Minimum font size (number in px or string like '14px', '1rem', '80%').
   * @param maxSize - Maximum font size (same unit as minSize or converted to rem).
   * @param minWidth - Minimum viewport width where scaling starts (in px).
   * @param maxWidth - Maximum viewport width where scaling stops (in px).
   * @returns A CSS font-size string using `clamp()` and fluid scaling.
   *
   * @example
   * Typography.clampFontSize(14, 24, 320, 1280);
   * // "clamp(0.875rem, calc(0.875rem + (1.5 - 0.875) * ((100vw - 320px) / (1280 - 320))), 1.5rem)"
   */
  static clampFontSize(
    minSize: number | string,
    maxSize: number | string,
    minWidth: number,
    maxWidth: number
  ): string {
    const rootFontSize =
      typeof document !== "undefined"
        ? parseFloat(getComputedStyle(document.documentElement).fontSize)
        : 16; // fallback for SSR

    const parse = (val: number | string) => {
      if (typeof val === "number")
        return { value: val / rootFontSize, unit: "rem" };
      const match = val.match(/^([\d.]+)([a-z%]*)$/i);
      if (!match) throw new Error(`Invalid size format: ${val}`);
      const value = parseFloat(match[1]);
      const unit = match[2];
      if (!unit || unit === "px")
        return { value: value / rootFontSize, unit: "rem" };
      return { value, unit };
    };

    const min = parse(minSize);
    const max = parse(maxSize);

    if (min.unit !== max.unit) {
      throw new Error(
        `Units must match for minSize (${min.unit}) and maxSize (${max.unit})`
      );
    }

    const fluid = `calc(${min.value}${min.unit} + (${max.value} - ${min.value}) * ((100vw - ${minWidth}px) / (${maxWidth} - ${minWidth})))`;

    return `clamp(${min.value}${min.unit}, ${fluid}, ${max.value}${max.unit})`;
  }

  /**
   * Generate a responsive font-size with clamp() and adjustable scaling factor.
   * Automatically converts px → rem by default, respects other units.
   *
   * @param minSize - Minimum font size (number in px or string like '14px', '1rem', '80%').
   * @param maxSize - Maximum font size (same unit as minSize or converted to rem).
   * @param minWidth - Minimum viewport width where scaling starts (in px).
   * @param maxWidth - Maximum viewport width where scaling stops (in px).
   * @param factor - Optional scaling factor to control speed of fluid scaling (default 1).
   * @returns A CSS font-size string using `clamp()` and fluid scaling.
   *
   * @example
   * Typography.clampFontSizeWithFactor(14, 24, 320, 1280, 1);
   * // "clamp(0.875rem, calc(0.875rem + (1.5 - 0.875) * ((100vw - 320px) / (1280 - 320))), 1.5rem)"
   *
   * Typography.clampFontSizeWithFactor(14, 24, 320, 1280, 1.5);
   * // Scaling is 1.5x faster
   */
  static clampFontSizeWithFactor(
    minSize: number | string,
    maxSize: number | string,
    minWidth: number,
    maxWidth: number,
    factor: number = 1
  ): string {
    const rootFontSize =
      typeof document !== "undefined"
        ? parseFloat(getComputedStyle(document.documentElement).fontSize)
        : 16;

    const parse = (val: number | string) => {
      if (typeof val === "number")
        return { value: val / rootFontSize, unit: "rem" };
      const match = val.match(/^([\d.]+)([a-z%]*)$/i);
      if (!match) throw new Error(`Invalid size format: ${val}`);
      const value = parseFloat(match[1]);
      const unit = match[2];
      if (!unit || unit === "px")
        return { value: value / rootFontSize, unit: "rem" };
      return { value, unit };
    };

    const min = parse(minSize);
    const max = parse(maxSize);

    if (min.unit !== max.unit) {
      throw new Error(
        `Units must match for minSize (${min.unit}) and maxSize (${max.unit})`
      );
    }

    const fluid = `calc(${min.value}${min.unit} + (${max.value} - ${min.value}) * ${factor} * ((100vw - ${minWidth}px) / (${maxWidth} - ${minWidth})))`;

    return `clamp(${min.value}${min.unit}, ${fluid}, ${max.value}${max.unit})`;
  }

  /**
   * Generate a responsive text style with clamp() font-size, proportional line-height and optional letter-spacing.
   *
   * @param minSize - Minimum font size (number in px or string like '14px', '1rem', '80%').
   * @param maxSize - Maximum font size (same unit as minSize or converted to rem).
   * @param minWidth - Minimum viewport width where scaling starts (in px).
   * @param maxWidth - Maximum viewport width where scaling stops (in px).
   * @param factor - Optional scaling factor for font-size (default 1).
   * @param baseLineHeight - Optional base line-height ratio (default 1.4).
   * @param letterSpacingRatio - Optional letter-spacing ratio relative to font-size (e.g., 0.02 = 2% of font-size).
   * @param weight - Optional font-weight (default 'normal').
   * @param family - Optional font-family.
   * @returns CSS object with adaptive font-size, line-height, letter-spacing, weight, and family, with vendor prefixes applied.
   *
   * @example
   * Typography.adaptiveText(
   *   14, 24, 320, 1280, 1, 1.4, 0.02, 'bold', 'Arial'
   * );
   * // {
   * //   fontSize: "clamp(0.875rem, calc(...), 1.5rem)",
   * //   lineHeight: "calc(clamp(...) * 1.4)",
   * //   letterSpacing: "calc(clamp(...) * 0.02)",
   * //   fontWeight: "bold",
   * //   fontFamily: "Arial"
   * // }
   */
  static adaptiveText(
    minSize: number | string,
    maxSize: number | string,
    minWidth: number,
    maxWidth: number,
    factor: number = 1,
    baseLineHeight: number = 1.4,
    letterSpacingRatio: number = 0,
    weight: FontWeight = "normal",
    family?: string
  ): Record<string, string | number> {
    const fontSize = Typography.clampFontSizeWithFactor(
      minSize,
      maxSize,
      minWidth,
      maxWidth,
      factor
    );

    const style: Record<string, string | number> = {
      fontSize,
      lineHeight: `calc(${fontSize} * ${baseLineHeight})`,
      fontWeight: weight,
    };

    if (letterSpacingRatio) {
      style.letterSpacing = `calc(${fontSize} * ${letterSpacingRatio})`;
    }

    if (family) style.fontFamily = family;

    return CssUtils.autoPrefix(style);
  }

  /**
   * Create a responsive font-size based on a base size and a scale factor.
   *
   * This formula increases the font size linearly as the viewport width grows,
   * capped between min and max values. Supports px, rem, em, and %.
   *
   * @param baseSize - Base font size (numeric)
   * @param scaleFactor - Growth per 1px of viewport
   * @param minWidth - Min viewport width for scaling
   * @param maxWidth - Max viewport width for scaling
   * @param unit - Unit of measurement (px, rem, em, %) (default: px)
   * @param minSize - Minimum font size (optional)
   * @param maxSize - Maximum font size (optional)
   *
   * @returns A clamp() string suitable for font-size
   *
   * @example
   * Typography.scaledFontSize(1, 0.001, 320, 1600, 'rem');
   * // clamp(1rem, calc(1rem + 0.001 * (100vw - 320px)), 2.28rem)
   */
  static scaledFontSize(
    baseSize: number,
    scaleFactor: number,
    minWidth: number,
    maxWidth: number,
    unit: FontUnit = "px",
    minSize?: number,
    maxSize?: number
  ): string {
    const min = minSize ?? baseSize;
    const max = maxSize ?? baseSize + (maxWidth - minWidth) * scaleFactor;

    const preferred = `calc(${baseSize}${unit} + ${scaleFactor}${unit} * (100vw - ${minWidth}px))`;

    return `clamp(${min}${unit}, ${preferred}, ${max}${unit})`;
  }

  /**
   * Generate fully responsive text styles as a CSS string.
   * Font-size, line-height, and letter-spacing scale fluidly.
   *
   * @param minSize - Minimum font size (number in px or string like '14px', '1rem').
   * @param maxSize - Maximum font size (same unit as minSize).
   * @param breakpoints - Optional array of breakpoints with optional overrides for line-height and letter-spacing.
   * @param factor - Scaling factor for font-size (default 1).
   * @param baseLineHeight - Base line-height ratio (default 1.4).
   * @param letterSpacingRatio - Base letter-spacing ratio (default 0).
   * @param weight - Font weight (default 'normal').
   * @param family - Optional font family.
   * @returns A string containing CSS with responsive font-size, line-height, letter-spacing, weight, and media queries.
   *
   * @example
   * const css = Typography.responsiveText(
   *   14, 24,
   *   [
   *     { width: 480, lineHeight: 1.4, letterSpacing: 0.01 },
   *     { width: 768, lineHeight: 1.5, letterSpacing: 0.02 },
   *     { width: 1200, lineHeight: 1.6, letterSpacing: 0.03 }
   *   ],
   *   1.2, 1.4, 0.02, 'bold', 'Roboto'
   * );
   */
  static responsiveText(
    minSize: number | string,
    maxSize: number | string,
    breakpoints: Array<{
      width: number;
      lineHeight?: number;
      letterSpacing?: number;
    }> = [],
    factor: number = 1,
    baseLineHeight: number = 1.4,
    letterSpacingRatio: number = 0,
    weight: FontWeight = "normal",
    family?: string
  ): string {
    // Helper to convert number to px string if needed
    const toPx = (v: number | string) => (typeof v === "number" ? `${v}px` : v);

    const fontSize = toPx(
      typeof minSize === "number" ? minSize * factor : minSize
    );

    let css = `
    font-size: ${fontSize};
    line-height: calc(${fontSize} * ${baseLineHeight});
    ${
      letterSpacingRatio
        ? `letter-spacing: calc(${fontSize} * ${letterSpacingRatio});`
        : ""
    }
    font-weight: ${weight};
    ${family ? `font-family: ${family};` : ""}
  `;

    for (const bp of breakpoints) {
      const styles: Record<string, string | number> = {};

      if (bp.lineHeight)
        styles.lineHeight = `calc(${fontSize} * ${bp.lineHeight})`;
      if (bp.letterSpacing)
        styles.letterSpacing = `calc(${fontSize} * ${bp.letterSpacing})`;

      const prefixed = CssUtils.autoPrefix(styles);
      const styleString = Object.entries(prefixed)
        .map(([k, v]) => `${CssUtils.camelToKebab(k)}: ${v};`)
        .join(" ");

      css += `@media (min-width: ${bp.width}px) { ${styleString} }\n`;
    }

    return css;
  }

  /**
   * Generate fully fluid, responsive text styles.
   * Font-size, line-height, and letter-spacing scale linearly between min and max sizes.
   * Automatically applies vendor prefixes for common CSS properties.
   *
   * @param minSize - Minimum font size in px.
   * @param maxSize - Maximum font size in px.
   * @param minWidth - Minimum viewport width in px for scaling (e.g., 320).
   * @param maxWidth - Maximum viewport width in px for scaling (e.g., 1280).
   * @param lineHeightRatio - Base line-height ratio at minSize (default 1.4).
   * @param letterSpacingRatio - Base letter-spacing ratio at minSize (default 0).
   * @param weight - Font weight (default 'normal').
   * @param family - Optional font family.
   * @returns CSS string with fluid font-size, line-height, letter-spacing, weight, and family.
   *
   * @example
   * const css = Typography.fluidText(14, 24, 320, 1280, 1.4, 0.02, 'bold', 'Roboto');
   */
  static fluidText(
    minSize: number,
    maxSize: number,
    minWidth: number,
    maxWidth: number,
    lineHeightRatio: number = 1.4,
    letterSpacingRatio: number = 0,
    weight: FontWeight = "normal",
    family?: string
  ): string {
    const fontSizeCalc = `calc(${minSize}px + (${maxSize} - ${minSize}) * ((100vw - ${minWidth}px) / (${maxWidth} - ${minWidth})))`;

    let css = `
    font-size: ${fontSizeCalc};
    line-height: calc(${fontSizeCalc} * ${lineHeightRatio});
    ${
      letterSpacingRatio
        ? `letter-spacing: calc(${fontSizeCalc} * ${letterSpacingRatio});`
        : ""
    }
    font-weight: ${weight};
    ${family ? `font-family: ${family};` : ""}
  `;

    return CssUtils.autoPrefixString(css);
  }
}
