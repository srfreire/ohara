import { useState, Fragment, useEffect } from "react";
import {
  ChevronRight,
  PanelRightClose,
  PanelRightOpen,
  Folder,
  Home,
  Bookmark,
  BookmarkPlus,
} from "lucide-react";
import toast from 'react-hot-toast';
import FileGridSkeleton from "../ui/FileGridSkeleton";
import CollectionGrid from "../collections/CollectionGrid";
import CollectionDetail from "../collections/CollectionDetail";
import CollectionForm from "../collections/CollectionForm";
import CollectionPicker from "../collections/CollectionPicker";
import ConfirmModal from "../ui/ConfirmModal";
import { useCollectionsStore } from "../../stores/collections-store";
import { useAuth } from "../../contexts/auth-context";

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
  // Collections state and store
  const { user } = useAuth();
  const [view_mode, set_view_mode] = useState('files'); // 'files' or 'collections'
  const [selected_collection, set_selected_collection] = useState(null);
  const [is_form_open, set_is_form_open] = useState(false);
  const [collection_to_edit, set_collection_to_edit] = useState(null);
  const [collection_to_delete, set_collection_to_delete] = useState(null);
  const [is_saving, set_is_saving] = useState(false);

  const {
    collections,
    items_by_collection,
    loading: collections_loading,
    fetch_collections,
    fetch_collection_items,
    create_collection_action,
    update_collection_action,
    delete_collection_action,
    remove_item,
  } = useCollectionsStore();

  // Fetch collections when switching to collections view
  useEffect(() => {
    if (view_mode === 'collections' && user) {
      fetch_collections().catch((error) => {
        console.error('Error fetching collections:', error);
        toast.error('Failed to load collections');
      });
    }
  }, [view_mode, user, fetch_collections]);

  // Fetch items when selecting a collection
  useEffect(() => {
    if (selected_collection && user) {
      fetch_collection_items(selected_collection.id).catch((error) => {
        console.error('Error fetching collection items:', error);
        toast.error('Failed to load collection items');
      });
    }
  }, [selected_collection, user, fetch_collection_items]);

  // Collections handlers
  const handle_view_toggle = () => {
    set_view_mode(view_mode === 'files' ? 'collections' : 'files');
    set_selected_collection(null);
  };

  const handle_collection_click = (collection) => {
    set_selected_collection(collection);
  };

  const handle_collection_back = () => {
    set_selected_collection(null);
  };

  const handle_create_new = () => {
    set_collection_to_edit(null);
    set_is_form_open(true);
  };

  const handle_collection_edit = (collection) => {
    set_collection_to_edit(collection);
    set_is_form_open(true);
  };

  const handle_collection_delete = (collection) => {
    set_collection_to_delete(collection);
  };

  const handle_form_save = async (collection_data) => {
    set_is_saving(true);
    try {
      if (collection_to_edit) {
        // Edit existing collection
        await update_collection_action(collection_to_edit.id, collection_data);
        toast.success('Collection updated successfully');
      } else {
        // Create new collection
        const new_collection_data = {
          ...collection_data,
          user_id: user.id,
        };
        await create_collection_action(new_collection_data);
        toast.success('Collection created successfully');
      }
      set_is_form_open(false);
      set_collection_to_edit(null);
    } catch (error) {
      console.error('Error saving collection:', error);
      toast.error(error.message || 'Failed to save collection');
    } finally {
      set_is_saving(false);
    }
  };

  const handle_delete_confirm = async () => {
    if (!collection_to_delete) return;

    try {
      await delete_collection_action(collection_to_delete.id);
      toast.success('Collection deleted successfully');

      // If we're viewing the deleted collection, go back
      if (selected_collection?.id === collection_to_delete.id) {
        set_selected_collection(null);
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
      toast.error('Failed to delete collection');
    }
  };

  const handle_item_remove = async (item) => {
    if (!selected_collection) return;

    try {
      await remove_item(selected_collection.id, item.id);
      toast.success('Removed from collection');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    }
  };

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

  // State for collection picker at FileExplorer level
  const [picker_document_id, set_picker_document_id] = useState(null);

  const FileIconItem = ({ file, animation_delay = 0 }) => {
    const [is_hovered, set_is_hovered] = useState(false);
    const { document_collections } = useCollectionsStore();

    // Debug: Log file structure
    if (is_hovered && file.id) {
      console.log('FileIconItem - File object:', file);
      console.log('FileIconItem - file.id:', file.id, 'type:', typeof file.id);
    }

    const get_large_icon = (file_type) => {
      return (
        <img
          src={is_hovered ? "/src/assets/fold.png" : "/src/assets/file.png"}
          alt="File"
          className="w-14 h-14"
        />
      );
    };

    const collection_count = document_collections[file.id]?.length || 0;
    const collection_names = collection_count > 0
      ? (collections || [])
          .filter((c) => c != null && c.id && document_collections[file.id]?.includes(c.id))
          .map((c) => c.name)
          .join(', ')
      : '';

    return (
      <div
        className="flex flex-col items-center p-4 rounded-lg cursor-pointer hover:bg-secondary-100 dark:hover:bg-secondary-800 group relative"
        onClick={() => on_file_select && on_file_select(file)}
        onMouseEnter={() => set_is_hovered(true)}
        onMouseLeave={() => set_is_hovered(false)}
      >
        {/* Add to collection button - show on hover */}
        {is_hovered && file.id && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              console.log('🔘 Opening picker for:', file.id);
              set_picker_document_id(file.id);
            }}
            className="absolute top-2 right-2 z-50 p-1.5 rounded bg-white/90 dark:bg-secondary-700/90 hover:bg-primary-100 dark:hover:bg-primary-900/50 text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors shadow-sm"
            title="Add to collection"
          >
            <BookmarkPlus className={`w-4 h-4 ${collection_count > 0 ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Collection badge - show when not hovering and in collections */}
        {!is_hovered && collection_count > 0 && (
          <div
            className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-primary-600 text-white text-xs font-medium shadow-sm z-10"
            title={`In collections: ${collection_names}`}
          >
            {collection_count}
          </div>
        )}

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
              {view_mode === 'files' ? 'File Explorer' : 'Collections'}
            </h2>
          </div>
        )}

        {/* Right side buttons */}
        {!is_collapsed && (
          <div className="flex items-center gap-2">
            {/* Bookmark toggle button */}
            <button
              onClick={handle_view_toggle}
              className={`p-2 rounded-lg transition-colors ${
                view_mode === 'collections'
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                  : 'text-text-muted hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
              }`}
              title={view_mode === 'files' ? 'View Collections' : 'View Files'}
            >
              <Bookmark className={`w-5 h-5 ${view_mode === 'collections' ? 'fill-current' : ''}`} />
            </button>

            {/* Collapse Button */}
            {(can_collapse || is_collapsed) && (
              <button
                onClick={on_toggle_collapse}
                className={`p-2 rounded-lg text-text-muted hover:text-text-light ${
                  !can_collapse && !is_collapsed ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                aria-label={is_collapsed ? "Expand file explorer" : "Collapse file explorer"}
                disabled={!can_collapse && !is_collapsed}
              >
                <PanelRightOpen className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Collapse button when collapsed */}
        {is_collapsed && (can_collapse || is_collapsed) && (
          <button
            onClick={on_toggle_collapse}
            className="p-2 rounded-lg text-text-muted hover:text-text-light"
            aria-label="Expand file explorer"
          >
            <PanelRightClose className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Content Area - Only show when not collapsed */}
      {!is_collapsed && (
        <div className="flex-1 overflow-auto">
          {view_mode === 'files' ? (
            <IconGridView />
          ) : (
            <>
              {selected_collection ? (
                <CollectionDetail
                  collection={selected_collection}
                  items={items_by_collection[selected_collection.id] || []}
                  documents={documents || []}
                  is_loading={collections_loading}
                  on_back={handle_collection_back}
                  on_item_remove={handle_item_remove}
                  on_document_click={on_file_select}
                />
              ) : (
                <CollectionGrid
                  collections={collections || []}
                  items_by_collection={items_by_collection || {}}
                  is_loading={collections_loading}
                  on_collection_click={handle_collection_click}
                  on_collection_edit={handle_collection_edit}
                  on_collection_delete={handle_collection_delete}
                  on_create_new={handle_create_new}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* Collection Form Modal */}
      <CollectionForm
        is_open={is_form_open}
        on_close={() => {
          set_is_form_open(false);
          set_collection_to_edit(null);
        }}
        on_save={handle_form_save}
        collection={collection_to_edit}
        is_loading={is_saving}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        is_open={collection_to_delete !== null}
        on_close={() => set_collection_to_delete(null)}
        on_confirm={() => {
          handle_delete_confirm();
          set_collection_to_delete(null);
        }}
        title="Delete Collection"
        message={`Are you sure you want to delete "${collection_to_delete?.name}"? This action cannot be undone.`}
        confirm_text="Delete"
        cancel_text="Cancel"
        variant="danger"
      />

      {/* Collection Picker Modal - Rendered at FileExplorer level */}
      <CollectionPicker
        is_open={picker_document_id !== null}
        on_close={() => set_picker_document_id(null)}
        document_id={picker_document_id}
        on_complete={() => {
          console.log('Collection picker completed for:', picker_document_id);
          set_picker_document_id(null);
        }}
      />
    </div>
  );
};

export default FileExplorer;
