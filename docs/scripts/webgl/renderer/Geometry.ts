export class Geometry {
    private posBuffer: PossibleNullObject<WebGLBuffer> = null;
    private uvBuffer: PossibleNullObject<WebGLBuffer> = null;
    private indicesBuffer: PossibleNullObject<WebGLBuffer> = null;
    private drawCount: number = 0;
    private posData: PossibleNullObject<ArrayBufferView> = null;
    private uvData: PossibleNullObject<ArrayBufferView> = null;
    private indicesData: PossibleNullObject<ArrayBufferView> = null;
    constructor(protected isDynamic = false) {}

    public setPositionBufferData(
        gl: RenderContext,
        data: ArrayBufferView
    ): void {
        if (this.posData && !this.isDynamic) {
            return;
        }
        if (!this.posBuffer) {
            this.posBuffer = gl.createBuffer();
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            data,
            this.isDynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW
        );
        this.posData = data;
    }
    public setUVBufferData(
        gl: RenderContext,
        data: ArrayBufferView,
        isDynamic: boolean
    ): void {
        if (this.uvData && !this.isDynamic) {
            return;
        }
        if (!this.uvBuffer) {
            this.uvBuffer = gl.createBuffer();
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            data,
            isDynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW
        );
        this.uvData = data;
    }
    public setIndicesBufferData(
        gl: RenderContext,
        data: ArrayBufferView,
        isDynamic: boolean
    ): void {
        if (this.indicesData) {
            return;
        }
        if (!this.indicesBuffer) {
            this.indicesBuffer = gl.createBuffer();
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.posBuffer);
        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            data,
            isDynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW
        );
        this.indicesData = data;
    }
}
