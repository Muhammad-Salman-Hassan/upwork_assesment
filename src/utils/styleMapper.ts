type StyleMap = Record<string, unknown>;

const BG_MAP: Record<string, string> = {
  primary: "bg-white",
  secondary: "bg-gray-100",
  transparent: "bg-transparent",
  brand: "bg-[#00AEEF]",
};

const COLOR_MAP: Record<string, string> = {
  brand: "text-[#00AEEF]",
  invert: "text-white",
  primary: "text-gray-900",
};

const SIZE_MAP: Record<string, string> = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
};

const WEIGHT_MAP: Record<string, string> = {
  "400": "font-normal",
  "500": "font-medium",
  "600": "font-semibold",
  "700": "font-bold",
  bold: "font-bold",
};

const RADIUS_MAP: Record<string, string> = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  "3xl": "rounded-3xl",
  full: "rounded-full",
};

export function mapFrameStyles(styles: StyleMap): string {
  const classes: string[] = ["flex"];

  if (styles.orientation === "vertical") classes.push("flex-col");
  else classes.push("flex-row");

  if (typeof styles.gap === "number") classes.push(`gap-${styles.gap}`);
  if (typeof styles.padding === "string") classes.push(styles.padding);
  if (typeof styles.margin === "string") classes.push(styles.margin);
  if (typeof styles.radius === "string") classes.push(RADIUS_MAP[styles.radius] ?? "");
  if (typeof styles.background === "string") classes.push(BG_MAP[styles.background] ?? "");

  if (styles.justify === "between") classes.push("justify-between");
  else if (styles.justify === "center") classes.push("justify-center");
  else if (styles.justify === "start") classes.push("justify-start");
  else if (styles.justify === "end") classes.push("justify-end");

  if (styles.align === "center") classes.push("items-center");
  else if (styles.align === "start") classes.push("items-start");
  else if (styles.align === "end") classes.push("items-end");

  if (styles.width === "100") classes.push("w-full");
  else if (typeof styles.width === "string") classes.push(`w-[${styles.width}%]`);

  if (typeof styles.minHeight === "number") classes.push(`min-h-[${styles.minHeight}px]`);
  if (typeof styles.height === "string") classes.push(styles.height.trim());

  return classes.filter(Boolean).join(" ");
}

export function mapTextStyles(styles: StyleMap): string {
  const classes: string[] = [];

  if (typeof styles.size === "string") classes.push(SIZE_MAP[styles.size] ?? "");
  if (typeof styles.weight === "string") classes.push(WEIGHT_MAP[styles.weight] ?? "");
  if (typeof styles.color === "string") classes.push(COLOR_MAP[styles.color] ?? "text-gray-800");
  if (styles.align === "left") classes.push("text-left");
  else if (styles.align === "center") classes.push("text-center");
  else if (styles.align === "right") classes.push("text-right");
  if (styles.underline === true) classes.push("underline");

  return classes.filter(Boolean).join(" ");
}

export function mapImageStyles(styles: StyleMap): string {
  const classes: string[] = ["object-cover"];

  if (typeof styles.radius === "string") classes.push(RADIUS_MAP[styles.radius] ?? "");
  if (typeof styles.width === "string") classes.push(styles.width.trim());
  if (typeof styles.height === "string") classes.push(styles.height.trim());

  return classes.filter(Boolean).join(" ");
}
