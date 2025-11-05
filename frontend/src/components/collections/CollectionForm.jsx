import { useState, useEffect } from 'react';
import { X, BookMarked, Lock, Globe, EyeOff } from 'lucide-react';

const CollectionForm = ({
  is_open,
  on_close,
  on_save,
  collection = null, // If provided, we're editing; otherwise creating
  is_loading = false,
}) => {
  const [name, set_name] = useState('');
  const [description, set_description] = useState('');
  const [visibility, set_visibility] = useState('private');
  const [errors, set_errors] = useState({});

  const is_edit_mode = collection !== null;

  // Populate form when editing
  useEffect(() => {
    if (collection) {
      set_name(collection.name || '');
      set_description(collection.description || '');
      set_visibility(collection.visibility || 'private');
    } else {
      // Reset form when creating new
      set_name('');
      set_description('');
      set_visibility('private');
    }
    set_errors({});
  }, [collection, is_open]);

  const validate = () => {
    const new_errors = {};

    if (!name.trim()) {
      new_errors.name = 'Collection name is required';
    } else if (name.trim().length < 1) {
      new_errors.name = 'Collection name must be at least 1 character';
    }

    set_errors(new_errors);
    return Object.keys(new_errors).length === 0;
  };

  const handle_submit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const collection_data = {
      name: name.trim(),
      description: description.trim() || undefined,
      visibility,
    };

    on_save(collection_data);
  };

  const handle_close = () => {
    set_errors({});
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
      <div className="relative bg-white dark:bg-secondary-900 rounded-xl shadow-2xl border border-white/80 dark:border-secondary-600/50 p-6 max-w-lg w-full mx-4 animate-in fade-in zoom-in duration-200">
        {/* Close button */}
        <button
          onClick={handle_close}
          disabled={is_loading}
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
        <h2 className="text-xl font-bold text-text-light mb-4 font-sora">
          {is_edit_mode ? 'Edit Collection' : 'Create New Collection'}
        </h2>

        {/* Form */}
        <form onSubmit={handle_submit} className="space-y-4">
          {/* Name input */}
          <div>
            <label
              htmlFor="collection-name"
              className="block text-sm font-medium text-text-light mb-1 font-reddit-sans"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="collection-name"
              type="text"
              value={name}
              onChange={(e) => set_name(e.target.value)}
              disabled={is_loading}
              placeholder="e.g., Research Papers, Favorites, Project Docs"
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.name
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-secondary-300 dark:border-secondary-600'
              } bg-white dark:bg-secondary-800 text-text-light placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 font-reddit-sans`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1 font-reddit-sans">
                {errors.name}
              </p>
            )}
          </div>

          {/* Description textarea */}
          <div>
            <label
              htmlFor="collection-description"
              className="block text-sm font-medium text-text-light mb-1 font-reddit-sans"
            >
              Description <span className="text-text-muted text-xs">(optional)</span>
            </label>
            <textarea
              id="collection-description"
              value={description}
              onChange={(e) => set_description(e.target.value)}
              disabled={is_loading}
              placeholder="Add a brief description of this collection..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-800 text-text-light placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 resize-none font-reddit-sans"
            />
          </div>

          {/* Visibility selector */}
          <div>
            <label className="block text-sm font-medium text-text-light mb-2 font-reddit-sans">
              Visibility
            </label>
            <div className="space-y-2">
              {/* Private */}
              <label className="flex items-start gap-3 p-3 rounded-lg border border-secondary-300 dark:border-secondary-600 cursor-pointer hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={visibility === 'private'}
                  onChange={(e) => set_visibility(e.target.value)}
                  disabled={is_loading}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Lock className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
                    <span className="font-medium text-text-light font-reddit-sans">
                      Private
                    </span>
                  </div>
                  <p className="text-xs text-text-muted font-reddit-sans">
                    Only you can see this collection
                  </p>
                </div>
              </label>

              {/* Unlisted */}
              <label className="flex items-start gap-3 p-3 rounded-lg border border-secondary-300 dark:border-secondary-600 cursor-pointer hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  value="unlisted"
                  checked={visibility === 'unlisted'}
                  onChange={(e) => set_visibility(e.target.value)}
                  disabled={is_loading}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <EyeOff className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="font-medium text-text-light font-reddit-sans">
                      Unlisted
                    </span>
                  </div>
                  <p className="text-xs text-text-muted font-reddit-sans">
                    Anyone with the link can view this collection
                  </p>
                </div>
              </label>

              {/* Public */}
              <label className="flex items-start gap-3 p-3 rounded-lg border border-secondary-300 dark:border-secondary-600 cursor-pointer hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={visibility === 'public'}
                  onChange={(e) => set_visibility(e.target.value)}
                  disabled={is_loading}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-text-light font-reddit-sans">
                      Public
                    </span>
                  </div>
                  <p className="text-xs text-text-muted font-reddit-sans">
                    Anyone can discover and view this collection
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3 justify-end pt-2">
            <button
              type="button"
              onClick={handle_close}
              disabled={is_loading}
              className="px-4 py-2 rounded-lg bg-secondary-100 dark:bg-secondary-700 hover:bg-secondary-200 dark:hover:bg-secondary-600 text-text-light transition-colors font-reddit-sans disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={is_loading}
              className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors font-reddit-sans disabled:opacity-50 flex items-center gap-2"
            >
              {is_loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>{is_edit_mode ? 'Save Changes' : 'Create Collection'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CollectionForm;
