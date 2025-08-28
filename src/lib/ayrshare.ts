interface SocialAccount {
  created: string;
  displayName: string;
  id: string;
  platform: string;
  profileUrl?: string;
  userImage?: string;
  username?: string;
  messagingActive?: boolean;
  refreshDaysRemaining?: number;
  refreshRequired?: string;
  type?: string;
  usedQuota?: number;
  subscriptionType?: string;
  verifiedType?: string;
  description?: string;
  userId?: string;
  pageName?: string;
  placeId?: string;
  mapsUrl?: string;
  reviewUrl?: string;
  isVerified?: boolean;
  isEligibleForGeoRestrictions?: boolean;
  monthlyUsage?: number;
  monthlyLimit?: number;
  monthlyReset?: string;
}

interface AyrshareUserResponse {
  activeSocialAccounts?: string[];
  displayNames?: SocialAccount[];
  email?: string;
  lastApiCall?: string;
  messagingConversationMonthlyCount?: number;
  messagingEnabled?: boolean;
  monthlyApiCalls?: number;
  monthlyPostCount?: number;
  monthlyPostQuota?: number;
  monthlyApiCallsQuota?: number;
  refId?: string;
  title?: string;
  lastUpdated?: string;
  nextUpdate?: string;
  created?: {
    _seconds: number;
    _nanoseconds: number;
    utc: string;
  };
}

interface JWTResponse {
  token: string;
  ssoUrl: string;
  expiresIn: number;
  domain: string;
  verificationStatus?: string;
}

export class AyrshareService {
  private apiKey: string;
  private baseUrl = "https://api.ayrshare.com/api";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getUserProfile(
    profileKey?: string
  ): Promise<AyrshareUserResponse | null> {
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      };

      if (profileKey) {
        headers["Profile-Key"] = profileKey;
      }

      const response = await fetch(`${this.baseUrl}/user`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        console.error(
          "Ayrshare API error:",
          response.status,
          response.statusText
        );
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching Ayrshare user profile:", error);
      return null;
    }
  }

  async getUserProfileWithInstagramDetails(
    profileKey?: string
  ): Promise<AyrshareUserResponse | null> {
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      };

      if (profileKey) {
        headers["Profile-Key"] = profileKey;
      }

      const response = await fetch(
        `${this.baseUrl}/user?instagramDetails=true`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        console.error(
          "Ayrshare API error:",
          response.status,
          response.statusText
        );
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(
        "Error fetching Ayrshare user profile with Instagram details:",
        error
      );
      return null;
    }
  }

  // Helper method to get platform icon colors
  static getPlatformColor(platform: string): string {
    const colors: Record<string, string> = {
      facebook: "#1877F2",
      instagram: "#E4405F",
      twitter: "#1DA1F2",
      linkedin: "#0A66C2",
      youtube: "#FF0000",
      tiktok: "#000000",
      pinterest: "#BD081C",
      reddit: "#FF4500",
      snapchat: "#FFFC00",
      telegram: "#0088CC",
      threads: "#000000",
      bluesky: "#0085FF",
      gmb: "#4285F4",
    };
    return colors[platform] || "#6B7280";
  }

  // Helper method to format platform name
  static formatPlatformName(platform: string): string {
    const names: Record<string, string> = {
      facebook: "Facebook",
      instagram: "Instagram",
      twitter: "X (Twitter)",
      linkedin: "LinkedIn",
      youtube: "YouTube",
      tiktok: "TikTok",
      pinterest: "Pinterest",
      reddit: "Reddit",
      snapchat: "Snapchat",
      telegram: "Telegram",
      threads: "Threads",
      bluesky: "Bluesky",
      gmb: "Google Business",
    };
    return (
      names[platform] || platform.charAt(0).toUpperCase() + platform.slice(1)
    );
  }

  // Helper method to calculate usage percentage
  static getUsagePercentage(used: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((used / total) * 100);
  }

  /**
   * Generate JWT for SSO login
   */
  async generateJWT(
    profileKey: string,
    options?: {
      expiresIn?: number;
      domain?: string;
      allowedSocial?: string[];
      redirect?: string;
      logout?: boolean;
      email?: string;
      verify?: boolean;
    }
  ): Promise<JWTResponse | null> {
    try {
      const response = await fetch("/api/ayrshare/jwt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileKey,
          ...options,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        return null;
      }

      const data = await response.json();

      return data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Open SSO login in new window/tab
   */
  async openSSOLogin(
    profileKey: string,
    options: {
      expiresIn?: number;
      domain?: string;
      email?: string;
      maxPack?: boolean;
    } = {}
  ): Promise<boolean> {
    try {
      const jwtResponse = await this.generateJWT(profileKey, options);

      if (!jwtResponse?.token) {
        return false;
      }

      const domain = options.domain || "acme";
      const ssoUrl = `https://profile.ayrshare.com/social-accounts?domain=${domain}&jwt=${jwtResponse.token}`;

      // Open SSO window
      const ssoWindow = window.open(
        ssoUrl,
        "ayrshare_sso",
        "width=800,height=600,scrollbars=yes,resizable=yes"
      );

      if (!ssoWindow) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate SSO URL for external use (e.g., email links)
   */
  async generateSSOUrl(
    profileKey: string,
    options?: {
      expiresIn?: number;
      domain?: string;
      allowedSocial?: string[];
      redirect?: string;
      logout?: boolean;
      email?: string;
      verify?: boolean;
    }
  ): Promise<string | null> {
    try {
      const jwtResponse = await this.generateJWT(profileKey, options);
      return jwtResponse?.ssoUrl || null;
    } catch (error) {
      console.error("Error generating SSO URL:", error);
      return null;
    }
  }
}

export type { AyrshareUserResponse, JWTResponse, SocialAccount };
