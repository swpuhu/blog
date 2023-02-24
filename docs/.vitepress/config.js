const markdownItKatex = require('markdown-it-katex');
const customElements = [
    'math',
    'maction',
    'maligngroup',
    'malignmark',
    'menclose',
    'merror',
    'mfenced',
    'mfrac',
    'mi',
    'mlongdiv',
    'mmultiscripts',
    'mn',
    'mo',
    'mover',
    'mpadded',
    'mphantom',
    'mroot',
    'mrow',
    'ms',
    'mscarries',
    'mscarry',
    'mscarries',
    'msgroup',
    'mstack',
    'mlongdiv',
    'msline',
    'mstack',
    'mspace',
    'msqrt',
    'msrow',
    'mstack',
    'mstack',
    'mstyle',
    'msub',
    'msup',
    'msubsup',
    'mtable',
    'mtd',
    'mtext',
    'mtr',
    'munder',
    'munderover',
    'semantics',
    'math',
    'mi',
    'mn',
    'mo',
    'ms',
    'mspace',
    'mtext',
    'menclose',
    'merror',
    'mfenced',
    'mfrac',
    'mpadded',
    'mphantom',
    'mroot',
    'mrow',
    'msqrt',
    'mstyle',
    'mmultiscripts',
    'mover',
    'mprescripts',
    'msub',
    'msubsup',
    'msup',
    'munder',
    'munderover',
    'none',
    'maligngroup',
    'malignmark',
    'mtable',
    'mtd',
    'mtr',
    'mlongdiv',
    'mscarries',
    'mscarry',
    'msgroup',
    'msline',
    'msrow',
    'mstack',
    'maction',
    'semantics',
    'annotation',
    'annotation-xml',
    'mjx-container',
    'mjx-assistive-mml',
];

/**
 * @type {import('vitepress').UserConfig}
 */
const config = {
    base: '/blog/',
    head: [
        [
            'link',
            {
                rel: 'stylesheet',
                href: '/blog/katex.css',
            },
        ],
    ],
    lastUpdated: true,
    title: "Hans' Blog",
    description: 'A blog website about front-end and game develop tech',
    locales: {
        root: {
            label: 'Chinese',
            lang: 'zh',
        },
        // en: {
        //     label: 'English',
        //     lang: 'en',
        //     link: '/en/guide',
        // },
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
            // {
            //     text: '图形学',
            //     collapsed: false,
            //     link: '/articles/graphics/',
            //     items: [
            //         {
            //             text: '简介',
            //             link: '/articles/graphics/1-introduction.md',
            //         },
            //         {
            //             text: 'ContourTracing',
            //             link: '/articles/graphics/2-contourTracing.md',
            //         },
            //     ],
            // },
            {
                text: 'WebGL实战专栏',
                collapsed: false,
                link: '/articles/webgl/',
                items: [
                    {
                        text: 'WebGL核心原理概述',
                        link: '/articles/webgl/1-webgl-introduction/',
                    },
                    {
                        text: '你的第一个 WebGL 程序',
                        link: '/articles/webgl/2-webgl-drawPoint/',
                    },
                ],
            },
        ],
    },
    markdown: {
        lineNumbers: true,
        config: md => {
            md.use(markdownItKatex);
        },
    },
    vue: {
        template: {
            compilerOptions: {
                isCustomElement: tag => customElements.includes(tag),
            },
        },
    },
};

export default config;
