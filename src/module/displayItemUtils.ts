export interface recItem {
    children: recItem[];
    hasChildren: boolean;
    name: string;
}

export function mapDisplayItems<T extends recItem>(items: T[], fn: (item: T) => T): T[] {
    const res = [];
    for (let i = 0, j = items.length; i < j; i++) {
        const item = { ...items[i] };
        if (item.hasChildren) {
            item.children = mapDisplayItems(item.children as T[], fn);
        }
        res.push(fn(item));
    }
    return res;
}

export function filterDisplayItems<T extends recItem>(items: T[], pred: (item: T) => boolean): T[] {
    const childrenFiltered = mapDisplayItems(items, (item) => {
        const newItem = { ...item, children: filterDisplayItems(item.children as T[], pred) };
        newItem.hasChildren = newItem.children.length > 0;
        return newItem;
    });
    return childrenFiltered.filter((item) => item.hasChildren || pred(item));
}
