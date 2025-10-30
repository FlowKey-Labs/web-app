# FlowKeys Frontend

FlowKeys is a modern web application that offers real-time analytics, appointment scheduling, and business management tools.

## 🚀 Features

- **Modern Stack**:
  - React 19.0.0 with TypeScript
  - Vite for fast development
  - Tailwind CSS for styling
  - Zustand for state management

## 🛠️ Prerequisites

- Node.js 18.0.0 or higher (LTS recommended)
- npm (v8.0.0+) or yarn (v1.22.0+)
- Git
- Backend API server (required for full functionality)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/FlowKey-Labs/web-app.git
cd web-app
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Or using yarn:
```bash
yarn install
```

### 3. Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# API Configuration
VITE_APP_BASEURL=http://127.0.0.1:8000  # URL of your backend API
VITE_APP_ENVIRONMENT=development        # Set to 'production' in production

```

> **Note**: The frontend requires a running backend API server. Make sure your backend is running and accessible at the specified `VITE_APP_BASEURL`.

### 4. Start the Development Server

```bash
# Using npm
npm run dev

# Or using yarn
yarn run dev
```

The application will be available at [http://localhost:5173](http://localhost:5173)

### 5. Build for Production

```bash
# Using npm
npm run build

# Or using yarn
yarn run build
```

Production files will be generated in the `dist` directory and can be served using any static file server.

## 🔧 Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Ensure the backend server is running and accessible
   - Verify the `VITE_APP_BASEURL` in your `.env` file is correct
   - Check browser's developer console for CORS errors

2. **Installation Issues**
   - Clear npm/yarn cache: `npm cache clean --force` or `yarn cache clean`
   - Delete `node_modules` and `package-lock.json`/`yarn.lock` and reinstall
   - Ensure you're using the correct Node.js version (18+)

3. **Build Failures**
   - Check for TypeScript errors
   - Ensure all environment variables are properly set
   - Verify all dependencies are correctly installed

4. **Development Server Not Starting**
   - Check if port 5173 is already in use
   - Try running with a different port: `npm run dev -- --port 3000`

## Project Structure

```
web-app/
├── src/
│   ├── assets/          # Static assets (images, fonts, etc.)
│   ├── components/      # Reusable React components
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   ├── api/             # API services
│   ├── store/           # Zustand store
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Root component
│   └── main.tsx         # Application entry point
├── public/              # Public assets
├── index.html           # Main HTML file
├── package.json         # Project dependencies
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## Available Scripts

- `dev`: Start development server
- `build`: Create production build
- `preview`: Preview production build locally
- `test`: Run tests
- `lint`: Check code for errors
- `format`: Format code with Prettier

## Development Guidelines

- Use functional components with TypeScript
- Follow React best practices and hooks
- Keep components small and focused
- Write tests for new features
- Follow the existing code style

## 🧪 Testing

Run the test suite:
```bash
# Using npm
npm test

# Or using yarn
yarn test
```

## 📄 License

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/contribution-feature`)
3. Commit your changes (`git commit -m 'Add some contribution feature'`)
4. Push to the branch (`git push origin feature/contribution-feature`)
5. Open a Pull Request

## 🙋 Support

For support, please:
- For critical issues, contact the development team directly


