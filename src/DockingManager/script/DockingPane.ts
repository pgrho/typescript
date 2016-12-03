module dock {
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
        private _tabsHost: HTMLDivElement;
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

            this._tabsHost = document.createElement("div");
            makeAbsolute(this._tabsHost);

            if (this._dock != PaneDock.Fill) {
                this._grip = document.createElement("div");
                this._grip.className = s.gripClassName;
                makeAbsolute(this._grip);
            }

            var fi = this._containers[0] || <DockingContainer><any>{};
            var th = s.tabHeight;
            var w = fi.initialWidth > 0 ? fi.initialWidth : s.defaultPaneWidth;
            var h = fi.initialHeight > 0 ? fi.initialHeight : s.defaultPaneHeight;
            var gw = s.gripWidth;



            switch (this.dock) {
                case PaneDock.Left:
                    setPosition(this._element, 0, null, context.top, context.bottom, w + gw);
                    if (this._containers.length > 1) {
                        setPosition(this._containersHost, 0, gw, 0, th);
                        setPosition(this._tabsHost, 0, gw, null, 0, null, th);
                        this._tabsHost.classList.add(s.bottomTabListClassName);
                    } else {
                        setPosition(this._containersHost, 0, gw, 0, 0);
                        this._tabsHost.style.display = "none";
                    }
                    setPosition(this._grip, null, 0, 0, 0, gw);
                    this._grip.classList.add(s.verticalGripClassName);
                    context.left = w + gw;
                    break;
                case PaneDock.Right:
                    setPosition(this._element, null, 0, context.top, context.bottom, w + gw);
                    if (this._containers.length > 1) {
                        setPosition(this._containersHost, gw, 0, 0, th);
                        setPosition(this._tabsHost, gw, 0, null, 0, null, th);
                        this._tabsHost.classList.add(s.bottomTabListClassName);
                    } else {
                        setPosition(this._containersHost, gw, 0, 0, 0);
                        this._tabsHost.style.display = "none";
                    }
                    setPosition(this._grip, 0, null, 0, 0, gw);
                    this._grip.classList.add(s.verticalGripClassName);
                    context.right = w + gw;
                    break;
                case PaneDock.Top:
                    setPosition(this._element, context.left, context.right, 0, null, null, h + gw);
                    if (this._containers.length > 1) {
                        setPosition(this._containersHost, 0, 0, th, gw);
                        setPosition(this._tabsHost, 0, 0, 0, null, null, th);
                        this._tabsHost.classList.add(s.topTabListClassName);
                    } else {
                        setPosition(this._containersHost, 0, 0, 0, gw);
                        this._tabsHost.style.display = "none";
                    }
                    setPosition(this._grip, 0, 0, null, 0, null, gw);
                    this._grip.classList.add(s.horizontalGripClassName);
                    context.top = h + gw;
                    break;
                case PaneDock.Bottom:
                    setPosition(this._element, context.left, context.right, null, 0, null, h + gw);
                    if (this._containers.length > 1) {
                        setPosition(this._containersHost, 0, 0, gw, th);
                        setPosition(this._tabsHost, 0, 0, null, 0, null, th);
                        this._tabsHost.classList.add(s.bottomTabListClassName);
                    } else {
                        setPosition(this._containersHost, 0, 0, gw, 0);
                        this._tabsHost.style.display = "none";
                    }
                    setPosition(this._grip, 0, 0, 0, null, null, gw);
                    this._grip.classList.add(s.horizontalGripClassName);
                    context.bottom = h + gw;
                    break;

                case PaneDock.Fill:
                default:
                    setPosition(this._element, context.left, context.right, context.top, context.bottom);
                    if (this._containers.length > 1) {
                        setPosition(this._containersHost, 0, 0, th, 0);
                        setPosition(this._tabsHost, 0, 0, 0, null, null, th);
                        this._tabsHost.classList.add(s.topTabListClassName);
                    } else {
                        setPosition(this._containersHost, 0, 0, 0, 0);
                        this._tabsHost.style.display = "none";
                    }
                    break;
            }

            for (var i = 0; i < this._containers.length; i++) {
                var c = this._containers[i];
                c.init();

                this._containersHost.appendChild(c.element);
                this._tabsHost.appendChild(c.tabElement);
            }

            this._element.appendChild(this._containersHost);
            this._element.appendChild(this._tabsHost);
            if (this._grip) {
                this._element.appendChild(this._grip);
            }
            this.parent.element.appendChild(this._element);
        }
    }
}