export function getTenantId(): string | null {
  if (typeof window === "undefined") return null;
  
  const tenantId = localStorage.getItem("selectedTenantId");
  return tenantId || null;
}

export function getTenantInfo(): { id: string; name: string; slug: string } | null {
  if (typeof window === "undefined") return null;
  
  const tenantId = localStorage.getItem("selectedTenantId");
  const tenantName = localStorage.getItem("selectedTenantName");
  const tenantSlug = localStorage.getItem("selectedTenantSlug");
  
  if (!tenantId || !tenantName || !tenantSlug) {
    return null;
  }
  
  return {
    id: tenantId,
    name: tenantName,
    slug: tenantSlug,
  };
}
