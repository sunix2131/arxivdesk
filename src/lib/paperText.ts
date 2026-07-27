import type { Paper } from '../types';
import type { Language } from './storage';

export const paperTitle = (paper: Paper, language: Language) =>
  language === 'ru' && paper.titleRu ? paper.titleRu : paper.title;

export const paperAbstract = (paper: Paper, language: Language) =>
  language === 'ru' && paper.abstractRu ? paper.abstractRu : paper.abstract;
