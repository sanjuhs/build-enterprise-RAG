"use client";

// import { useState } from "react";
import { AuthProvider } from "@/components/providers/auth-provider";
import { NavBar } from "@/components/shared/nav-bar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploader } from "@/components/upload/file-uploader";
import { UploadStatus } from "@/components/upload/upload-status";

export default function UploadDashboardPage() {
  return (
    <AuthProvider requiredRoles={["user", "admin"]}>
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="container mx-auto p-6 flex-1">
          <h1 className="text-2xl font-bold mb-6">File Upload Dashboard</h1>

          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload Files</TabsTrigger>
              <TabsTrigger value="status">Upload Status</TabsTrigger>
            </TabsList>

            <TabsContent value="upload">
              <FileUploader />
            </TabsContent>

            <TabsContent value="status">
              <UploadStatus />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthProvider>
  );
}
