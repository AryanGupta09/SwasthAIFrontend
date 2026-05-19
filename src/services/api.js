import axios from "axios";

// Production backend URL
const API = axios.create({
  baseURL: "https://swasthaibackend.onrender.com/api"
});

export default API;
