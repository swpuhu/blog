<template>
    <div class="label">
        {{ label ? label : '' }}
    </div>
    <div class="flex">
        <div class="slide-bar">
            <div
                :style="{ left: `${posX}%` }"
                class="slide"
                @touchstart="onTouchStart"
                @mousedown="onTouchStart"
            ></div>
            <div class="bar" ref="bar"></div>
        </div>
        <div class="value-text">{{ currentVal }}</div>
    </div>
</template>

<script>
export default {
    emits: ['value-change'],
    props: {
        min: Number,
        max: Number,
        val: Number,
        label: String,
    },
    data() {
        return {
            isMouse: true,
            currentVal: this.val,
        };
    },
    computed: {
        posX() {
            return (this.currentVal / (this.max - this.min)) * 100;
        },
    },
    methods: {
        onTouchStart(event) {
            this.startVal = this.currentVal;
            const bar = this.$refs.bar;
            this.barWidth = bar.clientWidth;
            console.log('barWidth: ', this.barWidth);
            this.startPos = {};
            if (event instanceof MouseEvent) {
                this.isMouse = true;
                this.startPos = {
                    x: event.clientX,
                    y: event.clientY,
                };
            } else {
                this.isMouse = false;
            }
            if (this.isMouse) {
                document.addEventListener('mousemove', this.onMove);
                document.addEventListener('mouseup', this.onUp);
            } else {
                document.addEventListener('touchmove', this.onMove);
                document.addEventListener('touchend', this.onUp);
            }
        },
        onMove(event) {
            if (event instanceof MouseEvent) {
                const offset = {
                    x: event.clientX - this.startPos.x,
                    y: event.clientY - this.startPos.y,
                };
                const valueRange = this.max - this.min;
                const initProportion = this.startVal / valueRange;
                let proportion = initProportion + offset.x / this.barWidth;

                proportion = Math.min(Math.max(0, proportion), 1);
                this.currentVal = Math.round(proportion * valueRange);
                this.$emit('value-change', this.currentVal);
            } else if (event instanceof TouchEvent) {
            }
        },
        onUp(event) {
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
.label {
    width: 50px;
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
    background-color: rgb(218, 232, 232);
    border: 2px solid #ccc;
    transform: translate(-50%, -50%);
    z-index: 1;
}

.bar {
    transform: translate(0, -50%);
    height: 4px;
    background-color: azure;
    border-radius: 2px;
}
</style>
