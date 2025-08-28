export interface VideoClip {
  kind: string;
  id: string;
  selfLink: string;
  mediaLink: string;
  name: string;
  bucket: string;
  generation: string;
  metageneration: string;
  contentType: string;
  storageClass: string;
  size: string;
  md5Hash: string;
  crc32c: string;
  etag: string;
  timeCreated: string;
  updated: string;
  timeStorageClassUpdated: string;
  timeFinalized: string;
}

export class VideoClipsService {
  private static webhookUrl =
    "https://n8n.srv834400.hstgr.cloud/webhook/bcd49dcb-3103-4152-aefc-32c7d8c552fe";

  static async fetchVideoClips(): Promise<VideoClip[]> {
    try {
      if (!this.webhookUrl) {
        throw new Error("Webhook URL is not configured");
      }

      const response = await fetch(this.webhookUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching video clips:", error);
      throw error;
    }
  }

  /**
   * Generate a publicly accessible URL for a video
   * This handles Google Cloud Storage URLs that might not be publicly accessible
   */
  static getPublicVideoUrl(video: VideoClip): string {
    // If the mediaLink is already a public URL, return it
    if (
      video.mediaLink.startsWith("http") &&
      !video.mediaLink.includes("storage.googleapis.com")
    ) {
      return video.mediaLink;
    }

    // For Google Cloud Storage URLs, we need to make them publicly accessible
    // This is a temporary solution - in production, you should:
    // 1. Set proper IAM permissions on the bucket
    // 2. Use signed URLs for security
    // 3. Or serve through a CDN

    // For now, return the original mediaLink and handle access issues in the UI
    return video.mediaLink;
  }

  /**
   * Check if a video URL is accessible
   */
  static async checkVideoAccessibility(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: "HEAD" });
      return response.ok;
    } catch (error) {
      console.warn("Video URL not accessible:", url, error);
      return false;
    }
  }

  static formatFileSize(bytes: string): string {
    const size = parseInt(bytes);
    if (size === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(size) / Math.log(k));

    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  static getVideoTypeFromName(name: string): string {
    if (name.includes("#")) {
      return "Processed Video";
    }
    return "Original Video";
  }

  static getVideoStatus(
    video: VideoClip
  ): "processing" | "completed" | "error" {
    // Check if video has been processed (contains # in name)
    if (video.name.includes("#")) {
      return "completed";
    }

    // Check if video is recent (within last 5 minutes) - might be processing
    const created = new Date(video.timeCreated);
    const now = new Date();
    const diffMinutes = (now.getTime() - created.getTime()) / (1000 * 60);

    if (diffMinutes < 5) {
      return "processing";
    }

    return "completed";
  }
}
