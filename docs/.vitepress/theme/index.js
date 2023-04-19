import DefaultTheme from 'vitepress/theme';
import SourceCodeExample from '../../scripts/SourceCodeExample.vue';
import AffineExample from '../../components/AffineExample.vue';
import ImgContainer from '../../components/ImgContainer.vue';
import QRCode from '../../components/QRCode.vue';
import WebGLExample1 from '../../scripts/webgl/components/WebGLExample1.vue';
import WebGLExample3 from '../../scripts/webgl/components/WebGLExample3.vue';
import WebGLUVMapping from '../../scripts/webgl/components/WebGLUVMapping.vue';
import WebGLImgProcess from '../../scripts/webgl/components/WebGLImgProcess.vue';
import WebGLImgProcess2 from '../../scripts/webgl/components/WebGLImgProcess2.vue';
import VisualizeLUTCube from '../../scripts/webgl/components/VisualizeLUTCube.vue';
import WebGLOrthoProjection1 from '../../scripts/webgl/components/WebGLOrthoProjection1.vue';
import WebGLOrthoProjection2 from '../../scripts/webgl/components/WebGLOrthoProjection2.vue';
import WebGLPerspectiveProjection from '../../scripts/webgl/components/WebGLPerspectiveProjection.vue';
import WebGLParallelLight from '../../scripts/webgl/components/WebGLParallelLight.vue';
import WebGLPointLight from '../../scripts/webgl/components/WebGLPointLight.vue';
import WebGLSpotLight from '../../scripts/webgl/components/WebGLSpotLight.vue';
import WebGLLessCode from '../../scripts/webgl/components/WebGLLessCode.vue';
import WebGLLoadModel from '../../scripts/webgl/components/WebGLLoadModel.vue';

import WebGLHierarchy from '../../scripts/webgl/components/WebGLHierarchy.vue';
import WebGLCamera from '../../scripts/webgl/components/WebGLCamera.vue';
import WebGLCamera2 from '../../scripts/webgl/components/WebGLCamera2.vue';
import WebGLRenderer from '../../scripts/webgl/components/WebGLRenderer.vue';
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
        ctx.app.component('WebGLImgProcess', WebGLImgProcess);
        ctx.app.component('WebGLImgProcess2', WebGLImgProcess2);
        ctx.app.component('VisualizeLUTCube', VisualizeLUTCube);
        ctx.app.component('WebGLOrthoProjection1', WebGLOrthoProjection1);
        ctx.app.component('WebGLOrthoProjection2', WebGLOrthoProjection2);
        ctx.app.component('WebGLHierarchy', WebGLHierarchy);
        ctx.app.component('WebGLCamera', WebGLCamera);
        ctx.app.component('WebGLCamera2', WebGLCamera2);
        ctx.app.component('WebGLRenderer', WebGLRenderer);
        ctx.app.component('WebGLParallelLight', WebGLParallelLight);
        ctx.app.component('WebGLPointLight', WebGLPointLight);
        ctx.app.component('WebGLSpotLight', WebGLSpotLight);
        ctx.app.component('WebGLLessCode', WebGLLessCode);
        ctx.app.component('WebGLLoadModel', WebGLLoadModel);
        ctx.app.component(
            'WebGLPerspectiveProjection',
            WebGLPerspectiveProjection
        );
        ctx.app.component('QRCode', QRCode);
    },
    setup() {},
};
