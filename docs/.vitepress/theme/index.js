import DefaultTheme from 'vitepress/theme';
import SourceCodeExample from '../../scripts/SourceCodeExample.vue';
import './Layout.css';
export default {
    ...DefaultTheme,
    enhanceApp(ctx) {
        DefaultTheme.enhanceApp(ctx);
        ctx.app.component('SourceCodeExample', SourceCodeExample);
    },
    setup() {},
};
