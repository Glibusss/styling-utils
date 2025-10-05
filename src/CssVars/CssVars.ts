type ResponsiveVariableValue = string | { [minWidth: number]: string };

export class CssVars {
  private static vars: Record<string, string> = {};
  private static themes: Record<
    string,
    Record<string, ResponsiveVariableValue>
  > = {};
  private static currentTheme: string | null = null;

  /**
   * Set a single CSS variable immediately
   * Supports fallback via syntax: CssVars.get('other-var', 'fallback-value')
   */
  static set(name: string, value: string): string {
    const varName = `--${name}`;
    const processedValue = value.replace(
      /CssVars\.get\(['"](.+?)['"](?:,\s*['"](.+?)['"])?\)/g,
      (_, ref, fallback) => {
        const resolved =
          CssVars.vars[`--${ref}`] ?? fallback ?? `var(--${ref})`;
        return resolved;
      }
    );

    CssVars.vars[varName] = processedValue;

    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty(varName, processedValue);
    }

    return `var(${varName})`;
  }

  /**
   * Set multiple variables at once
   */
  static setBatch(variables: Record<string, string>) {
    for (const [name, value] of Object.entries(variables)) {
      CssVars.set(name, value);
    }
  }

  /**
   * Define a theme with optional responsive variables
   */
  static defineTheme(
    themeName: string,
    variables: Record<string, ResponsiveVariableValue>
  ) {
    CssVars.themes[themeName] = variables;
  }

  /**
   * Apply a theme, including responsive and dependent variables
   */
  static applyTheme(themeName: string) {
    const theme = CssVars.themes[themeName];
    if (!theme) throw new Error(`Theme "${themeName}" is not defined`);

    CssVars.currentTheme = themeName;

    // Split into static and responsive
    const staticVars: Record<string, string> = {};
    const responsiveVars: Record<string, Record<number, string>> = {};

    for (const [name, value] of Object.entries(theme)) {
      if (typeof value === "string") {
        staticVars[name] = value;
      } else {
        responsiveVars[name] = value;
      }
    }

    // Apply static first
    CssVars.setBatch(staticVars);

    // Apply responsive
    for (const [name, values] of Object.entries(responsiveVars)) {
      CssVars.applyResponsiveVariable(name, values);
    }
  }

  /**
   * Apply a responsive variable via media queries
   */
  private static applyResponsiveVariable(
    name: string,
    values: Record<number, string>
  ) {
    const varName = `--${name}`;
    const minWidthKeys = Object.keys(values)
      .map(Number)
      .sort((a, b) => a - b);
    const baseValue = values[minWidthKeys[0]];

    CssVars.set(name, baseValue);

    if (typeof document === "undefined") return;

    let styleEl = document.getElementById("styling-utils-responsive-vars");
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "styling-utils-responsive-vars";
      document.head.appendChild(styleEl);
    }

    const mediaCss = minWidthKeys
      .map((minWidth) => {
        const val = values[minWidth].replace(
          /CssVars\.get\(['"](.+?)['"](?:,\s*['"](.+?)['"])?\)/g,
          (_, ref, fallback) => {
            const resolved =
              CssVars.vars[`--${ref}`] ?? fallback ?? `var(--${ref})`;
            return resolved;
          }
        );
        return `@media (min-width: ${minWidth}px) { :root { ${varName}: ${val}; } }`;
      })
      .join("\n");

    styleEl.appendChild(document.createTextNode(mediaCss));
  }

  /**
   * Get variable from JS with optional fallback
   */
  static get(name: string, fallback?: string): string {
    return CssVars.vars[`--${name}`] ?? fallback ?? `var(--${name})`;
  }

  /**
   * Get variable from DOM
   */
  static getComputed(
    name: string,
    element: HTMLElement = document.documentElement
  ): string {
    return getComputedStyle(element).getPropertyValue(`--${name}`).trim();
  }

  /**
   * Get the currently applied theme
   */
  static getCurrentTheme(): string | null {
    return CssVars.currentTheme;
  }
}
