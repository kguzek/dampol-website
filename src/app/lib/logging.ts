export function warnInProduction(...args: any[]) {
  if (process.env["NODE_ENV"] !== "development") {
    console.warn(...args);
  }
}
