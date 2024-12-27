"use client";

import { AuthProvider } from "@/components/providers/auth-provider";
import { NavBar } from "@/components/shared/nav-bar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  // CardDescription,
  // CardHeader,
  // CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Folder,
  File,
  Search,
  SortAsc,
  Grid2X2,
  List,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

type FileItem = {
  id: string;
  name: string;
  type: "file" | "folder";
  size?: string;
  modified: string;
  path: string[];
};

export default function ExploreFilesPage() {
  const [viewType, setViewType] = useState<"grid" | "list">("list");

  const files: FileItem[] = [
    {
      id: "1",
      name: "Documents",
      type: "folder",
      modified: "2024-02-20",
      path: ["Documents"],
    },
    {
      id: "2",
      name: "Project Files",
      type: "folder",
      modified: "2024-02-19",
      path: ["Project Files"],
    },
    {
      id: "3",
      name: "Report Q4.pdf",
      type: "file",
      size: "2.4 MB",
      modified: "2024-02-18",
      path: ["Documents"],
    },
    {
      id: "4",
      name: "Meeting Notes.docx",
      type: "file",
      size: "542 KB",
      modified: "2024-02-17",
      path: ["Documents"],
    },
  ];

  return (
    <AuthProvider requiredRoles={["user", "admin"]}>
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="container mx-auto p-6 flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Files</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search files..."
                  className="pl-10 w-[300px]"
                />
              </div>
              <Button variant="outline" size="icon">
                <SortAsc className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setViewType(viewType === "grid" ? "list" : "grid")
                }
              >
                {viewType === "grid" ? (
                  <List className="h-4 w-4" />
                ) : (
                  <Grid2X2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {viewType === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {files.map((file) => (
                <Card key={file.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      {file.type === "folder" ? (
                        <Folder className="h-10 w-10 text-blue-500" />
                      ) : (
                        <File className="h-10 w-10 text-gray-500" />
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Open</DropdownMenuItem>
                          <DropdownMenuItem>Share</DropdownMenuItem>
                          <DropdownMenuItem>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-4">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {file.size || "—"} • {file.modified}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Path</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Modified</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {files.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="flex items-center gap-2">
                        {file.type === "folder" ? (
                          <Folder className="h-4 w-4 text-blue-500" />
                        ) : (
                          <File className="h-4 w-4 text-gray-500" />
                        )}
                        {file.name}
                      </TableCell>
                      <TableCell>{file.path.join(" / ")}</TableCell>
                      <TableCell>{file.size || "—"}</TableCell>
                      <TableCell>{file.modified}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Open</DropdownMenuItem>
                            <DropdownMenuItem>Share</DropdownMenuItem>
                            <DropdownMenuItem>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      </div>
    </AuthProvider>
  );
}
