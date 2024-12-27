"use client";

import { AuthProvider } from "@/components/providers/auth-provider";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Upload, FileText } from "lucide-react";
import { NavBar } from "@/components/shared/nav-bar";

export default function ProfilePage() {
  const { data: session } = useSession();

  return (
    <AuthProvider requiredRoles={["user", "admin"]}>
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="container mx-auto p-6 max-w-4xl flex-1">
          <h1 className="text-2xl font-bold mb-8">Profile & Settings</h1>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" defaultValue={session?.user?.name || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      defaultValue={session?.user?.email || ""}
                      disabled
                    />
                  </div>
                  <Button>Save Changes</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>App Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Dark Mode</Label>
                      <div className="text-sm text-muted-foreground">
                        Toggle dark/light theme
                      </div>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <div className="text-sm text-muted-foreground">
                        Receive email updates about your queries
                      </div>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="files">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Documents</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Upload className="h-8 w-8 text-gray-400" />
                        <div className="text-sm text-center">
                          <p>Drag and drop your files here, or</p>
                          <Button variant="link" className="text-blue-500">
                            browse files
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Supported formats: PDF, DOCX, TXT (Max 10MB)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>My Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <DocumentItem
                        name="Project Report.pdf"
                        size="2.4 MB"
                        date="2024-02-20"
                      />
                      <DocumentItem
                        name="Meeting Notes.docx"
                        size="542 KB"
                        date="2024-02-19"
                      />
                      <DocumentItem
                        name="Research Paper.pdf"
                        size="1.8 MB"
                        date="2024-02-18"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthProvider>
  );
}

function DocumentItem({
  name,
  size,
  date,
}: {
  name: string;
  size: string;
  date: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center space-x-3">
        <FileText className="h-5 w-5 text-blue-500" />
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-gray-500">
            {size} • Uploaded on {date}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm">
          View
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-600"
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
