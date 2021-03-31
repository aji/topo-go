export async function sleepAsync(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
}

export function linJitter(low: number, high: number): number {
    return low + Math.random() * (high - low);
}

export function logJitter(low: number, high: number): number {
    return Math.exp(linJitter(Math.log(low), Math.log(high)));
}
