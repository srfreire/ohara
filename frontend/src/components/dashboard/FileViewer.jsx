import { FileText, X, MessageSquare } from 'lucide-react'
import { marked } from 'marked'
import { memo, useMemo, useState, useEffect } from 'react'
import { get_document_by_id } from '../../api/documents'
import { toast_error } from '../../utils/toast'
import LoadingSpinner from '../ui/LoadingSpinner'
import CommentsSection from '../comments/CommentsSection'

// Content cache to prevent re-parsing
const markdown_cache = new Map()

const MarkdownRenderer = memo(({ content }) => {
  const html_content = useMemo(() => {
    // Check cache first
    const cache_key = content.slice(0, 100) + content.length
    if (markdown_cache.has(cache_key)) {
      return markdown_cache.get(cache_key)
    }

    // Configure marked options for performance
    marked.setOptions({
      breaks: true,
      gfm: true,
      pedantic: false,
      sanitize: false
    })

    const html = marked.parse(content)

    // Cache the result (limit cache size to prevent memory leaks)
    if (markdown_cache.size > 50) {
      const first_key = markdown_cache.keys().next().value
      markdown_cache.delete(first_key)
    }
    markdown_cache.set(cache_key, html)

    return html
  }, [content])

  return (
    <div
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: html_content }}
    />
  )
})

MarkdownRenderer.displayName = 'MarkdownRenderer'

const FileViewer = ({ file, on_close }) => {
  const [document_data, set_document_data] = useState(null)
  const [is_loading, set_is_loading] = useState(false)
  const [show_comments, set_show_comments] = useState(false)

  // Fetch document content when file changes
  useEffect(() => {
    if (!file) {
      set_document_data(null)
      return
    }

    // If file already has content (from mock data), use it directly
    if (file.content) {
      set_document_data(file)
      return
    }

    // Otherwise, fetch from API
    const fetch_document = async () => {
      try {
        set_is_loading(true)
        const doc = await get_document_by_id(file.id)
        set_document_data(doc)
      } catch (error) {
        console.error('Error fetching document:', error)
        toast_error('Failed to load document content')
        // Use file data as fallback
        set_document_data(file)
      } finally {
        set_is_loading(false)
      }
    }

    fetch_document()
  }, [file])

  if (!file) {
    return (
      <div className="flex-1 bg-background-light p-8">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <p className="text-text-muted font-reddit-sans">
              Choose a file from the explorer to see its contents
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show loading state
  if (is_loading || !document_data) {
    return (
      <div className="h-full bg-white/80 dark:bg-secondary-900/80 backdrop-blur-sm rounded-xl shadow-lg flex flex-col">
        <div className="rounded-t-xl px-6 py-4 border-b border-white/80 dark:border-secondary-600/50">
          <div className="flex items-center justify-between">
            <div className="h-7 w-48 bg-secondary-200 dark:bg-secondary-700 rounded animate-pulse" />
            {on_close && (
              <button
                onClick={on_close}
                className="p-2 rounded-lg text-text-muted hover:text-text-light"
                aria-label="Close file viewer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-text-muted font-reddit-sans">Loading document...</p>
          </div>
        </div>
      </div>
    )
  }

  // Use document_data instead of file for rendering
  const display_file = document_data

  const format_date = (date_string) => {
    return new Date(date_string).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const render_file_content = () => {
    // Check if we have content to display
    if (!display_file.content && !display_file.storage_path) {
      return (
        <div className="p-8 rounded-lg text-center">
          <FileText className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <p className="text-text-light mb-2 font-reddit-sans">
            No content available
          </p>
          <p className="text-text-muted text-sm font-reddit-sans">
            This document has no content to display
          </p>
        </div>
      )
    }

    // Handle content - convert to string if needed
    let content = display_file.content || ''

    // If content is an array, join it into a single string
    if (Array.isArray(content)) {
      content = content.join('\n')
    }

    // If content is an object, stringify it
    if (typeof content === 'object' && content !== null) {
      content = JSON.stringify(content, null, 2)
    }

    // Ensure content is a string
    content = String(content)

    // Always render as Markdown
    return <MarkdownRenderer content={content} />
  }

  return (
    <div className="h-full flex space-x-4">
      {/* File Viewer */}
      <div className={`${show_comments ? 'flex-1' : 'w-full'} bg-white/80 dark:bg-secondary-900/80 backdrop-blur-sm rounded-xl shadow-lg flex flex-col`}>
        {/* File Header */}
        <div className="rounded-t-xl px-6 py-4 sticky top-0 z-10 border-b border-white/80 dark:border-secondary-600/50">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-text-light font-sora">
                {display_file.title || display_file.name}
              </h1>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => set_show_comments(!show_comments)}
                className={`p-2 rounded-lg ${
                  show_comments
                    ? 'bg-primary-600 text-white'
                    : 'text-text-muted hover:text-text-light hover:bg-secondary-100 dark:hover:bg-secondary-700'
                }`}
                aria-label="Toggle comments"
              >
                <MessageSquare className="w-5 h-5" />
              </button>

              {on_close && (
                <button
                  onClick={on_close}
                  className="p-2 rounded-lg text-text-muted hover:text-text-light hover:bg-secondary-100 dark:hover:bg-secondary-700"
                  aria-label="Close file viewer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* File Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white/40 dark:bg-secondary-900/40 backdrop-blur-sm rounded-b-xl">
          {render_file_content()}
        </div>
      </div>

      {/* Comments Panel */}
      {show_comments && (
        <div className="w-[450px] flex-shrink-0">
          <CommentsSection document_id={display_file.id} />
        </div>
      )}
    </div>
  )
}

export default FileViewer