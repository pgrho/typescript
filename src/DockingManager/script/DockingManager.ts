module dock {
    export interface DockingManagerSettings {
        backgroungClassName?: string;

        defaultPaneWidth?: number;
        defaultPaneHeight?: number;

        tabClassName?: string;
        leftTabListClassName?: string;
        rightTabListClassName?: string;
        topTabListClassName?: string;
        bottomTabListClassName?: string;
        tabHeight?: number;

        gripClassName?: string;
        verticalGripClassName?: string;
        horizontalGripClassName?: string;
        gripWidth?: number;
    }

    export interface DockingPaneHost {
        element: Element;
        settings: DockingManagerSettings;
    }

    export class DockingManager implements DockingPaneHost, DockingManagerSettings {
        private _element: Element;
        private _panes: DockingPane[];

        public backgroungClassName: string;

        public defaultPaneWidth: number;
        public defaultPaneHeight: number;

        public tabHeight: number;
        public tabClassName: string;
        public leftTabListClassName: string;
        public rightTabListClassName: string;
        public topTabListClassName: string;
        public bottomTabListClassName: string;

        public gripClassName: string;
        public verticalGripClassName: string;
        public horizontalGripClassName: string;
        public gripWidth: number;

        constructor(element: string, settings?: DockingManagerSettings)
        constructor(element: Element, settings?: DockingManagerSettings)
        constructor(element: any, settings?: DockingManagerSettings) {
            this._element = (<Element>element).innerHTML !== undefined ? element : document.querySelector(element);
            this._panes = [];
            var s = settings || {};

            this.backgroungClassName = s.backgroungClassName || "docking-manager-background";

            this.defaultPaneWidth = s.defaultPaneWidth > 0 ? s.defaultPaneWidth : 200;
            this.defaultPaneHeight = s.defaultPaneHeight > 0 ? s.defaultPaneHeight : 100;

            this.tabClassName = s.tabClassName || "docking-tab";
            this.leftTabListClassName = s.leftTabListClassName || "docking-tab-list-left";
            this.rightTabListClassName = s.rightTabListClassName || "docking-tab-list-right";
            this.topTabListClassName = s.topTabListClassName || "docking-tab-list-top";
            this.bottomTabListClassName = s.bottomTabListClassName || "docking-tab-list-bottom";
            this.tabHeight = s.tabHeight > 0 ? s.tabHeight : 24;

            this.gripClassName = s.gripClassName || "docking-grip";
            this.verticalGripClassName = s.verticalGripClassName || "docking-grip-vertical";
            this.horizontalGripClassName = s.horizontalGripClassName || "docking-grip-horizontal";
            this.gripWidth = s.gripWidth > 0 ? s.gripWidth : 4;
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
                var item = <HTMLElement>this._element.children[i];
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

    export function makeAbsolute(element: HTMLElement) {
        element.style.display = "block";
        element.style.position = "absolute";
        element.style.margin = "0";
        element.style.boxSizing = "border-box";
    }

    export function setPosition(element: HTMLElement, left?: number, right?: number, top?: number, bottom?: number, width?: number, height?: number) {
        element.style.left = left === 0 ? '0' : left == null ? null : (left.toString() + 'px');
        element.style.right = right === 0 ? '0' : right == null ? null : (right.toString() + 'px');
        element.style.top = top === 0 ? '0' : top == null ? null : (top.toString() + 'px');
        element.style.bottom = bottom === 0 ? '0' : bottom == null ? null : (bottom.toString() + 'px');
        element.style.width = width === 0 ? '0' : width == null ? null : (width.toString() + 'px');
        element.style.height = height === 0 ? '0' : height == null ? null : (height.toString() + 'px');
    }
}