import IPlayerCursor from '../types/IPlayerCursor'
import IPlayerSkill from '../types/IPlayerSkill'

import Bomb from './Bomb'
export default class Player extends Phaser.Physics.Arcade.Sprite {
  private speed: number = 5000
  private status: string = 'turndown'
  private controlable: boolean = false
  private health: number = 3
  private playerText: Phaser.GameObjects.Text

  public skillBomb: IPlayerSkill = {
    cooldown: 1000,
    ready: true,
  }
  private skillArea: Phaser.Physics.Arcade.Image

  private bomb: Bomb = undefined
  private bombTarget: Phaser.Math.Vector2 = undefined

  public name: string

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number = 128,
    height: number = 128,
    name: string = 'player',
    controlable: boolean = false
  ) {
    super(scene, x, y, 'player_turndown')

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.controlable = controlable
    this.name = name
    this.setDisplaySize(width, height)
      .setSize(90, 70)
      .setOffset((128 - 90) / 2, 128 - 70)
    // this.setDisplaySize((128 / 90) * width, (128 / 100) * height)
    //   .setSize(90, 100)

    // add player text
    this.playerText = scene.add
      .text(x, y - height / 2, `${this.name} ♥${this.health}`, {
        color: 'black',
        fontSize: '16pt',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(21000)

    // add place bomb area
    this.skillArea = scene.physics.add
      .image(x, y + 64, 'bomb_area')
      .setDisplaySize(64, 64)
      .setCollideWorldBounds(true)
      .setDepth(21000)
    if (controlable === false) {
      this.skillArea.setAlpha(0)
    }

    // player health
    this.setData('health', this.health)
    // player take damage
    this.addListener('takedamage', this.takeDamage)

    // animation
    const walkFramerate = 12
    // walk

    scene.anims.create({
      key: 'walkdown',
      frames: [
        { key: 'player_walkdown1' },
        { key: 'player_turndown' },
        { key: 'player_walkdown2' },
      ],
      frameRate: walkFramerate,
      repeat: -1,
    })

    scene.anims.create({
      key: 'walkup',
      frames: [
        { key: 'player_walkup1' },
        { key: 'player_turnup' },
        { key: 'player_walkup2' },
      ],
      frameRate: walkFramerate,
      repeat: -1,
    })

    scene.anims.create({
      key: 'walkleft',
      frames: [
        { key: 'player_walkleft1' },
        { key: 'player_turnleft' },
        { key: 'player_walkleft2' },
      ],
      frameRate: walkFramerate,
      repeat: -1,
    })

    scene.anims.create({
      key: 'walkright',
      frames: [
        { key: 'player_walkright1' },
        { key: 'player_turnright' },
        { key: 'player_walkright2' },
      ],
      frameRate: walkFramerate,
      repeat: -1,
    })
  }

  private skillControl(
    key: Phaser.Input.Keyboard.Key,
    skill: IPlayerSkill,
    skillAction: Function,
    cooldownAction?: Function
  ): void {
    if (
      key.isDown &&
      skill.ready &&
      (skill.count == undefined || skill.count > 0)
    ) {
      if (skill.count > 0) skill.count--
      skill.ready = false
      skillAction()
      setTimeout(() => {
        skill.ready = true
        if (cooldownAction) {
          cooldownAction()
        }
      }, skill.cooldown)
    }
  }

  public activeSkillBomb(delta: number, keyboard?: Phaser.Input.Keyboard.Key) {
    this.skillControl(
      keyboard,
      this.skillBomb,
      () => {
        // console.log('bomb has been planted,', 'left:', this.skillBomb.count)
        this.bomb = new Bomb(
          this.scene,
          this.body.position.x + this.body.width / 2,
          this.body.position.y + this.body.height / 2
        ).setDepth(20001)

        this.bombTarget = new Phaser.Math.Vector2(
          this.skillArea.body.position.x + this.skillArea.displayWidth / 2,
          this.skillArea.body.position.y + this.skillArea.displayHeight / 2
        )
      },
      () => {
        // console.log('can plant again!')
      }
    )
    // check Bomb is Desroyed
    if (this.bomb !== undefined) {
      if (this.bomb.isDestroyed()) {
        this.bomb = this.bomb.isDestroyed() ? undefined : this.bomb
      } else {
        this.bomb.moveto(this.bombTarget, delta)
      }
    }
  }

  private moveControl(
    delta: number,
    direction: string,
    key: Phaser.Input.Keyboard.Key,
    alt_key?: Phaser.Input.Keyboard.Key
  ): void {
    if (key.isDown || (alt_key !== undefined && alt_key.isDown)) {
      switch (direction) {
        case 'left':
          this.setVelocity(-this.speed / delta, 0)
          // this.setVelocityX(-this.speed / delta)
          break
        case 'right':
          this.setVelocity(this.speed / delta, 0)
          // this.setVelocityX(this.speed / delta)
          break
        case 'up':
          this.setVelocity(0, -this.speed / delta)
          // this.setVelocityY(-this.speed / delta)
          break
        case 'down':
          this.setVelocity(0, this.speed / delta)
          // this.setVelocityY(this.speed / delta)
          break
      }
      this.anims.play(`walk${direction}`, true)
      this.status = `turn${direction}`
    }
  }

  playerUpdate(delta: number, keyboard?: IPlayerCursor): void {
    // player health
    this.setData('health', this.health)
    this.setVelocity(0)

    // fix depth
    this.setDepth(
      Math.floor(this.body.position.y / 64) * 10 + (this.controlable ? 2 : 1)
    )

    // set playertext
    this.playerText
      .setPosition(
        this.body.position.x + this.body.width / 2,
        this.body.position.y - (this.playerText.height + 40) / 2
      )
      .setOrigin(0.5)

    // set skillarea
    const radious: number = 2
    const skillTarget = new Phaser.Math.Vector2(
      this.body.position.x + this.body.width / 2,
      this.body.position.y + this.body.height / 2
    )
    switch (this.status) {
      case 'turndown':
        skillTarget.y += 64 * radious
        break
      case 'turnup':
        skillTarget.y -= 64 * radious
        break
      case 'turnleft':
        skillTarget.x -= 64 * radious
        break
      case 'turnright':
        skillTarget.x += 64 * radious
        break
    }
    const moveTime = 30
    setTimeout(() => {
      this.scene.physics.moveToObject(
        this.skillArea,
        skillTarget,
        this.speed / delta,
        moveTime
      )
    }, moveTime / 2)

    //check if dead
    if (this.health <= 0) {
      this.anims.stop()
      return
    }

    if (this.controlable) {
      // Move Control
      this.playerController(keyboard, delta)
      // Skill: Plant a bomb
      this.activeSkillBomb(delta, keyboard.space)
    }
  }

  private dead(): void {
    this.setAlpha(0.3)
    this.playerText.setAlpha(0.3)
    this.skillArea.setAlpha(0.3)
  }

  private takeDamage(point: number): void {
    if (this.health > point) {
      this.health -= point
    } else {
      this.health = 0
      this.dead()
      console.log(`${this.name} is dead`)
    }
    this.playerText.setText(`${this.name} ♥${this.health}`)
    // console.log(`${this.name} take damage: ${point}, remaining: ${this.health}`);
  }

  private playerController(keyboard: IPlayerCursor, delta: number): void {
    // 4 Direction movement
    this.moveControl(delta, 'up', keyboard.up, keyboard.alt_up)
    this.moveControl(delta, 'down', keyboard.down, keyboard.alt_down)
    this.moveControl(delta, 'left', keyboard.left, keyboard.alt_left)
    this.moveControl(delta, 'right', keyboard.right, keyboard.alt_right)

    let moving =
      !keyboard.left.isDown &&
      !keyboard.right.isDown &&
      !keyboard.down.isDown &&
      !keyboard.up.isDown
    const altkeys =
      keyboard.alt_up !== undefined &&
      keyboard.alt_down !== undefined &&
      keyboard.alt_left !== undefined &&
      keyboard.alt_right !== undefined

    if (altkeys) {
      moving =
        moving &&
        !keyboard.alt_left.isDown &&
        !keyboard.alt_right.isDown &&
        !keyboard.alt_down.isDown &&
        !keyboard.alt_up.isDown
    }
    if (moving) {
      this.anims.stop()
      this.setTexture(`player_${this.status}`)
    }
  }
}
