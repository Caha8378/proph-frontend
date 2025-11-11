// Feature flags configuration (Vite: use import.meta.env.VITE_*)
export const FEATURES = {
  REQUIRE_EMAIL_VERIFICATION:
    (import.meta as any).env?.VITE_REQUIRE_EMAIL_VERIFICATION !== 'false',
  // Default to true, but can disable with env var (VITE_REQUIRE_EMAIL_VERIFICATION=false)
};

export const shouldRequireEmailVerification = (): boolean => {
  // Check localStorage override first (for dev/testing)
  const skipOverride = localStorage.getItem('skipEmailVerification') === 'true';
  if (skipOverride) return false;

  // Then check feature flag
  return FEATURES.REQUIRE_EMAIL_VERIFICATION;
};

