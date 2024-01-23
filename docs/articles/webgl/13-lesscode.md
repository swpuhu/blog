# 码少，趣多

## 动机

在进行下一步的学习之前，我们需要整理一下我们之前写的代码。我们回顾一下我们之前编写的 WebGL 代码，我们发现，大部分的代码都是极其重复的。比如：

```ts
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointPos), gl.STATIC_DRAW);

const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

const normalBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

// ......

const uWorldLoc = gl.getUniformLocation(program, 'u_world');
const uViewInvLoc = gl.getUniformLocation(program, 'u_viewInv');
const uLightPos = gl.getUniformLocation(program, 'u_lightPos');
const uViewPosLoc = gl.getUniformLocation(program, 'u_viewWorldPos');
const uGlossLoc = gl.getUniformLocation(program, 'u_gloss');
const uCoefficientLoc = gl.getUniformLocation(program, 'u_coefficient');
const uSpotDirLoc = gl.getUniformLocation(program, 'u_spotDir');
const uCutoffLoc = gl.getUniformLocation(program, 'u_cutoff');

// ......
```

我们可以看出这些代码大量的重复，这显得十分的啰嗦！

## 辅助函数

那么有没有一种办法可以简化这些代码呢？答案是肯定的！我们可以自己编写一些辅助函数来帮助我们来处理这些向 WebGL 传递值的工作，而我们只是需要提供一些必要的信息即可。

当然，我们现在编写的这一套”框架“需要建立在一些假设之上：

1. 一个`attribute`变量就对应了一个 `WebGLBuffer`，我们不采用一个`WebGLBuffer`对应多个`attribute`变量的做法
2. 似乎暂时没有别的约束了。

那我们要产出的辅助函数最终是一个什么东西呢？

我们希望可以通过某种 API，假设我们创建一个`setAttribute` 的 API，我们可以通过调用它来设置好所有的 `attribute`变量的数据。类似的，我们也希望创建类似于`setUniforms`这类的 API 来帮助我们设置好所有的 `uniform` 变量。

那么这两个 API 的参数又该如何设计？设计方法有很多。这里介绍一下作者的思路：

1. 首先，参数中必须要包含 `attribute`/`uniform` 变量真正的值！
2. 要往 WebGL 中传递数据的话，我们必须知道 `attribute`/`uniform` 变量在 Shader 中的位置(Location)。
3. 如何设置值同样也是需要我们考虑的部分，比如对于`attribute`变量来说，它是 3 维还是 4 维向量都需要显示的说明；对于`uniform`变量来说，设置`vec`和 `matrix`的值所对应的 API 都是不同的。
4. 值与 location 还需要一一对应起来，这里我们采用相同的 key 来使值与 location 之间发生联系。

我们先来看 `uniform` 变量。

### 给 Uniform 变量设置值

按上面的思考方式，我们设计`setUniforms`这个 API，首先，我们需要接受真正的 `uniform`值，所以其中一个参数必然是包含了所有的`uniform`变量的值。

另外，还需要知道对于不同的 `uniform`值，我们怎样去设置它。

我们将入参设计为：

```ts
setUniform(setters: Record<string, (v: any) => void>, uniformValues: Record<string, any>)
```

`setters`表示对于每一个 `uniform` 变量，如何设置其值。`setters` 和 `uniformValues`中的 key 应该是一一对应的。具体的函数实现如下：

```ts
function setUniform(
    setters: Record<string, (v: any) => void>,
    uniformValues: Record<string, any>
): void {
    const keys = Object.keys(uniforms);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const v = uniforms[key];

        const setter = uniformSetters[key];
        setter && setter(v);
    }
}
```

在上面的函数中，`uniformValues`应该是由开发者确定的，而`setters`可能是通过调用另一个 API 生成的中间产物。比如这个 API 叫做 `createUniformSetters`。

