export interface Guidelines {
  // Company Details Tab
  regulatory_compliance: string;
  brand_identity: string;

  // Drug/Product Details Tab
  drug_brief: string;
  medical_scientific: string;
  technical_specs: string;

  // Audience & Campaign Tab
  accessibility: string;
  audience_guidelines: string;
  other_guidelines: string;

  // Quick Access Tab
  purpose: string;
}

export interface ImageItem {
  s3Url: string;
  createdAt: string;
  fileName: string;
  url: string;
}
