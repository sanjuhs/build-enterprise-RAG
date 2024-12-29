"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
// import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
// import { useToast } from "@/components/ui/use-toast";
import { useToast } from "@/hooks/use-toast";

import { generatePresignedUrl } from "@/lib/s3-utils";

interface FileUpload {
  file: File;
  progress: number;
  status: "waiting" | "uploading" | "completed" | "error";
  error?: string;
  documentId?: number;
}

export function FileUploader() {
  const [uploads, setUploads] = useState<FileUpload[]>([]);
  const { toast } = useToast();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      console.log(
        "Files received:",
        acceptedFiles.map((f) => f.name)
      );

      // Create initial upload entries
      const newUploads = acceptedFiles.map((file) => ({
        file,
        progress: 0,
        status: "waiting" as const,
      }));

      // Add new uploads to state
      setUploads((prev) => [...prev, ...newUploads]);

      // Process files sequentially instead of using forEach
      for (let i = 0; i < newUploads.length; i++) {
        const upload = newUploads[i];
        const uploadIndex = uploads.length + i; // Calculate correct index

        try {
          console.log(`Getting presigned URL for ${upload.file.name}...`);

          // Create initial document record
          const createResponse = await fetch("/api/documents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileName: upload.file.name,
              status: "pending_upload",
            }),
          });

          if (!createResponse.ok) {
            throw new Error("Failed to create document record");
          }

          const { documentId } = await createResponse.json();

          // Update local state with document ID
          setUploads((prev) => {
            const updated = [...prev];
            updated[uploadIndex] = {
              ...updated[uploadIndex],
              documentId,
              status: "uploading",
              progress: 10,
            };
            return updated;
          });

          const presignedUrl = await generatePresignedUrl(upload.file.name);
          console.log("Received presigned URL:", presignedUrl);

          // Update document status to uploading
          await fetch("/api/documents", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              documentId,
              status: "uploading_to_s3",
            }),
          });

          // Update progress
          setUploads((prev) => {
            const updated = [...prev];
            updated[uploadIndex] = { ...updated[uploadIndex], progress: 30 };
            return updated;
          });

          console.log(`Starting upload to S3 for ${upload.file.name}...`);
          const response = await fetch(presignedUrl.url, {
            method: "PUT",
            body: upload.file,
            headers: {
              "Content-Type": upload.file.type,
            },
          });

          console.log(`S3 upload response status:`, response.status);

          if (!response.ok) {
            console.error(`Upload failed with status ${response.status}`);
            throw new Error(`Upload failed with status ${response.status}`);
          }

          console.log(`Upload completed for ${upload.file.name}`);

          // After successful S3 upload
          await fetch("/api/documents", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              documentId,
              s3Url: presignedUrl.url,
              status: "uploaded_to_s3",
            }),
          });

          setUploads((prev) => {
            const updated = [...prev];
            updated[uploadIndex] = {
              ...updated[uploadIndex],
              status: "completed",
              progress: 100,
            };
            return updated;
          });

          toast({
            title: "Success",
            description: `${upload.file.name} uploaded successfully`,
          });
        } catch (error) {
          console.error(`Upload error for ${upload.file.name}:`, error);
          setUploads((prev) => {
            const updated = [...prev];
            updated[uploadIndex] = {
              ...updated[uploadIndex],
              status: "error",
              error: error instanceof Error ? error.message : "Upload failed",
              progress: 0,
            };
            return updated;
          });

          toast({
            title: "Error",
            description: `Failed to upload ${upload.file.name}`,
            variant: "destructive",
          });

          // Update document status on error if we have a document ID
          if (uploads[uploadIndex]?.documentId) {
            await fetch("/api/documents", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                documentId: uploads[uploadIndex].documentId,
                status: "upload_failed",
              }),
            });
          }
        }
      }
    },
    [uploads.length]
  ); // Add uploads.length as dependency

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-12
          flex flex-col items-center justify-center
          cursor-pointer transition-colors
          ${isDragActive ? "border-primary bg-primary/10" : "border-gray-300"}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Drag and drop files here, or click to select files
        </p>
      </div>

      {uploads.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold">Uploads</h3>
          {uploads.map((upload, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{upload.file.name}</span>
                <span>{upload.status}</span>
              </div>
              <Progress value={upload.progress} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
