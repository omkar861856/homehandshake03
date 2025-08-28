"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAyrshareData } from "@/hooks/useAyrshareData";

import { VideoClip } from "@/lib/videoClips";
import React, { useState } from "react";

interface PostVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: VideoClip;
}

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

interface PlatformConfig {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  maxLength: number;
  fields: string[];
  options: Record<
    string,
    {
      type: string;
      label: string;
      placeholder?: string;
      required?: boolean;
    }
  >;
}

const platformConfigs: Record<string, PlatformConfig> = {
  twitter: {
    name: "Twitter",
    icon: ({ className }: { className?: string }) => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    maxLength: 280,
    fields: ["sensitive", "replyTo"],
    options: {
      sensitive: {
        type: "switch",
        label: "Mark as sensitive content",
        required: false,
      },
      replyTo: {
        type: "input",
        label: "Reply to tweet ID",
        placeholder: "Enter tweet ID to reply to",
        required: false,
      },
    },
  },
  instagram: {
    name: "Instagram",
    icon: ({ className }: { className?: string }) => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
    maxLength: 2200,
    fields: ["location", "hashtags"],
    options: {
      location: {
        type: "input",
        label: "Location",
        placeholder: "Add location",
        required: false,
      },
      hashtags: {
        type: "input",
        label: "Hashtags",
        placeholder: "#hashtag1 #hashtag2",
        required: false,
      },
    },
  },
  linkedin: {
    name: "LinkedIn",
    icon: ({ className }: { className?: string }) => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.047-1.852-3.047-1.853 0-2.136 1.445-2.136 2.939v5.677H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    maxLength: 3000,
    fields: ["visibility", "language"],
    options: {
      visibility: {
        type: "select",
        label: "Post visibility",
        required: false,
      },
      language: {
        type: "input",
        label: "Language",
        placeholder: "en",
        required: false,
      },
    },
  },
  facebook: {
    name: "Facebook",
    icon: ({ className }: { className?: string }) => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    maxLength: 63206,
    fields: ["privacy", "targeting"],
    options: {
      privacy: {
        type: "select",
        label: "Privacy setting",
        required: false,
      },
      targeting: {
        type: "input",
        label: "Target audience",
        placeholder: "Friends, Public, etc.",
        required: false,
      },
    },
  },
};

