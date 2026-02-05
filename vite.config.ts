import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {fileURLToPath, URL} from "node:url";
import {gplayReloadPlugin} from "../gplay-app-sdk/src/vite/reloadPlugin.ts";
import svgLoader from 'vite-svg-loader'


// https://vite.dev/config/
export default defineConfig({
    plugins: [vue(), svgLoader(),
        gplayReloadPlugin()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
})
