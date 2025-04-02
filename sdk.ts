export class CloudSDK {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    if (!baseUrl) {
      // If no base URL is provided, auto detect it as follows:
      // - If `import.meta.url` is a `file:` URL, use `http://localhost:8000`
      // - If `import.meta.url` is an `http:` or `https:` URL, use the same origin
      const url = new URL(import.meta.url);
      if (url.protocol === "file:") {
        this.baseUrl = "http://localhost:8000";
      } else {
        this.baseUrl = `${url.protocol}//${url.host}`;
      }
    } else {
      // Remove trailing slashes
      this.baseUrl = baseUrl.replace(/\/+$/, "");
    }
  }

  /**
   * Fetch logs from the server and discover all resources mentioned in them
   * @returns Promise<Resource[]> Array of resources with their status
   */
  async discoverResources(): Promise<string[]> {
    // Fetch logs
    const logsResponse = await fetch(`${this.baseUrl}/logs`);
    if (!logsResponse.ok) {
      throw new Error(
        `Failed to fetch logs: ${logsResponse.status} ${logsResponse.statusText}`,
      );
    }

    const logsText = await logsResponse.text();

    // Find all resource identifiers in logs
    const resourceRegex = /(vm|bucket):(\S+)/g;
    const resourceMatches = [...logsText.matchAll(resourceRegex)];

    // Create simple array of resources
    const resources: string[] = [];
    const processedKeys = new Set<string>();

    for (const match of resourceMatches) {
      const [, type, id] = match;
      const key = `${type}:${id}`;

      // Avoid duplicates
      if (processedKeys.has(key)) {
        continue;
      }
      processedKeys.add(key);

      // Fetch the status of the resource
      const resourceResponse = await fetch(`${this.baseUrl}/${type}/${id}`);
      const json = await resourceResponse.json();
      switch (json.status) {
        case "ok":
          resources.push(`${type}:${id} is healthy`);
          break;
        case "notfound":
          // Do nothing;
          break;
        default:
          throw new Error("Bad status");
      }
    }

    return resources;
  }
}
