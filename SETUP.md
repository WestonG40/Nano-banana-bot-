# Setup Guide - Nano-banana-bot

This guide will help you properly set up the Nano-banana-bot application to work correctly.

## Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn
- A Gemini API key

## Quick Setup

### 1. Clone the Repository (if not already done)
```bash
cd /workspaces/Nano-banana-bot-
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Get Your Gemini API Key

1. Visit [https://ai.google.dev/](https://ai.google.dev/)
2. Sign in with your Google account
3. Click "Get API Key" 
4. Create or select a project
5. Copy your API key

### 4. Configure Environment Variables

#### Option A: Automatic Setup (Recommended)
Run the provided setup script:
```bash
chmod +x setup.sh
./setup.sh
```

#### Option B: Manual Setup
1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and replace the placeholder with your actual API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

### 5. Verify the Setup
Check that `.env.local` contains:
```bash
cat .env.local
```

You should see:
```
GEMINI_API_KEY=sk-... (your actual key)
NODE_ENV=development
```

## Running the Application

### Development Server
```bash
npm run dev
```

The application will start on `http://localhost:3000`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Project Structure

```
src/
├── App.tsx                  # Main application component
├── components/              # React components
│   ├── ChatHistory.tsx
│   ├── NanoBot.tsx
│   ├── SettingsModal.tsx
│   └── VoiceVisualizer.tsx
├── hooks/                   # Custom React hooks
│   ├── useAudioPlayer.ts
│   └── useAudioRecorder.ts
├── services/                # API services
│   ├── geminiApi.ts         # Gemini API configuration
│   └── geminiLiveService.ts # Gemini Live streaming service
├── main.tsx                 # Application entry point
└── index.css               # Global styles
```

## Troubleshooting

### Issue: "GEMINI_API_KEY is not defined in the environment"

**Solution:**
- Ensure `.env.local` file exists in the project root
- Verify the file contains: `GEMINI_API_KEY=your_actual_key`
- Restart the development server after editing `.env.local`

### Issue: "Authentication failed" or "403 Forbidden"

**Solution:**
- Verify your API key is correct and not expired
- Ensure your Google account has enabled the Gemini API
- Check if your quota limits have been exceeded
- Visit [https://console.cloud.google.com/](https://console.cloud.google.com/) to manage your project

### Issue: "Network error" or Connection fails

**Solution:**
- Check your internet connection
- Verify firewall settings allow outbound connections to Google APIs
- Try clearing browser cache and restarting the dev server

### Issue: Build fails or dependencies not found

**Solution:**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Environment Variables Explained

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Your Google Gemini API key for authentication |
| `NODE_ENV` | No | Environment mode (development or production) |

## API Configuration Details

The application uses two main API files:

### `geminiApi.ts`
Central configuration for the Gemini API client:
- `initializeGeminiClient()` - Creates and returns an API client
- `validateGeminiConfig()` - Validates API configuration
- `getGeminiConfig()` - Retrieves current configuration
- `isGeminiApiConfigured()` - Checks if API is ready

### `geminiLiveService.ts`
Handles real-time streaming with Gemini:
- `connectToGeminiLive()` - Establishes a live audio connection
- Manages audio input/output
- Handles transcriptions and callbacks

## For More Information

- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

---

**Last Updated:** 2026-08-15
