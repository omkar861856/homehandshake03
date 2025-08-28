"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAyrshare } from "@/contexts/AyrshareContext";
import { useState } from "react";

interface SSOLoginButtonProps {
  className?: string;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
  showDetails?: boolean;
}

export function SSOLoginButton({
  className,
  variant = "default",
  size = "default",
  children = "Connect Social Accounts",
  showDetails = false,
}: SSOLoginButtonProps) {
  const { profileKey, isLoading, error, openSSOLogin, generateSSOUrl } =
    useAyrshare();
  const [isConnecting, setIsConnecting] = useState(false);
  const [ssoUrl, setSsoUrl] = useState<string | null>(null);

  const handleSSOLogin = async () => {
    if (!profileKey) {
      console.error("No profile key available");
      return;
    }

    setIsConnecting(true);
    try {
      console.log("Starting SSO login process...", { profileKey });

      const success = await openSSOLogin({
        expiresIn: 120, // 2 hours - increased for testing
        domain: "id-8ig3h",
        verify: true, // Verify JWT in development
      });

      console.log("SSO login result:", success);

      if (success) {
        console.log("SSO login window opened successfully");
      } else {
        console.error(
          "Failed to open SSO login window - openSSOLogin returned false"
        );
        // Check if there's an error in the context
        console.error("Current context error:", error);
      }
    } catch (err) {
      console.error("Error during SSO login:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleGenerateUrl = async () => {
    if (!profileKey) {
      console.error("No profile key available");
      return;
    }

    try {
      const url = await generateSSOUrl({
        expiresIn: 240, // 4 hours for email links - increased for testing
        domain: "id-8ig3h",
        verify: true,
      });
      setSsoUrl(url);
    } catch (err) {
      console.error("Error generating SSO URL:", err);
    }
  };

  const isDisabled = isLoading || !profileKey || isConnecting;

  if (showDetails) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Social Media Integration</span>
            {profileKey && (
              <Badge variant="secondary" className="text-xs">
                Connected
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Connect your social media accounts to Ayrshare for automated posting
            and analytics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Profile Key:</span>
              <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                {profileKey ? `${profileKey.substring(0, 8)}...` : "Not set"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Domain:</span>
              <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                {process.env.NEXT_PUBLIC_AYRSHARE_DOMAIN || "Not configured"}
              </span>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Button
              onClick={handleSSOLogin}
              disabled={isDisabled}
              className="w-full"
              variant={variant}
              size={size}
            >
              {isConnecting ? "Opening..." : children}
            </Button>

            <Button
              onClick={handleGenerateUrl}
              disabled={isDisabled}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Generate Email Link
            </Button>

            {ssoUrl && (
              <div className="mt-3 p-3 bg-muted rounded-md">
                <p className="text-xs text-muted-foreground mb-2">
                  Generated SSO URL:
                </p>
                <p className="text-xs font-mono break-all">{ssoUrl}</p>
                <Button
                  onClick={() => navigator.clipboard.writeText(ssoUrl)}
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-xs"
                >
                  Copy URL
                </Button>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive font-medium">Error:</p>
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p>• JWT tokens expire in 5 minutes by default</p>
            <p>• Use email links for longer expiration (up to 48 hours)</p>
            <p>
              • Domain:{" "}
              {process.env.NEXT_PUBLIC_AYRSHARE_DOMAIN || "Not configured"}{" "}
              (your Ayrshare domain)
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Button
      onClick={handleSSOLogin}
      disabled={isDisabled}
      className={className}
      variant={variant}
      size={size}
    >
      {isConnecting ? "Opening..." : children}
    </Button>
  );
}
