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
      <div className="flex-1 flex overflow-hidden">
        {/* File Explorer */}
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

        {/* File Viewer - Only show when file is selected */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            selected_file
              ? 'flex-1 opacity-100 transform translate-x-0'
              : 'w-0 opacity-0 transform translate-x-4 overflow-hidden'
          }`}
        >
          {selected_file && (
            <FileViewer
              file={selected_file}
              on_close={handle_close_file}
            />
          )}
        </div>

        {/* Chat Agent Sidebar */}
        <ChatAgent
          is_collapsed={is_chat_collapsed}
          on_toggle_collapse={handle_toggle_chat}
        />
      </div>
    </div>
  )
}

export default Dashboard