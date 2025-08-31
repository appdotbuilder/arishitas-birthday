import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PhotoGallery } from '@/components/PhotoGallery';
import { VideoGallery } from '@/components/VideoGallery';
import { Guestbook } from '@/components/Guestbook';
import { trpc } from '@/utils/trpc';
import './App.css';

function App() {
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    // Show celebration animation after a short delay
    const timer = setTimeout(() => setShowCelebration(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const healthCheck = useCallback(async () => {
    try {
      const result = await trpc.healthcheck.query();
      console.log('Server health:', result);
    } catch (error) {
      console.error('Server connection failed:', error);
    }
  }, []);

  useEffect(() => {
    healthCheck();
  }, [healthCheck]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-purple-200">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-pink-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 -right-20 w-60 h-60 bg-purple-300 rounded-full opacity-15 animate-bounce"></div>
        <div className="absolute bottom-10 left-1/4 w-32 h-32 bg-pink-400 rounded-full opacity-25"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className={`transition-all duration-1000 ${showCelebration ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-4">
              🎉 Happy Birthday! 🎂
            </h1>
            <h2 className="text-4xl font-semibold text-purple-800 mb-6">
              Arishita Nurul Anastasia
            </h2>
            <div className="flex justify-center space-x-4 text-2xl mb-6">
              <span>🎈</span>
              <span>✨</span>
              <span>🎁</span>
              <span>🌟</span>
              <span>💖</span>
            </div>
          </div>
          
          <Card className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm border-purple-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-purple-700 text-2xl">A Digital Celebration Card</CardTitle>
              <CardDescription className="text-purple-600 text-lg">
                Welcome to Arishita's special day! Share photos, watch videos, and leave your birthday wishes below 💜
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="photos" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-white/70 backdrop-blur-sm">
              <TabsTrigger 
                value="photos" 
                className="data-[state=active]:bg-purple-500 data-[state=active]:text-white text-purple-700 font-semibold"
              >
                📸 Photo Gallery
              </TabsTrigger>
              <TabsTrigger 
                value="videos"
                className="data-[state=active]:bg-pink-500 data-[state=active]:text-white text-pink-700 font-semibold"
              >
                🎥 Video Collection
              </TabsTrigger>
              <TabsTrigger 
                value="guestbook"
                className="data-[state=active]:bg-purple-500 data-[state=active]:text-white text-purple-700 font-semibold"
              >
                📝 Guestbook
              </TabsTrigger>
            </TabsList>

            <TabsContent value="photos" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-purple-700 flex items-center gap-2">
                    📸 Birthday Photo Gallery
                  </CardTitle>
                  <CardDescription className="text-purple-600">
                    Share your favorite memories with Arishita!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PhotoGallery />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="videos" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-pink-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-pink-700 flex items-center gap-2">
                    🎥 Birthday Video Collection
                  </CardTitle>
                  <CardDescription className="text-pink-600">
                    Watch and share special video messages and memories!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <VideoGallery />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="guestbook" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-purple-700 flex items-center gap-2">
                    📝 Birthday Guestbook
                  </CardTitle>
                  <CardDescription className="text-purple-600">
                    Leave your birthday wishes and messages for Arishita! 💜
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Guestbook />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 py-8">
          <div className="text-purple-600 text-lg mb-4">
            Made with 💖 for Arishita's special day
          </div>
          <div className="flex justify-center space-x-6 text-3xl">
            <span className="animate-bounce">🎂</span>
            <span className="animate-pulse">🎉</span>
            <span className="animate-bounce">🎈</span>
            <span className="animate-pulse">✨</span>
            <span className="animate-bounce">🎁</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;