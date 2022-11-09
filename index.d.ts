export type Plugin = {
  identifier: string
  name: string
  vendor: string
  website: string
  description: string
  keywords: string[]
  category: string[]
  path: string
};

export declare const Plugins: Plugin[]
export declare const Keywords: string[]
export declare const Categories: Record<string, string[]>
export declare const Vendors: string[]

export {};

