declare module "xmlbuilder2/lib/xmlbuilder2.min.js" {
  export function create(options?: unknown): {
    ele(name: string, attributes?: Record<string, unknown>): any;
    end(options?: Record<string, unknown>): string;
  };
}
