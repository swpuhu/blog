export class Geometry {
    static getPlane(): Geometry {
        // prettier-ignore
        const vertPos = [
            -1, -1, 0,
            1, -1, 0,
            1, 1, 0,
            -1, 1, 0
        ]
        const uvPos = [0, 0, 1, 0, 1, 1, 0, 1];
        const indices = [0, 1, 2, 2, 3, 0];
        return new Geometry(
            new Float32Array(vertPos),
            new Float32Array(uvPos),
            new Uint16Array(indices),
            Uint16Array.BYTES_PER_ELEMENT
        );
    }

    private posBuffer: PossibleNullObject<WebGLBuffer> = null;
    private uvBuffer: PossibleNullObject<WebGLBuffer> = null;
    private indicesBuffer: PossibleNullObject<WebGLBuffer> = null;
    public drawCount: number = 0;
    private posData: PossibleNullObject<ArrayBufferView> = null;
    private uvData: PossibleNullObject<ArrayBufferView> = null;
    private indicesData: PossibleNullObject<ArrayBufferView> = null;
    private posDataSettled = false;
    private uvDataSettled = false;
    private indicesDataSettled = false;
    private perByteLength: number = 1;
    constructor(
        posData?: ArrayBufferView,
        uvData?: ArrayBufferView,
        indicesData?: ArrayBufferView,
        perByteLength?: number,
        protected isDynamic = false
    ) {
        if (posData) {
            this.posData = posData;
        }
        if (uvData) {
            this.uvData = uvData;
        }
        if (indicesData) {
            this.indicesData = indicesData;
        }
        if (perByteLength) {
            this.perByteLength = perByteLength;
        }
    }

    public setPositionBufferData(
        gl: RenderContext,
        data?: ArrayBufferView
    ): void {
        if (this.posDataSettled && !this.isDynamic) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
            return;
        }
        if (!this.posBuffer) {
            this.posBuffer = gl.createBuffer();
        }
        if (data) {
            this.posData = data;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            this.posData,
            this.isDynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW
        );
        this.posDataSettled = true;
    }
    public setUVBufferData(gl: RenderContext, data?: ArrayBufferView): void {
        if (this.uvDataSettled && !this.isDynamic) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
            return;
        }
        if (!this.uvBuffer) {
            this.uvBuffer = gl.createBuffer();
        }
        if (data) {
            this.uvData = data;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            this.uvData,
            this.isDynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW
        );
        this.uvDataSettled = true;
    }
    public setIndicesBufferData(
        gl: RenderContext,
        data?: ArrayBufferView,
        perByteLength?: number
    ): void {
        if (this.indicesDataSettled) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
            return;
        }
        if (!data && !this.indicesData) {
            return;
        }
        if (!this.indicesBuffer) {
            this.indicesBuffer = gl.createBuffer();
        }
        if (data) {
            this.indicesData = data;
        }
        if (perByteLength) {
            this.perByteLength = perByteLength;
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            this.indicesData,
            this.isDynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW
        );
        this.drawCount = this.indicesData!.byteLength / this.perByteLength;
        this.indicesDataSettled = true;
    }
}
