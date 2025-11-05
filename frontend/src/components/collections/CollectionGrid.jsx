import { Plus, BookMarked } from 'lucide-react';
import CollectionCard from './CollectionCard';
import FileGridSkeleton from '../ui/FileGridSkeleton';

const CollectionGrid = ({
  collections = [],
  items_by_collection = {},
  is_loading = false,
  on_collection_click,
  on_collection_edit,
  on_collection_delete,
  on_create_new,
}) => {
  if (is_loading) {
    return <FileGridSkeleton count={8} />;
  }

  return (
    <div className="p-6">
      {/* Header with create button */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-light font-sora">
          Collections
        </h2>
        <button
          onClick={on_create_new}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors font-reddit-sans text-sm font-medium"
          title="Create new collection"
        >
          <Plus className="w-4 h-4" />
          New Collection
        </button>
      </div>

      {/* Empty state */}
      {collections.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center min-h-[60vh]">
          <div className="w-24 h-24 mb-4 opacity-20">
            <BookMarked className="w-full h-full text-text-muted" />
          </div>
          <h3 className="text-lg font-semibold text-text-light mb-2 font-sora">
            No collections yet
          </h3>
          <p className="text-text-muted mb-6 max-w-md font-reddit-sans">
            Collections help you organize and group related documents. Create your first collection to get started.
          </p>
          <button
            onClick={on_create_new}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors font-reddit-sans text-sm font-medium"
          >
            <Plus className="w-5 h-5" />
            Create Your First Collection
          </button>
        </div>
      )}

      {/* Collections grid */}
      {collections.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {collections
            .filter((collection) => collection != null && collection.id)
            .map((collection) => {
              const items = items_by_collection[collection.id] || [];
              return (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  item_count={items.length}
                  on_click={on_collection_click}
                  on_edit={on_collection_edit}
                  on_delete={on_collection_delete}
                />
              );
            })}
        </div>
      )}
    </div>
  );
};

export default CollectionGrid;
