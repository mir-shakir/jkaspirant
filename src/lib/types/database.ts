export interface Exam {
  id: string;
  slug: string;
  title: string;
  department: string | null;
  description: string | null;
  vacancy_count: number | null;
  pay_scale: string | null;
  eligibility: string | null;
  is_active: boolean;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
  og_image_url: string | null;
  focus_keyword: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  slug: string;
  title: string;
  body: string | null;
  source_url: string | null;
  exam_id: string | null;
  category: "result" | "admit_card" | "notification" | "answer_key" | null;
  published_at: string | null;
  is_published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  focus_keyword: string | null;
  auto_fetched: boolean;
  source_raw: string | null;
  created_at: string;
  updated_at: string;
  exam?: Exam;
}

export interface Paper {
  id: string;
  exam_id: string;
  title: string;
  year: number | null;
  subject: string | null;
  file_url: string | null;
  file_size_kb: number | null;
  downloads: number;
  is_published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
}

export interface Cutoff {
  id: string;
  exam_id: string;
  year: number;
  category: string;
  cutoff_score: number | null;
  total_posts: number | null;
  total_applied: number | null;
  created_at: string;
}

export interface SyllabusSection {
  id: string;
  exam_id: string;
  section_title: string;
  topics: string[];
  marks_weight: number | null;
  sort_order: number;
  created_at: string;
}

export interface ExamDate {
  id: string;
  exam_id: string;
  event_name: string;
  event_date: string | null;
  is_tentative: boolean;
  created_at: string;
}
