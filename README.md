# Spark Strand Chat - Next.js Application

A comprehensive real-time chat application built with Next.js 15 and the Spark Strand Chat API Client.

## Features

- **Real-time messaging** with instant message delivery
- **Room management** - create, join, and switch between chat rooms
- **User authentication** with demo login system
- **Message notifications** with sound alerts (Howler.js)
- **Auto-reconnection** handling for network issues
- **Responsive design** with Tailwind CSS
- **TypeScript** for type safety
- **Modern UI/UX** with clean, intuitive interface

## Technology Stack

- **Next.js 15** with App Router
- **React 19** with hooks
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **@sparkstrand/chat-api-client** for real-time chat functionality
- **Howler.js** for notification sounds
- **ESLint** for code quality

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A running Spark Strand Chat Server

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your chat server URL:
```
NEXT_PUBLIC_CHAT_SERVER_URL=http://localhost:3001
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Demo Login

For demonstration purposes, you can use any username and password to log in. The username will be used as the userId for the chat system. In a production environment, this would connect to your actual authentication service to get the proper userId.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Main page with auth logic
│   └── globals.css         # Global styles
├── components/
│   ├── ChatApp.tsx         # Main chat application wrapper
│   ├── ChatInterface.tsx   # Main chat interface
│   ├── LoginForm.tsx       # Authentication form
│   ├── RoomList.tsx        # Room sidebar component
│   ├── MessageList.tsx     # Messages display component
│   ├── MessageInput.tsx    # Message input component
│   └── CreateRoomModal.tsx # Room creation modal
```

## Key Features Implementation

### Real-time Messaging
- Uses `@sparkstrand/chat-api-client` context providers (`useChat`, `useChatRoom`, `useChatMessage`)
- Automatic message ordering and instant display
- Message status indicators (Sent, Delivered, Read)

### Room Management
- Create new rooms with name and description
- Switch between rooms seamlessly
- Room list sorted by latest activity

### Notifications
- Sound notifications for new messages
- Visual indicators for unread messages
- Notification sounds using Howler.js

### Auto-reconnection
- Automatic reconnection on network issues
- Graceful handling of connection states
- User feedback for connection status

## Configuration

### Environment Variables

- `NEXT_PUBLIC_CHAT_SERVER_URL` - Chat server WebSocket URL
- `NEXT_PUBLIC_APP_NAME` - Application identifier
- `NODE_ENV` - Environment (development/production)

### Chat Server Setup

Make sure your Spark Strand Chat Server is running and accessible at the configured URL. The server should support:

- WebSocket connections
- User authentication
- Room management
- Real-time message broadcasting

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

The project uses ESLint with Next.js recommended configuration. Run `npm run lint` to check for issues.

## Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Environment Setup

Make sure to set the correct environment variables for your production chat server:

```bash
NEXT_PUBLIC_CHAT_SERVER_URL=https://your-chat-server.com
```

## Troubleshooting

### Common Issues

1. **Connection Issues**: Verify the chat server URL in `.env.local`
2. **Authentication Problems**: Check if the chat server is running and accessible
3. **Missing Notifications**: Add a valid MP3 file at `public/notification.mp3`

### Debug Mode

Set `NODE_ENV=development` to enable debug logging in the chat client.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Check the troubleshooting section
- Review the Spark Strand Chat API Client documentation
- Open an issue in the repository
