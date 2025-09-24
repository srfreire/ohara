import { useState } from 'react'
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react'
import * as Icons from 'lucide-react'
import {
  get_root_folders,
  get_subfolders,
  get_files_in_folder,
  get_file_icon,
  format_file_size
} from '../../utils/mock-data'

const FileExplorer = ({ selected_file, on_file_select, selected_folder, on_folder_select }) => {
  const [expanded_folders, set_expanded_folders] = useState(new Set(['2'])) // Expand 'Projects' by default

  const toggle_folder = (folder_id) => {
    const new_expanded = new Set(expanded_folders)
    if (new_expanded.has(folder_id)) {
      new_expanded.delete(folder_id)
    } else {
      new_expanded.add(folder_id)
    }
    set_expanded_folders(new_expanded)
    on_folder_select(folder_id)
  }

  const FileIcon = ({ file_type, className }) => {
    const icon_name = get_file_icon(file_type)
    const IconComponent = Icons[icon_name]
    return IconComponent ? <IconComponent className={className} /> : <Icons.File className={className} />
  }

  const FolderItem = ({ folder, level = 0 }) => {
    const is_expanded = expanded_folders.has(folder.id)
    const is_selected = selected_folder === folder.id
    const subfolders = get_subfolders(folder.id)
    const files = get_files_in_folder(folder.id)
    const has_children = subfolders.length > 0 || files.length > 0

    return (
      <div>
        {/* Folder Row */}
        <div
          className={`flex items-center space-x-2 py-2 px-3 cursor-pointer hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg transition-colors duration-200 ${
            is_selected ? 'bg-primary-100 dark:bg-primary-900 border border-primary-200 dark:border-primary-700' : ''
          }`}
          style={{ marginLeft: `${level * 20}px` }}
          onClick={() => toggle_folder(folder.id)}
        >
          {/* Expand/Collapse Icon */}
          <div className="w-4 h-4 flex items-center justify-center">
            {has_children ? (
              is_expanded ? (
                <ChevronDown className="w-4 h-4 text-text-muted" />
              ) : (
                <ChevronRight className="w-4 h-4 text-text-muted" />
              )
            ) : null}
          </div>

          {/* Folder Icon */}
          {is_expanded ? (
            <FolderOpen className="w-5 h-5 text-primary-500" />
          ) : (
            <Folder className="w-5 h-5 text-primary-500" />
          )}

          {/* Folder Name */}
          <span className="text-text-light font-medium truncate">
            {folder.name}
          </span>
        </div>

        {/* Children (when expanded) */}
        {is_expanded && (
          <div>
            {/* Subfolders */}
            {subfolders.map(subfolder => (
              <FolderItem key={subfolder.id} folder={subfolder} level={level + 1} />
            ))}

            {/* Files */}
            {files.map(file => (
              <div
                key={file.id}
                className={`flex items-center space-x-2 py-2 px-3 cursor-pointer hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg transition-colors duration-200 ${
                  selected_file === file.id ? 'bg-secondary-200 dark:bg-secondary-700 border border-secondary-300 dark:border-secondary-600' : ''
                }`}
                style={{ marginLeft: `${(level + 1) * 20 + 20}px` }}
                onClick={() => on_file_select(file)}
              >
                {/* File Icon */}
                <FileIcon file_type={file.file_type} className="w-4 h-4 text-text-muted" />

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-text-light text-sm truncate">
                    {file.name}
                  </div>
                  <div className="text-xs text-text-muted">
                    {format_file_size(file.size)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const root_folders = get_root_folders()

  return (
    <div className="w-80 bg-background-surface border-r border-secondary-200 dark:border-secondary-700 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
        <h2 className="text-lg font-semibold text-text-light">
          File Explorer
        </h2>
      </div>

      {/* File Tree */}
      <div className="p-4 space-y-1">
        {root_folders.map(folder => (
          <FolderItem key={folder.id} folder={folder} />
        ))}
      </div>
    </div>
  )
}

export default FileExplorer