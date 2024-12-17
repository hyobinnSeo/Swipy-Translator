# Swify Translator

A cutting-edge AI-powered translation platform that goes beyond simple text conversion. Swify Translator leverages multiple AI models to provide context-aware translations while preserving the original tone and cultural nuances of your content.

## Key Features

- **Multi-Model AI Translation**
  - Powered by leading AI models:
    - Google's Gemini 1.5
    - Cohere Command R
    - Claude 3 Haiku
    - GPT-4o mini
  - Smart model selection for optimal results
  - Context-aware translations

- **Advanced Language Support**
  - 10 major languages including:
    - English (US, UK, AU variants)
    - French (France, Canada variants)
    - Spanish (Spain, US variants)
    - Italian
    - German
    - Brazilian Portuguese
    - Japanese
    - Korean
    - Simplified Chinese
    - Arabic
  - Auto language detection
  - Native script support for all languages

- **Intelligent Tone Control**
  - Multiple tone options:
    - Standard (neutral and clear)
    - Casual (friendly and relaxed)
    - Formal (professional and polite)
    - Business (industry-specific terminology)
    - Literary (elegant and artistic)
    - Humorous (witty and playful)
    - Kid-friendly (simple and fun)
    - Unique "Cardi B" style (bold and unfiltered)
  - Tone preservation across languages
  - Cultural context adaptation

- **Voice Capabilities**
  - Text-to-Speech with multiple voice options per language
  - Gender selection for voices (male/female variants)
  - Regional accent options (e.g., US, UK, AU for English)
  - Speech-to-Text for hands-free input
  - Real-time voice processing

- **Smart Features**
  - Translation history management (up to 10 items)
  - Saved translations storage (up to 50 items)
  - Password protection option
  - Mobile-friendly responsive design
  - Swipe gesture support
  - Safety warnings for sensitive content

## Technology Stack

### Frontend
- React.js for UI components
- Tailwind CSS for styling
- Custom React Hooks for state management
- Browser Speech API integration
- Local storage for data persistence
- Socket.IO for real-time communication

### Backend
- Node.js with Express
- Google Cloud Platform integration:
  - Cloud Text-to-Speech API
  - Cloud Speech-to-Text API
  - App Engine hosting
- Real-time WebSocket communication
- Session management
- CORS security

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── constants/     # Application constants
│   │   ├── core/         # Core application logic
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # Page components
│   │   └── services/     # API and utility services
│   └── public/           # Static assets
└── server/               # Backend Node.js server
    ├── client/          # Production build files
    └── index.js         # Server entry point
```

## Getting Started

1. Clone the repository

2. Install dependencies:
   ```bash
   # Install root dependencies
   npm install

   # Install client dependencies
   cd client
   npm install

   # Install server dependencies
   cd ../server
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the server directory
   - Add required Google Cloud credentials
   - Configure API keys and environment-specific variables

4. Start the development servers:
   ```bash
   # Start the frontend (from client directory)
   npm start

   # Start the backend (from server directory)
   npm start
   ```

## Deployment

The application is configured for deployment to Google Cloud Platform:

- Uses Google App Engine for hosting
- Includes deployment automation via `deploy.bat`
- Configuration files:
  - `app.yaml` - App Engine configuration
  - `env_variables.yaml` - Environment variables
  - `.gcloudignore` - Deployment exclusions

## Development Guidelines

- Use consistent code formatting
- Follow React best practices and hooks guidelines
- Maintain responsive design principles
- Write clean, documented code
- Test thoroughly before deployment

## License

This project is proprietary software. All rights reserved.