回顾一下如何给 `uniform`变量传递值，首先我们需要知道它在 shader 中的 location，也就是通过 `gl.getUniformLocation` 这个 API。然后再通过 `gl.uniform1f`, `gl.uniform2fv`等等 API 往其中传递值。所以在创建 `setter`时，我们需要知道 shader 中有哪些`uniform`变量，以及如何往其中传递值。所以我们需要所有 `uniform`变量的名字和类型。

我们大概率会写下这样的代码：

```ts
function createUniformSetters(
    program: WebGLProgram,
    uniforms: {
        name: string;
        type: string;
    }[]
): Record<string, (v: any) => void> {
    for (let i = 0; i < uniforms.length; i++) {
        const uniform = uniforms[i];
        const location = gl.getUniformLocation(program, uniform.name);
        if (uniform.type === 'FLOAT') {
            return function (v: number) {
                gl.uniform1f(location, v);
            };
        } else if (uniform.type === 'FLOAT_2f') {
            // ......
        }
        // ......
    }
}
```

上面的代码似乎是没有什么问题，但是我们需要显示往函数中传递 shader 中用到的所有`uniform`变量。有没有一种办法可以不用这样做呢？

幸运的是，WebGL 为我们提供了一个 API 可以获取到当前 shader 程序中使用的 `uniform`变量和 `attribute` 变量，这个 API 就是：

-   获取所有的 `uniform`变量：`gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)`

-   获取所有的 `attribute`变量：`gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);`

这样，我们就不用手动的枚举所有的 `uniform`和`attribute`变量了。

完善一下上面的代码，可以写作：

```ts
type UniformSetters = Record<string, (v: any) => void>;
export function createUniformSetters(
    gl: RenderContext,
    program: WebGLProgram
): UniformSetters {
    let textUnit = 0;
    const createUniformSetter = (
        program: WebGLProgram,
        uniformInfo: {
            name: string;
            type: number;
        }
    ): ((v: any) => void) => {
        const location = gl.getUniformLocation(program, uniformInfo.name);
        const type = uniformInfo.type;
        if (type === gl.FLOAT) {
            return function (v: number) {
                gl.uniform1f(location, v);
            };
        } else if (type === gl.FLOAT_VEC2) {
            return function (v: number[]) {
                gl.uniform2fv(location, v);
            };
        } else if (type === gl.FLOAT_VEC3) {
            return function (v: number[]) {
                gl.uniform3fv(location, v);
            };
        } else if (type === gl.FLOAT_VEC4) {
            return function (v: number[]) {
                gl.uniform4fv(location, v);
            };
        } else if (type === gl.FLOAT_MAT2) {
            return function (v: number[]) {
                gl.uniformMatrix2fv(location, false, v);
            };
        } else if (type === gl.FLOAT_MAT3) {
            return function (v: number[]) {
                gl.uniformMatrix3fv(location, false, v);
            };
        } else if (type === gl.FLOAT_MAT4) {
            return function (v: number[]) {
                gl.uniformMatrix4fv(location, false, v);
            };
        } else if (type === gl.SAMPLER_2D) {
            const currentTexUnit = textUnit;
            ++textUnit;
            return function (v: WebGLTexture) {
                gl.uniform1i(location, currentTexUnit);
                gl.activeTexture(gl.TEXTURE0 + currentTexUnit);
                gl.bindTexture(gl.TEXTURE_2D, v);
            };
        }
        return function () {
            throw new Error('cannot find corresponding type of value.');
        };
    };

    const uniformsSetters: UniformSetters = {};
    const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < numUniforms; i++) {
        const uniformInfo = gl.getActiveUniform(program, i);
        if (!uniformInfo) {
            break;
        }
        let name = uniformInfo.name;
        if (name.substr(-3) === '[0]') {
            name = name.substr(0, name.length - 3);
        }
        uniformsSetters[uniformInfo.name] = createUniformSetter(
            program,
            uniformInfo
        );
    }
    return uniformsSetters;
}
```

这样我们要想往 shader 中传入 uniform 值就非常的方便了。我们在初始化程序时，就可以通过 `createUniformSetters`来创建 setter，最后再使用 `setUniform(setter, values)`API 真正的传入我们需要的值即可。

