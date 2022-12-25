export const delay = (ms: number) => new Promise<void>((res, rej) => setTimeout(() => res(), ms))