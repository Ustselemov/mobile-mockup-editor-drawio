export function parseStyle(styleValue: string | undefined): Record<string, string> {
  if (!styleValue) {
    return {};
  }

  return styleValue
    .split(";")
    .map((token) => token.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((accumulator, token) => {
      const [rawKey, ...rest] = token.split("=");
      const key = rawKey.trim();
      const value = rest.join("=").trim();
      if (key) {
        accumulator[key] = value;
      }
      return accumulator;
    }, {});
}

export function serializeStyle(style: Record<string, string | number | undefined>): string {
  return Object.entries(style)
    .filter((entry): entry is [string, string | number] => entry[1] !== undefined)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(";")
    .concat(";");
}
