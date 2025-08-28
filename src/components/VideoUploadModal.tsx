"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from "@/components/ui/modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  FileText,
  Link2,
  Upload,
  Video,
  Youtube,
} from "lucide-react";
import React, { useState } from "react";

// Video Platform Types
interface VideoPlatform {
  id: number;
  name: string;
  icon: React.ReactNode;
  placeholder: string;
  extensions?: string[];
}

interface VideoFormData {
  sourceType: number;
  videoUrl: string;
  videoFile?: File;
}

interface ValidationErrors {
  videoUrl?: string;
  fileExtension?: string;
}

// Video Upload Modal Component
const VideoUploadModalContent = () => {
  const [formData, setFormData] = useState<VideoFormData>({
    sourceType: 1,
    videoUrl: "",
    videoFile: undefined,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const videoPlatforms: VideoPlatform[] = [
    {
      id: 1,
      name: "Remote video file",
      icon: <Video className="w-4 h-4" />,
      placeholder: "https://example.com/video.mp4",
      extensions: ["mp4", "3gp", "avi", "mov"],
    },
    {
      id: 2,
      name: "YouTube",
      icon: <Youtube className="w-4 h-4" />,
      placeholder: "https://youtube.com/watch?v=...",
    },
    {
      id: 3,
      name: "Google Drive",
      icon: <FileText className="w-4 h-4" />,
      placeholder: "https://drive.google.com/file/d/...",
    },
    {
      id: 4,
      name: "Vimeo",
      icon: <Video className="w-4 h-4" />,
      placeholder: "https://vimeo.com/...",
    },
    {
      id: 5,
      name: "StreamYard",
      icon: <Video className="w-4 h-4" />,
      placeholder: "https://streamyard.com/...",
    },
    {
      id: 6,
      name: "TikTok",
      icon: <Video className="w-4 h-4" />,
      placeholder: "https://tiktok.com/@user/video/...",
    },
    {
      id: 7,
      name: "Twitter",
      icon: <Video className="w-4 h-4" />,
      placeholder: "https://twitter.com/user/status/...",
    },
    {
      id: 8,
      name: "Rumble",
      icon: <Video className="w-4 h-4" />,
      placeholder: "https://rumble.com/...",
    },
    {
      id: 9,
      name: "Twitch",
      icon: <Video className="w-4 h-4" />,
      placeholder: "https://twitch.tv/videos/...",
    },
    {
      id: 10,
      name: "Loom",
      icon: <Video className="w-4 h-4" />,
      placeholder: "https://loom.com/share/...",
    },
    {
      id: 11,
      name: "Facebook",
      icon: <Video className="w-4 h-4" />,
      placeholder: "https://facebook.com/watch?v=...",
    },
    {
      id: 12,
      name: "LinkedIn",
      icon: <Video className="w-4 h-4" />,
      placeholder: "https://linkedin.com/posts/...",
    },
  ];

  const selectedPlatform = videoPlatforms.find(
    (p) => p.id === formData.sourceType
  );

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (formData.sourceType === 1) {
      // For remote video files, require file upload only
      if (!formData.videoFile) {
        newErrors.videoUrl = "Please upload a video file";
      }
    } else {
      // For other platforms, URL is required
      if (!formData.videoUrl.trim()) {
        newErrors.videoUrl = "Video URL is required";
      } else if (!isValidUrl(formData.videoUrl)) {
        newErrors.videoUrl = "Please enter a valid URL";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the payload according to the API specification
      const payload = {
        sourceType: formData.sourceType,
        videoUrl: formData.sourceType === 1 ? "" : formData.videoUrl, // Empty for remote video files
        platform: selectedPlatform?.name,
        timestamp: new Date().toISOString(),
      };

      // Post to webhook
      const webhookUrl = "/api/webhook-proxy";

      let response: Response;

      if (formData.sourceType === 1 && formData.videoFile) {
        // For remote video files (type 1), send the video file and source type
        const formDataToSend = new FormData();

        // Ensure the file is properly appended
        formDataToSend.append(
          "videoFile",
          formData.videoFile,
          formData.videoFile.name
        );

        formDataToSend.append("sourceType", formData.sourceType.toString());

        // Add additional metadata
        formDataToSend.append("fileName", formData.videoFile.name);
        formDataToSend.append("fileSize", formData.videoFile.size.toString());
        formDataToSend.append("fileType", formData.videoFile.type);

        try {
          response = await fetch(webhookUrl, {
            method: "POST",
            body: formDataToSend,
          });
        } catch (fetchError) {
          if (fetchError instanceof Error) {
            // If it's a CORS or network issue, try to provide helpful error message
            if (fetchError.message.includes("Failed to fetch")) {
              throw new Error(
                "Cannot reach the webhook. This might be due to CORS restrictions or the webhook being unreachable. Check the webhook URL and ensure it's accessible from your domain."
              );
            }
            throw new Error(`Network error: ${fetchError.message}`);
          } else {
            throw new Error(`Network error: ${String(fetchError)}`);
          }
        }
      } else {
        // For other cases, send as JSON with full payload
        response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let result;
      try {
        result = await response.json();
      } catch {
        result = {};
      }

      alert(
        `Video submitted successfully!\n\nPlatform: ${
          selectedPlatform?.name
        }\nSource Type: ${formData.sourceType}${
          formData.sourceType === 1
            ? `\nFile: ${
                formData.videoFile?.name || "Uploaded file"
              } sent to webhook`
            : `\nURL: ${formData.videoUrl} sent to webhook`
        }\n\nData sent to webhook successfully!`
      );

      // Reset form
      setFormData({
        sourceType: 1,
        videoUrl: "",
        videoFile: undefined,
      });
      setErrors({});
    } catch (error) {
      alert(
        "Submission failed. Please try again.\n\nError: " +
          (error as Error).message
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof VideoFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear related errors
    if (field === "videoUrl" && errors.videoUrl) {
      setErrors((prev) => ({ ...prev, videoUrl: undefined }));
    }
    if (field === "videoFile" && errors.fileExtension) {
      setErrors((prev) => ({ ...prev, fileExtension: undefined }));
    }
  };

  return (
    <>
      <ModalContent className="max-w-2xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Add Video</h2>
            <p className="text-gray-600">
              Add videos from various platforms or upload your own files
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
            id="video-upload-form"
          >
            {/* Video Platform Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-900">
                Video Platform
              </Label>
              <Select
                value={formData.sourceType.toString()}
                onValueChange={(value) =>
                  handleInputChange("sourceType", parseInt(value))
                }
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    {selectedPlatform?.icon}
                    <span>{selectedPlatform?.name}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {videoPlatforms.map((platform) => (
                    <SelectItem
                      key={platform.id}
                      value={platform.id.toString()}
                    >
                      <div className="flex items-center gap-2">
                        {platform.icon}
                        <span>{platform.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Video URL Input (only for non-remote video types) */}
            {formData.sourceType !== 1 && (
              <div className="space-y-2">
                <Label
                  htmlFor="videoUrl"
                  className="text-base font-semibold text-gray-900"
                >
                  Video URL
                </Label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="videoUrl"
                    type="url"
                    placeholder={selectedPlatform?.placeholder}
                    value={formData.videoUrl}
                    onChange={(e) =>
                      handleInputChange("videoUrl", e.target.value)
                    }
                    className={cn(
                      "pl-10",
                      errors.videoUrl && "border-red-500 focus:ring-ring"
                    )}
                  />
                </div>
                {errors.videoUrl && (
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    {errors.videoUrl}
                  </div>
                )}
              </div>
            )}

            {/* File Upload (only for remote video files) */}
            {formData.sourceType === 1 && (
              <div className="space-y-2">
                <Label className="text-base font-semibold text-gray-900">
                  Upload Video File
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    id="videoFile"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Update form data with the file
                        setFormData((prev) => {
                          const newData = { ...prev, videoFile: file };
                          return newData;
                        });
                      }
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="videoFile"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    <div className="text-sm text-gray-600">
                      <span className="font-medium text-blue-600 hover:text-blue-500">
                        Click to upload
                      </span>{" "}
                      or drag and drop
                    </div>
                    <p className="text-xs text-gray-500">
                      MP4, 3GP, AVI, MOV up to 100MB
                    </p>
                  </label>
                </div>
                {formData.videoFile && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Video className="w-4 h-4" />
                    <span>{formData.videoFile.name}</span>
                    <span className="text-gray-500">
                      ({(formData.videoFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      </ModalContent>

      <ModalFooter className="gap-3">
        <Button
          variant="outline"
          onClick={() => {
            setFormData({
              sourceType: 1,
              videoUrl: "",
              videoFile: undefined,
            });
            setErrors({});
          }}
          disabled={isSubmitting}
        >
          Reset
        </Button>
        <Button
          type="submit"
          form="video-upload-form"
          className="bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Add Video
            </>
          )}
        </Button>
      </ModalFooter>
    </>
  );
};

// Main Component Export
export const VideoUploadModal = () => {
  return (
    <Modal>
      <ModalTrigger>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Upload className="w-4 h-4 mr-2" />
          Add Video
        </Button>
      </ModalTrigger>
      <ModalBody>
        <VideoUploadModalContent />
      </ModalBody>
    </Modal>
  );
};
