import { NamedItem } from './types.ts';

export interface ElementList<TElement> {
    [index: string]: TElement;
}

export interface Rec<T> {
    contains?: ElementList<T>;
    colapsed?: ElementList<T>;
}

export type List<T extends Rec<T>> = ElementList<T>;

export function emptyList<T>(): ElementList<T> {
    return {};
}

export function filterList<T>(list: ElementList<T>, pred: (i: T) => boolean): ElementList<T> {
    return Object.fromEntries(Object.entries(list).filter(([_, val]) => pred(val)));
}

export function mapList<T, U>(list: ElementList<T>, fn: (i: T) => U): ElementList<U> {
    return Object.fromEntries(Object.entries(list).map(([i, val]) => [i, fn(val)]));
}

export function find<T extends Rec<T>>(list: List<T>, pred: (i: T) => boolean): T | undefined {
    const listValues = Object.values(list);
    if (listValues.length === 0) return undefined;
    const res = listValues.find(pred);
    if (!!res) return res;
    for (let i = 0; i < listValues.length; i++) {
        const r = find(listValues[i].contains ?? emptyList<T>(), pred);
        if (!!r) return r;
        const c = find(listValues[i].colapsed ?? emptyList<T>(), pred);
        if (!!c) return c;
    }
    return undefined;
}

export function findByName<T extends Rec<T> & NamedItem>(list: List<T>, name: string): T | undefined {
    return find(list, (w) => w.name === name);
}

export function findByNameStart<T extends Rec<T> & NamedItem>(list: List<T>, name: string): T | undefined {
    return find(list, (w) => name.startsWith(w.name));
}

export function some<T extends Rec<T>>(list: List<T>, pred: (i: T) => boolean): boolean {
    return !!find(list, pred);
}

export function every<T extends Rec<T>>(list: List<T>, pred: (i: T) => boolean): boolean {
    return !some(list, (i) => !pred(i));
}

export function nameExists<T extends Rec<T> & NamedItem>(list: List<T>, name: string): boolean {
    return !!find(list, (w) => w.name === name);
}

export function nameStartExists<T extends Rec<T> & NamedItem>(list: List<T>, name: string): boolean {
    return !!find(list, (w) => name.startsWith(w.name));
}

export function findBestNameFit<T extends Rec<T> & NamedItem>(list: List<T>, name: string): T | undefined {
    const flat = flatten(list);
    const filtered = Object.values(flat)
        .filter((val) => name.startsWith(val.name))
        .sort((val, val1) => val1.name.length - val.name.length);
    if (filtered.length > 0) return filtered[0];
    return undefined;
}
export function filter<T extends Rec<T>>(list: List<T>, pred: (i: T) => boolean): List<T> {
    const l1 = filterList(list, (i) => pred(i) || !!find(i.contains ?? emptyList<T>(), pred));
    const l2 = mapList(l1, (i) => {
        const r = {
            ...i,
            contains: i.contains ? filter(i.contains, pred) : undefined,
            colapsed: i.colapsed ? filter(i.colapsed, pred) : undefined,
        };
        return r;
    });
    return l2;
}

export function flatten<T extends Rec<T>>(list: List<T>): List<T> {
    function inner(list: List<T>, key: string): [i: string, val: T][] {
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
