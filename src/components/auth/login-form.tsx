"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { requestOTP, verifyOTP } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function LoginForm() {
  const router = useRouter();
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"EMAIL" | "OTP">("EMAIL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await requestOTP(email, role);
    if (res.success) {
      setStep("OTP");
    } else {
      setError(res.error || "Failed to send OTP");
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await verifyOTP(email, otp);
    if (res.success) {
      if (res.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/store");
      }
    } else {
      setError(res.error || "Invalid OTP");
    }
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Sycomp Login</CardTitle>
        <CardDescription>
          Sign in to access your dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="USER" onValueChange={(v) => { setRole(v as "USER"|"ADMIN"); setStep("EMAIL"); setOtp(""); setError(""); }} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="USER">User</TabsTrigger>
            <TabsTrigger value="ADMIN">Admin</TabsTrigger>
          </TabsList>
        </Tabs>

        {error && (
          <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        {step === "EMAIL" ? (
          <form onSubmit={handleRequestOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send OTP Code"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">One-Time Password</Label>
              <Input
                id="otp"
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                className="text-center tracking-widest text-lg"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Code sent to {email}. <button type="button" onClick={() => setStep("EMAIL")} className="text-blue-500 underline">Change</button>
              </p>
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify & Log in"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
