import { sql, type SQL } from "drizzle-orm";

/**
 * Sanitize user input for PostgreSQL full-text search
 * Removes FTS special characters and joins words with & (AND)
 */
export const sanitizeSearchQuery = (query: string): string => {
  return query
    .replace(/[&|!<>():*\\'"@#$%^~{}\[\]\-]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .join(" & ");
};

/**
 * Build prefix tsquery for autocomplete suggestions
 * Last word gets :* prefix match, others are exact
 * Example: "red sh" -> "red & sh:*"
 */
export const buildPrefixTsquery = (query: string): string => {
  const words = query
    .replace(/[&|!<>():*\\'"@#$%^~{}\[\]\-]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "";
  if (words.length === 1) return `${words[0]}:*`;

  const lastWord = words.pop()!;
  return `${words.join(" & ")} & ${lastWord}:*`;
};

/**
 * Build WHERE condition for full-text search
 * Uses search_vector @@ to_tsquery(...)
 */
export const buildSearchCondition = (query: string): SQL => {
  const sanitized = sanitizeSearchQuery(query);
  return sql`"products"."search_vector" @@ to_tsquery('english', ${sanitized})`;
};

/**
 * Build WHERE condition for prefix full-text search (autocomplete)
 * Uses search_vector @@ to_tsquery(...) with :* prefix
 */
export const buildPrefixSearchCondition = (query: string): SQL => {
  const prefixQuery = buildPrefixTsquery(query);
  return sql`"products"."search_vector" @@ to_tsquery('english', ${prefixQuery})`;
};

/**
 * Build ts_rank_cd expression for relevance sorting
 * Uses cover density ranking for better phrase proximity scoring
 */
export const buildSearchRankExpression = (query: string): SQL => {
  const sanitized = sanitizeSearchQuery(query);
  return sql`ts_rank_cd("products"."search_vector", to_tsquery('english', ${sanitized}))`;
};