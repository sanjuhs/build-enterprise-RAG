export interface Guidelines {
  // Regulatory Compliance
  regulatory_requirements: string;
  safety_warnings: string;
  isi_reference: string;
  industry_code: string;
  testimonial_policy: string;
  clinical_data_policy: string;
  statistics_policy: string;

  // Medical & Scientific
  clinical_claims: string;
  study_references: string;
  moa_requirements: string;
  terminology_standards: string;
  antiplatelet_terminology: string;
  dosing_info: string;

  // Brand Identity
  color_palette: string;
  typography: string;
  logo_requirements: string;

  // Market Specific
  language_requirements: string;
  healthcare_system: string;

  // Digital Platform
  size_requirements: string;
  file_specifications: string;

  // MLR Review
  submission_process: string;
  documentation: string;

  // Audience Specific
  hcp_materials: string;
  patient_materials: string;
  persona_guidelines: string;

  // Technical Specs
  print_requirements: string;
  digital_requirements: string;

  // Safety & Risk
  warning_placement: string;
  required_statements: string;

  // Accessibility
  accessibility_digital: string;
  accessibility_print: string;

  // Final Steps
  purpose_of_image: string;
  final_prompt: string;
}

export const defaultGuidelines: Guidelines = {
  // Regulatory Compliance
  regulatory_requirements:
    'Include "AGGRENOX® (aspirin/extended-release dipyridamole) 25mg/200mg capsules"',
  safety_warnings: "Must be prominently displayed for bleeding risks",
  isi_reference: "Reference ISI in all materials",
  industry_code: "PhRMA Code compliance required",
  testimonial_policy: "No patient testimonials without documented verification",
  clinical_data_policy:
    "Clinical data must be from last 5 years unless historically significant",
  statistics_policy: "All statistics must include study reference and date",

  // Medical & Scientific
  clinical_claims: "48% relative risk reduction in stroke vs aspirin alone",
  study_references: "ESPS2 Trial, 1996",
  moa_requirements: "MOA visualization must show both antiplatelet mechanisms",
  terminology_standards:
    'Use "secondary stroke prevention" not "stroke prevention"',
  antiplatelet_terminology: '"Antiplatelet therapy" not "blood thinner"',
  dosing_info: "Twice daily dosing",

  // Brand Identity
  color_palette:
    "Primary: Boehringer Blue (#003366)\nSecondary: Medical White (#FFFFFF)\nAccent: Safety Orange (#FF6633)",
  typography:
    "Headlines: Frutiger Bold\nBody: Frutiger Light\nMinimum size: 8pt for print, 12px for digital",
  logo_requirements:
    "Clear space: 1x height of logo\nMinimum size: 1.5 inches for print\nAlways use ® symbol",

  // Market Specific
  language_requirements:
    "American English spelling\nAvoid regional medical terminology\nInclude Spanish translation option for patient materials",
  healthcare_system:
    "Include insurance coverage information\nMedicare Part D tier status\nPrior authorization requirements",

  // Digital Platform
  size_requirements:
    "Banner ads: 728x90, 300x250, 160x600\nSocial media: 1200x628 (Facebook), 1080x1080 (Instagram)\nEmail headers: 600px width",
  file_specifications:
    "Web: PNG/JPG, max 200KB\nPrint: CMYK, 300dpi minimum\nVideo: MP4, max 30 seconds",

  // MLR Review
  submission_process:
    "Initial review: 5 business days\nRevisions: 3 business days\nFinal approval: 2 business days",
  documentation:
    "Reference validation forms\nClinical data substantiation\nPrevious approval codes",

  // Audience Specific
  hcp_materials:
    "Include prescribing information\nClinical trial data emphasis\nProfessional medical imagery",
  patient_materials:
    "6th-grade reading level\nLifestyle imagery\nClear dosing instructions",
  persona_guidelines:
    "Professional tone for HCPs\nEmpathetic tone for patients\nClear, concise language for all",

  // Technical Specs
  print_requirements: "Bleed: 0.125 inches\nResolution: 300 DPI\nColor: CMYK",
  digital_requirements: "RGB color space\nWeb-safe fonts\nResponsive design",

  // Safety & Risk
  warning_placement:
    "Black box warning: Top 1/3 of page\nSafety information: Minimum 8pt font\nAdverse events: Bullet point format",
  required_statements:
    "Report adverse events to FDA at 1-800-FDA-1088\nPlease see Full Prescribing Information, including boxed WARNING",

  // Accessibility
  accessibility_digital:
    "WCAG 2.1 Level AA compliance\nAlt text for all images\nMinimum contrast ratio: 4.5:1",
  accessibility_print:
    "Minimum 8pt font size\nHigh contrast color combinations\nClear hierarchy of information",

  // Final Steps
  purpose_of_image: "",
  final_prompt: "",
};

export interface ImageItem {
  s3Url: string;
  createdAt: string;
  fileName: string;
  url: string;
}
