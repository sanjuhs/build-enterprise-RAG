import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";

interface GenerationTabProps {
  imagePrompt: string;
  setImagePrompt: (prompt: string) => void;
  isLoading: boolean;
  generatedImage: string | null;
  generatedImageS3Url: string | null;
  onGenerateImage: () => void;
}

export function GenerationTab({
  imagePrompt,
  setImagePrompt,
  isLoading,
  generatedImage,
  generatedImageS3Url,
  onGenerateImage,
}: GenerationTabProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Image Generation Prompt
        </label>
        <Textarea
          value={imagePrompt}
          onChange={(e) => setImagePrompt(e.target.value)}
          placeholder="Describe your image..."
          className="min-h-[100px]"
        />
      </div>

      <Button
        onClick={onGenerateImage}
        disabled={isLoading || !imagePrompt.trim()}
      >
        {isLoading ? "Generating..." : "Generate Image"}
      </Button>

      {isLoading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Generating image...</p>
        </div>
      )}

      {generatedImage && (
        <div className="space-y-2">
          <div className="border rounded-lg p-4">
            <Image
              src={`data:image/jpeg;base64,${generatedImage}`}
              alt="Generated image"
              width={1024}
              height={768}
              className="w-full h-auto rounded-lg"
            />
          </div>
          <div className="bg-gray-50 p-2 rounded text-xs text-gray-500 font-mono">
            <h4 className="font-semibold mb-1">Image Stats:</h4>
            <div className="space-y-0.5">
              <p>Dimensions: 1024 x 768</p>
              <p>Format: JPEG</p>
              {generatedImageS3Url && (
                <p className="truncate">
                  <span className="font-medium">S3 URL:</span>{" "}
                  {generatedImageS3Url}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
