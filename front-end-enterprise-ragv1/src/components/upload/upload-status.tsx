"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";

interface UploadRecord {
  id: string;
  fileName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  s3Url?: string;
}

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

export function UploadStatus() {
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
                Last Updated
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
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
                    >
                      {upload.fileName}
                    </a>
                  ) : (
                    upload.fileName
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDistanceToNow(new Date(upload.updatedAt), {
                    addSuffix: true,
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDistanceToNow(new Date(upload.createdAt), {
                    addSuffix: true,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
