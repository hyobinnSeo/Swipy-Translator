const isDevelopment = process.env.NODE_ENV === 'development';

const config = {
    serverUrl: isDevelopment 
        ? 'http://localhost:5000'
        : 'https://swipy-translator.du.r.appspot.com'
};

export default config;
