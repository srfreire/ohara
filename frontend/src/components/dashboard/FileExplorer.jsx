import { useState, Fragment } from "react";
import {
  ChevronRight,
  ChevronDown,
  PanelRightClose,
  PanelRightOpen,
  ArrowLeft,
  Folder,
  FolderOpen,
  Home,
} from "lucide-react";
import * as Icons from "lucide-react";
import FileListSkeleton from "../ui/FileListSkeleton";
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
  // Auto-determine view mode based on file selection
  const view_mode = selected_file ? "list" : "icon";
  const [expanded_folders, set_expanded_folders] = useState(new Set());

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

  const toggle_folder = (folder_id) => {
    const new_expanded = new Set(expanded_folders);
    if (new_expanded.has(folder_id)) {
      new_expanded.delete(folder_id);
    } else {
      new_expanded.add(folder_id);
    }
    set_expanded_folders(new_expanded);
    on_folder_select(folder_id);
  };

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
          {file.name}
        </span>
      </div>
    );
  };

  const FolderItem = ({ folder, level = 0 }) => {
    const is_expanded = expanded_folders.has(folder.id);
    const is_selected = selected_folder === folder.id;
    const subfolders = get_subfolders_data(folder.id);
    const files = get_files_in_folder_data(folder.id);
    const has_children = subfolders.length > 0 || files.length > 0;

    return (
      <div>
        {/* Folder Row */}
        <div
          className={`flex items-center space-x-2 py-2 px-3 cursor-pointer hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg ${
            is_selected
              ? "bg-primary-100 dark:bg-primary-900 border border-primary-200 dark:border-primary-700"
              : ""
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
          <img
            src={
              is_expanded ? "/src/assets/open.png" : "/src/assets/closed.png"
            }
            alt={is_expanded ? "Open folder" : "Closed folder"}
            className="w-5 h-5"
          />

          {/* Folder Name */}
          <span className="text-text-light font-medium truncate flex-1 min-w-0 font-reddit-sans">
            {folder.name}
          </span>
        </div>

        {/* Children (when expanded) */}
        {is_expanded && (
          <div>
            {/* Subfolders */}
            {subfolders.map((subfolder) => (
              <FolderItem
                key={subfolder.id}
                folder={subfolder}
                level={level + 1}
              />
            ))}

            {/* Files */}
            {files.map((file) => (
              <div
                key={file.id}
                className={`flex items-center space-x-2 py-2 px-3 cursor-pointer hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg ${
                  selected_file === file.id
                    ? "bg-secondary-200 dark:bg-secondary-700 border border-secondary-300 dark:border-white/80"
                    : ""
                }`}
                style={{ marginLeft: `${(level + 1) * 20 + 20}px` }}
                onClick={() => on_file_select(file)}
              >
                {/* File Icon */}
                <FileIcon
                  file_type={file.file_type}
                  className="w-4 h-4 text-text-muted"
                  is_selected={selected_file === file.id}
                />

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-text-light text-sm truncate font-reddit-sans">
                    {file.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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

  const root_folders = get_root_folders_data();

  const get_width_class = () => {
    if (is_collapsed) return "w-12"; // Just show the collapse button
    if (is_expanded || !selected_file) return "flex-1";
    return "w-80";
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
        <div className="flex-1 relative min-h-0">
        {/* Icon Grid View */}
        <div
          className={`absolute inset-0 overflow-auto ${
            view_mode === "icon"
              ? "opacity-100 transform translate-x-0 pointer-events-auto z-10"
              : "opacity-0 transform translate-x-4 pointer-events-none z-0"
          }`}
        >
          <IconGridView />
        </div>

        {/* Traditional List View */}
        <div
          className={`absolute inset-0 overflow-auto ${
            view_mode === "list"
              ? "opacity-100 transform translate-x-0 pointer-events-auto z-10"
              : "opacity-0 transform -translate-x-4 pointer-events-none z-0"
          }`}
        >
          {is_loading ? (
            <FileListSkeleton count={5} />
          ) : (
            <div className="p-4 space-y-1">
              {root_folders.map((folder) => (
                <FolderItem key={folder.id} folder={folder} />
              ))}
            </div>
          )}
        </div>
        </div>
      )}
    </div>
  );
};

export default FileExplorer;
