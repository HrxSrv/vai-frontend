import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    optimizeDeps: {
        exclude: ["lucide-react"],
    },
    define: {
        "process.env": {},
    },
    build: {
        rollupOptions: {
            onwarn(warning, warn) {
                // Skip certain warnings
                if (warning.code === 'UNUSED_EXTERNAL_IMPORT')
                    return;
                warn(warning);
            }
        }
    },
    esbuild: {
        // This will ignore TypeScript errors during build
        logOverride: { 'this-is-undefined-in-esm': 'silent' }
    },
    server: {
    allowedHosts: [
      'all',
      '*',
      'localhost',
      '127.0.0.1',
      'a9db-2401-4900-8543-4225-6dfd-d06c-c5f2-47ce.ngrok-free.app',
      'http://7d4f-2401-4900-8543-4225-6dfd-d06c-c5f2-47ce.ngrok-free.app'
    ]
  }
});
