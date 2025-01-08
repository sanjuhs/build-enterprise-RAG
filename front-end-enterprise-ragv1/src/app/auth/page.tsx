"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");
    const csrfResponse = await fetch("/api/auth/csrf");
    const { csrfToken } = await csrfResponse.json();

    // Add token to form data
    formData.append("csrfToken", csrfToken);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Handle error
        console.error(result.error);
      } else {
        router.push("/dashboard"); // Redirect to RAG page
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    try {
      // Create a temporary guest session
      const guestEmail = `guest_${Date.now()}@temp.com`;
      const result = await signIn("credentials", {
        email: guestEmail,
        password: "guest-pass",
        redirect: false,
      });

      if (!result?.error) {
        router.push("/rag");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("signup-email");
    const password = formData.get("signup-password");
    const name = formData.get("name");

    if (!email || !password || !name) return;

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        name,
        action: "signup",
      });

      if (result?.error) {
        console.error(result.error);
      } else {
        router.push("/rag");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side with abstract image */}
      <div className="hidden lg:block w-1/2 relative">
        <Image
          src="/abstract.svg"
          alt="Abstract Design"
          fill
          className="object-cover"
        />
      </div>

      {/* Right side with auth forms */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#f8f9fc]">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#012042]">
              Welcome to super<span className="text-[#028ce5]">RAG</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Your AI-powered document assistant
            </p>
          </div>

          {/* Guest Login Button */}
          <Button
            variant="outline"
            className="w-full border-[#028ce5]/20 hover:bg-[#028ce5]/5"
            onClick={handleGuestLogin}
            disabled={isLoading}
          >
            Continue as Guest
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#f8f9fc] px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger
                value="login"
                className="data-[state=active]:bg-[#028ce5] data-[state=active]:text-white"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="data-[state=active]:bg-[#028ce5] data-[state=active]:text-white"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="border-2 border-[#028ce5]/10 bg-white">
                <CardHeader>
                  <CardTitle className="text-[#012042]">Login</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleLogin}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="name@example.com"
                          className="border-[#028ce5]/20 focus-visible:ring-[#028ce5]"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          className="border-[#028ce5]/20 focus-visible:ring-[#028ce5]"
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-[#028ce5] hover:bg-[#012042]"
                        disabled={isLoading}
                      >
                        {isLoading ? "Loading..." : "Login"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card className="border-2 border-[#028ce5]/10 bg-white">
                <CardHeader>
                  <CardTitle className="text-[#012042]">
                    Create an account
                  </CardTitle>
                  <CardDescription>
                    Enter your details to create your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleSignup}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          name="signup-email"
                          type="email"
                          placeholder="name@example.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <Input
                          id="signup-password"
                          name="signup-password"
                          type="password"
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-[#028ce5] hover:bg-[#012042]"
                        disabled={isLoading}
                      >
                        {isLoading ? "Loading..." : "Create account"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
