import { BookOpen } from 'lucide-react'

/**
 * Parse message content and replace $CITE_X$ tokens with clickable badges
 * @param {string} content - Message content with citation tokens
 * @param {Array} citations - Array of citation objects
 * @param {Function} on_citation_click - Callback when citation is clicked
 * @returns {Array} Array of React elements
 */
const parse_message_with_citations = (content, citations, on_citation_click) => {
  if (!content) return []

  // Remove markdown image syntax: ![alt text](url)
  content = content.replace(/!\[.*?\]\(.*?\)/g, '')

  // Regex to match $CITE_X$ patterns
  const citation_pattern = /\$CITE_(\d+)\$/g
  const parts = []
  let last_index = 0
  let match

  while ((match = citation_pattern.exec(content)) !== null) {
    const citation_number = parseInt(match[1])
    const citation = citations && citations[citation_number - 1]

    // Add text before the citation
    if (match.index > last_index) {
      parts.push({
        type: 'text',
        content: content.substring(last_index, match.index),
        key: `text_${last_index}`
      })
    }

    // Add citation badge
    parts.push({
      type: 'citation',
      number: citation_number,
      citation: citation,
      key: `cite_${citation_number}_${match.index}`
    })

    last_index = match.index + match[0].length
  }

  // Add remaining text
  if (last_index < content.length) {
    parts.push({
      type: 'text',
      content: content.substring(last_index),
      key: `text_${last_index}_end`
    })
  }

  // If no citations found, return the whole content as text
  if (parts.length === 0) {
    parts.push({
      type: 'text',
      content: content,
      key: 'text_full'
    })
  }

  return parts
}

const MessageWithCitations = ({ content, citations, on_citation_click }) => {
  const parts = parse_message_with_citations(content, citations, on_citation_click)

  return (
    <span className="text-sm whitespace-pre-wrap font-reddit-sans">
      {parts.map((part) => {
        if (part.type === 'text') {
          return <span key={part.key}>{part.content}</span>
        } else if (part.type === 'citation') {
          return (
            <button
              key={part.key}
              onClick={() => on_citation_click && on_citation_click(part.citation, part.number)}
              className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 mx-0.5
                bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300
                rounded hover:bg-primary-200 dark:hover:bg-primary-800/40
                transition-colors duration-200 text-xs font-semibold
                border border-primary-300 dark:border-primary-600
                align-baseline"
              title={part.citation ? `Citation ${part.number}: ${typeof part.citation === 'string' ? part.citation.substring(0, 100) : (part.citation.text || part.citation.content || JSON.stringify(part.citation)).substring(0, 100)}...` : `Citation ${part.number}`}
              aria-label={`Show citation ${part.number} in document`}
            >
              <BookOpen className="w-2.5 h-2.5" />
              <span>{part.number}</span>
            </button>
          )
        }
        return null
      })}
    </span>
  )
}

export default MessageWithCitations
