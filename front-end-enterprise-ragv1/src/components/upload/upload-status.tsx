"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow, parseISO } from "date-fns"; // format
import { Loader2, Trash2 } from "lucide-react";

interface UploadRecord {
  id: string;
  fileName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  s3Url?: string;
  metadata?: Record<string, MetadataValue>;
  visibility?: "public" | "private";
}

type MetadataValue =
  | string
  | number
  | boolean
  | null
  | MetadataValue[]
  | { [key: string]: MetadataValue };

function getStatusColor(status: string) {
  switch (status) {
    case "pending_upload":
      return "bg-yellow-100 text-yellow-800";
    case "uploading_to_s3":
      return "bg-blue-100 text-blue-800";
    case "uploaded_to_s3":
      return "bg-green-100 text-green-800";
    case "upload_failed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function truncateFileName(fileName: string, maxLength: number = 50) {
  if (fileName.length <= maxLength) return fileName;
  const extension = fileName.split(".").pop();
  const nameWithoutExt = fileName.slice(0, fileName.lastIndexOf("."));
  const truncatedName = nameWithoutExt.slice(
    0,
    maxLength - 3 - (extension?.length || 0)
  );
  return `${truncatedName}...${extension ? `.${extension}` : ""}`;
}

function getVisibilityBadge(visibility: string = "private") {
  return visibility === "public"
    ? "bg-green-100 text-green-800"
    : "bg-gray-100 text-gray-800";
}

function formatDate(dateString: string) {
  const date = parseISO(dateString);
  const now = new Date();

  // If less than 5 minutes old
  const minutesAgo = (now.getTime() - date.getTime()) / (1000 * 60);
  if (minutesAgo < 5) {
    return "just now";
  }

  return formatDistanceToNow(date, {
    addSuffix: true,
    includeSeconds: false,
  });
}

export function UploadStatus() {
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUploadHistory();
    // Set up polling for updates every 5 seconds
    const interval = setInterval(fetchUploadHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchUploadHistory = async () => {
    try {
      const response = await fetch("/api/uploads/history");
      if (!response.ok) {
        throw new Error("Failed to fetch upload history");
      }
      const data = await response.json();
      setUploads(data);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch upload history:", error);
      setError("Failed to load upload history");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (uploadId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this file? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeletingId(uploadId);
    try {
      const response = await fetch(`/api/uploads/${uploadId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete file");
      }

      // Remove the deleted item from the local state
      setUploads((prevUploads) =>
        prevUploads.filter((upload) => upload.id !== uploadId)
      );
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Failed to delete file. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                File Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Visibility
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Metadata
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {uploads.map((upload) => (
              <tr key={upload.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {upload.s3Url ? (
                    <a
                      href={upload.s3Url}
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      title={upload.fileName}
                    >
                      {truncateFileName(upload.fileName)}
                    </a>
                  ) : (
                    <span title={upload.fileName}>
                      {truncateFileName(upload.fileName)}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                      upload.status
                    )}`}
                  >
                    {upload.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getVisibilityBadge(
                      upload.visibility
                    )}`}
                  >
                    {upload.visibility || "private"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {upload.metadata &&
                  Object.keys(upload.metadata).length > 0 ? (
                    <div className="max-w-xs overflow-hidden">
                      <pre className="text-xs text-gray-600 overflow-x-auto">
                        {JSON.stringify(upload.metadata, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(upload.updatedAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(upload.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleDelete(upload.id)}
                    disabled={deletingId === upload.id}
                    className={`text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors
                      ${
                        deletingId === upload.id
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    title="Delete file"
                  >
                    {deletingId === upload.id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Trash2 className="h-5 w-5" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
