import DefaultTheme from 'vitepress/theme';
import SourceCodeExample from '../../scripts/SourceCodeExample.vue';
import AffineExample from '../../components/AffineExample.vue';
import ImgContainer from '../../components/ImgContainer.vue';
import QRCode from '../../components/QRCode.vue';
import WebGLExample1 from '../../scripts/webgl/WebGLExample1.vue';
import WebGLExample3 from '../../scripts/webgl/WebGLExample3.vue';
import WebGLUVMapping from '../../scripts/webgl/WebGLUVMapping.vue';
import WebGLImgProcess from '../../scripts/webgl/WebGLImgProcess.vue';
import WebGLImgProcess2 from '../../scripts/webgl/WebGLImgProcess2.vue';
import TestComponent from '../../scripts/webgl/Test.vue';
import VisualizeLUTCube from '../../scripts/webgl/VisualizeLUTCube.vue';
import WebGLOrthoProjection1 from '../../scripts/webgl/WebGLOrthoProjection1.vue';
import WebGLOrthoProjection2 from '../../scripts/webgl/WebGLOrthoProjection2.vue';
import WebGLPerspectiveProjection from '../../scripts/webgl/WebGLPerspectiveProjection.vue';
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
        ctx.app.component('WebGLImgProcess2', WebGLImgProcess2);
        ctx.app.component('VisualizeLUTCube', VisualizeLUTCube);
        ctx.app.component('WebGLOrthoProjection1', WebGLOrthoProjection1);
        ctx.app.component('WebGLOrthoProjection2', WebGLOrthoProjection2);
        ctx.app.component(
            'WebGLPerspectiveProjection',
            WebGLPerspectiveProjection
        );
        ctx.app.component('QRCode', QRCode);
    },
    setup() {},
};
