import type {CapacitorConfig} from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.gcognify.death-clock',
    appName: 'Death Clock',
    webDir: 'dist',
    server: {
        url: 'http://192.168.10.10:5173/',
        androidScheme: 'https',
        cleartext: true
    },
};

export default config;
