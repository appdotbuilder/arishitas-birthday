import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import type { GuestbookMessage, CreateGuestbookMessageInput } from '../../../server/src/schema';

export function Guestbook() {
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<CreateGuestbookMessageInput>({
    author_name: '',
    message: ''
  });

  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await trpc.getGuestbookMessages.query({ limit: 50, offset: 0 });
      setMessages(result);
    } catch (error) {
      console.error('Failed to load guestbook messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.author_name.trim() || !formData.message.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const newMessage = await trpc.createGuestbookMessage.mutate({
        author_name: formData.author_name.trim(),
        message: formData.message.trim()
      });
      setMessages((prev: GuestbookMessage[]) => [newMessage, ...prev]);
      setFormData({
        author_name: '',
        message: ''
      });
    } catch (error) {
      console.error('Failed to create guestbook message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvatarInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const getBirthdayEmojis = (): string[] => {
    return ['🎂', '🎉', '🎈', '🎁', '✨', '💖', '🌟', '🎊', '🥳', '💜', '🌸', '🦄'];
  };

  const getRandomEmoji = (): string => {
    const emojis = getBirthdayEmojis();
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  return (
    <div className="space-y-6">
      {/* Message Form */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-700 flex items-center gap-2">
            💌 Write a Birthday Message
          </CardTitle>
          <CardDescription className="text-purple-600">
            Share your birthday wishes and love for Arishita! 💜✨
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="author_name" className="text-purple-700 font-medium">
                Your Name
              </Label>
              <Input
                id="author_name"
                placeholder="e.g., Emma Johnson"
                value={formData.author_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateGuestbookMessageInput) => ({ 
                    ...prev, 
                    author_name: e.target.value 
                  }))
                }
                className="border-purple-200 focus:border-purple-400"
                maxLength={100}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message" className="text-purple-700 font-medium">
                Birthday Message
              </Label>
              <Textarea
                id="message"
                placeholder="Write your heartfelt birthday message for Arishita here... 💖"
                value={formData.message}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData((prev: CreateGuestbookMessageInput) => ({ 
                    ...prev, 
                    message: e.target.value 
                  }))
                }
                className="border-purple-200 focus:border-purple-400 min-h-[120px] resize-none"
                maxLength={1000}
                required
              />
              <div className="text-right">
                <span className="text-sm text-purple-500">
                  {formData.message.length}/1000 characters
                </span>
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.author_name.trim() || !formData.message.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium"
            >
              {isSubmitting ? '💌 Sending...' : '💖 Send Birthday Wishes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Messages List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-purple-800 flex items-center gap-2">
            📖 Birthday Messages
            {messages.length > 0 && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                {messages.length} {messages.length === 1 ? 'message' : 'messages'}
              </Badge>
            )}
          </h3>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center space-x-2 text-purple-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              <span>Loading birthday messages... 💌</span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <Card className="text-center py-12 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="pt-6">
              <div className="text-6xl mb-4">💌</div>
              <h3 className="text-xl font-semibold text-purple-700 mb-2">No messages yet!</h3>
              <p className="text-purple-600">Be the first to write a birthday message for Arishita! 💜</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {messages.map((message: GuestbookMessage, index: number) => (
              <Card 
                key={message.id} 
                className="hover:shadow-lg transition-all duration-300 border-purple-200 bg-white/90 backdrop-blur-sm"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-12 h-12 border-2 border-purple-200">
                      <AvatarFallback className="bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700 font-semibold">
                        {getAvatarInitials(message.author_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-purple-800">{message.author_name}</h4>
                          <span className="text-lg">{getRandomEmoji()}</span>
                        </div>
                        <span className="text-sm text-purple-500">
                          {message.created_at.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="prose prose-purple max-w-none">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {message.message}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}