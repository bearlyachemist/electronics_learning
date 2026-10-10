// Chapter metadata stays relative to the notebook, even when it is mounted on a subpath.
export function sitePath(path: string): string {
  return import.meta.env.BASE_URL.replace(/\/$/, '') + path;
}
