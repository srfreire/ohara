import { create } from 'zustand';
import {
  get_collections,
  get_collection_by_id,
  create_collection,
  update_collection,
  delete_collection,
  get_collection_items,
  add_item_to_collection,
  remove_item_from_collection,
} from '../api/collections';

export const useCollectionsStore = create((set, get) => ({
  // State
  collections: [],
  items_by_collection: {}, // { collection_id: [items] }
  document_collections: {}, // { document_id: [collection_ids] }
  loading: false,
  error: null,

  // Fetch all collections
  fetch_collections: async () => {
    set({ loading: true, error: null });
    try {
      const data = await get_collections();
      set({ collections: data, loading: false });
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Fetch single collection by ID
  fetch_collection_by_id: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await get_collection_by_id(id);
      // Update the collection in the list if it exists
      set((state) => ({
        collections: (state.collections || []).map((c) =>
          c.id === id ? data : c
        ),
        loading: false,
      }));
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Create new collection
  create_collection_action: async (collection_data) => {
    set({ loading: true, error: null });
    try {
      const new_collection = await create_collection(collection_data);

      // Add to collections list
      set((state) => ({
        collections: [...(state.collections || []), new_collection],
        loading: false,
      }));

      return new_collection;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Update existing collection
  update_collection_action: async (id, collection_data) => {
    // Optimistic update
    const previous_collections = get().collections || [];
    set((state) => ({
      collections: (state.collections || []).map((c) =>
        c.id === id ? { ...c, ...collection_data } : c
      ),
    }));

    try {
      const updated_collection = await update_collection(id, collection_data);

      // Update with server response
      set((state) => ({
        collections: (state.collections || []).map((c) =>
          c.id === id ? updated_collection : c
        ),
      }));

      return updated_collection;
    } catch (error) {
      // Revert on error
      set({ collections: previous_collections, error: error.message });
      throw error;
    }
  },

  // Delete collection
  delete_collection_action: async (id) => {
    // Optimistic delete
    const previous_collections = get().collections || [];
    set((state) => ({
      collections: (state.collections || []).filter((c) => c.id !== id),
    }));

    try {
      await delete_collection(id);

      // Remove items cache for this collection
      set((state) => {
        const new_items = { ...(state.items_by_collection || {}) };
        delete new_items[id];
        return { items_by_collection: new_items };
      });

      // Recalculate document_collections
      get().recalculate_document_collections();
    } catch (error) {
      // Revert on error
      set({ collections: previous_collections, error: error.message });
      throw error;
    }
  },

  // Fetch items in a collection
  fetch_collection_items: async (collection_id) => {
    set({ loading: true, error: null });
    try {
      const items = await get_collection_items(collection_id);

      // Cache items for this collection
      set((state) => ({
        items_by_collection: {
          ...state.items_by_collection,
          [collection_id]: items,
        },
        loading: false,
      }));

      // Update document_collections mapping
      get().recalculate_document_collections();

      return items;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Add item to collection
  add_item: async (collection_id, document_id) => {
    try {
      const new_item = await add_item_to_collection(collection_id, document_id);

      // Add item to cache
      set((state) => {
        const current_items = (state.items_by_collection || {})[collection_id] || [];
        return {
          items_by_collection: {
            ...(state.items_by_collection || {}),
            [collection_id]: [...current_items, new_item],
          },
        };
      });

      // Update document_collections mapping
      get().recalculate_document_collections();

      return new_item;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Remove item from collection
  remove_item: async (collection_id, item_id) => {
    // Optimistic removal
    const previous_items = (get().items_by_collection || {})[collection_id] || [];
    set((state) => ({
      items_by_collection: {
        ...(state.items_by_collection || {}),
        [collection_id]: previous_items.filter((item) => item.id !== item_id),
      },
    }));

    try {
      await remove_item_from_collection(collection_id, item_id);

      // Update document_collections mapping
      get().recalculate_document_collections();
    } catch (error) {
      // Revert on error
      set((state) => ({
        items_by_collection: {
          ...(state.items_by_collection || {}),
          [collection_id]: previous_items,
        },
        error: error.message,
      }));
      throw error;
    }
  },

  // Helper: Get which collections contain a specific document
  get_document_collections: (document_id) => {
    const state = get();
    const collection_ids = (state.document_collections || {})[document_id] || [];
    return (state.collections || []).filter((c) => collection_ids.includes(c.id));
  },

  // Helper: Check if document is in a specific collection
  is_document_in_collection: (document_id, collection_id) => {
    const state = get();
    const items = (state.items_by_collection || {})[collection_id] || [];
    return items.some((item) => item.document_id === document_id);
  },

  // Helper: Recalculate document_collections mapping from items cache
  recalculate_document_collections: () => {
    const state = get();
    const mapping = {};

    Object.entries(state.items_by_collection || {}).forEach(([collection_id, items]) => {
      (items || []).forEach((item) => {
        if (!mapping[item.document_id]) {
          mapping[item.document_id] = [];
        }
        mapping[item.document_id].push(collection_id);
      });
    });

    set({ document_collections: mapping });
  },

  // Clear error
  clear_error: () => set({ error: null }),
}));