### 给 Attribute 变量设置值。

上面我们完成了给`uniform`变量设置值的辅助函数的编写，对于 `attribute`变量的设置也是类似的。只是不同的是他们彼此的传值方式不同，因为`attribute`变量的值是从 `WebGLBuffer`中读取的，不能够通过 `gl.uniform1f`这类 API 直接往其中传入。

我们再次回顾一下如何给`attribute`变量传值。

1. 创建 `WebGLBuffer`: `const buffer = gl.createBuffer();`
2. 绑定 Buffer: `gl.bindBuffer(gl.ARRAY_BUFFER, buffer);`
3. 往 Buffer 中传入数据： `gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointPos), gl.STATIC_DRAW);`
4. 获取 `attribute` 变量在 shader 中的位置：`const a_position = gl.getAttribLocation(program, 'a_position');`
5. 启用这个`attribute`变量：`gl.enableVertexAttribArray(a_position);`
6. 告诉 WebGL 如何从`WebGL`读取数据来给`attribute`变量设置值：`gl.vertexAttribPointer(
    a_position,
    3,
    gl.FLOAT,
    false,
    Float32Array.BYTES_PER_ELEMENT * 3,
    0
);`

其中 1~3 步是在创建`WebGLBuffer`并填充数据，4~6 步则是在告诉 WebGL 如何读取数据。所以我们提供的值不是简单的 JS 对象了。而是需要真正的 `WebGLBuffer`。

但是除此之外，其他的部分与 `uniformSetter` 并无太大的区别。这里为了防止啰嗦，直接给出源代码，请读者自行体会。

```ts
type BufferInfo = {
    name: string;
    buffer: WebGLBuffer;
    numComponents: number;
    isIndices?: boolean;
};
export function createBufferInfoFromArrays(
    gl: RenderContext,
    arrays: {
        name: string;
        numComponents: number;
        data: number[];
        isIndices?: boolean;
    }[]
): BufferInfo[] {
    const result: BufferInfo[] = [];

    for (let i = 0; i < arrays.length; i++) {
        const buffer = gl.createBuffer();
        if (!buffer) {
            continue;
        }
        result.push({
            name: arrays[i].name,
            buffer: buffer,
            numComponents: arrays[i].numComponents,
            isIndices: arrays[i].isIndices,
        });
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(arrays[i].data),
            gl.STATIC_DRAW
        );
    }
    return result;
}

type AttributeSetters = Record<string, (bufferInfo: BufferInfo) => void>;
export function createAttributeSetter(
    gl: RenderContext,
    program: WebGLProgram
): AttributeSetters {
    const createAttribSetter = (index: number) => {
        return function (b: BufferInfo) {
            if (!b.isIndices) {
                gl.bindBuffer(gl.ARRAY_BUFFER, b.buffer);
                gl.enableVertexAttribArray(index);
                gl.vertexAttribPointer(
                    index,
                    b.numComponents,
                    gl.FLOAT,
                    false,
                    0,
                    0
                );
            }
        };
    };
    const attribSetter: AttributeSetters = {};
    const numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < numAttribs; i++) {
        const attribInfo = gl.getActiveAttrib(program, i);
        if (!attribInfo) {
            break;
        }
        const index = gl.getAttribLocation(program, attribInfo.name);
        attribSetter[attribInfo.name] = createAttribSetter(index);
    }
    return attribSetter;
}
```

## 优化代码

我们现在就可以用刚刚编写的辅助函数来优化上一节中的代码了。具体完整的代码请见文末。后续我们将继续学习关于 WebGL 和图形学的内容。敬请期待！

<QRCode/>

<WebGLLessCode/>
:::code-group

<<< @/scripts/webgl/13-lessCode.ts#snippet [index.ts]

<<< @/../submodule/renderer/util.ts#lesscode [util.ts]
<<< @/../submodule/renderer/shader/11-light-vert.glsl [vert.glsl]
<<< @/../submodule/renderer/shader/12-spotLight-frag.glsl [frag.glsl]
:::
