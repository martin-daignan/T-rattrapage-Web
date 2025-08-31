const TRELLO_CONFIG = {
  API_KEY: import.meta.env.VITE_TRELLO_KEY,        
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || "http://localhost:3000",
  CALLBACK_URL: import.meta.env.VITE_CALLBACK_URL || "http://localhost:3000/api/callback",
};

export default TRELLO_CONFIG;
