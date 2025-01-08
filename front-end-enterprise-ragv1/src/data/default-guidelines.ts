import { Guidelines } from "@/types/image-gen";

export const defaultGuidelines: Guidelines = {
  // Regulatory Compliance
  regulatory_requirements: `USA Market Requirements:
- FDA Requirements:
  • Include "AGGRENOX® (aspirin/extended-release dipyridamole) 25mg/200mg capsules"
  • Include registration number
  • Follow FDA promotional guidelines

- Fair Balance Requirements:
  • Safety information must be as prominent as efficacy claims
  • Include ISI in all promotional materials
  • Balance risk and benefit information

- Prescribing Information:
  • Include statement "See Full Prescribing Information"
  • Include PI in all promotional materials
  • Reference ISI appropriately

Note: For other markets, replace with local regulatory requirements`,

  safety_warnings: `Safety Warning Requirements:
- Display prominent safety warnings based on market requirements
- For USA: Black Box Warning must be prominently displayed for bleeding risks
- Follow regional warning display guidelines
- Include required safety symbols and formatting`,

  industry_code: `Industry Code Compliance:
- USA: PhRMA Code compliance required
- Follow regional industry association guidelines
- Adhere to self-regulatory body requirements
- Maintain ethical promotional standards`,

  isi_reference: `Important Safety Information (ISI) guidelines:
- Include complete ISI in all materials
- Follow regional ISI formatting requirements
- Ensure ISI is readily accessible`,

  testimonial_policy: `Testimonial usage guidelines:
- Verify all testimonial sources
- Document patient consent
- Follow regional testimonial regulations`,

  clinical_data_policy: `Clinical data presentation policy:
- Use data from last 5 years
- Include study methodology
- Present balanced outcomes`,

  statistics_policy: `Statistical presentation guidelines:
- Include p-values where relevant
- Show confidence intervals
- Reference data sources`,

  // Medical & Scientific
  clinical_claims: `Clinical efficacy claims guidelines...`,
  study_references: `Study citation requirements...`,
  moa_requirements: `Mechanism of action visualization guidelines...`,
  terminology_standards: `Medical terminology standards...`,
  antiplatelet_terminology: `Specific terminology requirements...`,
  dosing_info: `Dosing information presentation...`,

  // Brand Identity
  color_palette: `Brand color specifications...`,
  typography: `Typography guidelines...`,
  logo_requirements: `Logo usage requirements...`,

  // Market Specific
  language_requirements: `Language requirements:
- Use local language standards
- Follow regional terminology
- Include translation requirements`,
  healthcare_system: `Healthcare system considerations:
- Include coverage information
- Follow reimbursement guidelines
- Local healthcare requirements`,

  // Digital Platform
  size_requirements: `Size requirements:
- Banner ads: 728x90, 300x250, 160x600
- Social media: 1200x628 (Facebook), 1080x1080 (Instagram)
- Email headers: 600px width`,
  file_specifications: `File specifications:
- Web: PNG/JPG, max 200KB
- Print: CMYK, 300dpi minimum
- Video: MP4, max 30 seconds`,

  // MLR Review
  submission_process: `Review submission process...`,
  documentation: `Required documentation guidelines...`,

  // Audience Specific
  hcp_materials: `Healthcare professional content guidelines...`,
  patient_materials: `Patient-facing content guidelines...`,
  persona_guidelines: `Persona-specific communication guidelines...`,

  // Technical Specs
  print_requirements: `Print production specifications...`,
  digital_requirements: `Digital asset specifications...`,

  // Safety & Risk
  warning_placement: `Warning placement guidelines...`,
  required_statements: `Required safety statements...`,

  // Accessibility
  accessibility_digital: `Digital accessibility requirements...`,
  accessibility_print: `Print accessibility guidelines...`,

  // Final Steps
  purpose_of_image: "",
  final_prompt: "",
};
