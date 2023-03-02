import DefaultTheme from 'vitepress/theme';
import SourceCodeExample from '../../scripts/SourceCodeExample.vue';
import AffineExample from '../../components/AffineExample.vue';
import ImgContainer from '../../components/ImgContainer.vue';
import QRCode from '../../components/QRCode.vue';
import WebGLExample1 from '../../scripts/webgl/WebGLExample1.vue';
import WebGLExample3 from '../../scripts/webgl/WebGLExample3.vue';
import WebGLUVMapping from '../../scripts/webgl/WebGLUVMapping.vue';
import WebGLImgProcess from '../../scripts/webgl/WebGLImgProcess.vue';
import TestComponent from '../../scripts/webgl/Test.vue';
import VisualizeLUTCube from '../../scripts/webgl/VisualizeLUTCube.vue';
import './Layout.css';
export default {
    ...DefaultTheme,
    enhanceApp(ctx) {
        DefaultTheme.enhanceApp(ctx);
        ctx.app.component('TestComponent', TestComponent);
        ctx.app.component('SourceCodeExample', SourceCodeExample);
        ctx.app.component('AffineExample', AffineExample);
        ctx.app.component('WebGLExample1', WebGLExample1);
        ctx.app.component('WebGLExample3', WebGLExample3);
        ctx.app.component('ImgContainer', ImgContainer);
        ctx.app.component('WebGLUVMapping', WebGLUVMapping);
        ctx.app.component('WebGLImgProcess', WebGLImgProcess);
        ctx.app.component('VisualizeLUTCube', VisualizeLUTCube);
        ctx.app.component('QRCode', QRCode);
    },
    setup() {},
};
