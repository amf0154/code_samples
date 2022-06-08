import {
    Component,
    DoCheck,
    EventEmitter,
    Input,
    IterableDiffers,
    OnChanges,
    OnInit,
    Output,
    SimpleChange
} from "@angular/core";
import { BasicList } from "./basic-list";
@Component({
    selector: "onboard-selection-list",
    templateUrl: "./selection-list.component.html",
    styleUrls: ["./selection-list.component.less"]
})
export class SelectionListComponent implements OnInit, DoCheck {
    constructor(private readonly differs: IterableDiffers) {
        this.available = new BasicList(SelectionListComponent.AVAILABLE_LIST_NAME);
        this.confirmed = new BasicList(SelectionListComponent.CONFIRMED_LIST_NAME);
    }
    private static AVAILABLE_LIST_NAME = "available";
    private static CONFIRMED_LIST_NAME = "confirmed";
    @Input() public listName = "List";
    @Input() public autId: string;
    @Input() private itemLabelKey = "name";
    @Input() private itemValueKey = "id";
    @Input() public inputListClasses = "col-5 col-sm-10 col-md-10";
    @Input() public inputMoveButtonsClasses = "col-2 col-sm-4 col-md-4";
    @Input() private tableId = "neo-selection-list";
    @Input() public disabled = false;
    @Input() public draggable = true;
    @Input() filter = false;
    @Input() sort = false;
    @Input() compare: compareFunction;
    @Input() source: Array<any>;
    @Input() destination: Array<any>;
    @Output() destinationChange = new EventEmitter();
    public available: BasicList;
    public confirmed: BasicList;
    private sourceDiffer: any;
    private destinationDiffer: any;

    private sorter = (a: any, b: any) => {
        return a._name < b._name ? -1 : a._name > b._name ? 1 : 0;
    };

    public lowerCase = (text: string) => text.toLowerCase();

    public ngOnInit(): void {
        if (this.filter) {
            if (!this.filter) {
                this.clearFilter(this.available);
                this.clearFilter(this.confirmed);
            }
        }

        if (this.sort && !this.compare) {
            this.compare = this.sorter;
        } else {
            this.compare = undefined;
        }

        if (this.source) {
            this.available = new BasicList(SelectionListComponent.AVAILABLE_LIST_NAME);
            this.updatedSource();
            this.updatedDestination();
        }

        if (this.destination) {
            this.confirmed = new BasicList(SelectionListComponent.CONFIRMED_LIST_NAME);
            this.updatedDestination();
            this.updatedSource();
        }
    }

    public ngDoCheck(): void {
        if (this.source && this.buildAvailable(this.source)) {
            this.onFilter(this.available);
        }
        if (this.destination && this.buildConfirmed(this.destination)) {
            this.onFilter(this.confirmed);
        }
    }

    private buildAvailable(source: Array<any>): boolean {
        const sourceChanges = this.sourceDiffer.diff(source);
        if (sourceChanges) {
            sourceChanges.forEachRemovedItem((r: any) => {
                const idx = this.findItemIndex(this.available.list, r.item, this.itemValueKey);
                if (idx !== -1) {
                    this.available.list.splice(idx, 1);
                }
            });

            sourceChanges.forEachAddedItem((r: any) => {
                if (this.findItemIndex(this.available.list, r.item, this.itemValueKey) === -1) {
                    this.available.list.push({ _id: this.makeId(r.item), _name: this.makeName(r.item) });
                }
            });

            if (this.compare !== undefined) {
                this.available.list.sort(this.compare);
            }
            this.available.sift = this.available.list;

            return true;
        }
        return false;
    }

    private buildConfirmed(destination: Array<any>): boolean {
        let moved = false;
        const destChanges = this.destinationDiffer.diff(destination);
        if (destChanges) {
            destChanges.forEachRemovedItem((r: any) => {
                const idx = this.findItemIndex(this.confirmed.list, r.item, this.itemValueKey);
                if (idx !== -1) {
                    if (!this.isItemSelected(this.confirmed.pick, this.confirmed.list[idx])) {
                        this.selectItem(this.confirmed.pick, this.confirmed.list[idx]);
                    }
                    this.moveItem(this.confirmed, this.available, this.confirmed.list[idx], false);
                    moved = true;
                }
            });

            destChanges.forEachAddedItem((r: any) => {
                const idx = this.findItemIndex(this.available.list, r.item, this.itemValueKey);
                if (idx !== -1) {
                    if (!this.isItemSelected(this.available.pick, this.available.list[idx])) {
                        this.selectItem(this.available.pick, this.available.list[idx]);
                    }
                    this.moveItem(this.available, this.confirmed, this.available.list[idx], false);
                    moved = true;
                }
            });

            if (this.compare !== undefined) {
                this.confirmed.list.sort(this.compare);
            }
            this.confirmed.sift = this.confirmed.list;

            if (moved) {
                this.trueUp();
            }
            return true;
        }
        return false;
    }

