import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ImageItem } from "@/types/image-gen";
import { format } from "date-fns";
import { CalendarIcon, RefreshCcw } from "lucide-react";
import Image from "next/image";

interface ReviewTabProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  images: ImageItem[];
  selectedImage: ImageItem | null;
  setSelectedImage: (image: ImageItem | null) => void;
  isLoading: boolean;
  onRefresh: () => void;
}

export function ReviewTab({
  selectedDate,
  setSelectedDate,
  images,
  selectedImage,
  setSelectedImage,
  isLoading,
  onRefresh,
}: ReviewTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {format(selectedDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date: Date | undefined) =>
                  date && setSelectedDate(date)
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCcw
            className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      <div className="space-y-6">
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[300px] overflow-y-auto p-2">
            {images.map((image) => (
              <div
                key={image.fileName}
                className={`
                  relative aspect-video cursor-pointer rounded-lg overflow-hidden
                  transition-all duration-200 transform hover:scale-[1.02]
                  ${
                    selectedImage?.fileName === image.fileName
                      ? "ring-2 ring-blue-500 ring-offset-2 shadow-lg scale-[1.02]"
                      : "border border-gray-200 hover:border-gray-300 shadow-sm"
                  }
                `}
                onClick={() => setSelectedImage(image)}
              >
                <Image
                  src={image.url}
                  alt={image.fileName}
                  fill
                  className="object-cover rounded-lg"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                />
              </div>
            ))}
          </div>
        </div>

        {selectedImage && (
          <div className="flex gap-6">
            <div className="flex-[3] border rounded-lg p-4 bg-white shadow-sm">
              <Image
                src={selectedImage.url}
                alt={selectedImage.fileName}
                width={1024}
                height={768}
                className="w-full h-auto rounded-lg"
              />
            </div>
            <div className="flex-1 space-y-4">
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <h4 className="font-semibold text-gray-700 mb-2">
                  Image Details:
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">File:</span>{" "}
                    {selectedImage.fileName}
                  </p>
                  <p>
                    <span className="font-medium">Created:</span>{" "}
                    {format(new Date(selectedImage.createdAt), "PPp")}
                  </p>
                  <p className="truncate">
                    <span className="font-medium">S3 Path:</span>{" "}
                    {selectedImage.s3Url}
                  </p>
                </div>
              </div>
              <button
                className="w-full py-3 px-4 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg transition-colors shadow-sm"
                onClick={() => {
                  console.log("Post-screen review for:", selectedImage);
                }}
              >
                Post-Screen Review
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
