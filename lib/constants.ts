export const TENANT_ID = "demo_tenant";

export type ViewportSize = "desktop" | "tablet" | "mobile";

export const VIEWPORT_WIDTHS: Record<ViewportSize, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

export function getIframeWidth(viewportSize: ViewportSize): string {
  return VIEWPORT_WIDTHS[viewportSize];
}

export const TEMPLATE_TYPES = [
  "media_digest",
  "welcome",
  "newsletter",
  "order_confirmation",
  "password_reset",
] as const;

export type TemplateType = (typeof TEMPLATE_TYPES)[number];
