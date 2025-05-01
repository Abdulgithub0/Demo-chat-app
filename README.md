# Sparkstrand Chat Next.js Application

A real-time chat application built with Next.js and the Sparkstrand Chat API client.

## Features

- Real-time messaging using Socket.IO
- Room-based chat system
- Typing indicators
- User status management (Online, Away, Offline)
- Responsive UI with Tailwind CSS

## Prerequisites

- Node.js 14.x or later
- A GitHub Personal Access Token with read:packages scope
- Sparkstrand Chat API credentials (API Key and API Secret)

## Setup

1. Clone this repository
2. Create a `.npmrc` file in the project root with the following content:
   ```
   @sparkstrand:registry=https://npm.pkg.github.com/
   //npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
   ```
3. Set your GitHub token as an environment variable:
   ```bash
   export GITHUB_TOKEN=your_github_token
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Create a `.env.local` file with your Sparkstrand Chat API credentials:
   ```
   CHAT_API_KEY=your_api_key_here
   CHAT_API_SECRET=your_api_secret_here
   NEXT_PUBLIC_CHAT_SERVER_URL=https://chat-application-h0xp.onrender.com
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```
7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Implementation Details

This application uses the `@sparkstrand/chat-api-client` SDK version 0.0.5 to interact with the Sparkstrand Chat API. The key components are:

### Authentication Flow

1. User enters a username (externalId) on the login page
2. The application calls the `/api/auth/initiate` endpoint to get a clientToken
3. The `useSparkStrandChat` hook uses the clientToken to authenticate with the Sparkstrand Chat API
4. Once authenticated, the user can join rooms and send messages

### Key SDK Components Used

- `useSparkStrandChat` hook from `@sparkstrand/chat-api-client/hooks`
- Types from `@sparkstrand/chat-api-client/types` (IMessage, IRoom, UserStatus, etc.)

### Project Structure

- `/src/pages/api/auth/initiate.ts` - API route for authentication
- `/src/components/Chat.tsx` - Main chat component using the SDK
- `/src/components/ChatMessage.tsx` - Component for rendering individual messages
- `/src/components/RoomList.tsx` - Component for displaying available chat rooms
- `/src/components/ChatInput.tsx` - Component for sending messages and typing indicators
- `/src/components/ChatHeader.tsx` - Component for displaying room info and user status

## Deployment

This application can be deployed to Vercel or any other Next.js-compatible hosting platform.

Make sure to set the environment variables in your hosting platform's dashboard.

## License

MIT
