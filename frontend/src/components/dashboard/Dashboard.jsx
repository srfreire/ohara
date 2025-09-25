import { useState, useEffect } from 'react'
import Header from '../layout/Header'
import FileExplorer from './FileExplorer'
import FileViewer from './FileViewer'
import ChatAgent from '../chat/ChatAgent'

const Dashboard = () => {
  const [selected_file, set_selected_file] = useState(null)
  const [selected_folder, set_selected_folder] = useState('2') // Default to 'Projects' folder
  const [is_file_explorer_collapsed, set_is_file_explorer_collapsed] = useState(false)
  const [is_chat_collapsed, set_is_chat_collapsed] = useState(false)
  const [current_folder_id, set_current_folder_id] = useState(null) // For icon view navigation

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
    // Auto-expand file explorer when returning to icon view
    set_is_file_explorer_collapsed(false)
  }

  const handle_toggle_file_explorer = () => {
    set_is_file_explorer_collapsed(!is_file_explorer_collapsed)
  }

  const handle_toggle_chat = () => {
    set_is_chat_collapsed(!is_chat_collapsed)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handle_keyboard_shortcuts = (e) => {
      // ESC key: Close file and return to icon view
      if (e.key === 'Escape') {
        if (selected_file) {
          set_selected_file(null)
          // Auto-expand file explorer when returning to icon view
          set_is_file_explorer_collapsed(false)
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
    <div className="h-screen bg-background-light flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden gap-4 p-4">
        {/* File Explorer - Only render when not collapsed */}
        {!is_file_explorer_collapsed ? (
          <FileExplorer
            selected_file={selected_file?.id}
            on_file_select={handle_file_select}
            selected_folder={selected_folder}
            on_folder_select={handle_folder_select}
            is_collapsed={is_file_explorer_collapsed}
            on_toggle_collapse={handle_toggle_file_explorer}
            is_expanded={!selected_file} // Expand when no file selected
            current_folder_id={current_folder_id}
            on_folder_navigate={handle_folder_navigate}
          />
        ) : (
          /* Floating File Explorer Button when collapsed */
          <button
            onClick={handle_toggle_file_explorer}
            className="fixed top-20 left-6 z-50 w-14 h-14 bg-secondary-600 hover:bg-secondary-700 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
            aria-label="Expand file explorer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
            </svg>
          </button>
        )}

        {/* File Viewer - Only render when file is selected */}
        {selected_file && (
          <div className="flex-1 h-full">
            <FileViewer
              file={selected_file}
              on_close={handle_close_file}
            />
          </div>
        )}

        {/* Chat Agent Sidebar */}
        {!is_chat_collapsed && (
          <ChatAgent
            is_collapsed={is_chat_collapsed}
            on_toggle_collapse={handle_toggle_chat}
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