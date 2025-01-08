"use client";

import { NavBar } from "@/components/shared/nav-bar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthProvider } from "@/components/providers/auth-provider";
import { GuidelinesTab } from "@/components/image-gen/GuidelinesTab";
import { GenerationTab } from "@/components/image-gen/GenerationTab";
import { ReviewTab } from "@/components/image-gen/ReviewTab";
import { useImageGeneration } from "@/hooks/use-image-generation";
// import { Guidelines, ImageItem } from "@/types/image-gen";
// import { useState, useCallback } from "react";
// import { useState } from "react";
// import { Guidelines } from "@/types/image-gen";
// import { defaultGuidelines } from "@/data/default-guidelines";

export default function ImageGenMLR() {
  const {
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
  } = useImageGeneration();

  //   const [guidelines2, setGuidelines2] = useState<Guidelines>(defaultGuidelines);

  //   console.log("Page level guidelines:", guidelines2);

  return (
    <AuthProvider requiredRoles={["guest", "user", "admin"]}>
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <h1 className="text-3xl font-bold mb-6">Image Generation MLR</h1>

          <Tabs defaultValue="guidelines" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="guidelines">
                Guidelines Management
              </TabsTrigger>
              <TabsTrigger value="generation">Image Generation</TabsTrigger>
              <TabsTrigger value="review">MLR Review & Post-Screen</TabsTrigger>
            </TabsList>

            <TabsContent value="guidelines">
              <GuidelinesTab
                guidelines={guidelines}
                onGuidelineChange={handleGuidelineChange}
              />
            </TabsContent>

            <TabsContent value="generation">
              <GenerationTab
                imagePrompt={imagePrompt}
                setImagePrompt={setImagePrompt}
                isLoading={isLoading}
                generatedImage={generatedImage}
                generatedImageS3Url={generatedImageS3Url}
                onGenerateImage={handleGenerateImage}
              />
            </TabsContent>

            <TabsContent value="review">
              <ReviewTab
                guidelines={guidelines}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                images={images}
                selectedImage={selectedImage}
                setSelectedImage={setSelectedImage}
                isLoading={isLoading}
                onRefresh={loadImages}
              />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AuthProvider>
  );
}
