import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import type { Video, AddVideoInput } from '../../../server/src/schema';

export function VideoGallery() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  
  const [formData, setFormData] = useState<AddVideoInput>({
    title: '',
    video_url: '',
    thumbnail_url: null,
    uploaded_by: ''
  });

  const loadVideos = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await trpc.getVideos.query({ limit: 20, offset: 0 });
      setVideos(result);
    } catch (error) {
      console.error('Failed to load videos:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.video_url || !formData.uploaded_by) {
      return;
    }

    setIsUploading(true);
    try {
      const newVideo = await trpc.addVideo.mutate(formData);
      setVideos((prev: Video[]) => [newVideo, ...prev]);
      setFormData({
        title: '',
        video_url: '',
        thumbnail_url: null,
        uploaded_by: ''
      });
    } catch (error) {
      console.error('Failed to add video:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const getVideoEmbedUrl = (url: string): string | null => {
    // YouTube
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    // Vimeo
    const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    return null;
  };

  const getVideoThumbnail = (url: string): string => {
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`;
    }
    return 'https://via.placeholder.com/480x270/ec4899/ffffff?text=🎥+Video';
  };

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
        <CardHeader>
          <CardTitle className="text-pink-700 flex items-center gap-2">
            📤 Share a Birthday Video
          </CardTitle>
          <CardDescription className="text-pink-600">
            Add a video message or memory for Arishita! 🎥💖
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-pink-700 font-medium">
                  Video Title
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Happy Birthday Arishita!"
                  value={formData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: AddVideoInput) => ({ ...prev, title: e.target.value }))
                  }
                  className="border-pink-200 focus:border-pink-400"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="uploaded_by" className="text-pink-700 font-medium">
                  Your Name
                </Label>
                <Input
                  id="uploaded_by"
                  placeholder="e.g., Michael"
                  value={formData.uploaded_by}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: AddVideoInput) => ({ ...prev, uploaded_by: e.target.value }))
                  }
                  className="border-pink-200 focus:border-pink-400"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="video_url" className="text-pink-700 font-medium">
                Video URL
              </Label>
              <Input
                id="video_url"
                type="url"
                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                value={formData.video_url}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: AddVideoInput) => ({ ...prev, video_url: e.target.value }))
                }
                className="border-pink-200 focus:border-pink-400"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="thumbnail_url" className="text-pink-700 font-medium">
                Custom Thumbnail URL (Optional)
              </Label>
              <Input
                id="thumbnail_url"
                type="url"
                placeholder="https://example.com/thumbnail.jpg"
                value={formData.thumbnail_url || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: AddVideoInput) => ({ 
                    ...prev, 
                    thumbnail_url: e.target.value || null 
                  }))
                }
                className="border-pink-200 focus:border-pink-400"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isUploading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium"
            >
              {isUploading ? '📤 Adding...' : '🎥 Share Video'}
            </Button>
          </form>
          
          <Alert className="mt-4 border-purple-200 bg-purple-50">
            <AlertDescription className="text-purple-700">
              💡 <strong>Tip:</strong> Supports YouTube and Vimeo links! Just paste the URL and we'll handle the rest.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Video Gallery */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center space-x-2 text-pink-600">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-600"></div>
            <span>Loading birthday videos... 🎥</span>
          </div>
        </div>
      ) : videos.length === 0 ? (
        <Card className="text-center py-12 bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
          <CardContent className="pt-6">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-semibold text-pink-700 mb-2">No videos yet!</h3>
            <p className="text-pink-600">Share the first birthday video message for Arishita! 💖</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video: Video) => (
            <Card key={video.id} className="group hover:shadow-xl transition-all duration-300 border-pink-200 bg-white/90 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                <div 
                  className="relative aspect-video cursor-pointer"
                  onClick={() => setSelectedVideo(video)}
                >
                  <img
                    src={video.thumbnail_url || getVideoThumbnail(video.video_url)}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/480x270/ec4899/ffffff?text=🎥+Video';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <div className="w-0 h-0 border-l-6 border-l-pink-500 border-y-4 border-y-transparent ml-1"></div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <div className="p-4 text-white">
                      <p className="font-medium text-sm">Click to watch 🎬</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-pink-800 line-clamp-2">{video.title}</h3>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-pink-100 text-pink-700 border-pink-200">
                      🎥 {video.uploaded_by}
                    </Badge>
                    <span className="text-xs text-pink-500">
                      {video.uploaded_at.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Video Modal */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              {getVideoEmbedUrl(selectedVideo.video_url) ? (
                <iframe
                  src={getVideoEmbedUrl(selectedVideo.video_url)!}
                  title={selectedVideo.title}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🎥</div>
                    <p className="mb-4">Unable to embed this video</p>
                    <Button
                      onClick={() => window.open(selectedVideo.video_url, '_blank')}
                      className="bg-pink-500 hover:bg-pink-600"
                    >
                      Watch on Original Site
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 text-white text-center">
              <h3 className="text-xl font-semibold mb-1">{selectedVideo.title}</h3>
              <p className="text-sm opacity-90">
                Shared by {selectedVideo.uploaded_by} • {selectedVideo.uploaded_at.toLocaleDateString()}
              </p>
            </div>
            <Button
              onClick={() => setSelectedVideo(null)}
              className="absolute -top-2 -right-2 bg-white hover:bg-gray-100 text-black rounded-full w-10 h-10 p-0"
            >
              ✕
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}