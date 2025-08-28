import { VideoClip, VideoClipsService } from "@/lib/videoClips";
import { useEffect, useState } from "react";

export function useVideoClips() {
  const [videoClips, setVideoClips] = useState<VideoClip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideoClips = async () => {
    try {
      setLoading(true);
      setError(null);
      const clips = await VideoClipsService.fetchVideoClips();
      setVideoClips(clips);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch video clips"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideoClips();
  }, []);

  const refreshVideoClips = () => {
    fetchVideoClips();
  };

  return {
    videoClips,
    loading,
    error,
    refreshVideoClips,
  };
}
