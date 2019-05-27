declare class Ref {
    idx: number;
    ref: string | number;
    constructor(idx: number, ref: string | number);
}
interface RefObj {
    [key: string]: any;
}
interface hElement extends HTMLElement {
    _refPaths?: Ref[];
    collect(node: Node): RefObj;
}
export function compile(node: Node): void;
export default function h(strings: TemplateStringsArray, ...args: any[]): hElement;
