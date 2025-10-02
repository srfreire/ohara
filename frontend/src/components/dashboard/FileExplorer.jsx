import { useState, Fragment } from "react";
import {
  ChevronRight,
  PanelRightClose,
  PanelRightOpen,
  Folder,
  Home,
} from "lucide-react";
import FileGridSkeleton from "../ui/FileGridSkeleton";

const FileExplorer = ({
  selected_file,
  on_file_select,
  selected_folder,
  on_folder_select,
  is_collapsed,
  on_toggle_collapse,
  is_expanded = false,
  current_folder_id = null,
  on_folder_navigate,
  can_collapse = true,
  folders = null,
  documents = null,
  is_loading = false,
}) => {

  // Helper functions for API data only
  const get_root_folders_data = () => {
    if (!folders) return []
    return folders.filter(folder => !folder.parent_id)
  }

  const get_subfolders_data = (parent_id) => {
    if (!folders) return []
    return folders.filter(folder => folder.parent_id === parent_id)
  }

  const get_files_in_folder_data = (folder_id) => {
    if (!documents) return []
    return documents.filter(doc => doc.folder_id === folder_id)
  }

  const get_folder_by_id_data = (folder_id) => {
    if (!folders) return null
    return folders.find(folder => folder.id === folder_id)
  }

  const get_folder_path_data = (folder_id) => {
    if (!folder_id || !folders) return []

    const path = []
    let current_folder = get_folder_by_id_data(folder_id)

    while (current_folder) {
      path.unshift(current_folder)
      current_folder = current_folder.parent_id ? get_folder_by_id_data(current_folder.parent_id) : null
    }

    return path
  }

  const FileIcon = ({ file_type, className, is_selected = false }) => {
    return (
      <img
        src={is_selected ? "/src/assets/fold.png" : "/src/assets/file.png"}
        alt="File"
        className={className}
      />
    );
  };

  // Icon View Components
  const FolderIconItem = ({ folder, animation_delay = 0 }) => {
    const [is_hovered, set_is_hovered] = useState(false);

    return (
      <div
        className="flex flex-col items-center p-4 rounded-lg cursor-pointer hover:bg-secondary-100 dark:hover:bg-secondary-800 group"
        onClick={() => on_folder_navigate && on_folder_navigate(folder.id)}
        onMouseEnter={() => set_is_hovered(true)}
        onMouseLeave={() => set_is_hovered(false)}
      >
        <div className="w-16 h-16 mb-2 flex items-center justify-center">
          <img
            src={is_hovered ? "/src/assets/open.png" : "/src/assets/closed.png"}
            alt="Folder"
            className="w-14 h-14"
          />
        </div>
        <span className="text-sm text-text-light text-center max-w-full break-words overflow-hidden text-ellipsis font-reddit-sans">
          {folder.name}
        </span>
      </div>
    );
  };

  const FileIconItem = ({ file, animation_delay = 0 }) => {
    const [is_hovered, set_is_hovered] = useState(false);

    const get_large_icon = (file_type) => {
      return (
        <img
          src={is_hovered ? "/src/assets/fold.png" : "/src/assets/file.png"}
          alt="File"
          className="w-14 h-14"
        />
      );
    };

    return (
      <div
        className="flex flex-col items-center p-4 rounded-lg cursor-pointer hover:bg-secondary-100 dark:hover:bg-secondary-800 group"
        onClick={() => on_file_select && on_file_select(file)}
        onMouseEnter={() => set_is_hovered(true)}
        onMouseLeave={() => set_is_hovered(false)}
      >
        <div className="w-16 h-16 mb-2 flex items-center justify-center">
          {get_large_icon(file.file_type)}
        </div>
        <span className="text-sm text-text-light text-center max-w-full break-words overflow-hidden text-ellipsis font-reddit-sans">
          {file.title || file.name}
        </span>
      </div>
    );
  };


  // Grid View Layout Component
  const IconGridView = () => {
    if (is_loading) {
      return <FileGridSkeleton count={12} />
    }

    const folder_to_show = current_folder_id || null;
    const folders_to_display = folder_to_show
      ? get_subfolders_data(folder_to_show)
      : get_root_folders_data();
    const files_to_display = folder_to_show
      ? get_files_in_folder_data(folder_to_show)
      : [];

    return (
      <div className="p-6">
        {/* Breadcrumb/Header */}
        <div className="mb-6 flex items-center space-x-2 flex-wrap min-h-[28px]">
          {/* Root breadcrumb - only show when not at root */}
          {folder_to_show && (
            <button
              onClick={() => on_folder_navigate && on_folder_navigate(null)}
              className="text-primary-600 hover:text-primary-700 transition-colors flex items-center h-7"
              title="Home"
            >
              <Home className="w-5 h-5" />
            </button>
          )}

          {/* Show only home icon when at root */}
          {!folder_to_show && (
            <div className="h-7 flex items-center">
              <Home className="w-5 h-5 text-text-light" />
            </div>
          )}

          {/* Path breadcrumbs */}
          {folder_to_show && (() => {
            const folder_path = get_folder_path_data(folder_to_show)
            return folder_path.map((folder, index) => {
              const is_last = index === folder_path.length - 1
              return (
                <Fragment key={folder.id}>
                  <div className="h-7 flex items-center">
                    <ChevronRight className="w-4 h-4 text-text-muted" />
                  </div>
                  {is_last ? (
                    <div className="h-7 flex items-center">
                      <h3 className="text-lg font-semibold text-text-light font-sora leading-none">
                        {folder.name}
                      </h3>
                    </div>
                  ) : (
                    <button
                      onClick={() => on_folder_navigate && on_folder_navigate(folder.id)}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium font-reddit-sans transition-colors h-7 flex items-center"
                    >
                      {folder.name}
                    </button>
                  )}
                </Fragment>
              )
            })
          })()}
        </div>

        {/* Empty State */}
        {folders_to_display.length === 0 && files_to_display.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center min-h-[60vh]">
            <div className="w-24 h-24 mb-4 opacity-20">
              <Folder className="w-full h-full text-text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-text-light mb-2 font-sora">
              No files or folders
            </h3>
            <p className="text-text-muted font-reddit-sans">
              {folder_to_show ? "This folder is empty" : "Upload files to get started"}
            </p>
          </div>
        )}

        {/* Grid Layout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {/* Folders First */}
          {folders_to_display.map((folder, index) => (
            <FolderIconItem
              key={`folder-${folder.id}`}
              folder={folder}
              animation_delay={index * 50}
            />
          ))}

          {/* Then Files */}
          {files_to_display.map((file, index) => (
            <FileIconItem
              key={`file-${file.id}`}
              file={file}
              animation_delay={(folders_to_display.length + index) * 50}
            />
          ))}
        </div>
      </div>
    );
  };

  const get_width_class = () => {
    if (is_collapsed) return "w-12"; // Just show the collapse button
    return "flex-1";
  };

  return (
    <div
      className={`bg-white/80 dark:bg-secondary-900/80 backdrop-blur-lg rounded-xl shadow-lg flex flex-col overflow-hidden ${get_width_class()}`}
    >
      {/* Header */}
      <div className={`flex items-center p-4 border-b border-white/80 dark:border-secondary-600/50 ${
        is_collapsed ? 'justify-center' : 'justify-between'
      }`}>
        {!is_collapsed && (
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-text-light truncate font-sora">
              File Explorer
            </h2>
          </div>
        )}

        {/* Collapse Button - Always reserve space to prevent layout shift */}
        <div className="w-9 h-9 flex items-center justify-center">
          {(can_collapse || is_collapsed) && (
            <button
              onClick={on_toggle_collapse}
              className={`p-2 rounded-lg text-text-muted hover:text-text-light ${
                !can_collapse && !is_collapsed ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              aria-label={is_collapsed ? "Expand file explorer" : "Collapse file explorer"}
              disabled={!can_collapse && !is_collapsed}
            >
              {is_collapsed ? (
                <PanelRightClose className="w-5 h-5" />
              ) : (
                <PanelRightOpen className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content Area - Only show when not collapsed */}
      {!is_collapsed && (
        <div className="flex-1 overflow-auto">
          <IconGridView />
        </div>
      )}
    </div>
  );
};

export default FileExplorer;
