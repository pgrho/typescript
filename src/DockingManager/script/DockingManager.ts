module dock {

    interface DockingManagerSettings {
        backgroungClassName?: string;
    }

    export class DockingManager {

        private _root: Element;

        public backgroungClassName: string;

        constructor(element: string, settings?: DockingManagerSettings)
        constructor(element: Element, settings?: DockingManagerSettings)
        constructor(element: any, settings?: DockingManagerSettings) {
            this._root = (<Element>element).innerHTML !== undefined ? element : document.querySelector(element);

            var s = settings || {};

            this.backgroungClassName = s.backgroungClassName || "docking-manager-background";
        }

        public init() {
            this._root.classList.add(this.backgroungClassName);
        }
    }
}