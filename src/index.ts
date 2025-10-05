export * as Color from "./Color";
export * as CSS from "./CSS";
export * as CssVars from "./CssVars";

import * as Color from "./Color";
import * as CSS from "./CSS";
import * as CssVars from "./CssVars";

export default {
  ...Color,
  ...CSS,
  ...CssVars,
};
