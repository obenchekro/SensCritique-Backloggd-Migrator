import { delay } from "./delay";

export async function retry<T>(
    worker: () => Promise<T>,
    errorMessage = 'Retry maxed out.',
    maxRetries = Number.MAX_SAFE_INTEGER,
    delayInMs = 1000,
): Promise<T> {
    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            const result = await worker();
            if (result) return result;
        } catch (error) {
            console.error(`Error in retry worker: ${error}`);
        }
        console.log(`Retry attempt for ${worker.toString()}: ${attempt + 1}/${maxRetries}`);
        await delay(delayInMs);
        attempt++;
    }
    throw new Error(errorMessage);
}
