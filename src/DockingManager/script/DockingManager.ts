module dock {

    export interface DockingManagerSettings {
        backgroungClassName?: string;
        gripClassName?: string;
        verticalGripClassName?: string;
        horizontalGripClassName?: string;
    }

    export interface DockingPaneHost {
        element: Element;
        settings: DockingManagerSettings;
    }

    export class DockingManager implements DockingPaneHost, DockingManagerSettings {

        private _element: Element;
        private _panes: DockingPane[];

        public backgroungClassName: string;
        public gripClassName: string;
        public verticalGripClassName: string;
        public horizontalGripClassName: string;


        constructor(element: string, settings?: DockingManagerSettings)
        constructor(element: Element, settings?: DockingManagerSettings)
        constructor(element: any, settings?: DockingManagerSettings) {

            this._element = (<Element>element).innerHTML !== undefined ? element : document.querySelector(element);
            this._panes = [];
            var s = settings || {};

            this.backgroungClassName = s.backgroungClassName || "docking-manager-background";

            this.gripClassName = s.gripClassName || "docking-grip";
            this.verticalGripClassName = s.verticalGripClassName || "docking-grip-vertical";
            this.horizontalGripClassName = s.horizontalGripClassName || "docking-grip-horizontal";
        }

        public get element(): Element {
            return this._element;
        }

        public get settings(): DockingManagerSettings {
            return this;
        }

        public init() {
            this._element.classList.add(this.backgroungClassName);

            var pane: DockingPane;

            for (var i = 0; i < this._element.children.length; i++) {
                var item = this._element.children[i];
                var path = item.getAttribute("data-dock-path");
                if (!path) {
                    (pane || this.getOrCreatePane(PaneDock.Fill)).addContainer(new DockingContainer(item));
                } else {
                    var dir: PaneDock;
                    if (/^\s*left\s*$/i.test(path)) {
                        dir = PaneDock.Left;
                    } else if (/^\s*right\s*$/i.test(path)) {
                        dir = PaneDock.Right;
                    } else if (/^\s*top\s*$/i.test(path)) {
                        dir = PaneDock.Top;
                    } else if (/^\s*bottom\s*$/i.test(path)) {
                        dir = PaneDock.Bottom;
                    } else {
                        dir = PaneDock.Fill;
                    }

                    this.getOrCreatePane(dir).addContainer(new DockingContainer(item));
                }
            }

            var ctx = new DockingPaneInitializingContext();

            for (var i = 0; i < this._panes.length; i++) {
                this._panes[i].init(ctx);
            }
        }

        public getOrCreatePane(dock: PaneDock) {
            var pane = this._panes.filter(p => p.dock === dock)[0];
            if (pane) {
                return pane;
            }
            var last = this._panes[this._panes.length - 1];
            if (last && last.dock === PaneDock.Fill) {
                this._panes.pop();
            }

            pane = new DockingPane(dock);
            pane.parent = this;

            this._panes.push(pane);

            if (last && last.dock === PaneDock.Fill) {
                this._panes.push(last);
            }

            return pane;
        }
    }

    export enum PaneDock {
        Fill,
        Left,
        Right,
        Top,
        Bottom,
    }

    export class DockingPaneInitializingContext {
        public left: number;
        public right: number;
        public top: number;
        public bottom: number;

        constructor() {
            this.left = this.right = this.top = this.bottom = 0;
        }
    }

    export class DockingPane {

        private _dock: PaneDock;
        private _containers: DockingContainer[];

        public parent: DockingPaneHost;

        private _element: HTMLDivElement;
        private _containersHost: HTMLDivElement;
        private _grip: HTMLDivElement;

        constructor(dock: PaneDock) {
            this._dock = dock || PaneDock.Fill;
            this._containers = [];
        }

        public get dock() {
            return this._dock;
        }

        public addContainer(container: DockingContainer) {
            if (container.pane) {
                throw "Container is already attached";
            }
            container.pane = this;
            this._containers.push(container);
        }
        public init(context: DockingPaneInitializingContext) {

            var s = this.parent.settings;

            this._element = document.createElement("div");
            makeAbsolute(this._element);

            this._containersHost = document.createElement("div");
            makeAbsolute(this._containersHost);

            if (this._dock != PaneDock.Fill) {
                this._grip = document.createElement("div");
                this._grip.className = s.gripClassName;
                makeAbsolute(this._grip);
            }

            switch (this.dock) {
                case PaneDock.Left:
                    setPosition(this._element, 0, null, context.top, context.bottom, 36);
                    setPosition(this._containersHost, 0, 4, 0, 0);
                    setPosition(this._grip, null, 0, 0, 0, 4);
                    this._grip.classList.add(s.verticalGripClassName);
                    context.left = 36;
                    break;
                case PaneDock.Right:
                    setPosition(this._element, null, 0, context.top, context.bottom, 36);
                    setPosition(this._containersHost, 4, 0, 0, 0);
                    setPosition(this._grip, 0, null, 0, 0, 4);
                    this._grip.classList.add(s.verticalGripClassName);
                    context.right = 36;
                    break;
                case PaneDock.Top:
                    setPosition(this._element, context.left, context.right, 0, null, null, 36);
                    setPosition(this._containersHost, 0, 0, 0, 4);
                    setPosition(this._grip, 0, 0, null, 0, null, 4);
                    this._grip.classList.add(s.horizontalGripClassName);
                    context.top = 36;
                    break;
                case PaneDock.Bottom:
                    setPosition(this._element, context.left, context.right, null, 0, null, 36);
                    setPosition(this._containersHost, 0, 0, 4, 0);
                    setPosition(this._grip, 0, 0, 0, null, null, 4);
                    this._grip.classList.add(s.horizontalGripClassName);
                    context.bottom = 36;
                    break;

                case PaneDock.Fill:
                default:
                    setPosition(this._element, context.left, context.right, context.top, context.bottom);
                    setPosition(this._containersHost, 0, 0, 0, 0);
                    break;
            }
            this._element.appendChild(this._containersHost);
            if (this._grip) {
                this._element.appendChild(this._grip);
            }
            this.parent.element.appendChild(this._element);
        }
    }

    export class DockingContainer {

        public pane: DockingPane;
        private _element: Element;

        constructor(element: Element) {
            this._element = element;
        }
    }

    function makeAbsolute(element: HTMLElement) {
        element.style.display = "block";
        element.style.position = "absolute";
        element.style.margin = "0";
        element.style.boxSizing = "border-box";
    }

    function setPosition(element: HTMLElement, left?: number, right?: number, top?: number, bottom?: number, width?: number, height?: number) {
        element.style.left = left === 0 ? '0' : left == null ? null : (left.toString() + 'px');
        element.style.right = right === 0 ? '0' : right == null ? null : (right.toString() + 'px');
        element.style.top = top === 0 ? '0' : top == null ? null : (top.toString() + 'px');
        element.style.bottom = bottom === 0 ? '0' : bottom == null ? null : (bottom.toString() + 'px');
        element.style.width = width === 0 ? '0' : width == null ? null : (width.toString() + 'px');
        element.style.height = height === 0 ? '0' : height == null ? null : (height.toString() + 'px');
    }
}