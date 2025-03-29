/**
 * Gabungkan base WHERE clause dan tambahan kondisi lainnya
 * @param base - WHERE clause utama (dari dynamic filter)
 * @param extra - Array of custom where clauses
 */
export function mergeWhereClause(base: string, extra: string[]): string {
  if (!extra.length) return base;
  const combined = extra.join(' AND ');
  return base ? `${base} AND ${combined}` : `WHERE ${combined}`;
}
