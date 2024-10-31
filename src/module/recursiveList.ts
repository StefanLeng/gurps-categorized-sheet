export interface ElementList<TElement> {
    [index: string]: TElement;
}

export interface Rec<T> {
    contains?: ElementList<T>;
    colapsed?: ElementList<T>;
}

export type RecursiveList<T extends Rec<T>> = ElementList<T>;

export function emptyList<T>(): ElementList<T> {
    return {};
}

export function filterList<T>(list: ElementList<T>, pred: (i: T) => boolean): ElementList<T> {
    return Object.fromEntries(Object.entries(list).filter(([_, val]) => pred(val)));
}

export function mapList<T, U>(list: ElementList<T>, fn: (i: T) => U): ElementList<U> {
    return Object.fromEntries(Object.entries(list).map(([i, val]) => [i, fn(val)]));
}

export function findRecursive<T extends Rec<T>>(list: RecursiveList<T>, pred: (i: T) => boolean): T | undefined {
    const listValues = Object.values(list);
    if (listValues.length === 0) return undefined;
    const res = listValues.find(pred);
    if (!!res) return res;
    for (let i = 0; i < listValues.length; i++) {
        const r = findRecursive(listValues[i].contains ?? emptyList<T>(), pred);
        if (!!r) return r;
        const c = findRecursive(listValues[i].colapsed ?? emptyList<T>(), pred);
        if (!!c) return c;
    }
    return undefined;
}

export function filterRecursive<T extends Rec<T>>(list: RecursiveList<T>, pred: (i: T) => boolean): RecursiveList<T> {
    const l1 = filterList(list, (i) => pred(i) || !!findRecursive(i.contains ?? emptyList<T>(), pred));
    const l2 = mapList(l1, (i) => {
        const r = {
            ...i,
            contains: i.contains ? filterRecursive(i.contains, pred) : undefined,
            colapsed: i.colapsed ? filterRecursive(i.colapsed, pred) : undefined,
        };
        return r;
    });
    return l2;
}

export function flattenList<T extends Rec<T>>(list: RecursiveList<T>): RecursiveList<T> {
    function inner(list: RecursiveList<T>, key: string): [i: string, val: T][] {
        const listValues = Object.entries(list);
        return listValues
            .map(([i, val]) => {
                const element: [i: string, val: T][] = [
                    [
                        key + i,
                        {
                            ...val,
                            contains: val.contains ? emptyList<T>() : undefined,
                            colapsed: val.colapsed ? emptyList<T>() : undefined,
                        },
                    ],
                ];
                const children: [i: string, val: T][] = inner(val.contains ?? emptyList<T>(), key + i);
                const children2: [i: string, val: T][] = inner(val.colapsed ?? emptyList<T>(), key + i);
                return element.concat(children).concat(children2);
            })
            .flat(1);
    }
    return Object.fromEntries(inner(list, ''));
}
