import { useState } from 'react';
import { BookMarked, Edit2, Trash2, Lock, Globe, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';

const CollectionCard = ({
  collection,
  item_count = 0,
  on_click,
  on_edit,
  on_delete,
}) => {
  const [is_hovered, set_is_hovered] = useState(false);
  const { user } = useAuth();

  // Check if current user owns this collection
  const is_owner = user && collection.user_id === user.id;

  // Get visibility icon and label
  const get_visibility_info = () => {
    switch (collection.visibility) {
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

  const handle_edit = (e) => {
    e.stopPropagation();
    on_edit && on_edit(collection);
  };

  const handle_delete = (e) => {
    e.stopPropagation();
    on_delete && on_delete(collection);
  };

  return (
    <div
      className="flex flex-col p-4 rounded-lg cursor-pointer hover:bg-secondary-100 dark:hover:bg-secondary-800 group relative transition-colors"
      onClick={() => on_click && on_click(collection)}
      onMouseEnter={() => set_is_hovered(true)}
      onMouseLeave={() => set_is_hovered(false)}
    >
      {/* Action buttons (owner only) */}
      {is_owner && is_hovered && (
        <div className="absolute top-2 right-2 flex gap-1 z-10">
          <button
            onClick={handle_edit}
            className="p-1.5 rounded bg-white/90 dark:bg-secondary-700/90 hover:bg-primary-100 dark:hover:bg-primary-900/50 text-text-light hover:text-primary-600 dark:hover:text-primary-400 transition-colors shadow-sm"
            title="Edit collection"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handle_delete}
            className="p-1.5 rounded bg-white/90 dark:bg-secondary-700/90 hover:bg-red-100 dark:hover:bg-red-900/50 text-text-light hover:text-red-600 dark:hover:text-red-400 transition-colors shadow-sm"
            title="Delete collection"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Collection icon */}
      <div className="w-16 h-16 mb-3 flex items-center justify-center mx-auto">
        <div className="w-14 h-14 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <BookMarked className="w-8 h-8 text-primary-600 dark:text-primary-400 fill-current" />
        </div>
      </div>

      {/* Collection name */}
      <h3 className="text-sm font-semibold text-text-light text-center mb-1 font-sora line-clamp-2 min-h-[2.5rem]">
        {collection.name}
      </h3>

      {/* Collection description */}
      {collection.description && (
        <p className="text-xs text-text-muted text-center mb-2 font-reddit-sans line-clamp-2">
          {collection.description}
        </p>
      )}

      {/* Footer: visibility badge and item count */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-secondary-200 dark:border-secondary-700">
        {/* Visibility badge */}
        <div className={`flex items-center gap-1 ${visibility_info.color}`} title={visibility_info.label}>
          <VisibilityIcon className="w-3.5 h-3.5" />
          <span className="text-xs font-medium font-reddit-sans">
            {visibility_info.label}
          </span>
        </div>

        {/* Item count */}
        <div className="text-xs text-text-muted font-reddit-sans">
          {item_count} {item_count === 1 ? 'item' : 'items'}
        </div>
      </div>
    </div>
  );
};

export default CollectionCard;
