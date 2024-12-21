/** @type {import("prettier").Config} */
export default {
    plugins: [],
    overrides: [
        {
            files: '*.astro',
            options: {
                parser: 'astro',
            },
        },
    ],
    trailingComma: 'es5',
    tabWidth: 4,
    printWidth: 120,
    semi: true,
    singleQuote: true,
};
