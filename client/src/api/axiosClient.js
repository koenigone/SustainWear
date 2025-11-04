import axios from "axios";

/*
  this is a reusable version of axios with preset configs (like baseURL and auth headers)
  It simplifies api calls across the app and keeps all request settings consistent in one place
  Use it instead of regular axios, do not modify it
*/
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default instance;