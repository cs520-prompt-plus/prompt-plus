export interface ResponseCreatePayload {
  input: string;
}

export interface ResponseCreateResponse {
  response_id: string;
  user_id: string;
  input: string;
  output: string;
  created_at: string;
  categories?: {
    category_id: string;
    category: string;
    input: string;
    preview: string;
    patterns: {
      pattern_id: string;
      pattern: string;
      description?: string;
      feedback: string;
      applied: boolean;
    }[];
  }[];
}

export interface ResponseUpdatePayload {
  output: string;
}

export interface MergePreviewsPayload {
  previews: string[];
}
