import { useState, useEffect } from 'react';
import { X, BookMarked, Plus, Check } from 'lucide-react';
import { useCollectionsStore } from '../../stores/collections-store';
import toast from 'react-hot-toast';

const CollectionPicker = ({
  is_open,
  on_close,
  document_id,
  on_complete,
}) => {
  const [selected_collection_ids, set_selected_collection_ids] = useState(new Set());
  const [initial_collection_ids, set_initial_collection_ids] = useState(new Set());
  const [is_saving, set_is_saving] = useState(false);
  const [show_create_inline, set_show_create_inline] = useState(false);
  const [new_collection_name, set_new_collection_name] = useState('');
  const [is_creating, set_is_creating] = useState(false);

  const {
    collections,
    items_by_collection,
    fetch_collections,
    fetch_collection_items,
    add_item,
    remove_item,
    create_collection_action,
  } = useCollectionsStore();

  // Load collections and determine which ones contain this document
  useEffect(() => {
    if (is_open && document_id) {
      console.log('📂 CollectionPicker opened for document_id:', document_id);
      console.log('Document ID type:', typeof document_id);
      console.log('Is valid UUID?', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(document_id));

      // Fetch collections
      fetch_collections().catch((error) => {
        console.error('Error fetching collections:', error);
      });

      // Check which collections contain this document
      const containing_collection_ids = new Set();
      Object.entries(items_by_collection).forEach(([collection_id, items]) => {
        if (items.some((item) => item.document_id === document_id)) {
          containing_collection_ids.add(collection_id);
        }
      });

      set_selected_collection_ids(new Set(containing_collection_ids));
      set_initial_collection_ids(new Set(containing_collection_ids));
    }
  }, [is_open, document_id, fetch_collections, items_by_collection]);

  // Fetch items for all collections when opening
  useEffect(() => {
    if (is_open && collections.length > 0) {
      collections.forEach((collection) => {
        if (!items_by_collection[collection.id]) {
          fetch_collection_items(collection.id).catch((error) => {
            console.error('Error fetching collection items:', error);
          });
        }
      });
    }
  }, [is_open, collections, items_by_collection, fetch_collection_items]);

  const toggle_collection = (collection_id) => {
    const new_set = new Set(selected_collection_ids);
    if (new_set.has(collection_id)) {
      new_set.delete(collection_id);
    } else {
      new_set.add(collection_id);
    }
    set_selected_collection_ids(new_set);
  };

  const handle_create_inline = async () => {
    if (!new_collection_name.trim()) {
      toast.error('Collection name is required');
      return;
    }

    set_is_creating(true);
    try {
      const new_collection = await create_collection_action({
        name: new_collection_name.trim(),
        visibility: 'private',
      });

      toast.success('Collection created');
      set_new_collection_name('');
      set_show_create_inline(false);

      // Auto-select the new collection
      const new_set = new Set(selected_collection_ids);
      new_set.add(new_collection.id);
      set_selected_collection_ids(new_set);
    } catch (error) {
      console.error('Error creating collection:', error);
      toast.error('Failed to create collection');
    } finally {
      set_is_creating(false);
    }
  };

  const handle_save = async () => {
    set_is_saving(true);

    console.log('=== COLLECTION PICKER SAVE ===');
    console.log('Document ID:', document_id);
    console.log('Document ID type:', typeof document_id);
    console.log('Is valid UUID?', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(document_id));
    console.log('Selected collections:', [...selected_collection_ids]);
    console.log('Initial collections:', [...initial_collection_ids]);

    try {
      const promises = [];

      // Add to newly selected collections
      selected_collection_ids.forEach((collection_id) => {
        if (!initial_collection_ids.has(collection_id)) {
          console.log('Adding to collection:', collection_id);
          promises.push(add_item(collection_id, document_id));
        }
      });

      // Remove from deselected collections
      initial_collection_ids.forEach((collection_id) => {
        if (!selected_collection_ids.has(collection_id)) {
          const items = items_by_collection[collection_id] || [];
          const item = items.find((item) => item.document_id === document_id);
          if (item) {
            console.log('Removing from collection:', collection_id);
            promises.push(remove_item(collection_id, item.id));
          }
        }
      });

      console.log('Executing', promises.length, 'operations...');
      await Promise.all(promises);

      const added_count = [...selected_collection_ids].filter(
        (id) => !initial_collection_ids.has(id)
      ).length;
      const removed_count = [...initial_collection_ids].filter(
        (id) => !selected_collection_ids.has(id)
      ).length;

      if (added_count > 0 || removed_count > 0) {
        toast.success('Collections updated successfully');
      }

      on_complete && on_complete();
      on_close();
    } catch (error) {
      console.error('Error updating collections:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to update collections');
    } finally {
      set_is_saving(false);
    }
  };

  const handle_close = () => {
    set_show_create_inline(false);
    set_new_collection_name('');
    on_close();
  };

  if (!is_open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handle_close}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-secondary-900 rounded-xl shadow-2xl border border-white/80 dark:border-secondary-600/50 p-6 max-w-md w-full mx-4 max-h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Close button */}
        <button
          onClick={handle_close}
          disabled={is_saving}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 text-text-muted transition-colors disabled:opacity-50"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
          <BookMarked className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-text-light mb-2 font-sora">
          Add to Collections
        </h2>
        <p className="text-sm text-text-muted mb-4 font-reddit-sans">
          Select which collections should contain this document
        </p>

        {/* Collections list */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-2 min-h-0">
          {collections.length === 0 ? (
            <div className="text-center py-8 text-text-muted font-reddit-sans">
              No collections yet. Create one below.
            </div>
          ) : (
            collections
              .filter((collection) => collection != null && collection.id)
              .map((collection) => {
                const is_selected = selected_collection_ids.has(collection.id);
                return (
                  <label
                    key={collection.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    is_selected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-secondary-300 dark:border-secondary-600 hover:bg-secondary-50 dark:hover:bg-secondary-800'
                  }`}
                >
                  <div className="flex items-center h-5">
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${
                        is_selected
                          ? 'bg-primary-600 border-primary-600'
                          : 'border-secondary-400 dark:border-secondary-500'
                      }`}
                    >
                      {is_selected && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-text-light font-reddit-sans">
                      {collection.name}
                    </div>
                    {collection.description && (
                      <p className="text-xs text-text-muted mt-0.5 font-reddit-sans line-clamp-1">
                        {collection.description}
                      </p>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    checked={is_selected}
                    onChange={() => toggle_collection(collection.id)}
                    className="sr-only"
                  />
                </label>
              );
            })
          )}

          {/* Inline create form */}
          {show_create_inline && (
            <div className="p-3 rounded-lg border border-primary-500 bg-primary-50 dark:bg-primary-900/20">
              <input
                type="text"
                value={new_collection_name}
                onChange={(e) => set_new_collection_name(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handle_create_inline();
                  } else if (e.key === 'Escape') {
                    set_show_create_inline(false);
                    set_new_collection_name('');
                  }
                }}
                placeholder="Collection name"
                disabled={is_creating}
                autoFocus
                className="w-full px-3 py-2 rounded-lg border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-800 text-text-light placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 font-reddit-sans text-sm mb-2"
              />
              <div className="flex gap-2">
                <button
                  onClick={handle_create_inline}
                  disabled={is_creating}
                  className="flex-1 px-3 py-1.5 rounded bg-primary-600 hover:bg-primary-700 text-white text-sm font-reddit-sans disabled:opacity-50"
                >
                  {is_creating ? 'Creating...' : 'Create'}
                </button>
                <button
                  onClick={() => {
                    set_show_create_inline(false);
                    set_new_collection_name('');
                  }}
                  disabled={is_creating}
                  className="px-3 py-1.5 rounded bg-secondary-200 dark:bg-secondary-700 hover:bg-secondary-300 dark:hover:bg-secondary-600 text-text-light text-sm font-reddit-sans disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Create new collection button */}
        {!show_create_inline && (
          <button
            onClick={() => set_show_create_inline(true)}
            disabled={is_saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-secondary-300 dark:border-secondary-600 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-text-muted hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-4 disabled:opacity-50 font-reddit-sans"
          >
            <Plus className="w-4 h-4" />
            Create New Collection
          </button>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-3 justify-end">
          <button
            onClick={handle_close}
            disabled={is_saving}
            className="px-4 py-2 rounded-lg bg-secondary-100 dark:bg-secondary-700 hover:bg-secondary-200 dark:hover:bg-secondary-600 text-text-light transition-colors font-reddit-sans disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handle_save}
            disabled={is_saving}
            className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors font-reddit-sans disabled:opacity-50 flex items-center gap-2"
          >
            {is_saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollectionPicker;
