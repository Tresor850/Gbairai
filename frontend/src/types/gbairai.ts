export interface Gbairai {
  id: number;
  content: string;
  location: string | null;
  likes_count: number;
  comments_count: number;
  has_liked: boolean;
  is_mine: boolean;
  status: 'active' | 'hidden' | 'banned';
  created_at: string;
  time_ago: string;
}

export interface Comment {
  id: number;
  gbairai_id: number;
  random_pseudo: string;
  content: string;
  is_author: boolean;
  is_mine: boolean;
  created_at: string;
  time_ago: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    path: string;
    per_page: number;
    to: number | null;
    total: number;
  };
}

export interface LikeToggleResponse {
  message: string;
  liked: boolean;
  likes_count: number;
}

export interface ReportResponse {
  message: string;
  status: 'active' | 'hidden' | 'banned';
  is_hidden: boolean;
}

