import type { Category, Paper } from '../types';

const matchesArxivPattern = (pattern: string, category: string) => {
  if (pattern.endsWith('.*')) {
    return category.startsWith(pattern.slice(0, -1));
  }
  return pattern === category;
};

export const categoryMatchesPaper = (category: Category, paper: Paper) =>
  paper.categories.some((paperCategory) => category.arxiv.some((pattern) => matchesArxivPattern(pattern, paperCategory)));

export const getPaperCategory = (paper: Paper, categories: Category[]) =>
  categories.find((category) => categoryMatchesPaper(category, paper));

export const isPaperInEnabledCategories = (paper: Paper, categories: Category[], enabledSlugs: string[]) => {
  const enabled = categories.filter((category) => enabledSlugs.includes(category.slug));
  return enabled.length === 0 || enabled.some((category) => categoryMatchesPaper(category, paper));
};

export const defaultEnabledCategories = (categories: Category[]) =>
  categories.filter((category) => category.enabledByDefault).map((category) => category.slug);
