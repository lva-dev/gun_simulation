import { stdout } from "node:process"

type seconds = number

/**
 * Sleeps for `time` seconds
 * @param ms milliseconds to sleep
 * @returns a void promise
 * @author GeeksForGeeks,
 *  https://www.geeksforgeeks.org/typescript/how-to-implement-sleep-function-in-typescript
 */
async function sleep(time: seconds): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, time * 1000))
}


class Stopwatch  {
    private _start: seconds = 0
    
    restart() {
        this._start = performance.now()
    }

    time(): seconds {
        return performance.now() - this._start
    }
}


type meters = number
type velocity = number

class PhysicalObject {
    x: meters
    y: meters
    vx: velocity
    vy: velocity
    
    constructor(x: meters, y: meters, vx: velocity, vy: velocity) {
        this.x = x
        this.y = y
        this.vx = vx
        this.vy = vy
    }

    static readonly GRAVITY_ACCELERATION = -9.81;

    update(dt: seconds) {
        if (this.y > 0) {
            this.vy += PhysicalObject.GRAVITY_ACCELERATION * dt
        }
        
        this.x += this.vx * dt
        this.y += this.vy * dt
        
        if (this.y <= 0) {
            this.vy = 0
            this.y = Math.max(this.y, 0)
        }
    }
}


class Bullet extends PhysicalObject {
    constructor(height: meters, horizontalVelocity: velocity) {
        super(0, height, horizontalVelocity, 0)
    }

    update(dt: seconds) {
        super.update(dt)
    }
}


class Gun {
    muzzleVelocity: velocity

    constructor(muzzleVelocity: velocity) {
        this.muzzleVelocity = muzzleVelocity    
    }

    shoot(height: meters): Bullet {
        return new Bullet(height, this.muzzleVelocity)
    }
}


class Environment {
    private gun: Gun
    readonly bullets: Bullet[]

    constructor(gunMuzzleVelocity: number) {
        this.gun = new Gun(gunMuzzleVelocity)
        this.bullets = []
    }

    shootGun(height: number) {
        const bullet = this.gun.shoot(height)
        this.bullets.push(bullet)
    }

    update(dt: number) {
        this.bullets.forEach((bullet) => {
            bullet.update(dt)
        })
    }
}


abstract class Simulation {
    private accumulator = 0
    private frameTimer = new Stopwatch()
    
    static readonly FRAMES_PER_SECOND = 5
    static readonly SECONDS_PER_TICK = 1 / Simulation.FRAMES_PER_SECOND
    
    start() {
        this.frameTimer.restart()
        this.loop()
    }
    
    abstract update(dt: seconds): void
    abstract draw(): void

    private loop() {
        this.accumulator += this.frameTimer.time()
        this.frameTimer.restart()
        
        while (this.accumulator >= Simulation.SECONDS_PER_TICK) {
            this.update(Simulation.SECONDS_PER_TICK)
            this.accumulator -= Simulation.SECONDS_PER_TICK
        }
        
        this.draw()
        
        setImmediate(() => this.loop())
    }
}


class GunPhysicsSimulation extends Simulation {
    environment: Environment
    readonly shotChancePerSec;
    private eventTimer = 0;
    
    constructor(environment: Environment, shotChancePerSec: number) {
        super()
        this.environment = environment    
        this.shotChancePerSec = shotChancePerSec;
    }
    
    update(dt: seconds) {
        let shoot_chance = 1 - Math.pow(1 - this.shotChancePerSec, dt);
        if (Math.random() < shoot_chance) {
            this.environment.shootGun(100)
        }
        
        this.environment.update(dt)
    }
    
    draw() {
        stdout.cork()
        
        stdout.write("\x1b[2J\x1b[H")
        if (stdout)
        for (let i = 0; i < this.environment.bullets.length; i++) {
            if (i >= stdout.rows) {
                break;
            }
            
            let bullet = this.environment.bullets[i];
            stdout.write(`${i}. x: ${bullet?.x}, y: ${bullet?.y}, vx: ${bullet?.vx}, vy: ${bullet?.vy}\n`)
        }
        // this.environment.bullets.forEach((bullet, i) => {
        //     stdout.write(`${i}. x: ${bullet.x}, y: ${bullet.y}, vx: ${bullet.vx}, vy: ${bullet.vy}\n`)
        // })
        
        stdout.uncork()
    }
}

function main() {
    let coltM1911Env = new Environment(253)
    let sim = new GunPhysicsSimulation(coltM1911Env, 0.20)
    sim.start()
}

main()