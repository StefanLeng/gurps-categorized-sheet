export function i18n(value : string, fallback?: string | undefined) {
    const result = game.i18n.localize(value)
    if (!!fallback) return value === result ? fallback : result
    return result
  }
  
export function filterObject(obj : Object, callback : (val: any)=>boolean) : Object {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, val]) => callback(val))
  );
}

export function encumberanceName(key : string){
  const names : {[index: string]: string,} = {
    enc0: 'None',
    enc1: 'Light',
    enc2: 'Medium',
    enc3: 'Heavy',
    enc4:  'x-Heavy',
  }
  return names[key] ??  'Unkonwn';
}

export function convertModifiers(list: Array<string>) {
  return list ? list.map((it: string) => `[${i18n(it)}]`).map((it: string) => {return {mod :GURPS.gurpslink(it)}}) : []
}

export function removeArrayItem<T>(arr: Array<T>, value: T): Array<T> { 
  const index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

export function removeArryDuplicates<T> (arr : T[]) : T[] {
    return arr.filter((v, i) => i === arr.indexOf(v));
}