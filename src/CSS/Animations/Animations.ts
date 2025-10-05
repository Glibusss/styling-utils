import { CssUtils } from "../CssUtils";

/**
 * A utility class for generating and managing CSS keyframes and animations programmatically.
 * Useful for dynamic styles, frameworks without CSS files, or JS-in-CSS libraries.
 *
 * All generated keyframes are automatically injected into a <style> element with ID "styling-utils-animations".
 * You can also specify a custom style container via the `scoped` option.
 */
export class Animations {
  private static counter = 0;
  private static styleId = "styling-utils-animations";

  /**
   * Create or retrieve a <style> element for animation injection.
   * @param scopedId Optional custom ID to scope animations separately.
   */
  private static getStyleElement(scopedId?: string): HTMLStyleElement {
    const id = scopedId || Animations.styleId;
    let styleEl = document.getElementById(id) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = id;
      document.head.appendChild(styleEl);
    }
    return styleEl;
  }

  /**
   * Generate a CSS @keyframes string from a JavaScript object and inject it into a <style> tag.
   *
   * @param frames - Object where keys are percentages ('0%', '50%', 'to') or 'from'/'to', and values are CSS style objects.
   * @param name - Optional custom name for the animation. If not provided, a unique name is generated.
   * @param scoped - Optional style element ID to scope this animation to a specific container.
   * @returns The generated animation name.
   *
   * @example
   * const fade = Animations.keyframes({
   *   from: { opacity: 0 },
   *   to: { opacity: 1 }
   * });
   * // Returns "anim_0" and injects @keyframes anim_0 into <style>
   */
  static keyframes(
    frames: Record<string, Record<string, string | number>>,
    name?: string,
    scoped?: string
  ): string {
    const animName = name || `anim_${Animations.counter++}`;

    let css = `@keyframes ${animName} {`;
    for (const [key, styles] of Object.entries(frames)) {
      const prefixed = CssUtils.autoPrefix(styles);
      const styleString = Object.entries(prefixed)
        .map(([k, v]) => `${CssUtils.camelToKebab(k)}: ${v};`)
        .join(" ");
      css += `${key} { ${styleString} } `;
    }
    css += `}`;

    if (typeof document !== "undefined") {
      const styleEl = Animations.getStyleElement(scoped);
      styleEl.appendChild(document.createTextNode(css));
    }

    return animName;
  }

  /**
   * Remove a previously generated @keyframes block by name.
   *
   * @param name - Animation name to remove.
   * @param scoped - Optional scoped style element ID if used when creating.
   * @returns `true` if removed, `false` if not found.
   */
  static removeKeyframes(name: string, scoped?: string): boolean {
    if (typeof document === "undefined") return false;
    const styleEl = document.getElementById(
      scoped || Animations.styleId
    ) as HTMLStyleElement;
    if (!styleEl) return false;
    const regex = new RegExp(`@keyframes\\s+${name}\\b[\\s\\S]*?}`, "g");
    const before = styleEl.textContent || "";
    const after = before.replace(regex, "");
    const changed = before !== after;
    if (changed) styleEl.textContent = after;
    return changed;
  }

  /**
   * Clear all generated keyframes from the global style element.
   * @param scoped Optional scoped style ID.
   */
  static clearAll(scoped?: string): void {
    if (typeof document === "undefined") return;
    const styleEl = document.getElementById(
      scoped || Animations.styleId
    ) as HTMLStyleElement;
    if (styleEl) styleEl.textContent = "";
  }

  /**
   * Generate a full CSS animation shorthand string.
   *
   * @param animations - One or multiple animation descriptors.
   * @returns A CSS animation shorthand string (can be applied to the `animation` property).
   *
   * @example
   * Animations.animate({ name: 'fadeIn', duration: '0.5s', timing: 'ease-in' });
   * // "fadeIn 0.5s ease-in 1 normal forwards"
   *
   * @example
   * Animations.animate([
   *   { name: 'fadeIn', duration: '0.5s' },
   *   { name: 'spin', duration: '2s', iteration: 'infinite', timing: 'linear' }
   * ]);
   * // "fadeIn 0.5s ease 1 normal forwards, spin 2s linear infinite normal forwards"
   */
  static animate(
    animations:
      | {
          name: string;
          duration?: string;
          timing?: string;
          iteration?: number | "infinite";
          direction?: "normal" | "reverse" | "alternate" | "alternate-reverse";
          fillMode?: "none" | "forwards" | "backwards" | "both";
        }
      | Array<{
          name: string;
          duration?: string;
          timing?: string;
          iteration?: number | "infinite";
          direction?: "normal" | "reverse" | "alternate" | "alternate-reverse";
          fillMode?: "none" | "forwards" | "backwards" | "both";
        }>
  ): string {
    const list = Array.isArray(animations) ? animations : [animations];
    return list
      .map(
        ({
          name,
          duration = "1s",
          timing = "ease",
          iteration = 1,
          direction = "normal",
          fillMode = "forwards",
        }) =>
          `${name} ${duration} ${timing} ${iteration} ${direction} ${fillMode}`
      )
      .join(", ");
  }

  // ----------------------------
  // Predefined Animations
  // ----------------------------

  /** Fade in animation */
  static fadeIn(duration: string = "0.5s"): string {
    const name = Animations.keyframes({
      from: { opacity: 0 },
      to: { opacity: 1 },
    });
    return Animations.animate({ name, duration });
  }

  /** Fade out animation */
  static fadeOut(duration: string = "0.5s"): string {
    const name = Animations.keyframes({
      from: { opacity: 1 },
      to: { opacity: 0 },
    });
    return Animations.animate({ name, duration });
  }

  /** Slide in horizontally */
  static slideInX(
    distance: string = "100%",
    duration: string = "0.5s"
  ): string {
    const name = Animations.keyframes({
      from: { transform: `translateX(${distance})` },
      to: { transform: "translateX(0)" },
    });
    return Animations.animate({ name, duration });
  }

  /** Slide out horizontally */
  static slideOutX(
    distance: string = "100%",
    duration: string = "0.5s"
  ): string {
    const name = Animations.keyframes({
      from: { transform: "translateX(0)" },
      to: { transform: `translateX(${distance})` },
    });
    return Animations.animate({ name, duration });
  }

  /** Continuous spinning animation */
  static spin(
    duration: string = "1s",
    iteration: "infinite" | number = "infinite"
  ): string {
    const name = Animations.keyframes({
      from: { transform: "rotate(0deg)" },
      to: { transform: "rotate(360deg)" },
    });
    return Animations.animate({ name, duration, timing: "linear", iteration });
  }
}
