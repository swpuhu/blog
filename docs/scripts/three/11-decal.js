"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
var THREE = require("three");
var lil_gui_module_min_js_1 = require("three/examples/jsm/libs/lil-gui.module.min.js");
var stats_module_js_1 = require("three/examples/jsm/libs/stats.module.js");
var OrbitControls_js_1 = require("three/examples/jsm/controls/OrbitControls.js");
var DecalGeometry_js_1 = require("three/examples/jsm/geometries/DecalGeometry.js");
var vitepress_1 = require("vitepress");
var OBJLoader_js_1 = require("three/examples/jsm/loaders/OBJLoader.js");
var plainFullScreen_frag_glsl_1 = require("./shaders/plainFullScreen.frag.glsl");
var normal_vert_glsl_1 = require("./shaders/normal.vert.glsl");
var RGBELoader_js_1 = require("three/examples/jsm/loaders/RGBELoader.js");
function main() {
    return __awaiter(this, void 0, void 0, function () {
        function init() {
            renderer = new THREE.WebGLRenderer({
                antialias: true,
                canvas: canvas,
            });
            renderer.setSize(512, 512);
            renderer.setPixelRatio(window.devicePixelRatio);
            stats = new stats_module_js_1.default();
            document.body.appendChild(stats.dom);
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 1, 1000);
            camera.position.z = 120;
            var cameraPos = new THREE.Vector3(-32, 88.705, 93.4);
            var cameraQuat = new THREE.Quaternion(-0.1959, -0.1321, -0.0266, 0.9713);
            camera.position.copy(cameraPos);
            camera.setRotationFromQuaternion(cameraQuat);
            var controls = new OrbitControls_js_1.OrbitControls(camera, renderer.domElement);
            controls.minDistance = 50;
            controls.maxDistance = 200;
            scene.add(new THREE.AmbientLight(0x666666));
            var dirLight1 = new THREE.DirectionalLight(0xffddcc, 3);
            dirLight1.position.set(1, 0.75, 0.5);
            scene.add(dirLight1);
            var dirLight2 = new THREE.DirectionalLight(0xccccff, 3);
            dirLight2.position.set(-1, 0.75, -0.5);
            scene.add(dirLight2);
            var geometry = new THREE.BufferGeometry();
            geometry.setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
            line = new THREE.Line(geometry, new THREE.LineBasicMaterial());
            scene.add(line);
            loadLeePerrySmith();
            raycaster = new THREE.Raycaster();
            mouseHelper = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 10), new THREE.MeshNormalMaterial());
            mouseHelper.visible = false;
            scene.add(mouseHelper);
            window.addEventListener('resize', onWindowResize);
            var moved = false;
            controls.addEventListener('change', function () {
                moved = true;
            });
            window.addEventListener('pointerdown', function () {
                moved = false;
            });
            window.addEventListener('pointerup', function (event) {
                if (moved === false) {
                    checkIntersection(event.offsetX, event.offsetY);
                    if (intersection.intersects)
                        shoot();
                }
            });
            window.addEventListener('pointermove', onPointerMove);
            function onPointerMove(event) {
                checkIntersection(event.offsetX, event.offsetY);
            }
            function checkIntersection(x, y) {
                if (mesh === undefined)
                    return;
                mouse.x = (x / canvas.width) * 2 - 1;
                mouse.y = -(y / canvas.height) * 2 + 1;
                raycaster.setFromCamera(mouse, camera);
                raycaster.intersectObject(mesh, false, intersects);
                if (intersects.length > 0) {
                    var p = intersects[0].point;
                    mouseHelper.position.copy(p);
                    intersection.point.copy(p);
                    var n = intersects[0].face.normal.clone();
                    n.transformDirection(mesh.matrixWorld);
                    n.multiplyScalar(10);
                    n.add(intersects[0].point);
                    intersection.normal.copy(intersects[0].face.normal);
                    mouseHelper.lookAt(n);
                    var positions = line.geometry.attributes.position;
                    positions.setXYZ(0, p.x, p.y, p.z);
                    positions.setXYZ(1, n.x, n.y, n.z);
                    positions.needsUpdate = true;
                    intersection.intersects = true;
                    intersects.length = 0;
                }
                else {
                    intersection.intersects = false;
                }
            }
            var gui = new lil_gui_module_min_js_1.GUI();
            gui.add(params, 'minScale', 1, 30);
            gui.add(params, 'maxScale', 1, 30);
            gui.add(params, 'rotate');
            gui.add(params, 'clear');
            gui.open();
            var hdrLoader = new RGBELoader_js_1.RGBELoader();
            hdrLoader.load((0, vitepress_1.withBase)('img/hdr/buikslotermeerplein_2k.hdr'), function (data) {
                data.mapping = THREE.EquirectangularReflectionMapping;
                scene.background = data;
            });
        }
        function loadLeePerrySmith() {
            var map = textureLoader.load((0, vitepress_1.withBase)('models/Map-COL.jpg'));
            map.colorSpace = THREE.SRGBColorSpace;
            var objLoader = new OBJLoader_js_1.OBJLoader();
            objLoader.load((0, vitepress_1.withBase)('model/dragon.obj'), function (group) {
                group.children.forEach(function (item) {
                    if (item instanceof THREE.Mesh) {
                        item.material = new THREE.MeshPhongMaterial({
                            specular: 0x111111,
                        });
                        scene.add(item);
                        mesh = item;
                        item.scale.set(5, 5, 5);
                    }
                });
            });
        }
        function shoot() {
            position.copy(intersection.point);
            orientation.copy(mouseHelper.rotation);
            if (params.rotate)
                orientation.z = Math.random() * 2 * Math.PI;
            var scale = params.minScale +
                Math.random() * (params.maxScale - params.minScale);
            size.set(scale, scale, scale);
            var material = customMaterial.clone();
            var index = Math.floor(Math.random() * decalTextures.length);
            if (selectedIndex >= 0) {
                index = selectedIndex;
            }
            // material.map = decalTextures[index];
            material.uniforms.mainTex.value = decalTextures[index];
            // material.color.setHex(Math.random() * 0xffffff);
            var m = new THREE.Mesh(new DecalGeometry_js_1.DecalGeometry(mesh, position, orientation, size), material);
            m.renderOrder = decals.length; // give decals a fixed render order
            decals.push(m);
            scene.add(m);
        }
        function removeDecals() {
            decals.forEach(function (d) {
                scene.remove(d);
            });
            decals.length = 0;
        }
        function onWindowResize() {
            // camera.updateProjectionMatrix();
        }
        function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
            // stats.update();
        }
        var canvas, renderer, scene, camera, stats, mesh, raycaster, line, selectedIndex, intersection, mouse, intersects, textureLoader, footerContainer, decalTextureUrls, list, imgs, decalTextures, decalDiffuse, customMaterial, decalMaterial, decals, mouseHelper, position, orientation, size, params, rfId, mainLoop, cancel;
        return __generator(this, function (_a) {
            canvas = document.getElementById('canvas');
            selectedIndex = -1;
            intersection = {
                intersects: false,
                point: new THREE.Vector3(),
                normal: new THREE.Vector3(),
            };
            mouse = new THREE.Vector2();
            intersects = [];
            textureLoader = new THREE.TextureLoader();
            footerContainer = document.getElementById('footer');
            decalTextureUrls = [
                (0, vitepress_1.withBase)('decals/bianpao.png'),
                (0, vitepress_1.withBase)('decals/denglong.png'),
                (0, vitepress_1.withBase)('decals/dragon.png'),
                (0, vitepress_1.withBase)('decals/fu-cute.png'),
                (0, vitepress_1.withBase)('decals/fu.png'),
                (0, vitepress_1.withBase)('decals/qianbi.png'),
                (0, vitepress_1.withBase)('decals/qiandai.png'),
                (0, vitepress_1.withBase)('decals/yuanbao.png'),
            ];
            list = document.createDocumentFragment();
            imgs = [];
            decalTextureUrls.forEach(function (item, index) {
                var imgDom = document.createElement('img');
                imgDom.classList.add('img');
                imgDom.src = item;
                imgs.push(imgDom);
                imgDom.onclick = function () {
                    imgs.forEach(function (item) { return item.classList.remove('active'); });
                    if (selectedIndex === index) {
                        selectedIndex = -1;
                        return;
                    }
                    selectedIndex = index;
                    imgs[index].classList.add('active');
                };
                list.appendChild(imgDom);
            });
            footerContainer.append(list);
            decalTextures = decalTextureUrls.map(function (url) {
                return textureLoader.load(url);
            });
            decalDiffuse = textureLoader.load((0, vitepress_1.withBase)('models/decal-diffuse.png'));
            decalDiffuse.colorSpace = THREE.SRGBColorSpace;
            customMaterial = new THREE.ShaderMaterial({
                vertexShader: normal_vert_glsl_1.default,
                fragmentShader: plainFullScreen_frag_glsl_1.default,
                depthTest: true,
                depthWrite: false,
                uniforms: {
                    mainTex: {
                        value: decalTextures[0],
                    },
                },
                polygonOffset: true,
                polygonOffsetFactor: -4,
                wireframe: false,
                blending: THREE.CustomBlending,
                blendSrc: THREE.SrcAlphaFactor,
                blendDst: THREE.OneMinusSrcAlphaFactor,
            });
            decalMaterial = new THREE.MeshLambertMaterial({
                // specular: 0x444444,
                map: decalTextures[0],
                // shininess: 30,
                transparent: true,
                depthTest: true,
                depthWrite: false,
                polygonOffset: true,
                polygonOffsetFactor: -4,
                wireframe: false,
            });
            decals = [];
            position = new THREE.Vector3();
            orientation = new THREE.Euler();
            size = new THREE.Vector3(10, 10, 10);
            params = {
                minScale: 5,
                maxScale: 10,
                rotate: true,
                clear: function () {
                    removeDecals();
                },
            };
            init();
            rfId = 0;
            mainLoop = function () {
                requestAnimationFrame(mainLoop);
            };
            cancel = function () {
                cancelAnimationFrame(rfId);
            };
            return [2 /*return*/, {
                    mainLoop: animate,
                    cancel: cancel,
                }];
        });
    });
}
exports.main = main;