export default function PostVideoModal({
  isOpen,
  onClose,
  video,
}: PostVideoModalProps) {
  const { ayrshareData } = useAyrshareData();
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [platformFields, setPlatformFields] = useState<
    Record<string, Record<string, unknown>>
  >({});
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const getConnectedPlatforms = () => {
    if (!ayrshareData?.displayNames) return [];

    return Object.keys(platformConfigs).filter((platformKey) => {
      const platform = ayrshareData.displayNames?.find(
        (p: SocialAccount) =>
          p.platform.toLowerCase() === platformKey.toLowerCase()
      );
      // Check if platform exists and has a username (indicating it's connected)
      return platform && platform.username;
    });
  };

  const handlePlatformFieldChange = (
    platformId: string,
    field: string,
    value: unknown
  ) => {
    setPlatformFields((prev) => ({
      ...prev,
      [platformId]: {
        ...prev[platformId],
        [field]: value,
      },
    }));
  };

  const handlePost = async () => {
    if (selectedPlatforms.length === 0) {
      alert("Please select at least one platform");
      return;
    }

    setIsPosting(true);

    try {
      // Prepare post data for each selected platform
      const postData = selectedPlatforms.map((platformKey) => {
        const fields = platformFields[platformKey] || {};

        return {
          platform: platformKey,
          caption,
          videoUrl: video.mediaLink, // Send the video URL
          ...fields,
        };
      });

      // TODO: Implement actual posting logic here
      console.log("Posting to platforms:", postData);

      // For now, just show success
      alert(`Posting to ${selectedPlatforms.length} platform(s)...`);
      onClose();
    } catch (error) {
      console.error("Error posting:", error);
      alert("Error posting video. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  const getCharacterCount = (text: string) => {
    return text.length;
  };

  const renderField = (
    platformId: string,
    field: string,
    config: Record<string, unknown>
  ) => {
    const value = (platformFields[platformId]?.[field] as unknown) || "";

    switch (config.type as string) {
      case "switch":
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={`${platformId}-${field}`}
              checked={(value as boolean) || false}
              onCheckedChange={(checked) =>
                handlePlatformFieldChange(platformId, field, checked)
              }
            />
            <Label htmlFor={`${platformId}-${field}`} className="text-gray-200">
              {config.label as string}
            </Label>
          </div>
        );

      case "input":
        return (
          <div className="space-y-2">
            <Label htmlFor={`${platformId}-${field}`} className="text-gray-200">
              {config.label as string}
            </Label>
            <Input
              id={`${platformId}-${field}`}
              type="text"
              placeholder={config.placeholder as string}
              value={value as string}
              onChange={(e) =>
                handlePlatformFieldChange(platformId, field, e.target.value)
              }
              className="bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        );

      case "textarea":
        return (
          <div className="space-y-2">
            <Label htmlFor={`${platformId}-${field}`} className="text-gray-200">
              {config.label as string}
            </Label>
            <Textarea
              id={`${platformId}-${field}`}
              placeholder={config.placeholder as string}
              value={value as string}
              onChange={(e) =>
                handlePlatformFieldChange(platformId, field, e.target.value)
              }
              className="bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        );

      case "select":
        return (
          <div className="space-y-2">
            <Label htmlFor={`${platformId}-${field}`} className="text-gray-200">
              {config.label as string}
            </Label>
            <select
              id={`${platformId}-${field}`}
              value={value as string}
              onChange={(e) =>
                handlePlatformFieldChange(platformId, field, e.target.value)
              }
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-gray-100 rounded-md focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select option</option>
              {field === "visibility" && (
                <>
                  <option value="public">Public</option>
                  <option value="connections">Connections</option>
                  <option value="group">Group</option>
                </>
              )}
              {field === "privacy" && (
                <>
                  <option value="everyone">Everyone</option>
                  <option value="friends">Friends</option>
                  <option value="friends-of-friends">Friends of Friends</option>
                  <option value="only-me">Only Me</option>
                </>
              )}
            </select>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  const connectedPlatforms = getConnectedPlatforms();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-100">
                Post Video to Social Media
              </h2>
              <p className="text-gray-400 mt-1">
                Share your video across multiple platforms
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-100"
            >
              ✕
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Video Preview */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-100">
                  {video.name}
                </h3>
                <p className="text-gray-400 text-sm">
                  Size: {video.size} | Type: {video.contentType}
                </p>
              </div>
            </div>
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label
              htmlFor="caption"
              className="text-base font-medium text-gray-100"
            >
              Caption
            </Label>
            <Textarea
              id="caption"
              placeholder="Write a compelling caption for your video..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="min-h-[100px] bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
            />
            <div className="flex justify-between text-sm text-gray-400">
              <span>Character count: {getCharacterCount(caption)}</span>
              <span>Max: 280 (Twitter limit)</span>
            </div>
          </div>

          {/* Platform Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium text-gray-100">
              Select Platforms ({connectedPlatforms.length} connected)
            </Label>

            {connectedPlatforms.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  No social media platforms connected
                </div>
                <div className="text-sm text-gray-500">
                  Please connect your social media accounts in the dashboard
                  first.
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {connectedPlatforms.map((platformKey) => {
                  const platform =
                    platformConfigs[
                      platformKey as keyof typeof platformConfigs
                    ];
                  if (!platform) return null;

                  const isSelected = selectedPlatforms.includes(platformKey);
                  const IconComponent = platform.icon;

                  return (
                    <Card
                      key={platformKey}
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? "ring-2 ring-blue-500 bg-blue-900/20"
                          : "bg-gray-800 hover:bg-gray-700"
                      }`}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedPlatforms((prev) =>
                            prev.filter((p) => p !== platformKey)
                          );
                          // Remove platform fields when deselected
                          setPlatformFields((prev) => {
                            const newFields = { ...prev };
                            delete newFields[platformKey];
                            return newFields;
                          });
                        } else {
                          setSelectedPlatforms((prev) => [
                            ...prev,
                            platformKey,
                          ]);
                        }
                      }}
                    >
                      <CardContent className="p-4 text-center">
                        <IconComponent className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <div className="text-sm font-medium text-gray-200">
                          {platform.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          Max: {platform.maxLength} chars
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Platform-Specific Options */}
          {selectedPlatforms.length > 0 && (
            <div className="space-y-4">
              <Label className="text-base font-medium text-gray-100">
                Platform-Specific Options
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedPlatforms.map((platformKey) => {
                  const platform =
                    platformConfigs[
                      platformKey as keyof typeof platformConfigs
                    ];
                  if (!platform) return null;

                  return (
                    <Card key={platformKey} className="bg-gray-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-gray-100 flex items-center space-x-2">
                          <platform.icon className="w-5 h-5" />
                          <span>{platform.name}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {platform.fields.map((field) => {
                          const fieldConfig =
                            platform.options[
                              field as keyof typeof platform.options
                            ];
                          if (!fieldConfig) return null;

                          return (
                            <div key={field}>
                              {renderField(platformKey, field, fieldConfig)}
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Scheduling */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="scheduling"
                checked={isScheduled}
                onCheckedChange={setIsScheduled}
              />
              <Label
                htmlFor="scheduling"
                className="text-base font-medium text-gray-100"
              >
                Schedule Post
              </Label>
            </div>

            {isScheduled && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduled-date" className="text-gray-200">
                    Date
                  </Label>
                  <Input
                    id="scheduled-date"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduled-time" className="text-gray-200">
                    Time
                  </Label>
                  <Input
                    id="scheduled-time"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-400">
                  {selectedPlatforms.length} platform
                  {selectedPlatforms.length !== 1 ? "s" : ""} selected
                </span>
              </div>
              {isScheduled && (
                <Badge
                  variant="secondary"
                  className="bg-blue-900 text-blue-200"
                >
                  Scheduled for {scheduledDate} at {scheduledTime}
                </Badge>
              )}
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {}}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-gray-100"
              >
                Preview
              </Button>
              <Button
                onClick={handlePost}
                disabled={isPosting || selectedPlatforms.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isPosting ? "Posting..." : "Post Now"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
