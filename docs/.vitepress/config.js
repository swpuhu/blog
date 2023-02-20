/**
 * @type {import('vitepress').UserConfig}
 */
const config = {
    base: '/blog/',
    title: "Hans' Blog",
    description: 'A blog website about front-end and game develop tech',
    locales: {
        root: {
            label: 'Chinese',
            lang: 'zh',
        },
        en: {
            label: 'English',
            lang: 'en',
            link: '/en/guide',
        },
    },
    themeConfig: {
        siteTitle: "Welcome, Hans' Creative Magic Space",
        nav: [
            {
                text: '技术文章',
                link: '/articles/',
            },
        ],
        sidebar: [
            {
                text: '图形学',
                collapsed: false,
                link: '/articles/graphics/',
                items: [
                    {
                        text: '简介',
                        link: '/articles/graphics/1-introduction.md',
                    },
                    {
                        text: 'ContourTracing',
                        link: '/articles/graphics/2-contourTracing.md',
                    },
                ],
            },
        ],
    },
    markdown: {
        theme: 'github-light',
        lineNumbers: true,
    },
};

export default config;
