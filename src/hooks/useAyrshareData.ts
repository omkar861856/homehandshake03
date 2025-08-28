"use client";

import type { AyrshareUserResponse } from "@/lib/ayrshare";
import { useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";

export function useAyrshareData() {
  const { user, isLoaded } = useUser();
  const [ayrshareData, setAyrshareData] = useState<AyrshareUserResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAyrshareData = useCallback(async () => {
    if (!isLoaded || !user) return;

    // Get profile key from user metadata
    const profileKey = user.publicMetadata?.["Profile-Key"] as string;
    if (!profileKey) {
      setError("Profile key not found");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = new URL("/api/ayrshare/user", window.location.origin);
      if (profileKey) {
        url.searchParams.set("profileKey", profileKey);
      }
      url.searchParams.set("instagramDetails", "true");

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setAyrshareData(data);
      }
    } catch (err) {
      console.error("Error fetching Ayrshare data:", err);
      setError("Error fetching social media data");
    } finally {
      setLoading(false);
    }
  }, [user, isLoaded]);

  useEffect(() => {
    fetchAyrshareData();
  }, [user, isLoaded, fetchAyrshareData]);

  // Get profile key from user metadata
  const profileKey = user?.publicMetadata?.["Profile-Key"] as string;

  return {
    ayrshareData,
    loading,
    error,
    refetch: fetchAyrshareData,
    profileKey,
  };
}
