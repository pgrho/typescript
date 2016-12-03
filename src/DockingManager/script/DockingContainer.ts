module dock {
    export class DockingContainer {
        public pane: DockingPane;
        private _element: HTMLElement;
        private _tabElement: HTMLElement;
        private _title: string;

        constructor(element: HTMLElement) {
            this._element = element;
        }

        public get element(): HTMLElement {
            return this._element;
        }

        public get tabElement(): HTMLElement {
            return this._tabElement;
        }

        public get initialWidth(): number {
            var v = parseFloat(this._element.getAttribute("data-dock-width"));
            return v > 0 ? v : undefined;
        }
        public get initialHeight(): number {
            var v = parseFloat(this._element.getAttribute("data-dock-height"));
            return v > 0 ? v : undefined;
        }

        public get title() {
            return this._title;
        }

        public init() {
            var s = this.pane.parent.settings;
            this._element.remove();
            this._title = this.element.getAttribute("data-dock-title") || this._element.id;
            this._tabElement = document.createElement("div");
            this._tabElement.appendChild(document.createTextNode(this._title));
            this._tabElement.style.cssFloat = "left";
            this._tabElement.style.height = "100%";
            this._tabElement.style.boxSizing = "border-box";
            this._tabElement.className = s.tabClassName;
        }
    }
}