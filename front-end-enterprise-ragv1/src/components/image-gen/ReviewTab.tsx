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
import { useState, useEffect } from "react";
import { Guidelines } from "@/types/image-gen";

interface ReviewTabProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  images: ImageItem[];
  selectedImage: ImageItem | null;
  setSelectedImage: (image: ImageItem | null) => void;
  isLoading: boolean;
  onRefresh: () => void;
  guidelines: Guidelines;
}

interface ImageAnalysis {
  isJson: true;
  overallScore: number;
  analyses: Array<{
    category: string;
    score: number;
    feedback: string;
  }>;
  generalImprovements: string[];
}

// Add this interface for raw responses
interface RawAnalysis {
  content: string;
  isJson: false;
}

export function ReviewTab({
  selectedDate,
  setSelectedDate,
  images,
  selectedImage,
  setSelectedImage,
  isLoading,
  onRefresh,
  guidelines,
}: ReviewTabProps) {
  const [analysisResult, setAnalysisResult] = useState<
    ImageAnalysis | RawAnalysis | null
  >(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    console.log("ReviewTab received guidelines:", guidelines);
  }, [guidelines]);

  const handleAnalyzeImage = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    setAnalysisError(null);

    const imageUrl = selectedImage.url.startsWith("s3://")
      ? `https://super-rag.s3.us-east-1.amazonaws.com/${selectedImage.url.replace(
          "s3://super-rag/",
          ""
        )}`
      : selectedImage.url;

    console.log("Using image URL:", imageUrl);

    // Define guidelines to analyze
    const guidelinesList = [
      {
        key: "accessibility",
        name: "Accessibility",
        value: guidelines.accessibility,
      },
      {
        key: "audience",
        name: "Audience Guidelines",
        value: guidelines.audience_guidelines,
      },
      {
        key: "brand",
        name: "Brand Identity",
        value: guidelines.brand_identity,
      },
      {
        key: "regulatory",
        name: "Regulatory Compliance",
        value: guidelines.regulatory_compliance,
      },
      { key: "drug", name: "Drug Brief", value: guidelines.drug_brief },
      {
        key: "medical",
        name: "Medical & Scientific Info",
        value: guidelines.medical_scientific,
      },
      {
        key: "technical",
        name: "Technical Specs",
        value: guidelines.technical_specs,
      },
    ];

    try {
      const analyses = [];
      const improvements = new Set<string>();

      // Analyze each guideline separately
      for (const guideline of guidelinesList) {
        const messages = [
          {
            role: "system",
            content: `You are an expert at analyzing medical/pharmaceutical images. Analyze the image specifically for ${guideline.name} guidelines. Respond in JSON format only.`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this image specifically for the following guideline:
                ${guideline.name}: ${guideline.value}
                
                Provide a score out of 5 and detailed feedback.
                
                Return in this JSON format only:
                {
                  "score": number,
                  "feedback": string,
                  "improvements": string[]
                }`,
              },
              {
                type: "image_url",
                image_url: { url: imageUrl },
              },
            ],
          },
        ];

        const response = await fetch("/api/imgchat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages }),
        });

        if (!response.ok)
          throw new Error(`Failed to analyze ${guideline.name}`);

        const data = await response.json();
        const result = JSON.parse(data.content);

        analyses.push({
          category: guideline.name,
          score: result.score,
          feedback: result.feedback,
        });

        // Add improvements to the set to avoid duplicates
        result.improvements.forEach((imp: string) => improvements.add(imp));
      }

      // Calculate overall score as average
      const overallScore = Number(
        (
          analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length
        ).toFixed(1)
      );

      // Combine results
      const finalAnalysis = {
        isJson: true,
        overallScore,
        analyses,
        generalImprovements: Array.from(improvements),
      };

      setAnalysisResult(finalAnalysis as ImageAnalysis);
    } catch (error) {
      console.error("Error analyzing image:", error);
      setAnalysisError(
        error instanceof Error
          ? error.message
          : "Failed to analyze image. Please try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

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
              <Button
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black"
                onClick={handleAnalyzeImage}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Image"}
              </Button>

              {analysisError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-600">{analysisError}</p>
                </div>
              )}

              {analysisResult &&
                ("isJson" in analysisResult && analysisResult.isJson ? (
                  <div className="space-y-4 bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900">
                        Analysis Score: {analysisResult.overallScore.toFixed(1)}
                        /5
                      </h4>
                    </div>

                    <div className="space-y-3">
                      {analysisResult.analyses.map((item, index) => (
                        <div key={index} className="border-t pt-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{item.category}</span>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  className={`${
                                    star <= item.score
                                      ? "text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {item.feedback}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-3">
                      <h5 className="font-medium mb-2">
                        Suggested Improvements
                      </h5>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        {analysisResult.generalImprovements.map(
                          (improvement, index) => (
                            <li key={index}>{improvement}</li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Analysis Result
                    </h4>
                    <div className="whitespace-pre-wrap text-sm text-gray-600">
                      {analysisResult.content}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
