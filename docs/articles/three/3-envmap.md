#环境贴图（天空盒）

## 简介

环境贴图(Environment map)是一类用于模拟环境反射光照的一种 3D 技术，尤其是在真实感渲染中是非常重要的组成部分。环境贴图也常常被我们称为“天空盒”。在 Three.js 中，支持许多不同类型的环境贴图，比如：

-   Cube Maps
-   Spherical Maps
-   Equirectangular Maps

### 为什么要使用环境贴图？

环境贴图常常被用于以下方面：

-   模拟物体所处的环境（作为背景）
-   作为一种间接光照参与到物体的渲染运算中
-   模拟反射、折射现象等

## 使用环境贴图

在 Three.js 中，使用环境贴图很方便。

```ts
const loader = new THREE.CubeTextureLoader();
loader.setPath('textures/cube/pisa/');

const textureCube = loader.load([
    'px.png',
    'nx.png',
    'py.png',
    'ny.png',
    'pz.png',
    'nz.png',
]);
```

我们可以将其作为场景中背景，只需要在 scene 对象上设置：

```ts
scene.background = textureCube;
```

也可以将其设置为材质的参数用于反射或者折射环境的光照：

```ts
const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    envMap: textureCube,
});
```

今天我们就来自己动手实践一番，一步一步实现一下将环境贴图作为背景是如何做到的。

## 动手实践

我们今天要实现的是 `Cube Maps`作为场景背景。大家可以先思考一下，为什么环境贴图广泛的被人们称为“天空盒”。

顾名思义，因为环境贴图正是在被贴在了一个盒子当中！正如下图所示：我们可以想象是将摄像机放在了一个盒子中，这个盒子的内部都被贴上了不同的图片，这些图片就代表了我们看到的环境！

<ImgContainer :srcs="['/img/three-example/skybox.png']"/>

实现环境贴图的方法有很多，今天我们介绍一种符合我们直觉的实现方式，正如上图一样，我们理解的环境贴图，就是将摄像机放置于一个内部贴满了图片的立方体盒子中。

### 如何对环境贴图采样？

回忆一下，在之前的 2D 贴图中，我们是如何对图片进行采样的？我们需要一个 uv 坐标来告诉我们对哪个坐标点进行采样。那么现在我们处于这样的一个立方体的盒子中，我们很容易想到，我们不仅仅需要 uv 坐标，而且我们还需要知道是在立方体的哪个面上。所以一个二维的 UV 坐标并不能满足我们的需求了。我们需要其他的采样方式。

假设这个立方体盒子的大小是恒定不变的，它的边长始终是 1，摄像机处于立方体的正中心位置。那么我们就可以根据摄像机的视线方向进行贴图的采样（每一个方向所对应的像素点是确定且唯一的！）。（如下图所示）

<ImgContainer :srcs="['/img/three-example/cubesampler.png']"/>

我们现在就开始模拟这样的一种场景。

### 模拟立方体

首先，我们需要一个立方体，然后将摄像机放在立方体里面。立方体的构建，在之前的章节中我们已经介绍过了，使用 Three.js 提供的内置几何体`BoxGeometry`即可，设置它的边长为 1。

```ts
const boxGeo = new BoxGeometry(1, 1, 1);
```

重点在于，我们如何将摄像机放入我们的盒子中呢？如果我们的场景中只有 1 个摄像机的话，如果将这个摄像机放入到了这个盒子中，那么其他物体的渲染就会出现问题，当然，我们也可以使用多个摄像机，然后设置摄像机的可见性即可。(意思就是使用 1 个额外的摄像机只渲染天空盒，另外的摄像机负责渲染别的物体)

这里介绍一种方法，可以让我们不使用额外的摄像机同样可以达到我们的目的。

```ts
mesh.onBeforeRender = function (this: Mesh, renderer, scene, camera) {
    this.matrixWorld.copyPosition(camera.matrixWorld);
};
```

`Mesh` 对象提供了一个事件`onBeforeRender`，通过这个事件，我们可以在渲染前修改我们的`matrixWorld`，它对应了 shader 程序中的 `modelMatrix`，通过 `modelMatrix`可以将顶点的本地坐标转换为世界坐标。

上面的代码将摄像机的世界矩阵复制到了立方体盒子的世界矩阵。那么立方体盒子的顶点坐标则相当于是摄像机空间下的本地坐标。相当于我们把 mesh 设置成了相机节点的**直接子节点**(所谓的直接子节点的意思是该节点的第一代子节点，不是孙子节点或更深层级的子节点)。

我们再来结合一下顶点着色器中的代码来看一下：

```glsl
varying vec3 vWorldDirection;

vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

}
void main() {

	vWorldDirection = transformDirection( position, modelMatrix );

	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

	gl_Position.z = gl_Position.w; // set z to camera.far

}
```

在上文中提到，我们需要根据视线方向来进行纹理采样。所以，计算摄像机的朝向十分的重要。 在上面的 shader 代码中，我们使用 `transformDirection`这个函数来进行向量的变换，在这个函数中，我们使用 `vec4(dir, 0.0)`来与矩阵进行相乘是为了消除矩阵中平移项对我们方向向量的影响，因为摄像机的朝向不应当收到摄像位移的影响！

再因为我们的立方体相当于是摄像机的第一代子节点，所以`modelViewMatrix * vec4(position, 1.0)`的结果应当是恰好处于摄像机的裁剪区域的边缘。再用`projectionMatrix`相乘后，则立方体刚好将整个画布所覆盖。

最后，我们需要保证立方体的可见区域的深度处于最深处，以保证不会遮挡别的物体。所以需要设置：

```glsl
gl_Position.z = gl_Position.w;
```

接下来，我们可以开始编写片元着色器的部分：

```glsl

varying vec3 vWorldDirection;
uniform samplerCube envMap;

void main() {

	vec4 texColor = textureCube( envMap, vWorldDirection);

	gl_FragColor = texColor;
}

```

片元着色器的部分就很简单了，除了需要声明一个跟顶点着色器相同的`varying`变量`vWorldDirection`用于纹理采样之外，还需要声明一个`uniform samplerCube`类型的变量，它表示环境贴图纹理（CubeTexture), 对其进行采用我们使用的是 GLSL 提供的内置函数`textureCube`。最后将采样的结果赋值给 `gl_FragColor`即可。

最终的效果如下：
<ThreeEnvMap/>

## 小结

今天我们介绍了什么是环境贴图以及环境贴图的使用方法，在 Three.js 中可以通过设置 scene 的 `background`属性来使用环境贴图，也可以给材质加上环境贴图以反射或折射环境。

后续我们自己动手实现了一个天空盒进一步加深了对环境贴图的理解，学习到了使用 `textureCube`来对环境贴图进行采样。

总的来说，环境贴图是一种使用非常广泛且实用的技术。

完整代码如下：

:::code-group

<<< @/scripts/three/3-three-envmap.ts#snippet [envmap.ts]
<<< @/scripts/three/shaders/envmap.vert.glsl#snippet{glsl:line-numbers} [vert.glsl]
<<< @/scripts/three/shaders/envmap.frag.glsl#snippet{glsl:line-numbers} [frag.glsl]
:::
