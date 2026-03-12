import type {CapacitorConfig} from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.gcognify.deathclock',
    appName: 'Death Clock',
    webDir: 'dist',
    server: {
        url: 'http://192.168.10.10:5173/',
        androidScheme: 'https',
        cleartext: true
    },
    plugins:{
        Keyboard: {
            resize: 'none'
        },
    },
};

export default config;
