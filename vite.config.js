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
import tailwindcss from '@tailwindcss/vite'
import mkcert from 'vite-plugin-mkcert'
import { VitePWA } from 'vite-plugin-pwa';
import javascriptObfuscator from 'vite-plugin-javascript-obfuscator';

export default defineConfig({
  server: {
          https: true,
             host: true, // Allow access from network
           port: 5173, // Default Vite port
             https: {
               key: fs.readFileSync("localhost+2-key.pem"),
              cert: fs.readFileSync("localhost+2.pem"),
             },
           },
  base: '/fcheckac/', // <-- your subdirectory path

  plugins: [
    react(), tailwindcss(),mkcert(),   javascriptObfuscator({
      compact: true,
      controlFlowFlattening: true,
      deadCodeInjection: true,
      debugProtection: true,
      stringArray: true,
      rotateStringArray: true,
    }, ['**/vendor/**']), // exclude vendor files if needed
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
    })
  ]
});

