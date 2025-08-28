"use client";

import { AyrshareTest } from "@/components/AyrshareTest";
import PostVideoModal from "@/components/PostVideoModal";
import { SSOLoginButton } from "@/components/SSOLoginButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoUploadModal } from "@/components/VideoUploadModal";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { useAyrshareData } from "@/hooks/useAyrshareData";
import { useVideoClips } from "@/hooks/useVideoClips";
import { VideoClipsService } from "@/lib/videoClips";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  BarChart3,
  Download,
  Edit,
  Facebook,
  Heart,
  Image,
  Instagram,
  Plus,
  RefreshCw,
  Share2,
  Sparkles,
  Trash2,
  Twitter,
  Video,
  Youtube,
} from "lucide-react";
import { redirect } from "next/navigation";
import React, { useEffect, useState } from "react";

interface DashboardStats {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  trend: "up" | "down";
}

interface VideoClip {
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

interface AIImage {
  id: string;
  title: string;
  url: string;
  prompt: string;
  style: string;
  downloads: number;
  createdAt: string;
}



interface RecentActivity {
  id: string;
  action: string;
  item: string;
  time: string;
  type: "video" | "image" | "analytics" | "social";
}

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState("overview");
  const [isGeneratingJWT, setIsGeneratingJWT] = useState(false);
  const [selectedVideoForPost, setSelectedVideoForPost] =
    useState<VideoClip | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const {
    ayrshareData,
    loading: ayrshareLoading,
    error: ayrshareError,
    refetch,
  } = useAyrshareData();

  const {
    videoClips,
    loading: videoClipsLoading,
    error: videoClipsError,
    refreshVideoClips,
  } = useVideoClips();

  const {
    data: analyticsData,
    loading: analyticsLoading,
    error: analyticsError,
    fetchAnalytics,
    getAggregatedMetrics,
    getPlatformMetrics,
  } = useAnalyticsData();

  // Debug analytics hook state
  console.log("Analytics hook state:", {
    hasData: !!analyticsData,
    loading: analyticsLoading,
    error: analyticsError,
    userLoaded: isLoaded,
    userAuthenticated: !!user,
  });

  // Helper functions for analytics
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const calculateEngagementRate = (): string => {
    if (!analyticsData) return "-";
    const metrics = getAggregatedMetrics();
    if (metrics.totalFollowers === 0) return "0%";
    const rate = (metrics.totalEngagement / metrics.totalFollowers) * 100;
    return rate.toFixed(1) + "%";
  };

