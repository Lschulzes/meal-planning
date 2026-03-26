export const SAMSCLUB_BASE = "https://www.samsclub.com";
export const SAMSCLUB_API_BASE = "https://www.samsclub.com/api";

/** Default request headers to mimic a browser session */
export const DEFAULT_HEADERS: Record<string, string> = {
  Accept: "application/json",
  "Accept-Language": "en-US,en;q=0.9",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-origin",
  Referer: "https://www.samsclub.com/b/grocery/1444",
};

/** Rate limiting config */
export const RATE_LIMIT = {
  /** Delay between individual requests in ms */
  requestDelayMs: 750,
  /** Max retries on failure */
  maxRetries: 3,
  /** Base backoff delay in ms (multiplied by attempt number) */
  backoffBaseMs: 1000,
  /** Products per page */
  pageSize: 48,
};
