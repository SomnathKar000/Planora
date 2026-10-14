// ────────────────────────────────────────────────────────────────
// Planora API — Staging Quota & Rate Limit Manager
// ────────────────────────────────────────────────────────────────
// Protects backend resources, enforces upload caps, and tracks
// hourly requests per client / project to prevent abuse and cost overruns.
// ────────────────────────────────────────────────────────────────

export interface QuotaConfig {
  maxRequestsPerHour: number;
  maxImageUploadBytes: number;
}

export class QuotaManager {
  private requestsByClient = new Map<string, number[]>();

  constructor(private readonly config: QuotaConfig) {}

  /**
   * Checks whether the client has available quota within the current hourly window.
   */
  checkQuota(clientId: string): { allowed: boolean; remaining: number; resetInMs: number } {
    const now = Date.now();
    const oneHourAgo = now - 3600 * 1000;

    let timestamps = this.requestsByClient.get(clientId) || [];
    // Purge timestamps older than 1 hour
    timestamps = timestamps.filter((t) => t > oneHourAgo);
    this.requestsByClient.set(clientId, timestamps);

    const allowed = timestamps.length < this.config.maxRequestsPerHour;
    const remaining = Math.max(0, this.config.maxRequestsPerHour - timestamps.length);
    const oldest = timestamps[0] || now;
    const resetInMs = Math.max(0, oldest + 3600 * 1000 - now);

    return { allowed, remaining, resetInMs };
  }

  /**
   * Records a consumed request against client's quota.
   */
  recordUsage(clientId: string): void {
    const timestamps = this.requestsByClient.get(clientId) || [];
    timestamps.push(Date.now());
    this.requestsByClient.set(clientId, timestamps);
  }

  /**
   * Validates image payload size and format.
   * Throws Error if payload exceeds size limit or is not a valid image format.
   */
  validateImagePayload(imagePayload: string, fieldName = 'Image'): void {
    if (!imagePayload || typeof imagePayload !== 'string') {
      throw new Error(`${fieldName} payload is empty or invalid.`);
    }

    // Check size (approximate for base64: length * 0.75 bytes)
    const byteLength = imagePayload.startsWith('data:')
      ? Math.round((imagePayload.length * 3) / 4)
      : imagePayload.length;

    if (byteLength > this.config.maxImageUploadBytes) {
      const maxMb = Math.round(this.config.maxImageUploadBytes / (1024 * 1024));
      throw new Error(`${fieldName} exceeds maximum allowable size of ${maxMb}MB.`);
    }

    // Check format (Data URI or HTTPS URL)
    if (imagePayload.startsWith('data:')) {
      const isImageMime = imagePayload.startsWith('data:image/png') ||
                          imagePayload.startsWith('data:image/jpeg') ||
                          imagePayload.startsWith('data:image/webp');
      if (!isImageMime) {
        throw new Error(`${fieldName} must be a valid PNG, JPEG, or WebP image.`);
      }
    } else if (!imagePayload.startsWith('http://') && !imagePayload.startsWith('https://')) {
      throw new Error(`${fieldName} must be a valid data URI or HTTP/HTTPS URL.`);
    }
  }

  /**
   * Clears quota for testing.
   */
  resetAll(): void {
    this.requestsByClient.clear();
  }
}