    private updatedSource(): void {
        this.available.list.length = 0;
        this.available.pick.length = 0;
        if (this.source !== undefined) {
            this.sourceDiffer = this.differs.find(this.source).create(null);
        }
    }

    private updatedDestination(): void {
        if (this.destination !== undefined) {
            this.destinationDiffer = this.differs.find(this.destination).create(null);
        }
    }

    public dragEnd(list: BasicList = null): boolean {
        if (list) {
            list.dragStart = false;
        } else {
            this.available.dragStart = false;
            this.confirmed.dragStart = false;
        }
        return false;
    }

    public drag(event: DragEvent, item: any, list: BasicList): void {
        if (!this.isItemSelected(list.pick, item)) {
            this.selectItem(list.pick, item);
        }
        list.dragStart = true;
        event.dataTransfer.setData(this.tableId, item._id);
    }

    public allowDrop(event: DragEvent, list: BasicList): boolean {
        if (event.dataTransfer.types.length && event.dataTransfer.types[0] === this.tableId) {
            event.preventDefault();
            if (!list.dragStart) {
                list.dragOver = true;
            }
        }
        return false;
    }

    public dragLeave(): void {
        this.available.dragOver = false;
        this.confirmed.dragOver = false;
    }

    public drop(event: DragEvent, list: BasicList): void {
        if (event.dataTransfer.types.length && event.dataTransfer.types[0] === this.tableId) {
            event.preventDefault();
            this.dragLeave();
            this.dragEnd();

            if (list === this.available) {
                this.moveItem(this.available, this.confirmed);
            } else {
                this.moveItem(this.confirmed, this.available);
            }
        }
    }

    private trueUp(): void {
        let changed = false;
        let pos = this.destination.length;
        while (pos >= 0) {
            const mv = this.confirmed.list.filter((conf) => {
                if (typeof this.destination[pos] === "object") {
                    return conf._id === this.destination[pos][this.itemValueKey];
                } else {
                    return conf._id === this.destination[pos];
                }
            });
            if (mv.length === 0) {
                this.destination.splice(pos, 1);
                changed = true;
            }
            pos -= 1;
        }

        for (let i = 0, len = this.confirmed.list.length; i < len; i += 1) {
            let mv = this.destination.filter((d: any) => {
                if (typeof d === "object") {
                    return d[this.itemValueKey] === this.confirmed.list[i]._id;
                } else {
                    return d === this.confirmed.list[i]._id;
                }
            });

            if (mv.length === 0) {
                mv = this.source.filter((o: any) => {
                    if (typeof o === "object") {
                        return o[this.itemValueKey] === this.confirmed.list[i]._id;
                    } else {
                        return o === this.confirmed.list[i]._id;
                    }
                });

                if (mv.length > 0) {
                    this.destination.push(mv[0]);
                    changed = true;
                }
            }
        }

        if (changed) {
            this.destinationChange.emit(this.destination);
        }
    }

    private findItemIndex(list: Array<any>, item: any, key: any = "_id"): number {
        let idx = -1;

        function matchObject(e: any): boolean {
            if (e._id === item[key]) {
                idx = list.indexOf(e);
                return true;
            }
            return false;
        }

        function match(e: any): boolean {
            if (e._id === item) {
                idx = list.indexOf(e);
                return true;
            }
            return false;
        }

        if (typeof item === "object") {
            list.filter(matchObject);
        } else {
            list.filter(match);
        }

        return idx;
    }

    private makeUnavailable(source: BasicList, item: any): void {
        const idx = source.list.indexOf(item);
        if (idx !== -1) {
            source.list.splice(idx, 1);
        }
    }

