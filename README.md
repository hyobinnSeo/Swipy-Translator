# Flipify Translator

A full-stack web application that provides translation services with additional features like text-to-speech and speech-to-text capabilities.

## Features

- Text translation between multiple languages
- Text-to-speech (TTS) functionality
- Speech-to-text (STT) capabilities
- Tone selection for translations
- Translation history management
- Customizable settings
- Voice settings configuration
- Responsive design with mobile support
- Password protection option

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API and utility services
│   │   └── pages/        # Page components
│   └── public/           # Static assets
└── server/               # Backend Node.js server
    └── index.js         # Server entry point
```

## Technology Stack

### Frontend
- React.js
- Tailwind CSS
- Custom React Hooks
- Browser Speech API integration

### Backend
- Node.js
- Google Cloud Platform services
- Text-to-Speech API
- Speech-to-Text API

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
   - Configure necessary API keys and credentials

4. Start the development servers:
   ```bash
   # Start the frontend (from client directory)
   npm start

   # Start the backend (from server directory)
   npm start
   ```

## Deployment

The application is configured for deployment to Google Cloud Platform using the provided deployment scripts and configuration files:

- `deploy.bat` - Deployment automation script
- `app.yaml` - Google Cloud App Engine configuration
- `env_variables.yaml` - Environment variables for cloud deployment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is proprietary software. All rights reserved.
