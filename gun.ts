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

class Timer {

}

/**
 * Bullet class.
 */
class Bullet {
    _x: number;
    _y: number;
    _vx: number;
    _vy: number;

    private static readonly GRAVITY_ACCELERATION = -9.8;

    constructor(height: number, speed: number) {
        this.y = height;
        this.vx = speed;
        this.vy = 0;
    }

    get x(): number {
        return this._x;
    }

    get y(): number {
        return this._y;
    }

    get vx(): number {
        return this._vx;
    }

    get vy(): number {
        return this._vy;
    }

    update(dt: number) {
        vy += GRAVITY_ACCELERATION;
        x += vx * dt;
        y += vy * dt;
    }
}

/**
 * Gun class.
 */
class Gun {
    power: number;

    constructor(power: number) {
        this.power = power;
    }

    shoot(height: number): Bullet {
        return new Bullet(height, power);
    }
}

class Environment {
    private _gun: Gun;
    _bullets: Bullet[];

    constructor(gun_power: number) {
        this._gun = new Gun(gun_power);
        this._bullets = [];
    }

    get bullets() {
        return this._bullets;
    }

    shoot_gun() {
        const bullet = this._gun.shoot();
        this._bullets.push(bullet);
    }

    update(dt: number) {
        for (let i = 0; i < this._bullets.length; i++) {
            this._bullets[i].update(dt);
        }
    }
}

const FRAMES_PER_SECOND = 6;
const TICK_LENGTH = 1000 / FRAMES_PER_SECOND;
let running = true;

let env = new Environment(50);

while (running) {
    if (Math.random() / 0.20 * TICK_LENGTH) {
        env.shoot_gun();
        console.log("Pew!");
        console.log("\x07");
    }

    env.update();

    // TODO: fix sleep interval being smaller than expected
    sleep(TICK_LENGTH);
}