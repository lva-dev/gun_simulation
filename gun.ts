/**
 * Sleeps for `ms` milliseconds
 * @param ms milliseconds to sleep
 * @returns a void promise
 * @author GeeksForGeeks,
 *  https://www.geeksforgeeks.org/typescript/how-to-implement-sleep-function-in-typescript
 */
async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

interface Bullet {
    x: number;
    y: number;
}

class Gun {
    shoot(height: number): Bullet {
        let bullet: Bullet = {
            x: 0,
            y: 0
        };
        
        return bullet;
    }
}

const FRAMES_PER_SECOND = 6;
const TICK_LENGTH = 1000 / FRAMES_PER_SECOND;
let running = true;

while (running) {
    console.log("Hello World!");
    // TODO: fix sleep interval being smaller than expected
    sleep(TICK_LENGTH);
}