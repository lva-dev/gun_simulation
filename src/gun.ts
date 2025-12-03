import { stdout } from "node:process"

type seconds = number

class Stopwatch  {
    private start: seconds = 0
    
    restart() {
        this.start = performance.now() / 1000
    }

    time(): seconds {
        return performance.now() / 1000 - this.start
    }
}


type meters = number
type meterspersec = number

class PhysicalObject {
    x: meters
    y: meters
    vx: meterspersec
    vy: meterspersec
    
    constructor(x: meters, y: meters, vx: meterspersec, vy: meterspersec) {
        this.x = x
        this.y = y
        this.vx = vx
        this.vy = vy
    }

    static readonly GRAVITY_ACCELERATION = -9.81

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


abstract class Simulation {
    private readonly frameTimer = new Stopwatch()
    private accumulator = 0
    
    start() {
        this.init()
        this.frameTimer.restart()
        this.loop()
        this.shutdown()
    }
    
    abstract shutdown(): void
    abstract init(): void
    abstract update(dt: seconds): void
    abstract draw(): void

    static readonly FRAMES_PER_SECOND = 24
    static readonly SECONDS_PER_TICK = 1 / Simulation.FRAMES_PER_SECOND

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


class Bullet extends PhysicalObject {
    constructor(height: meters, horizontalVelocity: meterspersec) {
        super(0, height, horizontalVelocity, 0)
    }

    update(dt: seconds) {
        if (this.y == 0) {
            this.vx = 0
        }
        
        super.update(dt)
    }
}


class Gun {
    muzzleVelocity: meterspersec

    constructor(muzzleVelocity: meterspersec) {
        this.muzzleVelocity = muzzleVelocity    
    }

    shoot(height: meters): Bullet {
        return new Bullet(height, this.muzzleVelocity)
    }
}

// TODO: Rename this class to GunEnvironment
class Environment {
    readonly bullets: Bullet[]
    private readonly gun: Gun

    constructor(gunMuzzleVelocity: meterspersec) {
        this.gun = new Gun(gunMuzzleVelocity)
        this.bullets = []
    }

    shootGun(height: meters) {
        const bullet = this.gun.shoot(height)
        this.bullets.push(bullet)
    }

    update(dt: seconds) {
        for (let bullet of this.bullets) {
            bullet.update(dt)
        }
    }
}


class GunPhysicsSimulation extends Simulation {
    readonly shotChancePerSec
    private readonly environment: Environment
    
    constructor(environment: Environment, shotChancePerSec: number) {
        super()
        this.environment = environment    
        this.shotChancePerSec = shotChancePerSec
    }
    
    init() {
        stdout.write("\x1b[?25l")
        stdout.cursorTo(0, 0)
        stdout.clearScreenDown()
    }

    shutdown() {
        stdout.write("\x1b[?25h")
    }
    
    update(dt: seconds) {
        const shotChance = 1 - Math.pow(1 - this.shotChancePerSec, dt)
        if (Math.random() < shotChance) {
            this.environment.shootGun(100)
        }
        
        this.environment.update(dt)
    }
    
    draw() {
        stdout.cork()
        stdout.cursorTo(0, 0) // TODO: Verify the necessity moving the cursor
        
        const rows = Math.min(this.environment.bullets.length, stdout.rows)
        for (let i = 0; i < rows; i++) {            
            const bullet = this.environment.bullets[i]
            let x = bullet?.x.toFixed(2)
            let y = bullet?.y.toFixed(2)
            let vx = bullet?.vx.toFixed(2)
            let vy = bullet?.vy.toFixed(2)
            stdout.cursorTo(0, i)
            stdout.write(`${i}. x: ${x}, y: ${y}, vx: ${vx}, vy: ${vy}`)
            stdout.clearLine(1)
        }
        
        stdout.uncork()
    }
}


function main() {
    const coltM1911Env = new Environment(253)
    const sim = new GunPhysicsSimulation(coltM1911Env, 0.50)
    sim.start()
}

main()