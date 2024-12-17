import { defineConfig } from "vite";

export default defineConfig({
  root: "./", // Set the folder where your index.html is located
  server: {
    open: false, // Opens the browser automatically
    cors: true,
  },
});
