declare module 'smol-toml' {
  export function parse(toml: string): any;
  export function stringify(obj: any): string;
}
