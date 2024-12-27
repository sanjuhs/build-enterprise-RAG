"use client";

import { AuthProvider } from "@/components/providers/auth-provider";
import { NavBar } from "@/components/shared/nav-bar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Wallet, LineChart } from "lucide-react";

export default function BillingPage() {
  return (
    <AuthProvider requiredRoles={["user", "admin"]}>
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="container mx-auto p-6 max-w-4xl flex-1">
          <h1 className="text-2xl font-bold mb-8">Billing & Usage</h1>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="payment">Payment Methods</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="h-5 w-5" />
                      Current Usage
                    </CardTitle>
                    <CardDescription>
                      Billing period: Feb 1 - Feb 29
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">API Calls</span>
                        <span className="text-sm font-medium">756 / 1000</span>
                      </div>
                      <Progress value={75.6} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Storage Used</span>
                        <span className="text-sm font-medium">2.1GB / 5GB</span>
                      </div>
                      <Progress value={42} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="h-5 w-5" />
                      Usage History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      Detailed usage metrics and charts will be displayed here
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="payment">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Methods
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <CreditCard className="h-6 w-6" />
                      <div>
                        <p className="font-medium">•••• 4242</p>
                        <p className="text-sm text-muted-foreground">
                          Expires 04/24
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Remove
                    </Button>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Add Payment Method</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthProvider>
  );
}
