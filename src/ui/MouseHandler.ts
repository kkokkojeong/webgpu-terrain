type Analog = {
    x: number;
    y: number;
    zoom?: number;
}

class MouseHandler {

    private _element: HTMLElement;

    private _mouseDown: boolean = false;

    private _analog: Analog = {x: 0, y: 0, zoom: 0};

    get element() {
        return this._element;
    }
    set element(el: HTMLElement) {
        this._element = el;
    }

    constructor(el: HTMLElement) {
        this.element = el;

        this._addDefaultHandlers();
    }

    private _addDefaultHandlers() {
        const el = this.element;

        el.addEventListener('mousedown', () => {
            this._mouseDown = true;
        });
        el.addEventListener('mouseup', () => {
            this._mouseDown = false;
        });
        el.addEventListener('mousemove', (e) => {
            this._mouseDown = (e.buttons & 1) !== 0;
            if (!this._mouseDown) {
                return;
            }

            this._analog.x += e.movementX;
            this._analog.y += e.movementY; 
        });
    }

    private _removeDefaultHandlers() {
        // todo...
    }
}

export default MouseHandler;