    public moveItem(source: BasicList, target: BasicList, item: any = null, trueup = true): void {
        let i = 0;
        let len = source.pick.length;

        if (item) {
            i = source.list.indexOf(item);
            len = i + 1;
        }

        for (; i < len; i += 1) {
            let mv: Array<any> = [];
            if (item) {
                const idx = this.findItemIndex(source.pick, item);
                if (idx !== -1) {
                    mv[0] = source.pick[idx];
                }
            } else {
                mv = source.list.filter((src) => {
                    return src._id === source.pick[i]._id;
                });
            }

            if (mv.length === 1) {
                if (target.list.filter((trg) => trg._id === mv[0]._id).length === 0) {
                    target.list.push(mv[0]);
                }

                this.makeUnavailable(source, mv[0]);
            }
        }

        if (this.compare !== undefined) {
            target.list.sort(this.compare);
        }

        source.pick.length = 0;

        if (trueup) {
            this.trueUp();
        }

        setTimeout(() => {
            this.onFilter(source);
            this.onFilter(target);
        }, 10);
    }

    public isItemSelected(list: Array<any>, item: any): boolean {
        if (list.filter((e) => Object.is(e, item)).length > 0) {
            return true;
        }
        return false;
    }

    public shiftClick(event: MouseEvent, index: number, source: BasicList, item: any): void {
        if (event.shiftKey && source.last && !Object.is(item, source.last)) {
            const idx = source.sift.indexOf(source.last);
            if (index > idx) {
                for (let i = idx + 1; i < index; i += 1) {
                    this.selectItem(source.pick, source.sift[i]);
                }
            } else if (idx !== -1) {
                for (let i = index + 1; i < idx; i += 1) {
                    this.selectItem(source.pick, source.sift[i]);
                }
            }
        }
        source.last = item;
    }

    public selectItem(list: Array<any>, item: any): void {
        const pk = list.filter((e: any) => {
            return Object.is(e, item);
        });
        if (pk.length > 0) {
            for (let i = 0, len = pk.length; i < len; i += 1) {
                const idx = list.indexOf(pk[i]);
                if (idx !== -1) {
                    list.splice(idx, 1);
                }
            }
        } else {
            list.push(item);
        }
    }

    public selectDeselect(source: BasicList): void {
        if (this.isAllSelected(source)) {
            this.selectNone(source);
        } else {
            this.selectAll(source);
        }
    }

    public selectAll(source: BasicList): void {
        source.pick.length = 0;
        source.pick = source.sift.slice(0);
    }

    public selectNone(source: BasicList): void {
        source.pick.length = 0;
    }

    public isAllSelected(source: BasicList): boolean {
        if (source.list.length === 0 || source.list.length === source.pick.length) {
            return true;
        }
        return false;
    }

    public isAnySelected(source: BasicList): boolean {
        if (source.pick.length > 0) {
            return true;
        }
        return false;
    }

    private unpick(source: BasicList): void {
        for (let i = source.pick.length - 1; i >= 0; i -= 1) {
            if (source.sift.indexOf(source.pick[i]) === -1) {
                source.pick.splice(i, 1);
            }
        }
    }

    private clearFilter(source: BasicList): void {
        if (source) {
            source.picker = "";
            this.onFilter(source);
        }
    }

    private onFilter(source: BasicList): void {
        if (source.picker.length > 0) {
            const filtered = source.list.filter((item: any) => {
                if (Object.prototype.toString.call(item) === "[object Object]") {
                    if (item._name !== undefined) {
                        return item._name.toLowerCase().indexOf(source.picker.toLowerCase()) !== -1;
                    } else {
                        return JSON.stringify(item).toLowerCase().indexOf(source.picker.toLowerCase()) !== -1;
                    }
                } else {
                    return item.toLowerCase().indexOf(source.picker.toLowerCase()) !== -1;
                }
            });
            source.sift = filtered;
            this.unpick(source);
        } else {
            source.sift = source.list;
        }
    }

    private makeId(item: any): string | number {
        if (typeof item === "object") {
            return item[this.itemValueKey];
        } else {
            return item;
        }
    }

    private makeName(item: any): any {
        const display = this.itemLabelKey;

        function fallback(itm: any): any {
            switch (Object.prototype.toString.call(itm)) {
                case "[object Number]":
                    return itm;
                case "[object String]":
                    return itm;
                default:
                    if (itm !== undefined) {
                        return itm[display];
                    } else {
                        return "undefined";
                    }
            }
        }
        return fallback(item);
    }
}

export type compareFunction = (a: any, b: any) => number;
