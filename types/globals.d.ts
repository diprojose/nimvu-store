// Global browser augmentations for third-party analytics scripts

interface Window {
  /** Google Tag Manager dataLayer */
  dataLayer: Record<string, unknown>[];
  /** Facebook Pixel SDK */
  fbq: (
    command: string,
    eventName: string,
    params?: Record<string, unknown>
  ) => void;
}
