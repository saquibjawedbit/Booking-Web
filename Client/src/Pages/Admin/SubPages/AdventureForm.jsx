import { ArrowLeft, ImageIcon, Video } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  createAdventure,
  getAdventure,
  updateAdventure,
} from '../../../Api/adventure.api';
import { fetchLocations } from '../../../Api/location.api';
import MediaPreview from '../../../components/MediaPreview';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs';

const AdventureFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      location: [],
      description: '',
      exp: '',
      medias: [],
      thumbnail: null,
      previewVideo: null,
    },
  });

  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [previewVideoFile, setPreviewVideoFile] = useState(null);
  const [previewVideoPreview, setPreviewVideoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locations, setLocations] = useState([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [adventure, setAdventure] = useState(null);
  const [isLoading, setIsLoading] = useState(isEditMode);

  // Fetch adventure data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      setIsLoading(true);
      getAdventure(id)
        .then((res) => {
          if (res && res.data) {
            setAdventure(res.data);
            reset(res.data);
            setSelectedLocations(res.data.location || []);
          }
        })
        .catch((error) => {
          toast.error('Failed to load adventure data');
          console.error(error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [id, isEditMode, reset]);

  // Generate previews when files are selected or when editing
  useEffect(() => {
    let previews = [];
    // Show existing medias from adventure in edit mode
    if (adventure && adventure.medias && Array.isArray(adventure.medias)) {
      previews = adventure.medias.map((media, idx) => {
        // Assume media is a URL string or an object with url/type/name
        if (typeof media === 'string') {
          // Guess type from extension
          const ext = media.split('.').pop().toLowerCase();
          let type = '';
          if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext))
            type = 'image';
          else if (['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(ext))
            type = 'video';
          else type = 'file';
          return {
            url: media,
            type: type,
            name: media.split('/').pop() || `media-${idx}`,
            isServer: true,
          };
        } else {
          return { ...media, isServer: true };
        }
      });
    }
    // Add previews for newly selected files
    if (mediaFiles.length) {
      const filePreviews = mediaFiles.map((file) => ({
        url: URL.createObjectURL(file),
        type: file.type.startsWith('image/')
          ? 'image'
          : file.type.startsWith('video/')
            ? 'video'
            : 'file',
        name: file?.name,
        isServer: false,
      }));
      previews = [...previews, ...filePreviews];
    }
    setMediaPreviews(previews);
    // Cleanup only for local files
    return () => {
      if (mediaFiles.length) {
        previews
          .filter((p) => !p.isServer)
          .forEach((p) => URL.revokeObjectURL(p.url));
      }
    };
  }, [mediaFiles, adventure]);

  // Handle thumbnail preview
  useEffect(() => {
    // Clear previous preview
    if (thumbnailPreview && !thumbnailPreview.isServer) {
      URL.revokeObjectURL(thumbnailPreview.url);
    }

    // Create preview for new thumbnail
    if (thumbnailFile) {
      setThumbnailPreview({
        url: URL.createObjectURL(thumbnailFile),
        type: 'image',
        name: thumbnailFile?.name,
        isServer: false,
      });
    } else if (adventure?.thumbnail) {
      // Show existing thumbnail from adventure
      setThumbnailPreview({
        url: adventure.thumbnail,
        type: 'image',
        name: 'thumbnail',
        isServer: true,
      });
    } else {
      setThumbnailPreview(null);
    }

    return () => {
      if (thumbnailPreview && !thumbnailPreview.isServer) {
        URL.revokeObjectURL(thumbnailPreview.url);
      }
    };
  }, [thumbnailFile, adventure]);

  // Handle preview video
  useEffect(() => {
    // Clear previous preview
    if (previewVideoPreview && !previewVideoPreview.isServer) {
      URL.revokeObjectURL(previewVideoPreview.url);
    }

    // Create preview for new video
    if (previewVideoFile) {
      setPreviewVideoPreview({
        url: URL.createObjectURL(previewVideoFile),
        type: 'video',
        name: previewVideoFile?.name,
        isServer: false,
      });
    } else if (adventure?.previewVideo) {
      // Show existing preview video from adventure
      setPreviewVideoPreview({
        url: adventure.previewVideo,
        type: 'video',
        name: 'preview-video',
        isServer: true,
      });
    } else {
      setPreviewVideoPreview(null);
    }

    return () => {
      if (previewVideoPreview && !previewVideoPreview.isServer) {
        URL.revokeObjectURL(previewVideoPreview.url);
      }
    };
  }, [previewVideoFile, adventure]);

  // Fetch locations for dropdown
  useEffect(() => {
    fetchLocations()
      .then((res) => {
        if (res && res.data) setLocations(res.data);
      })
      .catch(() => {
        toast.error('Failed to load locations');
        setLocations([]);
      });
  }, []);

  // Sync selectedLocations with form value
  useEffect(() => {
    setValue('location', selectedLocations);
  }, [selectedLocations, setValue]);

  // Remove a selected media file (only local files)
  const handleRemoveMedia = (idx) => {
    // Only allow removing local files (after server files)
    const serverCount =
      adventure && adventure.medias && Array.isArray(adventure.medias)
        ? adventure.medias.length
        : 0;
    if (idx >= serverCount) {
      setMediaFiles((files) => files.filter((_, i) => i !== idx - serverCount));
    }
    // Optionally, handle server media removal here if backend supports it
  };

  const handleRemoveThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
  };

  const handleRemovePreviewVideo = () => {
    setPreviewVideoFile(null);
    setPreviewVideoPreview(null);
  };

  const toggleLocation = (locId) => {
    setSelectedLocations((prev) =>
      prev.includes(locId)
        ? prev.filter((id) => id !== locId)
        : [...prev, locId]
    );
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const toastId = toast.loading(
      isEditMode ? 'Updating adventure...' : 'Creating adventure...'
    );
    try {
      const formData = new FormData();
      formData.append('name', data?.name);
      data.location.forEach((locId) => formData.append('location', locId));
      formData.append('description', data.description);
      formData.append('exp', data.exp);
      if (isEditMode && id) {
        formData.append('_id', id);
      }

      // Add thumbnail if available
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }

      // Add preview video if available
      if (previewVideoFile) {
        formData.append('previewVideo', previewVideoFile);
      }

      // Add regular media files
      mediaFiles.forEach((file) => {
        formData.append('medias', file);
      });

      if (isEditMode) {
        await updateAdventure(formData);
        toast.success('Adventure updated successfully', { id: toastId });
      } else {
        await createAdventure(formData);
        toast.success('Adventure created successfully', { id: toastId });
      }
      navigate('/admin/adventures');
    } catch (error) {
      toast.error('Error saving adventure', { id: toastId });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/adventures')}
          className="mr-4 p-2"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">
          {isEditMode ? 'Edit Adventure' : 'Create New Adventure'}
        </h1>
      </div>

      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">
            {isEditMode
              ? 'Update adventure details'
              : 'Enter adventure details'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="basic" className="text-base py-3">
                  Basic Info
                </TabsTrigger>
                <TabsTrigger value="media" className="text-base py-3">
                  Media
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-base">
                      Adventure Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Enter adventure name"
                      disabled={isSubmitting}
                      {...register('name', {
                        required: 'Adventure name is required',
                      })}
                      className="w-full p-3"
                    />
                    {errors?.name && (
                      <span className="text-red-500 text-sm">
                        {errors?.name.message}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exp" className="text-base">
                      Experience Points
                    </Label>
                    <Input
                      id="exp"
                      placeholder="Enter experience points"
                      type="number"
                      disabled={isSubmitting}
                      {...register('exp', {
                        required: 'Experience points are required',
                      })}
                      className="w-full p-3"
                    />
                    {errors.exp && (
                      <span className="text-red-500 text-sm">
                        {errors.exp.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-base">
                    Location
                  </Label>
                  <div
                    className="block w-full border rounded-md p-3 bg-white cursor-pointer select-none"
                    onClick={() => setShowLocationDropdown((v) => !v)}
                  >
                    {selectedLocations.length === 0
                      ? 'Select location(s)'
                      : locations
                          .filter((loc) => selectedLocations.includes(loc._id))
                          .map((loc) => loc?.name)
                          .join(', ')}
                  </div>
                  {showLocationDropdown && (
                    <div className="absolute z-10 bg-white border rounded-md mt-1 w-full max-w-2xl max-h-60 overflow-auto shadow-lg">
                      {locations.length === 0 ? (
                        <div className="px-4 py-3 text-gray-500">
                          No locations available
                        </div>
                      ) : (
                        locations.map((loc) => (
                          <div
                            key={loc._id}
                            className="flex items-center px-4 py-3 hover:bg-gray-100 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLocation(loc._id);
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedLocations.includes(loc._id)}
                              readOnly
                              className="mr-3"
                            />
                            <span>{loc?.name}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                  {errors.location && (
                    <span className="text-red-500 text-sm">
                      {errors.location.message}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base">
                    Description
                  </Label>
                  <Input
                    id="description"
                    placeholder="Enter adventure description"
                    disabled={isSubmitting}
                    {...register('description', {
                      required: 'Description is required',
                    })}
                    className="w-full p-3"
                  />
                  {errors.description && (
                    <span className="text-red-500 text-sm">
                      {errors.description.message}
                    </span>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="media" className="space-y-8 pt-4">
                {/* Thumbnail Image */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-base font-medium">
                    <ImageIcon size={18} /> Thumbnail Image
                  </Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files[0] && setThumbnailFile(e.target.files[0])
                    }
                    className="block w-full p-3"
                    disabled={isSubmitting}
                  />
                  {thumbnailPreview && (
                    <div className="relative mt-3 inline-block">
                      <img
                        src={thumbnailPreview.url || '/placeholder.svg'}
                        alt="Thumbnail preview"
                        className="h-48 w-auto object-cover rounded-md border border-gray-200"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full"
                        onClick={handleRemoveThumbnail}
                      >
                        ×
                      </Button>
                    </div>
                  )}
                </div>

                {/* Preview Video */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-base font-medium">
                    <Video size={18} /> Preview Video
                  </Label>
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={(e) =>
                      e.target.files[0] &&
                      setPreviewVideoFile(e.target.files[0])
                    }
                    className="block w-full p-3"
                    disabled={isSubmitting}
                  />
                  {previewVideoPreview && (
                    <div className="relative mt-3 inline-block">
                      <video
                        src={previewVideoPreview.url}
                        controls
                        className="h-48 w-auto object-cover rounded-md border border-gray-200"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full"
                        onClick={handleRemovePreviewVideo}
                      >
                        ×
                      </Button>
                    </div>
                  )}
                </div>

                {/* Regular Media Files */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    Additional Media (images/videos)
                  </Label>
                  <Input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={(e) => setMediaFiles(Array.from(e.target.files))}
                    className="block w-full p-3"
                    disabled={isSubmitting}
                  />
                  <div className="mt-4">
                    <MediaPreview
                      mediaPreviews={mediaPreviews}
                      onRemove={handleRemoveMedia}
                      isSubmitting={isSubmitting}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-4 pt-6 mt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/adventures')}
                disabled={isSubmitting}
                className="px-6 py-2.5"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-2.5 bg-black hover:bg-gray-800 text-white"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></span>
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </span>
                ) : isEditMode ? (
                  'Update Adventure'
                ) : (
                  'Create Adventure'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdventureFormPage;
