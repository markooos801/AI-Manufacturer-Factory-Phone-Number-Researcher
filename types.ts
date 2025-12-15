export type ManufacturerType = 'Factory' | 'Manufacturer' | 'Trader' | 'Unknown';

export interface PhoneNumber {
  number: string;
  type: 'factory' | 'sales' | 'export' | 'whatsapp';
  confidence: number;
}

export interface EmailAddress {
  email: string;
  role: 'sales' | 'export' | 'purchasing' | 'info' | 'general';
}

export interface CompanyRecord {
  company_name: string;
  manufacturer_type: ManufacturerType;
  industry: string;
  product_category: string;
  sub_category: string;
  country: string;
  city: string;
  phone_numbers: PhoneNumber[];
  emails: EmailAddress[];
  website: string;
  certifications: string[];
  export_capability: 'Yes' | 'No' | 'Unknown';
  verification_score: number;
  data_sources: string[];
  notes: string;
}

export interface SearchParams {
  product: string;
  country: string;
  industry: string;
}

export interface SearchState {
  isLoading: boolean;
  step: string; 
  records: CompanyRecord[];
  error: string | null;
}