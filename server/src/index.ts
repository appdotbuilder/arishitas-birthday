import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { 
  uploadPhotoInputSchema,
  getPhotosInputSchema,
  addVideoInputSchema,
  getVideosInputSchema,
  createGuestbookMessageInputSchema,
  getGuestbookMessagesInputSchema
} from './schema';
import { uploadPhoto } from './handlers/upload_photo';
import { getPhotos } from './handlers/get_photos';
import { addVideo } from './handlers/add_video';
import { getVideos } from './handlers/get_videos';
import { createGuestbookMessage } from './handlers/create_guestbook_message';
import { getGuestbookMessages } from './handlers/get_guestbook_messages';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Photo routes
  uploadPhoto: publicProcedure
    .input(uploadPhotoInputSchema)
    .mutation(({ input }) => uploadPhoto(input)),
  
  getPhotos: publicProcedure
    .input(getPhotosInputSchema.optional())
    .query(({ input }) => getPhotos(input)),
  
  // Video routes
  addVideo: publicProcedure
    .input(addVideoInputSchema)
    .mutation(({ input }) => addVideo(input)),
  
  getVideos: publicProcedure
    .input(getVideosInputSchema.optional())
    .query(({ input }) => getVideos(input)),
  
  // Guestbook routes
  createGuestbookMessage: publicProcedure
    .input(createGuestbookMessageInputSchema)
    .mutation(({ input }) => createGuestbookMessage(input)),
  
  getGuestbookMessages: publicProcedure
    .input(getGuestbookMessagesInputSchema.optional())
    .query(({ input }) => getGuestbookMessages(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`🎉 Arishita's Birthday Celebration TRPC server listening at port: ${port}`);
}

start();