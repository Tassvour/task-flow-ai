import axios from "axios";

// All requests go to /api — Vite proxy forwards to http://localhost:5000
const api = axios.create({
  baseURL: "/api",
});

export default api;
