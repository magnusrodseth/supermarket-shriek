import { TransformData } from "../../types";
import World from "./world";

// Constants
const CART_START_SPEED = 0;
const CART_START_ANGLE = 0;
const CART_RADIUS = 10;
const CART_ACCELERATION_MIN = 0.1;
const CART_ACCELERATION_MAX = 0.3;
const CART_ROTATION = 0.04 * Math.PI;
const GROUNDSPEED_DECAY_MULT = 0.94;
const CART_MIN_TURN_SPEED = 0.5; // Minimum speed to turn
const CART_MIN_SPEED = 0.1; // Minimum speed the car can go
const CART_BOUNCE_TIMER = 15;

export default class Cart {
  private element: Element;
  private world: World;

  private speed: number;
  private angle: number;

  private x: number;
  private startX: number;
  private y: number;
  private startY: number;
  private outOfControlTimer: number;

  constructor(
    element: Element,
    world: World,
    radius = CART_RADIUS,
    speed = CART_START_SPEED,
    angle = CART_START_ANGLE
  ) {
    this.element = element;
    this.world = world;

    this.x = this.startX = 0;
    this.y = this.startY = 0;

    this.speed = speed;
    this.angle = angle;
    this.outOfControlTimer = CART_BOUNCE_TIMER;
  }

  /**
   * Updates cart speed based volume from microphone
   * @param isLeft describes if cart is turning left
   * @param isRight describes if cart is turning right
   * @param volume describes the volume from microphone
   */
  updateByVolume(isLeft: boolean, isRight: boolean, volume: number) {
    const forward = volume > 0;
    const acceleration = Math.min(
      Math.max(CART_ACCELERATION_MIN, volume),
      CART_ACCELERATION_MAX
    );

    if (this.outOfControlTimer > 0) {
      if (forward)
        this.speed = this.speed + acceleration;

      if (isLeft && Math.abs(this.speed) > CART_MIN_TURN_SPEED)
        this.angle = this.angle - CART_ROTATION;

      if (isRight && Math.abs(this.speed) > CART_MIN_TURN_SPEED)
        this.angle = this.angle + CART_ROTATION;
    }

    // Move cart
    this.x = this.x + Math.cos(this.angle) * this.speed;
    this.y = this.y + Math.sin(this.angle) * this.speed;

    // Automatic deceleration
    if (Math.abs(this.speed) > CART_MIN_SPEED)
      this.speed = this.speed * GROUNDSPEED_DECAY_MULT;
    else
      this.speed = 0;

    if (this.checkCollision()) {
      this.trackBounce();
      this.checkStandStillAndReset();
    }

    return this.getTransform();
  }

  /**
   * Resets cart
   */
  reset() {
    this.x = this.startX;
    this.y = this.startY;
    this.speed = CART_START_SPEED;
    this.angle = CART_START_ANGLE;
    this.outOfControlTimer = CART_BOUNCE_TIMER;
  }

  /**
   * Gets the properties concerning the 'transform' CSS styling
   */
  private getTransform(): TransformData {
    return {
      x: this.x,
      y: this.y,
      degrees: toDegrees(this.angle),
    };
  }

  private trackBounce() {
    this.outOfControlTimer -= 1;
    this.speed *= -0.5;
  }

  /**
   * Checks if cart collides
   */
  private checkCollision() {
    const obstacles = this.world.obstacles();
    let playerRectangle = this.element.getBoundingClientRect();
    return Array.from(obstacles).some((item) => {
      if (item == this.element)
        return false;

      let other = item.getBoundingClientRect();

      return !(
        other.left > playerRectangle.right ||
        other.right < playerRectangle.left ||
        other.top > playerRectangle.bottom ||
        other.bottom < playerRectangle.top
      );
    });
  }

  private checkStandStillAndReset() {
    if (this.outOfControlTimer < 0) {
      this.reset();
    }
  }
}

const toDegrees = (angle: number) => {
  return angle * (180 / Math.PI);
}
