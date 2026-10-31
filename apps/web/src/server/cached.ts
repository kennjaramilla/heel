import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { getDb } from '@/lib/auth/server';
import { getPublishedTrainerBySlug, listPublishedTrainers } from './trainers';

// Public reads are cached and tagged; saving a profile calls updateTag() to refresh them.
export async function getCachedTrainers(limit = 24) {
  'use cache';
  cacheTag('trainers');
  cacheLife('hours');
  return listPublishedTrainers(getDb(), limit);
}

export async function getCachedTrainer(slug: string) {
  'use cache';
  cacheTag('trainers', `trainer:${slug}`);
  cacheLife('hours');
  return getPublishedTrainerBySlug(getDb(), slug);
}
