import { readFileSync, writeFileSync } from 'fs'

const CONFIG_PATH = 'capacitor.config.ts'

const DEV_SERVER = `  server: {
    url:'http://192.168.10.10:5173/',
    androidScheme: "https",
    cleartext: true,
  },`

const original = readFileSync(CONFIG_PATH, 'utf8')

const patched = original.replace(
  /(const config: CapacitorConfig = \{)/,
  `$1\n${DEV_SERVER}`
)

writeFileSync(CONFIG_PATH, patched)
console.log('✓ capacitor.config.ts patched with dev server')
