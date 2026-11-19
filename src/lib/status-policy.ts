export const transitions:Record<string,readonly string[]>={pending:['confirmed','cancelled'],confirmed:['completed','cancelled'],cancelled:[],completed:[]};
export function canTransition(from:string,to:string){return transitions[from]?.includes(to)??false;}
