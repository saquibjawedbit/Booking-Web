import { Button } from './ui/button';

const MediaPreview = ({ mediaPreviews, onRemove, isSubmitting }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
      {mediaPreviews.map((media, idx) => (
        <div key={idx} className="relative group">
          {media.type === 'image' ? (
            <img
              src={media.url || '/placeholder.svg'}
              alt={media?.name}
              className="w-full h-40 object-cover rounded-md border border-gray-200"
            />
          ) : media.type === 'video' ? (
            <video
              src={media.url}
              controls
              className="w-full h-40 object-cover rounded-md border border-gray-200"
            />
          ) : (
            <div className="w-full h-40 flex items-center justify-center bg-gray-100 rounded-md border border-gray-200">
              <span className="text-gray-500">{media?.name}</span>
            </div>
          )}
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onRemove(idx)}
            disabled={isSubmitting}
          >
            ×
          </Button>
        </div>
      ))}
    </div>
  );
};

export default MediaPreview;
