import { FileText, X, MessageSquare, Home, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { get_document_url } from '../../api/documents'
import { toast_error } from '../../utils/toast'
import LoadingSpinner from '../ui/LoadingSpinner'
import CommentsSection from '../comments/CommentsSection'
import PdfViewer from '../pdf/PdfViewer'
import AddToCollectionButton from '../collections/AddToCollectionButton'

const FileViewer = ({ file, folders = [], on_close, on_breadcrumb_click, citation_to_highlight }) => {
  const [pdf_url, set_pdf_url] = useState(null)
  const [is_loading, set_is_loading] = useState(false)
  const [show_comments, set_show_comments] = useState(false)

  // Helper to get folder by id
  const get_folder_by_id = (folder_id) => {
    return folders.find(folder => folder.id === folder_id)
  }

  // Build folder path from file's folder_id
  const get_folder_path = () => {
    if (!file.folder_id) return []

    const path = []
    let current_folder = get_folder_by_id(file.folder_id)

    while (current_folder) {
      path.unshift(current_folder)
      current_folder = current_folder.parent_id ? get_folder_by_id(current_folder.parent_id) : null
    }

    return path
  }

  const folder_path = get_folder_path()

  // Fetch document PDF URL when file changes
  useEffect(() => {
    if (!file) {
      set_pdf_url(null)
      return
    }

    const fetch_document_url = async () => {
      try {
        set_is_loading(true)
        const { url } = await get_document_url(file.id)
        set_pdf_url(url)
      } catch (error) {
        console.error('Error fetching document URL:', error)
        toast_error('Failed to load document')
        set_pdf_url(null)
      } finally {
        set_is_loading(false)
      }
    }

    fetch_document_url()
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
  if (is_loading || !pdf_url) {
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

  const format_date = (date_string) => {
    return new Date(date_string).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="h-full flex space-x-4">
      {/* File Viewer */}
      <div className={`${show_comments ? 'flex-1' : 'w-full'} bg-white/80 dark:bg-secondary-900/80 backdrop-blur-sm rounded-xl shadow-lg flex flex-col`}>
        {/* File Header with Breadcrumbs */}
        <div className="rounded-t-xl px-6 py-4 sticky top-0 z-10 border-b border-white/80 dark:border-secondary-600/50">
          <div className="flex items-center justify-between">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center space-x-2 flex-wrap min-h-[28px] flex-1 min-w-0">
              {/* Home breadcrumb */}
              <button
                onClick={() => on_breadcrumb_click && on_breadcrumb_click(null)}
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors flex items-center h-7"
                title="Home"
              >
                <Home className="w-5 h-5" />
              </button>

              {/* Folder path breadcrumbs */}
              {folder_path.map((folder, index) => (
                <div key={folder.id} className="flex items-center space-x-2">
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                  <button
                    onClick={() => on_breadcrumb_click && on_breadcrumb_click(folder.id)}
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium font-reddit-sans transition-colors h-7 flex items-center"
                  >
                    {folder.name}
                  </button>
                </div>
              ))}

              {/* Current file name */}
              <div className="flex items-center space-x-2">
                <ChevronRight className="w-4 h-4 text-text-muted" />
                <h1 className="text-xl font-bold text-text-light font-sora truncate">
                  {file.title || file.name}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
              {/* Add to Collection Button */}
              {file.id && (
                <AddToCollectionButton
                  document_id={file.id}
                  variant="icon"
                  className="p-2"
                />
              )}

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

        {/* PDF Content */}
        <div className="flex-1 overflow-hidden rounded-b-xl">
          <PdfViewer
            pdf_url={pdf_url}
            document_title={file.title || file.name}
            citation_to_highlight={citation_to_highlight}
          />
        </div>
      </div>

      {/* Comments Panel */}
      {show_comments && (
        <div className="w-[400px] flex-shrink-0">
          <CommentsSection document_id={file.id} />
        </div>
      )}
    </div>
  )
}

export default FileViewer
