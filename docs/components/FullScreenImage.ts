import { clamp } from '../scripts/webgl/util';

export class FullScreenImage {
    static instance: FullScreenImage;
    static getInstance(): FullScreenImage {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new FullScreenImage();
        return this.instance;
    }

    private imgSlot: HTMLImageElement;
    private root: HTMLElement;
    private imgContainer: HTMLElement;
    private scale = 1;
    private constructor() {
        const root = document.createElement('div');
        root.classList.add('modal-root');
        const background = document.createElement('div');
        background.classList.add('modal-background');

        const imgContainer = document.createElement('div');
        imgContainer.classList.add('modal-img-container');

        this.imgSlot = document.createElement('img');
        this.imgSlot.classList.add('modal-img-slot');

        this.imgSlot.onload = () => {
            const naturalWidth = this.imgSlot.naturalWidth;
            const naturalHeight = this.imgSlot.naturalHeight;
            const imgAsp = naturalWidth / naturalHeight;
            if (typeof window === 'undefined') {
                return;
            }
            const windowAsp = window.innerWidth / window.innerHeight;
            const base = 0.8;
            if (windowAsp > imgAsp) {
                // fit height
                let baseSize = base * window.innerHeight;
                if (baseSize > naturalHeight) {
                    baseSize = naturalHeight;
                }
                imgContainer.style.height = baseSize + 'px';
                imgContainer.style.width = baseSize * imgAsp + 'px';
            } else {
                // fit width
                let baseSize = base * window.innerWidth;
                if (baseSize > naturalWidth) {
                    baseSize = naturalWidth;
                }
                imgContainer.style.width = baseSize + 'px';
                imgContainer.style.height = baseSize / imgAsp + 'px';
            }
        };

        root.appendChild(background);
        root.appendChild(imgContainer);
        imgContainer.appendChild(this.imgSlot);

        this.root = root;
        this.imgContainer = imgContainer;
        this.bindEvents();
    }

    private bindEvents(): void {
        this.root.addEventListener('wheel', e => {
            e.preventDefault();
            console.log(e);
            this.scale += 0.01 * e.deltaY;
            this.scale = clamp(this.scale, 1, 3);
            this.imgContainer.style.transform = `translate(-50%, -50%) scale(${this.scale})`;
        });
        this.root.addEventListener('click', e => {
            this.hide();
        });
    }

    public show(src?: string) {
        document.body.appendChild(this.root);

        this.root.style.top = document.scrollingElement?.scrollTop + 'px';
        if (src) {
            this.imgSlot.src = src;
        }
    }

    public hide() {
        this.scale = 1;
        this.imgContainer.style.transform = `translate(-50%, -50%) scale(${this.scale})`;
        this.root.remove();
    }
}
