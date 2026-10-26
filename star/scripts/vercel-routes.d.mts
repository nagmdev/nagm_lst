export function resolveRequest(pathname: string, distDir?: string): { status: number; location?: string; file?: string };
export function headersFor(pathname: string): Record<string, string>;
