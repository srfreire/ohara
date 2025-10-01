import { Calendar, FileText, Download, X } from 'lucide-react'
import { marked } from 'marked'
import { memo, useMemo, useState, useEffect } from 'react'
import { get_document_by_id } from '../../api/documents'
import { toast_error } from '../../utils/toast'
import LoadingSpinner from '../ui/LoadingSpinner'

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

    const file_type = display_file.file_type || 'text'
    const content = display_file.content || ''

    switch (file_type) {
      case 'markdown':
        return (
          <MarkdownRenderer content={content} />
        )

      case 'text':
      case 'javascript':
      case 'json':
        return (
          <pre className="p-6 rounded-lg overflow-auto text-sm text-text-light whitespace-pre-wrap font-mono font-reddit-sans">
            {content}
          </pre>
        )

      case 'pdf':
        return (
          <div className="p-8 rounded-lg text-center">
            <FileText className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <p className="text-text-light mb-2 font-reddit-sans">PDF Document</p>
            <p className="text-text-muted text-sm mb-4 font-reddit-sans">
              {display_file.storage_path || 'PDF file'}
            </p>
            <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto">
              <Download className="w-4 h-4" />
              <span className="font-reddit-sans">Download PDF</span>
            </button>
          </div>
        )

      case 'image':
        return (
          <div className="p-8 rounded-lg text-center">
            <div className="max-w-2xl mx-auto mb-4">
              <img
                src={content || display_file.storage_path}
                alt={display_file.name || display_file.title}
                className="w-full h-auto rounded-lg shadow-lg max-h-96 object-contain mx-auto"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
              <div className="w-48 h-32 bg-gradient-to-br from-primary-200 to-secondary-200 dark:from-primary-800 dark:to-secondary-800 rounded-lg mx-auto flex items-center justify-center" style={{display: 'none'}}>
                <span className="text-text-muted text-sm font-reddit-sans">Image Preview</span>
              </div>
            </div>
            <p className="text-text-light mb-2 font-reddit-sans">{display_file.name || display_file.title}</p>
          </div>
        )

      default:
        return (
          <div className="p-8 rounded-lg text-center">
            <FileText className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <p className="text-text-light mb-2 font-reddit-sans">
              Cannot preview this file type
            </p>
            <p className="text-text-muted text-sm font-reddit-sans">
              File type: {file_type}
            </p>
          </div>
        )
    }
  }

  return (
    <div className="h-full bg-white/80 dark:bg-secondary-900/80 backdrop-blur-sm rounded-xl shadow-lg flex flex-col">
      {/* File Header */}
      <div className="rounded-t-xl px-6 py-4 sticky top-0 z-10 border-b border-white/80 dark:border-secondary-600/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-text-light font-sora">
              {display_file.name || display_file.title}
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-lg text-text-muted hover:text-text-light">
              <Download className="w-5 h-5" />
            </button>

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
      </div>

      {/* File Content */}
      <div className="flex-1 no-scrollbar overflow-y-auto p-6 bg-white/40 dark:bg-secondary-900/40 backdrop-blur-sm rounded-b-xl">
        {render_file_content()}
      </div>
    </div>
  )
}

export default FileViewer