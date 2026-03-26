import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from "node:url";
import svgLoader from 'vite-svg-loader'
import { gplayReloadPlugin } from "@gplay/app-sdk/vite";


// https://vite.dev/config/
export default defineConfig({
    base: './',
    plugins: [vue(), svgLoader(),
    gplayReloadPlugin()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
})
