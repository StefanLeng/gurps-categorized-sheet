import { Hand, WeaponGrip, emptyHand, keyedMeleeMode} from './weaponGrips.ts';


interface Defence{
    name: string,
    level: number,
    type: "dodge" | "block" | "parry" | "none",
    attack?: keyedMeleeMode
  }

  export function getDefenses(data : any, grips : WeaponGrip[], hands : Hand[]) : Defence[]{
    let defences : Defence[] = [];
    let dodge = data.system.currentdodge as number;
    defences.push({
      name : "",
      level : dodge,
      type : "dodge",
      attack: undefined
    });
    let d : Defence[] = hands.map(
      h => grips.find(g=> g.name === h.grip) ?? emptyHand
    ).map(
      g => g.meleeList.reduce(
        (r : [[number, keyedMeleeMode | undefined],[number, keyedMeleeMode | undefined]] , m) => {
          let b = parseInt(m.block);
          if (!isNaN(b) && b > r[0][0]) r[0] = [b,m];
          let p = parseInt(m.parry);
          if (!isNaN(p) && p > r[1][0]) r[1] = [p,m];
         return r;
        } 
        ,[[0,undefined],[0,undefined]]
      )  
    ).map(
      x => {
        if (x[0][0] > x[1][0] && x[0][1] !== undefined)
        {
          return{
            name : x[0][1].name,
            level : x[0][0],
            type : "block",
            attack: x[0][1],         
          } as Defence
        } else if (x[1][1] !== undefined){
          return{
            name : x[1][1].name,
            level : x[1][0],
            type : "parry",
            attack: x[1][1],           
          } as Defence
        }
        return{
          name : "None",
          level : 0,
          type : "none",
          attack: undefined    
        } as Defence
      }
    ).filter( (def, i, arr) => i === arr.findIndex(v => v.name === def.name && v.level === def.level && v.type === def.type) && def.type !== "none") //remaove duplicates
    return defences.concat(d);
  }