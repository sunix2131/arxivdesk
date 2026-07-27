export type Paper = {
  id: string;
  title: string;
  titleRu?: string;
  abstract: string;
  abstractRu?: string;
  authors: string[];
  categories: string[];
  primaryCategory: string;
  publishedAt: string;
  updatedAt: string;
  arxivUrl: string;
  pdfUrl: string;
  htmlUrl?: string;
  sourceUrl?: string;
  doi?: string;
  journalRef?: string;
  pages?: string;
  tags?: string[];
};

export type Category = {
  slug: string;
  label: string;
  arxiv: string[];
  short: string;
  enabledByDefault: boolean;
};

export type UserPaperState = {
  paperId: string;
  isSaved: boolean;
  isRead: boolean;
  viewedAt?: string;
  savedAt?: string;
  note?: string;
};

export type PapersPayload = {
  updatedAt: string;
  papers: Paper[];
};
