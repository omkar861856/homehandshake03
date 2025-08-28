import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

interface SocialAnalytics {
  [platform: string]: {
    analytics?: {
      followersCount?: number;
      fanCount?: number;
      subscriberCount?: string;
      viewsCount?: number;
      viewCount?: string;
      profileViews?: number;
      postsCount?: number;
      mediaCount?: number;
      tweetCount?: number;
      videoCountTotal?: number;
      likeCount?: number;
      likes?: number;
      reactions?: { total: number };
      pageImpressions?: number;
      followerCount?: number;
      commentCountTotal?: number;
      followers?: { totalFollowerCount: number };
      impressionCount?: number;
      clickCount?: number;
      views?: number;
    };
    lastUpdated?: string;
  };
}

interface AnalyticsData {
  data: SocialAnalytics | null;
  loading: boolean;
  error: string | null;
  fetchAnalytics: () => Promise<void>;
  getAggregatedMetrics: () => {
    totalFollowers: number;
    totalViews: number;
    totalContent: number;
    totalEngagement: number;
  };
  getPlatformMetrics: (platform: string) => {
    followers?: number;
    subscribers?: number;
    views?: number;
    impressions?: number;
    reactions?: number;
    likes?: number;
    tweets?: number;
    comments?: number;
    posts?: number;
    clicks?: number;
    lastUpdated?: string;
  } | null;
}

export const useAnalyticsData = (): AnalyticsData => {
  const { user, isLoaded } = useUser();
  const [data, setData] = useState<SocialAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset error when user changes
  useEffect(() => {
    if (user && error) {
      setError(null);
    }
  }, [user, error]);

  const fetchAnalytics = async () => {
    console.log("fetchAnalytics called with:", {
      isLoaded,
      user: !!user,
      userId: user?.id,
    });

    if (!isLoaded) {
      setError("Please wait for user data to load.");
      return;
    }

    if (!user) {
      setError("User not authenticated. Please log in again.");
      return;
    }

    setLoading(true);
    setError(null);

    // Get profile key from user metadata or use user ID as fallback
    const profileKey = user?.publicMetadata?.profileKey || user?.id;
    console.log("Using profile key:", profileKey);

    if (!profileKey) {
      setError("Profile key not found. Please ensure you're logged in.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/ayrshare/analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platforms: [
            "bluesky",
            "facebook",
            "gmb",
            "instagram",
            "linkedin",
            "pinterest",
            "reddit",
            "snapchat",
            "threads",
            "tiktok",
            "twitter",
            "youtube",
          ],
          profileKey: profileKey,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API response error:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });
        throw new Error(
          errorData.error ||
            `Failed to fetch analytics: ${response.status} ${response.statusText}`
        );
      }

      const analyticsData = await response.json();
      console.log("Analytics data received:", analyticsData);
      setData(analyticsData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch analytics"
      );
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate aggregated metrics from the analytics data
  const getAggregatedMetrics = () => {
    if (!data) {
      return {
        totalFollowers: 0,
        totalViews: 0,
        totalContent: 0,
        totalEngagement: 0,
      };
    }

    let totalFollowers = 0;
    let totalViews = 0;
    let totalContent = 0;
    let totalEngagement = 0;

    Object.keys(data).forEach((platform) => {
      if (
        platform === "status" ||
        platform === "lastUpdated" ||
        platform === "nextUpdate"
      )
        return;

      const platformData = data[platform];
      if (platformData?.analytics) {
        // Add followers
        if (platformData.analytics.followersCount) {
          totalFollowers += platformData.analytics.followersCount;
        } else if (platformData.analytics.fanCount) {
          totalFollowers += platformData.analytics.fanCount;
        } else if (platformData.analytics.subscriberCount) {
          totalFollowers +=
            parseInt(platformData.analytics.subscriberCount) || 0;
        }

        // Add views
        if (platformData.analytics.viewsCount) {
          totalViews += platformData.analytics.viewsCount;
        } else if (platformData.analytics.viewCount) {
          totalViews += parseInt(platformData.analytics.viewCount) || 0;
        } else if (platformData.analytics.profileViews) {
          totalViews += platformData.analytics.profileViews;
        }

        // Add content count
        if (platformData.analytics.postsCount) {
          totalContent += platformData.analytics.postsCount;
        } else if (platformData.analytics.mediaCount) {
          totalContent += platformData.analytics.mediaCount;
        } else if (platformData.analytics.tweetCount) {
          totalContent += platformData.analytics.tweetCount;
        } else if (platformData.analytics.videoCountTotal) {
          totalContent += platformData.analytics.videoCountTotal;
        }

        // Add engagement
        if (platformData.analytics.likeCount) {
          totalEngagement += platformData.analytics.likeCount;
        } else if (platformData.analytics.reactions?.total) {
          totalEngagement += platformData.analytics.reactions.total;
        }
      }
    });

    return {
      totalFollowers,
      totalViews,
      totalContent,
      totalEngagement,
    };
  };

  // Get platform-specific metrics
  const getPlatformMetrics = (platform: string) => {
    if (!data || !data[platform]?.analytics) {
      return null;
    }

    const analytics = data[platform].analytics;

    switch (platform) {
      case "facebook":
        return {
          followers: analytics.followersCount || analytics.fanCount || 0,
          impressions: analytics.pageImpressions || 0,
          reactions: analytics.reactions?.total || 0,
          lastUpdated: data[platform].lastUpdated,
        };

      case "instagram":
        return {
          followers: analytics.followersCount || 0,
          views: analytics.viewsCount || 0,
          likes: analytics.likeCount || 0,
          lastUpdated: data[platform].lastUpdated,
        };

      case "youtube":
        return {
          subscribers: parseInt(analytics.subscriberCount || "0") || 0,
          views: parseInt(analytics.viewCount || "0") || 0,
          likes: analytics.likes || 0,
          lastUpdated: data[platform].lastUpdated,
        };

      case "twitter":
        return {
          followers: analytics.followersCount || 0,
          tweets: analytics.tweetCount || 0,
          likes: analytics.likeCount || 0,
          lastUpdated: data[platform].lastUpdated,
        };

      case "tiktok":
        return {
          followers: analytics.followerCount || 0,
          views: analytics.profileViews || 0,
          comments: analytics.commentCountTotal || 0,
          lastUpdated: data[platform].lastUpdated,
        };

      case "linkedin":
        return {
          followers: analytics.followers?.totalFollowerCount || 0,
          impressions: analytics.impressionCount || 0,
          clicks: analytics.clickCount || 0,
          lastUpdated: data[platform].lastUpdated,
        };

      case "bluesky":
        return {
          followers: analytics.followersCount || 0,
          posts: analytics.postsCount || 0,
          lastUpdated: data[platform].lastUpdated,
        };

      case "threads":
        return {
          followers: analytics.followersCount || 0,
          views: analytics.views || 0,
          likes: analytics.likes || 0,
          lastUpdated: data[platform].lastUpdated,
        };

      default:
        return null;
    }
  };

  return {
    data,
    loading,
    error,
    fetchAnalytics,
    getAggregatedMetrics,
    getPlatformMetrics,
  };
};
