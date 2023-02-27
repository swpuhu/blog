import DefaultTheme from 'vitepress/theme';
import SourceCodeExample from '../../scripts/SourceCodeExample.vue';
import AffineExample from '../../components/AffineExample.vue';
import ImgContainer from '../../components/ImgContainer.vue';
import QRCode from '../../components/QRCode.vue';
import WebGLExample1 from '../../scripts/webgl/WebGLExample1.vue';
import WebGLExample3 from '../../scripts/webgl/WebGLExample3.vue';
import WebGLUVMapping from '../../scripts/webgl/WebGLUVMapping.vue';
import './Layout.css';
export default {
    ...DefaultTheme,
    enhanceApp(ctx) {
        DefaultTheme.enhanceApp(ctx);
        ctx.app.component('SourceCodeExample', SourceCodeExample);
        ctx.app.component('AffineExample', AffineExample);
        ctx.app.component('WebGLExample1', WebGLExample1);
        ctx.app.component('WebGLExample3', WebGLExample3);
        ctx.app.component('ImgContainer', ImgContainer);
        ctx.app.component('WebGLUVMapping', WebGLUVMapping);
        ctx.app.component('QRCode', QRCode);
    },
    setup() {},
};
