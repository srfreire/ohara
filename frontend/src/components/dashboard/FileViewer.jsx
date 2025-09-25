import { Calendar, FileText, Download, X } from 'lucide-react'
import { marked } from 'marked'
import { memo, useMemo } from 'react'

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
    switch (file.file_type) {
      case 'markdown':
        return (
          <MarkdownRenderer content={file.content} />
        )

      case 'text':
      case 'javascript':
      case 'json':
        return (
          <pre className="p-6 rounded-lg overflow-auto text-sm text-text-light whitespace-pre-wrap font-mono font-reddit-sans">
            {file.content}
          </pre>
        )

      case 'pdf':
        return (
          <div className="p-8 rounded-lg text-center">
            <FileText className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <p className="text-text-light mb-2 font-reddit-sans">PDF Document</p>
            <p className="text-text-muted text-sm mb-4 font-reddit-sans">
              {file.content}
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
                src={file.content}
                alt={file.name}
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
            <p className="text-text-light mb-2 font-reddit-sans">{file.name}</p>
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
              File type: {file.file_type}
            </p>
          </div>
        )
    }
  }

  return (
    <div className="h-full bg-white/80 backdrop-blur-sm rounded-xl shadow-lg flex flex-col">
      {/* File Header */}
      <div className="rounded-t-xl px-6 py-4 sticky top-0 z-10 border-b border-white/80">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-text-light font-sora">
              {file.name}
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
      <div className="flex-1 no-scrollbar overflow-y-auto p-6 bg-white/40 backdrop-blur-sm rounded-b-xl">
        {render_file_content()}
      </div>
    </div>
  )
}

export default FileViewer