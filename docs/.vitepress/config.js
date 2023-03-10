const markdownItKatex = require('./lib/markdown-katex');
const content = require('./content');
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
    base: '/blog',
    head: [
        [
            'link',
            {
                rel: 'stylesheet',
                href: '/blog/katex.css',
            },
        ],
    ],
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
        siteTitle: "Welcome to Hans' Creative Magic Space",
        nav: [
            {
                text: '????????????',
                link: '/articles/',
            },
        ],
        sidebar: content,
        footer: {
            copyright:
                'Copyright ?? 2023-present <a href="beian.miit.gov.cn">???ICP???2023003388???</a>',
        },
    },
    markdown: {
        lineNumbers: true,
        config: md => {
            md.use(markdownItKatex, {
                throwOnError: false,
                errorColor: '#cc0000',
            });
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
