import { useState } from 'react'
import Header from '../layout/Header'
import FileExplorer from './FileExplorer'
import FileViewer from './FileViewer'
import ChatAgent from '../chat/ChatAgent'

const Dashboard = () => {
  const [selected_file, set_selected_file] = useState(null)
  const [selected_folder, set_selected_folder] = useState('2') // Default to 'Projects' folder

  const handle_file_select = (file) => {
    set_selected_file(file)
  }

  const handle_folder_select = (folder_id) => {
    set_selected_folder(folder_id)
  }

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
        />

        {/* File Viewer */}
        <FileViewer file={selected_file} />

        {/* Chat Agent Sidebar */}
        <ChatAgent />
      </div>
    </div>
  )
}

export default Dashboard