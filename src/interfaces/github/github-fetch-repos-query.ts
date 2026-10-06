export interface IGithubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  language?: string | null;
  topics?: string[];
  full_name?: string;
  owner?: { login: string };
  homepage?: string | null;
  archived?: boolean;
  fork?: boolean;
}
