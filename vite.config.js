// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'
// import fs from "fs";
// import mkcert from 'vite-plugin-mkcert'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [
//     react(), tailwindcss(),mkcert()],
//     server: {
//       https: true,
//       host: true, // Allow access from network
//       port: 5173, // Default Vite port
//       https: {
//         key: fs.readFileSync("localhost+2-key.pem"),
//         cert: fs.readFileSync("localhost+2.pem"),
//       },
//     },

// })
import fs from "fs";
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite'
import mkcert from 'vite-plugin-mkcert'
export default defineConfig({
  //  server: {
  //        https: true,
  //           host: true, // Allow access from network
  //           port: 5173, // Default Vite port
  //           https: {
  //             key: fs.readFileSync("localhost+2-key.pem"),
  //             cert: fs.readFileSync("localhost+2.pem"),
  //           },
  //         },
  base: '/fcheckac/', // <-- your subdirectory path

  plugins: [
    react(), tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg'], // Only include vite.svg
      manifest: {
        
          "name": "Fitox Connect",
          "short_name": "Fitox Connect",
          "start_url": "/",
          "display": "standalone",
          "background_color": "#ffffff",
          "theme_color": "#0f172a",
          "icons": [
            {
              "src": "/fc-icon-192x192.png",
              "sizes": "192x192",
              "type": "image/png"
            },
            {
              "src": "/fc-icon-512x512.png",
              "sizes": "512x512",
              "type": "image/png"
            }
          ]
        
      }
    })
  ]
});

