import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {fileURLToPath, URL} from "node:url";
import {gplayReloadPlugin} from "../gplay-app-sdk/src/vite/reloadPlugin.ts";


// https://vite.dev/config/
export default defineConfig({
    plugins: [vue(), gplayReloadPlugin()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
})
