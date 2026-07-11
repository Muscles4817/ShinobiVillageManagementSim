import type { Report } from '../domain/types'
import type { Rng } from '../utils/rng'
import { generateSeededId } from '../utils/idGen'

export function makeReport(
  rng: Rng,
  day: number,
  category: Report['category'],
  title: string,
  body: string,
  refs?: Report['refs'],
): Report {
  return { id: generateSeededId('report', rng), day, category, title, body, refs }
}
