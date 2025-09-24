import { format_file_size } from '../../utils/mock-data'
import { Calendar, FileText, Download } from 'lucide-react'

const FileViewer = ({ file }) => {
  if (!file) {
    return (
      <div className="flex-1 bg-background-light p-8">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-light mb-2">
              Select a file to view
            </h3>
            <p className="text-text-muted">
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
      case 'text':
      case 'javascript':
      case 'json':
        return (
          <pre className="bg-secondary-50 dark:bg-secondary-900 p-6 rounded-lg overflow-auto text-sm text-text-light whitespace-pre-wrap font-mono">
            {file.content}
          </pre>
        )

      case 'pdf':
        return (
          <div className="bg-secondary-50 dark:bg-secondary-900 p-8 rounded-lg text-center">
            <FileText className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <p className="text-text-light mb-2">PDF Document</p>
            <p className="text-text-muted text-sm mb-4">
              {file.content}
            </p>
            <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto">
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        )

      case 'image':
        return (
          <div className="bg-secondary-50 dark:bg-secondary-900 p-8 rounded-lg text-center">
            <div className="w-48 h-32 bg-gradient-to-br from-primary-200 to-secondary-200 dark:from-primary-800 dark:to-secondary-800 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-text-muted text-sm">Image Preview</span>
            </div>
            <p className="text-text-light mb-2">Image File</p>
            <p className="text-text-muted text-sm">
              {file.content}
            </p>
          </div>
        )

      default:
        return (
          <div className="bg-secondary-50 dark:bg-secondary-900 p-8 rounded-lg text-center">
            <FileText className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <p className="text-text-light mb-2">
              Cannot preview this file type
            </p>
            <p className="text-text-muted text-sm">
              File type: {file.file_type}
            </p>
          </div>
        )
    }
  }

  return (
    <div className="flex-1 bg-background-light overflow-auto">
      {/* File Header */}
      <div className="bg-background-surface border-b border-secondary-200 dark:border-secondary-700 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-light mb-2">
              {file.name}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-text-muted">
              <span className="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 px-2 py-1 rounded">
                {file.file_type}
              </span>
              <span>{format_file_size(file.size)}</span>
            </div>
          </div>

          <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200">
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>

        {/* File Metadata */}
        <div className="mt-4 flex items-center space-x-6 text-sm text-text-muted">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Created: {format_date(file.created_at)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Modified: {format_date(file.updated_at)}</span>
          </div>
        </div>
      </div>

      {/* File Content */}
      <div className="p-6">
        {render_file_content()}
      </div>
    </div>
  )
}

export default FileViewer