import { Textarea } from "@/components/ui/textarea";
import { Guidelines } from "@/types/image-gen";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface GuidelinesTabProps {
  guidelines: Guidelines;
  onGuidelineChange: (key: keyof Guidelines, value: string) => void;
}

type ImageType = "realistic" | "icon" | "cartoon";

interface GuidelineAnalysis {
  category: string;
  score: number;
  feedback: string;
}

interface PromptAnalysis {
  overallScore: number;
  analyses: GuidelineAnalysis[];
  generalImprovements: string[];
}

export function GuidelinesTab({
  guidelines,
  onGuidelineChange,
}: GuidelinesTabProps) {
  const [imageType, setImageType] = useState<ImageType>("realistic");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const handleSuggestPrompts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/ragchat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You are an expert at writing image generation prompts. Generate a detailed prompt based on the user's requirements. Return only the prompt, no other text.",
            },
            {
              role: "user",
              content: `Please generate a ${imageType} style image prompt based on the following purpose: ${guidelines.purpose} as well as the audience guidelines: ${guidelines.audience_guidelines}`,
            },
          ],
        }),
      });

      if (!response.ok) throw new Error("Failed to generate prompt");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      let promptText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        promptText += new TextDecoder().decode(value);
      }

      setGeneratedPrompt(promptText);
    } catch (error) {
      console.error("Error generating prompt:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzePrompt = async () => {
    if (!generatedPrompt) return;
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch("/api/ragchat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `You are an expert at analyzing image generation prompts. You MUST return your response in valid JSON format ONLY, no other text. Analyze the given prompt against the provided guidelines and rate each aspect on a scale of 1-5. The response must follow this exact format:
              {
                "overallScore": 4,
                "analyses": [
                  {
                    "category": "Purpose Alignment",
                    "score": 4,
                    "feedback": "The prompt aligns well with the stated purpose"
                  }
                ],
                "generalImprovements": [
                  "Consider adding more specific details about X",
                  "Include Y for better clarity"
                ]
              }`,
            },
            {
              role: "user",
              content: `Analyze this prompt: "${generatedPrompt}"
              
              Against these 7 guidelines: 
              1. accessibility, 
              2. audience_guidelines, 
              3. brand_identity, 
              4. regulatory_compliance, 
              5. drug_brief, 
              6. medical_scientific, 
              7. technical_specs
              listed below:
              
              Accessibility: ${guidelines.accessibility}
              Audience Guidelines: ${guidelines.audience_guidelines}
              Brand Identity: ${guidelines.brand_identity}
              Regulatory Compliance: ${guidelines.regulatory_compliance}
              Drug Brief: ${guidelines.drug_brief}
              Medical & Scientific Info: ${guidelines.medical_scientific}
              Technical Specs: ${guidelines.technical_specs}
              
              Remember be very very strict and rigorous in your analysis. It's ok to give lower scores if the prompt doesn't align with the guidelines.`,
            },
          ],
        }),
      });

      if (!response.ok) throw new Error("Failed to analyze prompt");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      let analysisText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = new TextDecoder().decode(value);
        // console.log("Received chunk:", chunk);
        analysisText += chunk;
      }

      console.log("Full response text:", analysisText);

      let cleanedText = analysisText;
      cleanedText = cleanedText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      console.log("Cleaned text before parsing:", cleanedText);

      try {
        const analysisResult = JSON.parse(cleanedText) as PromptAnalysis;

        // Calculate overall score as average of all scores
        const totalScore = analysisResult.analyses.reduce(
          (sum, analysis) => sum + analysis.score,
          0
        );
        const averageScore = Number(
          (totalScore / analysisResult.analyses.length).toFixed(1)
        );

        // Update the overall score
        analysisResult.overallScore = averageScore;

        console.log("Successfully parsed result:", analysisResult);
        setAnalysis(analysisResult);
        setAnalysisError(null);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.error("Failed to parse text:", cleanedText);
        setAnalysisError("Failed to parse the analysis. Please try again.");
        setAnalysis(null);
      }
    } catch (error) {
      console.error("Error analyzing prompt:", error);
      setAnalysisError(
        "An error occurred while analyzing the prompt. Please try again."
      );
      setAnalysis(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderAnalysis = () => {
    if (!analysis) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold">
              Overall Score: {analysis.overallScore.toFixed(1)}/5
            </span>
            <span className="ml-2 text-sm text-gray-500">
              (Average of {analysis.analyses.length} criteria)
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {analysis.analyses.map((item, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-200 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">{item.category}</h4>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`h-4 w-4 ${
                        star <= item.score ? "text-yellow-400" : "text-gray-300"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600">{item.feedback}</p>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
          <h4 className="font-semibold text-gray-900">
            Suggested Improvements
          </h4>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-600">
            {analysis.generalImprovements.map((improvement, index) => (
              <li key={index}>{improvement}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <Tabs defaultValue="quick-access" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="quick-access">Quick Access</TabsTrigger>
        <TabsTrigger value="audience">Audience & Campaign</TabsTrigger>
        <TabsTrigger value="product">Drug/Product Details</TabsTrigger>
        <TabsTrigger value="company">Company Details</TabsTrigger>
      </TabsList>

      <TabsContent value="quick-access">
        <GuidelineSection
          title="Quick Access Configuration"
          description="Configure key details quickly using pre-existing information"
          fields={[
            {
              key: "purpose",
              label: "Purpose",
              placeholder:
                "Define the purpose, objectives, and key requirements for the image generation...",
            },
          ]}
          guidelines={guidelines}
          onGuidelineChange={onGuidelineChange}
        />

        <div className="mt-8 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Image Type Selection
            </h3>
            <div className="flex gap-4">
              <Button
                onClick={() => setImageType("realistic")}
                className={`${
                  imageType === "realistic"
                    ? "bg-blue-600"
                    : "bg-gray-200 text-gray-700"
                } hover:bg-blue-700`}
              >
                Realistic Image
              </Button>
              <Button
                onClick={() => setImageType("icon")}
                className={`${
                  imageType === "icon"
                    ? "bg-blue-600"
                    : "bg-gray-200 text-gray-700"
                } hover:bg-blue-700`}
              >
                Icon
              </Button>
              <Button
                onClick={() => setImageType("cartoon")}
                className={`${
                  imageType === "cartoon"
                    ? "bg-blue-600"
                    : "bg-gray-200 text-gray-700"
                } hover:bg-blue-700`}
              >
                Cartoon/Animated
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Prompt Assistant
            </h3>
            <Button
              onClick={handleSuggestPrompts}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? "Generating..." : "Suggest Prompts"}
            </Button>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Generated Prompt
            </label>
            <Textarea
              value={generatedPrompt}
              onChange={(e) => setGeneratedPrompt(e.target.value)}
              placeholder="AI-suggested prompts will appear here..."
              className="min-h-[150px] bg-gray-50"
            />
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Prompt Analysis
            </h3>
            <Button
              onClick={handleAnalyzePrompt}
              className="bg-green-600 hover:bg-green-700"
              disabled={isAnalyzing || !generatedPrompt}
            >
              {isAnalyzing ? "Analyzing..." : "Analyze Prompt"}
            </Button>
          </div>

          <div className="space-y-2">
            {analysisError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-center space-x-2">
                  <span className="text-red-600">⚠️</span>
                  <p className="text-sm text-red-600">{analysisError}</p>
                </div>
                <Button
                  onClick={handleAnalyzePrompt}
                  className="mt-2 bg-red-600 hover:bg-red-700"
                  disabled={isAnalyzing}
                >
                  Try Again
                </Button>
              </div>
            ) : (
              renderAnalysis()
            )}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="audience">
        <GuidelineSection
          title="Audience & Campaign Details"
          description="Specify audience targeting and campaign-specific requirements"
          fields={[
            {
              key: "accessibility",
              label: "Accessibility Guidelines",
              placeholder:
                "Specify accessibility requirements for specially abled audience...",
            },
            {
              key: "audience_guidelines",
              label: "Audience, Persona and Market Guidelines",
              placeholder:
                "Define target audience, personas, and market-specific requirements...",
            },
            {
              key: "other_guidelines",
              label: "Other Relevant Guidelines (Optional)",
              placeholder:
                "Add any additional campaign-specific guidelines or requirements...",
            },
          ]}
          guidelines={guidelines}
          onGuidelineChange={onGuidelineChange}
        />
      </TabsContent>

      <TabsContent value="product">
        <GuidelineSection
          title="Drug/Product Information"
          description="Specify product details and technical requirements"
          fields={[
            {
              key: "drug_brief",
              label: "Drug Details (Brief)",
              placeholder:
                "Provide key product information and basic details...",
            },
            {
              key: "medical_scientific",
              label: "Medical & Scientific Information",
              placeholder:
                "Include detailed medical and scientific information about the drug...",
            },
            {
              key: "technical_specs",
              label: "Digital, Print and Technical Specifications",
              placeholder:
                "Specify technical requirements for various media formats...",
            },
          ]}
          guidelines={guidelines}
          onGuidelineChange={onGuidelineChange}
        />
      </TabsContent>

      <TabsContent value="company">
        <GuidelineSection
          title="Company Guidelines"
          description="Specify company-wide regulatory and brand requirements"
          fields={[
            {
              key: "regulatory_compliance",
              label: "Regulatory Compliance Guidelines",
              placeholder:
                "Include all relevant regulatory requirements and compliance guidelines...",
            },
            {
              key: "brand_identity",
              label: "Brand Identity Guidelines",
              placeholder:
                "Specify detailed brand identity requirements and standards...",
            },
          ]}
          guidelines={guidelines}
          onGuidelineChange={onGuidelineChange}
        />
      </TabsContent>
    </Tabs>
  );
}

interface GuidelineSectionProps {
  title: string;
  description: string;
  fields: Array<{
    key: keyof Guidelines;
    label: string;
    placeholder: string;
  }>;
  guidelines: Guidelines;
  onGuidelineChange: (key: keyof Guidelines, value: string) => void;
}

function GuidelineSection({
  title,
  description,
  fields,
  guidelines,
  onGuidelineChange,
}: GuidelineSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <div className="space-y-4">
        {fields.map(({ key, label, placeholder }) => (
          <div key={key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {label}
            </label>
            <Textarea
              value={guidelines[key]}
              onChange={(e) => onGuidelineChange(key, e.target.value)}
              placeholder={placeholder}
              className="min-h-[200px] bg-white"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
