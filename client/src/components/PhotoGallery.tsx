import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import type { Photo, UploadPhotoInput } from '../../../server/src/schema';

export function PhotoGallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Photo | null>(null);
  
  const [formData, setFormData] = useState<UploadPhotoInput>({
    filename: '',
    original_name: '',
    file_path: '',
    uploaded_by: ''
  });

  const loadPhotos = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await trpc.getPhotos.query({ limit: 20, offset: 0 });
      setPhotos(result);
    } catch (error) {
      console.error('Failed to load photos:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.filename || !formData.original_name || !formData.uploaded_by) {
      return;
    }

    setIsUploading(true);
    try {
      const newPhoto = await trpc.uploadPhoto.mutate(formData);
      setPhotos((prev: Photo[]) => [newPhoto, ...prev]);
      setFormData({
        filename: '',
        original_name: '',
        file_path: '',
        uploaded_by: ''
      });
    } catch (error) {
      console.error('Failed to upload photo:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-700 flex items-center gap-2">
            📤 Upload a Birthday Photo
          </CardTitle>
          <CardDescription className="text-purple-600">
            Share a special moment with Arishita! 📸✨
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filename" className="text-purple-700 font-medium">
                  Photo Filename
                </Label>
                <Input
                  id="filename"
                  placeholder="e.g., birthday_party_2024.jpg"
                  value={formData.filename}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: UploadPhotoInput) => ({ ...prev, filename: e.target.value }))
                  }
                  className="border-purple-200 focus:border-purple-400"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="original_name" className="text-purple-700 font-medium">
                  Display Name
                </Label>
                <Input
                  id="original_name"
                  placeholder="e.g., Arishita's Birthday Cake"
                  value={formData.original_name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: UploadPhotoInput) => ({ ...prev, original_name: e.target.value }))
                  }
                  className="border-purple-200 focus:border-purple-400"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="file_path" className="text-purple-700 font-medium">
                  Photo URL
                </Label>
                <Input
                  id="file_path"
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  value={formData.file_path}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: UploadPhotoInput) => ({ ...prev, file_path: e.target.value }))
                  }
                  className="border-purple-200 focus:border-purple-400"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="uploaded_by" className="text-purple-700 font-medium">
                  Your Name
                </Label>
                <Input
                  id="uploaded_by"
                  placeholder="e.g., Sarah"
                  value={formData.uploaded_by}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: UploadPhotoInput) => ({ ...prev, uploaded_by: e.target.value }))
                  }
                  className="border-purple-200 focus:border-purple-400"
                  required
                />
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={isUploading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium"
            >
              {isUploading ? '📤 Uploading...' : '📸 Share Photo'}
            </Button>
          </form>
          
          <Alert className="mt-4 border-pink-200 bg-pink-50">
            <AlertDescription className="text-pink-700">
              💡 <strong>Tip:</strong> Upload your photo to a service like Imgur or Google Photos first, then paste the direct image URL here!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Photo Gallery */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center space-x-2 text-purple-600">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            <span>Loading birthday photos... 📸</span>
          </div>
        </div>
      ) : photos.length === 0 ? (
        <Card className="text-center py-12 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="text-6xl mb-4">📷</div>
            <h3 className="text-xl font-semibold text-purple-700 mb-2">No photos yet!</h3>
            <p className="text-purple-600">Be the first to share a birthday memory with Arishita! 💜</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo: Photo) => (
            <Card key={photo.id} className="group hover:shadow-xl transition-all duration-300 border-purple-200 bg-white/90 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                <div 
                  className="relative aspect-square cursor-pointer"
                  onClick={() => setSelectedImage(photo)}
                >
                  <img
                    src={photo.file_path}
                    alt={photo.original_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/300x300/9333ea/ffffff?text=Photo+Not+Found';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <div className="p-4 text-white">
                      <p className="font-medium text-sm">Click to view full size 🔍</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-purple-800 truncate">{photo.original_name}</h3>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                      📷 {photo.uploaded_by}
                    </Badge>
                    <span className="text-xs text-purple-500">
                      {photo.uploaded_at.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Photo Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage.file_path}
              alt={selectedImage.original_name}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-6 rounded-b-lg">
              <h3 className="text-xl font-semibold mb-1">{selectedImage.original_name}</h3>
              <p className="text-sm opacity-90">
                Shared by {selectedImage.uploaded_by} • {selectedImage.uploaded_at.toLocaleDateString()}
              </p>
            </div>
            <Button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 p-0"
            >
              ✕
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}