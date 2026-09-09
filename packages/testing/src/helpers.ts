export function createMockId(prefix: string = "id"): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}`;
}

export async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
