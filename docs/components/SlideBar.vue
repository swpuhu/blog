<template>
    <div class="label">
        {{ label ? label : '' }}
    </div>
    <div class="flex slide-container">
        <div class="slide-bar">
            <div
                :style="{ left: `${posX}%` }"
                class="slide"
                @touchstart="onTouchStart"
                @mousedown="onTouchStart"
            ></div>
            <div class="bar" ref="bar"></div>
        </div>
        <div class="value-text">{{ currentVal.toFixed(fractionNum) }}</div>
    </div>
</template>

<script lang="ts">
let startVal = 0;
let barWidth = 0;
let startPos: { x: number; y: number } = {
    x: 0,
    y: 0,
};
export default {
    emits: ['value-change'],
    props: {
        min: {
            type: Number,
            default: 0,
        },
        max: {
            type: Number,
            default: 0,
        },
        val: {
            default: 0,
            type: Number,
        },
        label: String,
        step: Number,
        fractionNum: Number,
    },
    data() {
        return {
            isMouse: true,
            currentVal: this.val,
        };
    },
    computed: {
        posX() {
            return ((this.currentVal - this.min) / (this.max - this.min)) * 100;
        },
    },
    methods: {
        onTouchStart(event: TouchEvent | MouseEvent) {
            event.preventDefault();
            event.stopPropagation();
            startVal = this.currentVal;
            const bar = this.$refs.bar as HTMLElement;
            barWidth = bar.clientWidth;
            // console.log('barWidth: ', this.barWidth);
            if (event instanceof MouseEvent) {
                this.isMouse = true;
                startPos = {
                    x: event.clientX,
                    y: event.clientY,
                };
            } else if (event instanceof TouchEvent) {
                this.isMouse = false;
                startPos = {
                    x: event.touches[0].clientX,
                    y: event.touches[0].clientY,
                };
            }
            if (this.isMouse) {
                document.addEventListener('mousemove', this.onMove);
                document.addEventListener('mouseup', this.onUp);
            } else {
                document.addEventListener('touchmove', this.onMove, {
                    passive: false,
                });
                document.addEventListener('touchend', this.onUp, {
                    passive: false,
                });
            }
        },
        onMove(event: MouseEvent | TouchEvent) {
            event.preventDefault();
            event.stopPropagation();
            let offset: { x: number; y: number } = { x: 0, y: 0 };
            if (event instanceof MouseEvent) {
                offset = {
                    x: event.clientX - startPos.x,
                    y: event.clientY - startPos.y,
                };
            } else if (event instanceof TouchEvent) {
                offset = {
                    x: event.touches[0].clientX - startPos.x,
                    y: event.touches[0].clientY - startPos.y,
                };
            }
            const valueRange = this.max - this.min;
            const initProportion = (startVal - this.min) / valueRange;
            let proportion = initProportion + offset.x / barWidth;

            proportion = Math.min(Math.max(0, proportion), 1);
            const step = this.step ? this.step : 0.1;
            this.currentVal = proportion * valueRange + this.min;
            let times = Math.floor(this.currentVal / step);
            const mod = this.currentVal - times * step;
            if (mod > step / 2) {
                times += 1;
            }
            this.currentVal = step * times;
            const fractionDigit = this.fractionNum ? 10 ** this.fractionNum : 1;
            this.currentVal =
                Math.round(this.currentVal * fractionDigit) / fractionDigit;
            this.$emit('value-change', this.currentVal);
        },
        onUp(event: MouseEvent | TouchEvent) {
            event.preventDefault();
            event.stopPropagation();
            this.removeDocumentEvents();
        },
        removeDocumentEvents() {
            if (this.isMouse) {
                document.removeEventListener('mousemove', this.onMove);
                document.removeEventListener('mouseup', this.onUp);
            } else {
                document.removeEventListener('touchmove', this.onMove);
                document.removeEventListener('touchend', this.onUp);
            }
        },
    },
    mounted() {
        this.$emit('value-change', this.currentVal);
    },
    beforeMount() {},
    unmounted() {
        this.removeDocumentEvents();
    },
};
</script>

<style scoped>
.flex {
    display: flex;
    align-items: center;
}

.slide-container {
    flex: 1;
    margin: 0 10px;
}
.label {
    min-width: 50px;
    max-width: 100%;
}
.value-text {
    margin: 0 5px;
    width: 30px;
}
.slide-bar {
    width: 100%;
    position: relative;
}

.slide {
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: var(--vp-button-brand-bg);
    border: 2px solid var(--vp-button-brand-border);
    transform: translate(-50%, -50%);
    z-index: 1;
}

.bar {
    transform: translate(0, -50%);
    height: 4px;
    background-color: var(--vp-button-brand-bg);
    border-radius: 2px;
}
</style>