  // Auto-refresh video feed every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refreshVideoClips();
      refetch();
    }, 5 * 60 * 1000); // 5 minutes in milliseconds

    return () => clearInterval(interval);
  }, [refreshVideoClips, refetch]);

  const handleSocialIntegration = async () => {
    // Use user ID as fallback profile key if not set in metadata
    const profileKey = user?.publicMetadata?.profileKey || user?.id;

    if (!profileKey) {
      alert("Unable to generate profile key. Please ensure you're logged in.");
      return;
    }

    setIsGeneratingJWT(true);
    try {
      const response = await fetch("/api/ayrshare/jwt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileKey: profileKey,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate JWT");
      }

      const { ssoUrl } = await response.json();

      // Open SSO URL in new tab
      window.open(ssoUrl, "_blank");
    } catch (error: unknown) {
      console.error("Error generating SSO URL:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      alert(`Failed to generate social integration link: ${errorMessage}`);
    } finally {
      setIsGeneratingJWT(false);
    }
  };

  const handleOpenPostModal = (video: VideoClip) => {
    setSelectedVideoForPost(video);
    setIsPostModalOpen(true);
  };

  const handleClosePostModal = () => {
    setIsPostModalOpen(false);
    setSelectedVideoForPost(null);
  };

  if (isLoaded && !isSignedIn) {
    redirect("/");
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-8 h-8 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const dashboardStats: DashboardStats[] = [
    {
      title: "Connected Platforms",
      value: ayrshareData?.activeSocialAccounts?.length.toString() || "0",
      change: ayrshareData?.activeSocialAccounts
        ? `${ayrshareData.activeSocialAccounts.length} active`
        : "No data",
      icon: <Share2 className="h-4 w-4" />,
      trend: "up",
    },
    {
      title: "Monthly Posts",
      value: ayrshareData?.monthlyPostCount?.toString() || "0",
      change: ayrshareData?.monthlyPostQuota
        ? `${
            ayrshareData.monthlyPostQuota - (ayrshareData.monthlyPostCount || 0)
          } remaining`
        : "No limit",
      icon: <Video className="h-4 w-4" />,
      trend: "up",
    },
    {
      title: "API Calls",
      value: ayrshareData?.monthlyApiCalls?.toString() || "0",
      change: ayrshareData?.lastApiCall
        ? `Last: ${new Date(ayrshareData.lastApiCall).toLocaleDateString()}`
        : "No recent calls",
      icon: <BarChart3 className="h-4 w-4" />,
      trend: "up",
    },
    {
      title: "Messaging",
      value: ayrshareData?.messagingEnabled ? "Enabled" : "Disabled",
      change: ayrshareData?.messagingConversationMonthlyCount
        ? `${ayrshareData.messagingConversationMonthlyCount}/100 conversations`
        : "Not available",
      icon: <Heart className="h-4 w-4" />,
      trend: "up",
    },
    {
      title: "Video Clips",
      value: videoClipsLoading ? "..." : videoClips.length.toString(),
      change: videoClipsLoading
        ? "Loading..."
        : videoClips.length === 0
        ? "No clips yet"
        : `${
            videoClips.filter(
              (v) => VideoClipsService.getVideoStatus(v) === "completed"
            ).length
          } processed`,
      icon: <Video className="h-4 w-4" />,
      trend: "up",
    },
  ];

  const aiImages: AIImage[] = [
    {
      id: "1",
      title: "Futuristic Cityscape",
      url: "https://img.freepik.com/premium-photo/futuristic-city-with-flying-cars-glowing-neon-lights-pink-sunset_1022970-58362.jpg",
      prompt: "A futuristic city with flying cars and neon lights",
      style: "Cyberpunk",
      downloads: 234,
      createdAt: "3 hours ago",
    },
    {
      id: "2",
      title: "Abstract Art Piece",
      url: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=200&h=200&fit=crop",
      prompt: "Abstract geometric patterns in vibrant colors",
      style: "Abstract",
      downloads: 156,
      createdAt: "6 hours ago",
    },
    {
      id: "3",
      title: "Nature Landscape",
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop",
      prompt: "Serene mountain landscape with crystal clear lake",
      style: "Realistic",
      downloads: 89,
      createdAt: "1 day ago",
    },
  ];

  // Create social platforms data from Ayrshare data
  // const getAllPlatforms = () => {
    // const allPlatforms = [
      // {
      //   key: "youtube",
      //   name: "YouTube",
      //   icon: <Youtube className="h-5 w-5 text-red-500" />,
      // },
      // {
      //   key: "instagram",
      //   name: "Instagram",
      //   icon: <Instagram className="h-5 w-5 text-pink-500" />,
      // },
      // {
      //   key: "twitter",
      //   name: "X (Twitter)",
      //   icon: <Twitter className="h-5 w-5 text-blue-500" />,
      // },
      // {
      //   key: "facebook",
      //   name: "Facebook",
      //   icon: <Facebook className="h-5 w-5 text-blue-600" />,
      // },
      {
        key: "linkedin",
        name: "LinkedIn",
        icon: <Share2 className="h-5 w-5 text-blue-700" />,
      },
      {
        key: "tiktok",
        name: "TikTok",
        icon: <Video className="h-5 w-5 text-black" />,
      },
      {
        key: "pinterest",
        name: "Pinterest",
        icon: <Share2 className="h-5 w-5 text-red-600" />,
      },
      {
        key: "reddit",
        name: "Reddit",
        icon: <Share2 className="h-5 w-5 text-orange-500" />,
      },
      {
        key: "snapchat",
        name: "Snapchat",
        icon: <Share2 className="h-5 w-5 text-yellow-400" />,
      },
      {
        key: "telegram",
        name: "Telegram",
        icon: <Share2 className="h-5 w-5 text-blue-400" />,
      },
      {
        key: "threads",
        name: "Threads",
        icon: <Share2 className="h-5 w-5 text-black" />,
      },
      {
        key: "bluesky",
        name: "Bluesky",
        icon: <Share2 className="h-5 w-5 text-blue-300" />,
      },
      {
        key: "gmb",
        name: "Google Business",
        icon: <Share2 className="h-5 w-5 text-blue-500" />,
      },
    ];

    return allPlatforms.map((platform) => {
      const connectedAccount = ayrshareData?.displayNames?.find(
        (account) => account.platform === platform.key
      );
      const isConnected =
        ayrshareData?.activeSocialAccounts?.includes(platform.key) || false;

      return {
        name: platform.name,
        icon: platform.icon,
        connected: isConnected,
        followers: connectedAccount?.displayName || "Not connected",
        engagement: connectedAccount?.username
          ? `@${connectedAccount.username}`
          : "0%",
        accountData: connectedAccount,
      };
    });
  };

  // Platform data is available through getAllPlatforms() if needed

  // const recentActivity: RecentActivity[] = [
    {
      id: "1",
      action: "Published video",
      item: "AI Tutorial: Getting Started",
      time: "2 hours ago",
      type: "video",
    },
    {
      id: "2",
      action: "Generated image",
      item: "Futuristic Cityscape",
      time: "3 hours ago",
      type: "image",
    },
    {
      id: "3",
      action: "Connected platform",
      item: "Instagram account",
      time: "5 hours ago",
      type: "social",
    },
    {
      id: "4",
      action: "Reached milestone",
      item: "100K total views",
      time: "1 day ago",
      type: "analytics",
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      published: "bg-green-100 text-green-800",
      draft: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
    };
    return variants[status as keyof typeof variants] || variants.draft;
  };

  const getActivityIcon = (type: string) => {
    const icons = {
      video: <Video className="h-4 w-4" />,
      image: <Image className="h-4 w-4" />,
      analytics: <BarChart3 className="h-4 w-4" />,
      social: <Share2 className="h-4 w-4" />,
    };
    return icons[type as keyof typeof icons] || icons.video;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Video className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">
              ContentClip AI
            </h1>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Welcome back, {user?.firstName}!
            </span>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                  userButtonPopoverCard: "bg-background border border-border",
                  userButtonPopoverActionButton:
                    "text-foreground hover:bg-accent",
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Dashboard
            </h2>
            <p className="text-muted-foreground">
              Manage your AI-powered content creation workflow
            </p>
            {ayrshareLoading && (
              <p className="text-sm text-muted-foreground mt-1">
                Loading social media data...
              </p>
            )}
            {ayrshareError && (
              <p className="text-sm text-red-500 mt-1">{ayrshareError}</p>
            )}
          </div>
          <VideoUploadModal />
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Dashboard Overview</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor your content creation performance and social media
                  metrics
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    refetch();
                    refreshVideoClips();
                  }}
                  variant="outline"
                  size="sm"
                  disabled={ayrshareLoading || videoClipsLoading}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${
                      ayrshareLoading || videoClipsLoading ? "animate-spin" : ""
                    }`}
                  />
                  Refresh All
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {dashboardStats.map((stat, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    {stat.icon}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      <span
                        className={
                          stat.trend === "up"
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {stat.change}
                      </span>{" "}
                      from last month
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your latest content creation activities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center space-x-4"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {activity.action}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.item}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {activity.time}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content Performance</CardTitle>
                  <CardDescription>
                    This month&apos;s content metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Monthly Posts Used</Label>
                      <span className="text-sm font-medium">
                        {ayrshareData?.monthlyPostQuota
                          ? `${Math.round(
                              ((ayrshareData.monthlyPostCount || 0) /
                                ayrshareData.monthlyPostQuota) *
                                100
                            )}%`
                          : "No limit"}
                      </span>
                    </div>
                    <Progress
                      value={
                        ayrshareData?.monthlyPostQuota
                          ? ((ayrshareData.monthlyPostCount || 0) /
                              ayrshareData.monthlyPostQuota) *
                            100
                          : 0
                      }
                      className="h-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Connected Platforms</Label>
                      <span className="text-sm font-medium">
                        {ayrshareData?.activeSocialAccounts
                          ? `${Math.round(
                              (ayrshareData.activeSocialAccounts.length / 13) *
                                100
                            )}%`
                          : "0%"}
                      </span>
                    </div>
                    <Progress
                      value={
                        ayrshareData?.activeSocialAccounts
                          ? (ayrshareData.activeSocialAccounts.length / 13) *
                            100
                          : 0
                      }
                      className="h-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Messaging Conversations</Label>
                      <span className="text-sm font-medium">
                        {ayrshareData?.messagingConversationMonthlyCount
                          ? `${Math.round(
                              (ayrshareData.messagingConversationMonthlyCount /
                                100) *
                                100
                            )}%`
                          : "0%"}
                      </span>
                    </div>
                    <Progress
                      value={
                        ayrshareData?.messagingConversationMonthlyCount
                          ? (ayrshareData.messagingConversationMonthlyCount /
                              100) *
                            100
                          : 0
                      }
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div> */}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">
                Analytics on a Social Network
              </h3>
              <p className="text-sm text-muted-foreground">
                Get analytics and demographics on a user&apos;s social profile,
                such as impressions, views, and followers. Requires a profile
                key from your social media accounts.
              </p>
              {analyticsError && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">
                    Error: {analyticsError}
                  </p>
                </div>
              )}
              {analyticsData && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-600">
                    ✓ Analytics data loaded successfully
                  </p>
                </div>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Social Profile Analytics</CardTitle>
                  <CardDescription>
                    Track your content performance across platforms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Available Platforms
                      </span>
                      <Badge variant="secondary">12 Platforms</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>• Bluesky, Facebook, Google My Business</div>
                      <div>• Instagram, LinkedIn, Pinterest</div>
                      <div>• Reddit, Snapchat, Threads</div>
                      <div>• TikTok, X/Twitter, YouTube</div>
                    </div>
                    <div className="pt-2 space-y-2">
                      <Button
                        onClick={fetchAnalytics}
                        disabled={analyticsLoading || !user || !isLoaded}
                        className="w-full"
                      >
                        {analyticsLoading ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Fetching...
                          </>
                        ) : !user || !isLoaded ? (
                          "Loading User Data..."
                        ) : (
                          "Fetch Analytics Data"
                        )}
                      </Button>
                      <Button
                        onClick={() => {
                          console.log("Current analytics state:", {
                            analyticsData,
                            analyticsLoading,
                            analyticsError,
                            user: !!user,
                            isLoaded,
                          });
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        Debug State
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Metrics</CardTitle>
                  <CardDescription>
                    Important performance indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {analyticsData
                          ? formatNumber(getAggregatedMetrics().totalFollowers)
                          : "-"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Followers
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {analyticsData
                          ? formatNumber(getAggregatedMetrics().totalViews)
                          : "-"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Views
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {analyticsData ? calculateEngagementRate() : "-"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Engagement Rate
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {analyticsData
                          ? formatNumber(getAggregatedMetrics().totalContent)
                          : "-"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Content Pieces
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Platform Performance</CardTitle>
                <CardDescription>
                  Analytics breakdown by social media platform
                  {analyticsLoading && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (Loading...)
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">YouTube</span>
                    </div>
                    <span className="text-sm font-medium">
                      {analyticsData && getPlatformMetrics("youtube")
                        ? `${formatNumber(
                            getPlatformMetrics("youtube")?.subscribers || 0
                          )} subscribers`
                        : "Loading..."}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                      <span className="text-sm">Instagram</span>
                    </div>
                    <span className="text-sm font-medium">
                      {analyticsData && getPlatformMetrics("instagram")
                        ? `${formatNumber(
                            getPlatformMetrics("instagram")?.followers || 0
                          )} followers`
                        : "Loading..."}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      <span className="text-sm">Facebook</span>
                    </div>
                    <span className="text-sm font-medium">
                      {analyticsData && getPlatformMetrics("facebook")
                        ? `${formatNumber(
                            getPlatformMetrics("facebook")?.followers || 0
                          )} followers`
                        : "Loading..."}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-black rounded-full"></div>
                      <span className="text-sm">X/Twitter</span>
                    </div>
                    <span className="text-sm font-medium">
                      {analyticsData && getPlatformMetrics("twitter")
                        ? `${formatNumber(
                            getPlatformMetrics("twitter")?.followers || 0
                          )} followers`
                        : "Loading..."}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">TikTok</span>
                    </div>
                    <span className="text-sm font-medium">
                      {analyticsData && getPlatformMetrics("tiktok")
                        ? `${formatNumber(
                            getPlatformMetrics("tiktok")?.followers || 0
                          )} followers`
                        : "Loading..."}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-800 rounded-full"></div>
                      <span className="text-sm">LinkedIn</span>
                    </div>
                    <span className="text-sm font-medium">
                      {analyticsData && getPlatformMetrics("linkedin")
                        ? `${formatNumber(
                            getPlatformMetrics("linkedin")?.followers || 0
                          )} followers`
                        : "Loading..."}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    <strong>Note:</strong> Analytics data may take 24-48 hours
                    to update. Some platforms require minimum follower counts
                    for demographic data.
                  </p>
                  {analyticsData && (
                    <p className="text-xs text-muted-foreground mt-2">
                      <strong>Last Updated:</strong>{" "}
                      {new Date().toLocaleString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Content Performance</CardTitle>
                  <CardDescription>
                    Detailed metrics by platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Facebook Page Impressions
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {analyticsData && getPlatformMetrics("facebook")
                          ? formatNumber(
                              getPlatformMetrics("facebook")?.impressions || 0
                            )
                          : "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Instagram Views (180 days)
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {analyticsData && getPlatformMetrics("instagram")
                          ? formatNumber(
                              getPlatformMetrics("instagram")?.views || 0
                            )
                          : "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        YouTube Video Views
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {analyticsData && getPlatformMetrics("youtube")
                          ? formatNumber(
                              getPlatformMetrics("youtube")?.views || 0
                            )
                          : "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        TikTok Profile Views
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {analyticsData && getPlatformMetrics("tiktok")
                          ? formatNumber(getPlatformMetrics("tiktok")?.views || 0)
                          : "-"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Engagement Metrics</CardTitle>
                  <CardDescription>
                    Interaction and engagement data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Facebook Reactions
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {analyticsData && getPlatformMetrics("facebook")
                          ? formatNumber(
                              getPlatformMetrics("facebook")?.reactions || 0
                            )
                          : "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Instagram Likes
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {analyticsData && getPlatformMetrics("instagram")
                          ? formatNumber(getPlatformMetrics("instagram")?.likes || 0)
                          : "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">YouTube Likes</span>
                      <span className="text-sm text-muted-foreground">
                        {analyticsData && getPlatformMetrics("youtube")
                          ? formatNumber(getPlatformMetrics("youtube")?.likes || 0)
                          : "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        TikTok Comments
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {analyticsData && getPlatformMetrics("tiktok")
                          ? formatNumber(getPlatformMetrics("tiktok")?.comments || 0)
                          : "-"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="videos" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Video Clips</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your AI-generated video content
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={refreshVideoClips}
                  variant="outline"
                  size="sm"
                  disabled={videoClipsLoading}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${
                      videoClipsLoading ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </Button>
                <VideoUploadModal />
              </div>
            </div>

            {videoClipsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">
                    Loading video clips...
                  </p>
                </div>
              </div>
            ) : videoClipsError ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="text-red-500 mb-4">
                    <Video className="h-12 w-12 mx-auto" />
                  </div>
                  <p className="text-red-600 font-medium">
                    Failed to load video clips
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">
                    {videoClipsError}
                  </p>
                  <Button
                    onClick={refreshVideoClips}
                    className="mt-4"
                    size="sm"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            ) : videoClips.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="text-muted-foreground mb-4">
                    <Video className="h-12 w-12 mx-auto" />
                  </div>
                  <p className="text-muted-foreground font-medium">
                    No video clips found
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Upload your first video to get started
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {videoClips
                  .sort(
                    (a, b) =>
                      new Date(b.timeCreated).getTime() -
                      new Date(a.timeCreated).getTime()
                  )
                  .map((video) => (
                    <Card key={video.id}>
                      <CardContent className="p-4">
                        {/* Inline Video Player */}
                        <div className="aspect-[9/16] relative mb-4 overflow-hidden rounded-lg bg-black">
                          <video
                            className="w-full h-full object-cover"
                            controls
                            preload="metadata"
                            muted
                            onLoadedData={(e) => {
                              const video = e.currentTarget;
                              video.currentTime = 0.1;
                              video
                                .play()
                                .then(() => {
                                  setTimeout(() => {
                                    video.pause();
                                  }, 100);
                                })
                                .catch(() => {
                                  // Ignore autoplay errors
                                });
                            }}
                          >
                            <source
                              src={video.mediaLink}
                              type={video.contentType}
                            />
                            Your browser does not support the video tag.
                          </video>
                          <div className="absolute top-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                            {VideoClipsService.getVideoTypeFromName(video.name)}
                          </div>
                          <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                            {VideoClipsService.formatFileSize(video.size)}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium truncate text-sm">
                              {video.name}
                            </h4>
                            <Badge
                              variant={
                                VideoClipsService.getVideoStatus(video) ===
                                "completed"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {VideoClipsService.getVideoStatus(video)}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div className="flex items-center justify-between">
                              <span>Bucket:</span>
                              <span className="font-mono">{video.bucket}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Type:</span>
                              <span>{video.contentType}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Created:</span>
                              <span>
                                {VideoClipsService.formatDate(
                                  video.timeCreated
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-xs text-muted-foreground">
                              ID: {video.id.split("/").pop()}
                            </span>
                          </div>

                          {/* Action Buttons Row */}
                          <div className="flex justify-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 h-8 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                              title="Download Video"
                              onClick={() => {
                                const link = document.createElement("a");
                                link.href = video.mediaLink;
                                link.download = video.name;
                                link.target = "_blank";
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              <span className="text-gray-900 dark:text-gray-100">
                                Download
                              </span>
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 h-8 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                              title="Post to Social Media"
                              onClick={() => handleOpenPostModal(video)}
                            >
                              <Share2 className="h-4 w-4 mr-1" />
                              <span className="text-gray-900 dark:text-gray-100">
                                Post
                              </span>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="images" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">AI Generated Images</h3>
                <p className="text-sm text-muted-foreground">
                  Your AI-created visual content library
                </p>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Generate Image
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {aiImages.map((image) => (
                <Card key={image.id}>
                  <CardContent className="p-4">
                    <div className="aspect-square relative mb-4 overflow-hidden rounded-lg bg-muted">
                      <img
                        src={image.url}
                        alt={image.title || "AI generated image"}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">{image.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {image.prompt}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{image.style}</Badge>
                        <span className="text-sm text-muted-foreground">
                          <Download className="mr-1 h-3 w-3 inline" />
                          {image.downloads}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {image.createdAt}
                        </span>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Social Media Integration</h3>
              <p className="text-sm text-muted-foreground">
                Connect and manage your social media accounts through Ayrshare
              </p>
            </div>

            {/* Social Media Integration Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Social Media Integration
                </CardTitle>
                <CardDescription>
                  Connect additional social media accounts using Ayrshare&apos;s
                  secure integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* SSO Login Button with Details */}
                <SSOLoginButton showDetails={true} className="w-full" />

                {/* Integration Test Component */}
                <AyrshareTest />

                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                      <Share2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                        Connect More Platforms
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                        Add new social media accounts to expand your reach.
                        Connect platforms like TikTok, LinkedIn, Pinterest, and
                        more through our secure integration.
                      </p>
                      <Button
                        onClick={handleSocialIntegration}
                        disabled={
                          isGeneratingJWT ||
                          !(user?.publicMetadata?.profileKey || user?.id)
                        }
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {isGeneratingJWT ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Generating Link...
                          </>
                        ) : (
                          <>
                            <Share2 className="h-4 w-4 mr-2" />
                            Connect Social Accounts
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={async () => {
                          try {
                            const response = await fetch("/api/ayrshare/debug");
                            if (response.ok) {
                              const data = await response.json();
                              console.log("PEM Diagnostics:", data);
                              if (data.summary.hasValidPrivateKey) {
                                alert(
                                  `✅ PEM found from: ${data.summary.privateKeySource}`
                                );
                              } else {
                                alert(
                                  `❌ No valid PEM found. Check console for details.`
                                );
                              }
                            }
                          } catch (error) {
                            console.error("Debug failed:", error);
                            alert("Debug failed. Check console.");
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="ml-2"
                      >
                        Debug PEM
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Currently Connected Accounts */}
                {ayrshareData?.activeSocialAccounts &&
                  ayrshareData.activeSocialAccounts.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">
                        Currently Connected Accounts
                      </h4>
                      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                        {ayrshareData.activeSocialAccounts.map((platform) => (
                          <div
                            key={platform}
                            className="flex items-center gap-2 p-3 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 rounded-lg"
                          >
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium capitalize text-green-800 dark:text-green-200">
                              {platform === "gmb"
                                ? "Google Business"
                                : platform}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>
                    • Integration links are valid for 5 minutes for security
                  </p>
                  <p>
                    • You&apos;ll be redirected to Ayrshare&apos;s secure
                    connection page
                  </p>
                  <p>• New connections will appear here after linking</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Profile</h3>
              <p className="text-sm text-muted-foreground">
                Manage your account information and profile details
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Your account details and profile information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src={user?.imageUrl || "https://via.placeholder.com/64"}
                      />
                      <AvatarFallback>
                        {user?.firstName?.[0] || user?.lastName?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h4 className="font-medium text-lg">
                        {user?.firstName} {user?.lastName}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {user?.emailAddresses[0]?.emailAddress}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Member since:{" "}
                        {new Date(user?.createdAt || "").toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">User ID</span>
                      <span className="text-sm text-muted-foreground font-mono">
                        {user?.id}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Username</span>
                      <span className="text-sm text-muted-foreground">
                        {user?.username || "Not set"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Phone Number</span>
                      <span className="text-sm text-muted-foreground">
                        {user?.phoneNumbers?.[0]?.phoneNumber || "Not provided"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Email Verified
                      </span>
                      <Badge
                        variant={
                          user?.emailAddresses[0]?.verification?.status ===
                          "verified"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {user?.emailAddresses[0]?.verification?.status ||
                          "Unknown"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Statistics</CardTitle>
                  <CardDescription>
                    Your content creation and platform activity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {videoClips?.length || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Video Clips
                      </div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {ayrshareData?.activeSocialAccounts?.length || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Connected Platforms
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Profile Key</span>
                      <span className="text-sm text-muted-foreground font-mono">
                        {user?.publicMetadata?.profileKey ||
                          user?.id ||
                          "Unknown"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Account Type</span>
                      <Badge>{ayrshareData?.title || "User Profile"}</Badge>
                    </div>
                    {ayrshareData?.monthlyPostQuota && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          Monthly Posts
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {ayrshareData.monthlyPostCount || 0} /{" "}
                          {ayrshareData.monthlyPostQuota}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">API Calls</span>
                      <span className="text-sm text-muted-foreground">
                        {ayrshareData?.monthlyApiCalls || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notifications and Billing sections removed */}
            </div>
          </TabsContent>
        </Tabs>

        {/* Post Video Modal */}
        {selectedVideoForPost && (
          <PostVideoModal
            isOpen={isPostModalOpen}
            onClose={handleClosePostModal}
            video={selectedVideoForPost}
          />
        )}
      </div>
    </div>
  );
}
