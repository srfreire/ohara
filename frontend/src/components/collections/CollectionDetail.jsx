import { useState } from 'react';
import { ChevronLeft, BookMarked, Trash2, Lock, Globe, EyeOff } from 'lucide-react';
import FileGridSkeleton from '../ui/FileGridSkeleton';
import ConfirmModal from '../ui/ConfirmModal';

const CollectionDetail = ({
  collection,
  items = [],
  documents = [],
  is_loading = false,
  on_back,
  on_item_remove,
  on_document_click,
}) => {
  const [item_to_remove, set_item_to_remove] = useState(null);

  // Get visibility icon and label
  const get_visibility_info = () => {
    switch (collection?.visibility) {
      case 'public':
        return { icon: Globe, label: 'Public', color: 'text-green-600 dark:text-green-400' };
      case 'unlisted':
        return { icon: EyeOff, label: 'Unlisted', color: 'text-yellow-600 dark:text-yellow-400' };
      case 'private':
      default:
        return { icon: Lock, label: 'Private', color: 'text-secondary-600 dark:text-secondary-400' };
    }
  };

  const visibility_info = get_visibility_info();
  const VisibilityIcon = visibility_info.icon;

  // Get document for an item
  const get_document_for_item = (item) => {
    return documents.find((doc) => doc.id === item.document_id);
  };

  // Document item card component
  const DocumentItemCard = ({ item }) => {
    const [is_hovered, set_is_hovered] = useState(false);
    const document = get_document_for_item(item);

    if (!document) {
      return null;
    }

    return (
      <div
        className="flex flex-col items-center p-4 rounded-lg cursor-pointer hover:bg-secondary-100 dark:hover:bg-secondary-800 group relative"
        onClick={() => on_document_click && on_document_click(document)}
        onMouseEnter={() => set_is_hovered(true)}
        onMouseLeave={() => set_is_hovered(false)}
      >
        {/* Remove button */}
        {is_hovered && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              set_item_to_remove(item);
            }}
            className="absolute top-2 right-2 p-1.5 rounded bg-white/90 dark:bg-secondary-700/90 hover:bg-red-100 dark:hover:bg-red-900/50 text-text-light hover:text-red-600 dark:hover:text-red-400 transition-colors shadow-sm z-10"
            title="Remove from collection"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {/* Document icon */}
        <div className="w-16 h-16 mb-2 flex items-center justify-center">
          <img
            src={is_hovered ? '/src/assets/fold.png' : '/src/assets/file.png'}
            alt="File"
            className="w-14 h-14"
          />
        </div>

        {/* Document name */}
        <span className="text-sm text-text-light text-center max-w-full break-words overflow-hidden text-ellipsis font-reddit-sans">
          {document.title || document.name}
        </span>
      </div>
    );
  };

  if (is_loading) {
    return (
      <div className="p-6">
        <FileGridSkeleton count={12} />
      </div>
    );
  }

  if (!collection) {
    return null;
  }

  return (
    <div className="p-6">
      {/* Header with breadcrumb */}
      <div className="mb-6">
        {/* Back button and breadcrumb */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={on_back}
            className="flex items-center gap-1 text-primary-600 hover:text-primary-700 transition-colors font-reddit-sans text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Collections
          </button>
        </div>

        {/* Collection info */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="w-16 h-16 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
              <BookMarked className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>

            {/* Info */}
            <div>
              <h2 className="text-2xl font-bold text-text-light mb-1 font-sora">
                {collection.name}
              </h2>

              {collection.description && (
                <p className="text-text-muted mb-2 font-reddit-sans">
                  {collection.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm">
                {/* Visibility badge */}
                <div className={`flex items-center gap-1 ${visibility_info.color}`}>
                  <VisibilityIcon className="w-4 h-4" />
                  <span className="font-medium font-reddit-sans">
                    {visibility_info.label}
                  </span>
                </div>

                {/* Item count */}
                <span className="text-text-muted font-reddit-sans">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center min-h-[50vh]">
          <div className="w-24 h-24 mb-4 opacity-20">
            <BookMarked className="w-full h-full text-text-muted" />
          </div>
          <h3 className="text-lg font-semibold text-text-light mb-2 font-sora">
            No documents yet
          </h3>
          <p className="text-text-muted max-w-md font-reddit-sans">
            This collection is empty. Add documents to this collection from the file explorer.
          </p>
        </div>
      )}

      {/* Items grid */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {items.map((item) => (
            <DocumentItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Remove confirmation modal */}
      <ConfirmModal
        is_open={item_to_remove !== null}
        on_close={() => set_item_to_remove(null)}
        on_confirm={() => {
          if (item_to_remove) {
            on_item_remove && on_item_remove(item_to_remove);
            set_item_to_remove(null);
          }
        }}
        title="Remove from Collection"
        message="Are you sure you want to remove this document from the collection? The document itself will not be deleted."
        confirm_text="Remove"
        cancel_text="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default CollectionDetail;
