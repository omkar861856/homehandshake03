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

export function AyrshareTest() {
  const { profileKey, isLoading, error, openSSOLogin, generateSSOUrl } =
    useAyrshare();
  const [testResults, setTestResults] = useState<{
    jwtTest: boolean | null;
    ssoTest: boolean | null;
    urlTest: boolean | null;
  }>({
    jwtTest: null,
    ssoTest: null,
    urlTest: null,
  });

  const runJWTTest = async () => {
    if (!profileKey) {
      setTestResults((prev) => ({ ...prev, jwtTest: false }));
      return;
    }

    try {
      const response = await fetch("/api/ayrshare/jwt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileKey, verify: true }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("JWT Test Success:", data);
        setTestResults((prev) => ({ ...prev, jwtTest: true }));
      } else {
        const errorData = await response.json();
        console.error("JWT Test Failed:", errorData);
        setTestResults((prev) => ({ ...prev, jwtTest: false }));
      }
    } catch (error) {
      console.error("JWT Test Error:", error);
      setTestResults((prev) => ({ ...prev, jwtTest: false }));
    }
  };

  const runSSOTest = async () => {
    if (!profileKey) {
      setTestResults((prev) => ({ ...prev, ssoTest: false }));
      return;
    }

    try {
      const success = await openSSOLogin({
        expiresIn: 5,
        domain: "id-8ig3h",
        verify: true,
      });
      setTestResults((prev) => ({ ...prev, ssoTest: success }));
    } catch (error) {
      console.error("SSO Test Error:", error);
      setTestResults((prev) => ({ ...prev, ssoTest: false }));
    }
  };

  const runURLTest = async () => {
    if (!profileKey) {
      setTestResults((prev) => ({ ...prev, urlTest: false }));
      return;
    }

    try {
      const url = await generateSSOUrl({
        expiresIn: 10,
        domain: "id-8ig3h",
        verify: true,
      });
      setTestResults((prev) => ({ ...prev, urlTest: !!url }));
    } catch (error) {
      console.error("URL Test Error:", error);
      setTestResults((prev) => ({ ...prev, urlTest: false }));
    }
  };

  const runAllTests = async () => {
    setTestResults({ jwtTest: null, ssoTest: null, urlTest: null });
    await runJWTTest();
    await runSSOTest();
    await runURLTest();
  };

  const getTestStatus = (test: boolean | null) => {
    if (test === null)
      return { text: "Not Tested", variant: "secondary" as const };
    if (test) return { text: "Passed", variant: "default" as const };
    return { text: "Failed", variant: "destructive" as const };
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Ayrshare Integration Test</span>
          <Badge variant="outline">Testing Tool</Badge>
        </CardTitle>
        <CardDescription>
          Test your Ayrshare integration to ensure everything is working
          correctly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Overview */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{profileKey ? "✅" : "❌"}</div>
            <div className="text-sm text-muted-foreground">Profile Key</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold">
              {isLoading ? "⏳" : error ? "❌" : "✅"}
            </div>
            <div className="text-sm text-muted-foreground">Context</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold">
              {profileKey ? profileKey.substring(0, 8) + "..." : "N/A"}
            </div>
            <div className="text-sm text-muted-foreground">Key Preview</div>
          </div>
        </div>

        <Separator />

        {/* Test Results */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">JWT Generation Test</span>
            <Badge variant={getTestStatus(testResults.jwtTest).variant}>
              {getTestStatus(testResults.jwtTest).text}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">SSO Login Test</span>
            <Badge variant={getTestStatus(testResults.ssoTest).variant}>
              {getTestStatus(testResults.ssoTest).text}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">URL Generation Test</span>
            <Badge variant={getTestStatus(testResults.urlTest).variant}>
              {getTestStatus(testResults.urlTest).text}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Test Actions */}
        <div className="space-y-3">
          <Button
            onClick={runAllTests}
            disabled={isLoading || !profileKey}
            className="w-full"
          >
            Run All Tests
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={runJWTTest}
              disabled={isLoading || !profileKey}
              variant="outline"
              size="sm"
            >
              Test JWT
            </Button>
            <Button
              onClick={runSSOTest}
              disabled={isLoading || !profileKey}
              variant="outline"
              size="sm"
            >
              Test SSO
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive font-medium">Error:</p>
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Test Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• JWT Test: Verifies token generation and validation</p>
          <p>• SSO Test: Opens the social linking page in a new window</p>
          <p>• URL Test: Generates a shareable SSO link</p>
          <p>
            • All tests require a valid profile key and environment
            configuration
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
