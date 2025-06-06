# Google Tasks Manager

A web application that integrates with Google Tasks API and syncs with Google Calendar. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- Google OAuth authentication
- View and manage tasks
- Sync with Google Calendar
- Responsive design
- Real-time updates
- Docker development environment with hot reloading

## Prerequisites

- Node.js 18.x or later
- npm or yarn
- Docker and Docker Compose
- Google Cloud Platform account
- Google Tasks API enabled
- Google Calendar API enabled

## Setup

### Local Development (without Docker)

1. Clone the repository:
```bash
git clone <repository-url>
cd google-tasks-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a Google Cloud Project and enable the necessary APIs:
   - Go to the [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project
   - Enable the Google Tasks API and Google Calendar API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs (e.g., http://localhost:4000/api/auth/callback/google)

4. Create a `.env.local` file in the root directory with the following variables:
```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
NEXTAUTH_URL=http://localhost:4000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

5. Run the development server:
```bash
npm run dev
```

### Docker Development

1. Make sure Docker and Docker Compose are installed and running on your system.

2. Create the `.env.local` file as described above.

3. Start the development environment:

   On Windows:
   ```bash
   scripts\dev.bat
   ```

   On Unix-based systems:
   ```bash
   chmod +x scripts/dev.sh
   ./scripts/dev.sh
   ```

4. The application will be available at http://localhost:4000

The Docker development environment includes:
- Hot reloading for instant updates
- Volume mounting for local development
- Health checks for container status
- Automatic cleanup on exit

## Development with Dev Containers (Recommended for Windows)

This project uses Dev Containers for a consistent development environment. This approach is recommended for Windows users as it provides better performance and integration than Docker Desktop.

### Prerequisites

1. Install [WSL2](https://learn.microsoft.com/en-us/windows/wsl/install)
2. Install [Visual Studio Code](https://code.visualstudio.com/)
3. Install the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) in VS Code

### Getting Started

1. Open the project in VS Code
2. When prompted, click "Reopen in Container" or use the command palette (F1) and select "Dev Containers: Reopen in Container"
3. Wait for the container to build and start
4. The development server will be available at http://localhost:3000

### Features

- Full Node.js development environment
- Pre-configured ESLint and Prettier
- Tailwind CSS support
- TypeScript support
- Git integration
- GitHub CLI tools

### Benefits over Docker Desktop

- Better performance on Windows
- Native file system access
- Direct hardware access
- No need for Docker Desktop
- Better integration with Windows tools
- Smaller resource footprint

## Development

- `npm run dev` - Start development server (local)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Technologies Used

- Next.js 14
- TypeScript
- Tailwind CSS
- NextAuth.js
- Google Tasks API
- Google Calendar API
- Docker
- Docker Compose

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
