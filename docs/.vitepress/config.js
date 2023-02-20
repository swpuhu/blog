/**
 * @type {import('vitepress').UserConfig}
 */
const config = {
    title: "Hans' Blog",
    description: 'Just playing around.',
    themeConfig: {
        siteTitle: "Welcome, Hans' Creative Space",
        nav: [
            {
                text: '文章',
                link: '/articles/',
            },
        ],
    },
    markdown: {
        lineNumbers: true,
    },
};

export default config;
