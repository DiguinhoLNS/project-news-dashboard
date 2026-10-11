import { defineConfig } from 'vite'

// O Vite só compila; quem serve os arquivos é o WordPress (functions.php).
// Os nomes são fixos e o cache é quebrado pela data do arquivo (filemtime).
export default defineConfig({
    base: './',
    publicDir: false,
    build: {
        outDir: 'assets/dist',
        emptyOutDir: true,
        modulePreload: false,
        rolldownOptions: {
            input: 'assets/src/js/main.js',
            output: {
                entryFileNames: 'main.js',
                assetFileNames: ({ names }) =>
                    names.some((name) => name.endsWith('.css'))
                        ? 'main.css'
                        : 'fonts/[name][extname]',
            },
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                // Silencia avisos do Sass por conta do Bootstrap 5.3.
                quietDeps: true,
                silenceDeprecations: [
                    'import',
                    'global-builtin',
                    'color-functions',
                    'if-function',
                ],
            },
        },
    },
})
