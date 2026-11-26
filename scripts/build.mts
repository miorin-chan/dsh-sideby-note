/**
 * Build the Sideby Note browser bundle from `src/client/index.ts`.
 *
 * Emits `client/client.js` wrapped in DSH's `window.__ModuleLoader__.load(...)`
 * classic-script envelope while keeping React and `@deepseek-ai/*` external.
 */
import type { Plugin } from 'esbuild'
import { createRequire } from 'node:module'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const { build } = require('esbuild') as typeof import('esbuild')

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CHECK = process.argv.includes('--check')
const pkg = JSON.parse(await readFile(resolve(ROOT, 'package.json'), 'utf8')) as { name: string }

const CLIENT_EXTERNAL = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  '@deepseek-ai/*',
]

const inlineCss: Plugin = {
  name: 'dsh-css-inline',
  setup(context) {
    context.onResolve({ filter: /\.css\?inline$/ }, (args) => ({
      path: resolve(args.resolveDir, args.path.slice(0, -'?inline'.length)),
      namespace: 'dsh-css-inline',
    }))
    context.onLoad({ filter: /.*/, namespace: 'dsh-css-inline' }, async (args) => ({
      contents: await readFile(args.path, 'utf8'),
      loader: 'text',
    }))
  },
}

const result = await build({
  entryPoints: [resolve(ROOT, 'src/client/index.ts')],
  bundle: true,
  write: false,
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  jsx: 'automatic',
  minify: false,
  legalComments: 'none',
  logLevel: 'warning',
  external: CLIENT_EXTERNAL,
  plugins: [inlineCss],
})

const file = result.outputFiles?.[0]
if (!file) throw new Error('No JavaScript output for src/client/index.ts')

const content = `window.__ModuleLoader__.load({ id: ${JSON.stringify(pkg.name)}, factory: (require) => {
var module = { exports: {} }; var exports = module.exports;
${file.text}
return module.exports; } });
`

const output = resolve(ROOT, 'client/client.js')
if (CHECK) {
  const current = existsSync(output) ? await readFile(output, 'utf8') : ''
  if (current !== content) {
    console.error('client/client.js is stale; run `node scripts/build.mjs`.')
    process.exitCode = 1
  } else {
    console.log('client/client.js is up to date.')
  }
} else {
  await mkdir(dirname(output), { recursive: true })
  await writeFile(output, content)
  console.log(`wrote client/client.js (${(content.length / 1024).toFixed(1)} KiB)`)
}
