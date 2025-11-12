import { useState, useEffect } from 'react'
import Header from '../layout/Header'
import FileExplorer from './FileExplorer'
import FileViewer from './FileViewer'
import ChatAgent from '../chat/ChatAgent'
import { get_folders } from '../../api/folders' // Updated to use .ts file
import { get_documents } from '../../api/documents' // Updated to use .ts file
import { toast_error } from '../../utils/toast'

const Dashboard = () => {
  const [selected_file, set_selected_file] = useState(null)
  const [selected_folder, set_selected_folder] = useState(null)
  const [is_chat_collapsed, set_is_chat_collapsed] = useState(false)
  const [current_folder_id, set_current_folder_id] = useState(null) // For icon view navigation
  const [folders, set_folders] = useState([])
  const [documents, set_documents] = useState([])
  const [is_loading, set_is_loading] = useState(true)
  const [active_citation, set_active_citation] = useState(null)

  // Fetch folders and documents on mount
  useEffect(() => {
    fetch_folders_and_documents()
  }, [])

  const fetch_folders_and_documents = async () => {
    try {
      set_is_loading(true)
      // v2 API: Fetch folders and documents with cursor pagination
      // Using high limit to fetch all at once (can be optimized with infinite scroll later)
      const [folders_result, documents_result] = await Promise.all([
        get_folders({ limit: 100 }),
        get_documents({ limit: 100 })
      ])

      // Extract data from v2 response format
      set_folders(folders_result.folders)
      set_documents(documents_result.documents)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast_error('Failed to load files and folders')
    } finally {
      set_is_loading(false)
    }
  }

  const handle_file_select = (file) => {
    set_selected_file(file)
  }

  const handle_folder_select = (folder_id) => {
    set_selected_folder(folder_id)
  }

  const handle_folder_navigate = (folder_id) => {
    set_current_folder_id(folder_id)
    set_selected_folder(folder_id)
  }

  const handle_close_file = () => {
    set_selected_file(null)
  }

  const handle_breadcrumb_click = (folder_id) => {
    set_selected_file(null)
    set_current_folder_id(folder_id)
    set_selected_folder(folder_id)
  }

  const handle_toggle_chat = () => {
    set_is_chat_collapsed(!is_chat_collapsed)
  }

  const handle_citation_click = (citation, citation_number) => {
    console.log('📖 Citation clicked:', { citation_number, citation })
    set_active_citation(citation)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handle_keyboard_shortcuts = (e) => {
      // ESC key: Close file and return to file explorer
      if (e.key === 'Escape') {
        if (selected_file) {
          set_selected_file(null)
          e.preventDefault()
        }
        return
      }
    }

    document.addEventListener('keydown', handle_keyboard_shortcuts)
    return () => {
      document.removeEventListener('keydown', handle_keyboard_shortcuts)
    }
  }, [selected_file])

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      {/* Background Hero Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/hero.jpg)',
        }}
      >
        {/* Overlay for better contrast */}
        <div className="absolute inset-0 bg-black/20 dark:bg-black/50"></div>
      </div>

      {/* Header */}
      <div className="relative z-10">
        <Header />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden gap-4 p-4 relative z-10">
        {/* File Explorer - Only show when no file is selected */}
        {!selected_file && (
          <FileExplorer
            selected_file={null}
            on_file_select={handle_file_select}
            selected_folder={selected_folder}
            on_folder_select={handle_folder_select}
            is_collapsed={false}
            on_toggle_collapse={() => {}}
            is_expanded={true}
            current_folder_id={current_folder_id}
            on_folder_navigate={handle_folder_navigate}
            can_collapse={false}
            folders={folders}
            documents={documents}
            is_loading={is_loading}
          />
        )}

        {/* File Viewer - Only render when file is selected */}
        {selected_file && (
          <div className="flex-1 h-full">
            <FileViewer
              file={selected_file}
              folders={folders}
              on_close={handle_close_file}
              on_breadcrumb_click={handle_breadcrumb_click}
              citation_to_highlight={active_citation}
            />
          </div>
        )}

        {/* Chat Agent Sidebar */}
        {!is_chat_collapsed && (
          <ChatAgent
            is_collapsed={is_chat_collapsed}
            on_toggle_collapse={handle_toggle_chat}
            selected_document_id={selected_file?.nessie_id}
            on_citation_click={handle_citation_click}
          />
        )}

        {/* Floating AI Button when collapsed */}
        {is_chat_collapsed && (
          <button
            onClick={handle_toggle_chat}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
            aria-label="Expand chat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <rect width="18" height="10" x="3" y="11" rx="2"></rect>
              <circle cx="12" cy="5" r="2"></circle>
              <path d="M12 7v4"></path>
              <line x1="8" x2="8" y1="16" y2="16"></line>
              <line x1="16" x2="16" y1="16" y2="16"></line>
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

export default Dashboard