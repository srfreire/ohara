/**
 * Fuzzy text matching utilities for finding inexact text matches
 * Useful for matching markdown-processed text to PDF text
 */

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Edit distance
 */
const levenshtein_distance = (str1, str2) => {
  const len1 = str1.length
  const len2 = str2.length
  const matrix = []

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      )
    }
  }

  return matrix[len1][len2]
}

/**
 * Normalize text for comparison (lowercase, remove extra spaces, punctuation)
 * @param {string} text - Text to normalize
 * @returns {string} Normalized text
 */
const normalize_text = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')  // Replace punctuation with spaces
    .replace(/\s+/g, ' ')       // Collapse multiple spaces
    .trim()
}

/**
 * Calculate similarity score between two strings (0-1, higher is better)
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Similarity score (0-1)
 */
export const calculate_similarity = (str1, str2) => {
  const norm1 = normalize_text(str1)
  const norm2 = normalize_text(str2)

  if (norm1 === norm2) return 1.0

  const max_len = Math.max(norm1.length, norm2.length)
  if (max_len === 0) return 1.0

  const distance = levenshtein_distance(norm1, norm2)
  return 1 - (distance / max_len)
}

/**
 * Find the best fuzzy match for a citation text in a larger text
 * @param {string} citation_text - Text to find (from citation)
 * @param {string} full_text - Full text to search in (from PDF)
 * @param {number} min_similarity - Minimum similarity threshold (0-1)
 * @returns {Object|null} Match object with {text, index, similarity} or null
 */
export const find_fuzzy_match = (citation_text, full_text, min_similarity = 0.7) => {
  if (!citation_text || !full_text) return null

  const citation_normalized = normalize_text(citation_text)
  const citation_length = citation_normalized.length

  // If citation is very short, require higher similarity
  const adjusted_threshold = citation_length < 20 ? Math.max(min_similarity, 0.85) : min_similarity

  let best_match = null
  let best_similarity = adjusted_threshold

  // Sliding window approach
  const words = citation_text.split(/\s+/)
  const window_size = words.length
  const full_words = full_text.split(/\s+/)

  // Try different window sizes (exact length, ±20%)
  for (let size_variation = -0.2; size_variation <= 0.2; size_variation += 0.1) {
    const current_window_size = Math.max(
      Math.floor(window_size * (1 + size_variation)),
      3
    )

    for (let i = 0; i <= full_words.length - current_window_size; i++) {
      const window = full_words.slice(i, i + current_window_size).join(' ')
      const similarity = calculate_similarity(citation_text, window)

      if (similarity > best_similarity) {
        best_similarity = similarity
        best_match = {
          text: window,
          index: full_text.indexOf(window),
          similarity: similarity,
          start_word: i,
          end_word: i + current_window_size
        }
      }
    }
  }

  return best_match
}

/**
 * Find all potential fuzzy matches in text (returns top N)
 * @param {string} citation_text - Text to find
 * @param {string} full_text - Full text to search in
 * @param {number} max_results - Maximum number of results to return
 * @param {number} min_similarity - Minimum similarity threshold
 * @returns {Array} Array of match objects sorted by similarity
 */
export const find_all_fuzzy_matches = (
  citation_text,
  full_text,
  max_results = 5,
  min_similarity = 0.7
) => {
  if (!citation_text || !full_text) return []

  const matches = []
  const words = citation_text.split(/\s+/)
  const window_size = words.length
  const full_words = full_text.split(/\s+/)

  for (let size_variation = -0.2; size_variation <= 0.2; size_variation += 0.1) {
    const current_window_size = Math.max(
      Math.floor(window_size * (1 + size_variation)),
      3
    )

    for (let i = 0; i <= full_words.length - current_window_size; i++) {
      const window = full_words.slice(i, i + current_window_size).join(' ')
      const similarity = calculate_similarity(citation_text, window)

      if (similarity >= min_similarity) {
        matches.push({
          text: window,
          index: full_text.indexOf(window),
          similarity: similarity,
          start_word: i,
          end_word: i + current_window_size
        })
      }
    }
  }

  // Sort by similarity (highest first) and return top N
  return matches
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, max_results)
}
