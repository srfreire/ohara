import { useState } from 'react';
import { BookmarkPlus } from 'lucide-react';
import CollectionPicker from './CollectionPicker';
import { useCollectionsStore } from '../../stores/collections-store';

const AddToCollectionButton = ({
  document_id,
  variant = 'icon', // 'icon' | 'button' | 'floating'
  className = '',
  on_complete,
}) => {
  const [is_picker_open, set_is_picker_open] = useState(false);
  const { document_collections } = useCollectionsStore();

  const is_in_any_collection = document_collections[document_id]?.length > 0;

  const handle_click = (e) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('AddToCollectionButton clicked, document_id:', document_id);
    set_is_picker_open(true);
  };

  // Icon variant - small icon button for hover states
  if (variant === 'icon') {
    return (
      <>
        <button
          type="button"
          onClick={handle_click}
          className={`p-1.5 rounded bg-white/90 dark:bg-secondary-700/90 hover:bg-primary-100 dark:hover:bg-primary-900/50 text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors shadow-sm ${className}`}
          title="Add to collection"
        >
          <BookmarkPlus className={`w-4 h-4 ${is_in_any_collection ? 'fill-current' : ''}`} />
        </button>

        <CollectionPicker
          is_open={is_picker_open}
          on_close={() => set_is_picker_open(false)}
          document_id={document_id}
          on_complete={on_complete}
        />
      </>
    );
  }

  // Floating variant - for overlay on cards
  if (variant === 'floating') {
    return (
      <>
        <button
          type="button"
          onClick={handle_click}
          className={`absolute top-2 right-2 p-1.5 rounded bg-white/90 dark:bg-secondary-700/90 hover:bg-primary-100 dark:hover:bg-primary-900/50 text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors shadow-sm z-50 ${className}`}
          title="Add to collection"
        >
          <BookmarkPlus className={`w-4 h-4 ${is_in_any_collection ? 'fill-current' : ''}`} />
        </button>

        <CollectionPicker
          is_open={is_picker_open}
          on_close={() => set_is_picker_open(false)}
          document_id={document_id}
          on_complete={on_complete}
        />
      </>
    );
  }

  // Button variant - full button with text
  return (
    <>
      <button
        type="button"
        onClick={handle_click}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary-100 dark:bg-secondary-700 hover:bg-secondary-200 dark:hover:bg-secondary-600 text-text-light transition-colors font-reddit-sans text-sm ${className}`}
      >
        <BookmarkPlus className={`w-4 h-4 ${is_in_any_collection ? 'fill-current' : ''}`} />
        {is_in_any_collection ? 'In Collections' : 'Add to Collection'}
      </button>

      <CollectionPicker
        is_open={is_picker_open}
        on_close={() => set_is_picker_open(false)}
        document_id={document_id}
        on_complete={on_complete}
      />
    </>
  );
};

export default AddToCollectionButton;
