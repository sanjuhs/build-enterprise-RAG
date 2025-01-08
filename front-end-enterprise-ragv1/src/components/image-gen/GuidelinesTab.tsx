import { Textarea } from "@/components/ui/textarea";
import { Guidelines } from "@/types/image-gen";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronRight, Info } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GuidelinesTabProps {
  guidelines: Guidelines;
  onGuidelineChange: (key: keyof Guidelines, value: string) => void;
}

interface GuidelineGroupProps {
  title: string;
  number: number;
  tooltip: string;
  fields: Array<{
    key: keyof Guidelines;
    label: string;
  }>;
  guidelines: Guidelines;
  onGuidelineChange: (key: keyof Guidelines, value: string) => void;
}

function GuidelineGroup({
  title,
  number,
  tooltip,
  fields,
  guidelines,
  onGuidelineChange,
}: GuidelineGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="space-y-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-2 w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="h-5 w-5" />
        ) : (
          <ChevronRight className="h-5 w-5" />
        )}
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-900">
            {number}. {title}
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-gray-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </button>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-7">
          {fields.map(({ key, label }) => (
            <div key={key} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {label}
              </label>
              <Textarea
                value={guidelines[key]}
                onChange={(e) => onGuidelineChange(key, e.target.value)}
                className="min-h-[100px] bg-white"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function GuidelinesTab({
  guidelines,
  onGuidelineChange,
}: GuidelinesTabProps) {
  const [finalStepsExpanded, setFinalStepsExpanded] = useState(true);

  return (
    <TooltipProvider>
      <div className="space-y-8">
        <GuidelineGroup
          number={1}
          title="Regulatory Compliance"
          tooltip="Regional regulatory requirements and compliance guidelines for pharmaceutical marketing"
          fields={[
            {
              key: "regulatory_requirements",
              label: "Regulatory Requirements",
            },
            { key: "safety_warnings", label: "Safety Warnings" },
            { key: "isi_reference", label: "Safety Information Reference" },
            { key: "industry_code", label: "Industry Code Compliance" },
            { key: "testimonial_policy", label: "Testimonial Policy" },
            { key: "clinical_data_policy", label: "Clinical Data Policy" },
            { key: "statistics_policy", label: "Statistics Policy" },
          ]}
          guidelines={guidelines}
          onGuidelineChange={onGuidelineChange}
        />

        <Separator />

        <GuidelineGroup
          number={2}
          title="Medical & Scientific"
          tooltip="Clinical Claims, Study References, Mechanism of Action Requirements, Terminology Standards, Medical Terminology, Dosing Information"
          fields={[
            { key: "clinical_claims", label: "Clinical Claims" },
            { key: "study_references", label: "Study References" },
            {
              key: "moa_requirements",
              label: "Mechanism of Action Requirements",
            },
            { key: "terminology_standards", label: "Terminology Standards" },
            {
              key: "antiplatelet_terminology",
              label: "Medical Terminology",
            },
            { key: "dosing_info", label: "Dosing Information" },
          ]}
          guidelines={guidelines}
          onGuidelineChange={onGuidelineChange}
        />

        <Separator />

        <GuidelineGroup
          number={3}
          title="Brand Identity"
          tooltip="Color Palette, Typography, Logo Requirements"
          fields={[
            { key: "color_palette", label: "Color Palette" },
            { key: "typography", label: "Typography" },
            { key: "logo_requirements", label: "Logo Requirements" },
          ]}
          guidelines={guidelines}
          onGuidelineChange={onGuidelineChange}
        />

        <Separator />

        <GuidelineGroup
          number={4}
          title="Market Specific"
          tooltip="Language Requirements, Healthcare System"
          fields={[
            { key: "language_requirements", label: "Language Requirements" },
            { key: "healthcare_system", label: "Healthcare System" },
          ]}
          guidelines={guidelines}
          onGuidelineChange={onGuidelineChange}
        />

        <Separator />

        <GuidelineGroup
          number={5}
          title="Digital Platform"
          tooltip="Size Requirements, File Specifications"
          fields={[
            { key: "size_requirements", label: "Size Requirements" },
            { key: "file_specifications", label: "File Specifications" },
          ]}
          guidelines={guidelines}
          onGuidelineChange={onGuidelineChange}
        />

        <Separator />

        <GuidelineGroup
          number={6}
          title="Review Process"
          tooltip="Submission Process, Documentation Requirements"
          fields={[
            { key: "submission_process", label: "Submission Process" },
            { key: "documentation", label: "Documentation Requirements" },
          ]}
          guidelines={guidelines}
          onGuidelineChange={onGuidelineChange}
        />

        <Separator />

        <GuidelineGroup
          number={7}
          title="Audience Guidelines"
          tooltip="Healthcare Professional Materials, Patient Materials, Persona Guidelines"
          fields={[
            {
              key: "hcp_materials",
              label: "Healthcare Professional Materials",
            },
            { key: "patient_materials", label: "Patient Materials" },
            { key: "persona_guidelines", label: "Persona Guidelines" },
          ]}
          guidelines={guidelines}
          onGuidelineChange={onGuidelineChange}
        />

        <Separator />

        <GuidelineGroup
          number={8}
          title="Technical Specifications"
          tooltip="Print Requirements, Digital Requirements"
          fields={[
            { key: "print_requirements", label: "Print Requirements" },
            { key: "digital_requirements", label: "Digital Requirements" },
          ]}
          guidelines={guidelines}
          onGuidelineChange={onGuidelineChange}
        />

        <Separator />

        <GuidelineGroup
          number={9}
          title="Safety & Risk Communication"
          tooltip="Warning Placement, Required Statements"
          fields={[
            { key: "warning_placement", label: "Warning Placement" },
            { key: "required_statements", label: "Required Statements" },
          ]}
          guidelines={guidelines}
          onGuidelineChange={onGuidelineChange}
        />

        <Separator />

        <GuidelineGroup
          number={10}
          title="Accessibility"
          tooltip="Digital Accessibility, Print Accessibility"
          fields={[
            { key: "accessibility_digital", label: "Digital Accessibility" },
            { key: "accessibility_print", label: "Print Accessibility" },
          ]}
          guidelines={guidelines}
          onGuidelineChange={onGuidelineChange}
        />

        <Separator />

        <div className="space-y-4">
          <button
            onClick={() => setFinalStepsExpanded(!finalStepsExpanded)}
            className="flex items-center space-x-2 w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
          >
            {finalStepsExpanded ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
            <h3 className="text-lg font-semibold text-gray-900">Final Steps</h3>
          </button>

          {finalStepsExpanded && (
            <div className="space-y-6 pl-7">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Purpose of Image Generation
                </label>
                <Textarea
                  value={guidelines.purpose_of_image}
                  onChange={(e) =>
                    onGuidelineChange("purpose_of_image", e.target.value)
                  }
                  className="min-h-[150px] bg-white"
                  placeholder="Describe the intended use and purpose of the image being generated..."
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Final Prompt
                </label>
                <Textarea
                  value={guidelines.final_prompt}
                  onChange={(e) =>
                    onGuidelineChange("final_prompt", e.target.value)
                  }
                  className="min-h-[150px] bg-white"
                  placeholder="Combine all relevant guidelines into a final image generation prompt..."
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
