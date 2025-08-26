// Enhanced listing detail types
export interface MediaItem {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
  sort?: number;
}

export interface BaseInfo {
  id: string;
  title: string;
  description?: string;
  price: number;
  status: string;
  isApproved: boolean;
  views: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  vehicle_type: {
    id: string;
    name: string;
    slug: string;
  };
  brand?: {
    id: string;
    name: string;
  };
  model?: {
    id: string;
    name: string;
  };
  variant?: {
    id: string;
    name: string;
  };
  year?: number;
  km?: number;
  locationText: string;
  createdAt: string;
  updatedAt: string;
  seller: {
    name: string;
    phone?: string;
    email?: string;
  };
  media: MediaItem[];
}

export interface AttributeDefinition {
  key: string;
  label: string;
  data_type: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'ENUM' | 'MULTISELECT';
  input_type?: string;
  unit?: string;
  icon?: string;
  order: number;
  is_required?: boolean;
}

export interface AttributeGroup {
  key: string;
  label: string;
  order: number;
  attributes: AttributeDefinition[];
}

export interface ListingSchema {
  groups: AttributeGroup[];
  flat: AttributeDefinition[];
}

export interface ListingValues {
  [key: string]: any;
}

export interface EnhancedListingDetail {
  base: BaseInfo;
  schema: ListingSchema;
  values: ListingValues;
}

export interface ListingDetailResponse {
  success: boolean;
  data: EnhancedListingDetail;
}

// Template system types
export interface TemplateProps {
  base: BaseInfo;
  schema: ListingSchema;
  values: ListingValues;
}

export interface TemplateEntry {
  component: React.FC<TemplateProps>;
  priority?: AttributeGroup[];
  customSections?: string[];
}
