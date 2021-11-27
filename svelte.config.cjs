const { postcss, globalStyle, typescript, scss } = require('svelte-preprocess')

module.exports = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [
    typescript(),
    scss(),
    postcss({
      plugins: [
        require('tailwindcss'),
        require('@tillschander/postcss-rem-to-px'),
        require('autoprefixer'),
      ],
    }),
    globalStyle(),
  ],
}
