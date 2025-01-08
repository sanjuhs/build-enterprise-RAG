import { useState, useCallback, useEffect } from "react";
import { Guidelines, ImageItem } from "@/types/image-gen";
import { format } from "date-fns";
import { defaultGuidelines } from "@/data/default-guidelines";

export function useImageGeneration() {
  const [guidelines, setGuidelines] = useState<Guidelines>(defaultGuidelines);
  const [imagePrompt, setImagePrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedImageS3Url, setGeneratedImageS3Url] = useState<string | null>(
    null
  );
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleGuidelineChange = useCallback(
    (key: keyof Guidelines, value: string) => {
      setGuidelines((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  const loadImages = useCallback(async () => {
    try {
      setIsLoading(true);
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      const response = await fetch(`/api/images?date=${formattedDate}`);
      const data = await response.json();

      setImages(data.images);
      if (data.images.length > 0) {
        setSelectedImage(data.images[0]);
      }
    } catch (error) {
      console.error("Error loading images:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  const handleGenerateImage = useCallback(async () => {
    if (!imagePrompt.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/generateImage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt }),
      });

      const data = await response.json();
      if (data.base64) setGeneratedImage(data.base64);
      if (data.s3Url) setGeneratedImageS3Url(data.s3Url);
      else if (data.error) console.warn("S3 upload failed:", data.error);

      await loadImages();
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsLoading(false);
    }
  }, [imagePrompt, loadImages]);

  // Load images when date changes
  useEffect(() => {
    loadImages();
  }, [selectedDate, loadImages]);

  // Load guidelines from localStorage
  useEffect(() => {
    const savedGuidelines = localStorage.getItem("imageGenGuidelines");
    if (savedGuidelines) {
      setGuidelines(JSON.parse(savedGuidelines));
    }
  }, []);

  // Save guidelines to localStorage
  useEffect(() => {
    localStorage.setItem("imageGenGuidelines", JSON.stringify(guidelines));
  }, [guidelines]);

  return {
    guidelines,
    handleGuidelineChange,
    imagePrompt,
    setImagePrompt,
    isLoading,
    generatedImage,
    generatedImageS3Url,
    handleGenerateImage,
    images,
    selectedImage,
    setSelectedImage,
    selectedDate,
    setSelectedDate,
    loadImages,
  };
}
