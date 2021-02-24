import { TransformData } from "../../types";
import World from "./world";

// Car
const CAR_START_SPEED = 0;
const CAR_START_ANGLE = 0;
const CAR_RADIUS = 10;
const CAR_ACCELERATION_MIN = 0.1;
const CAR_ACCELERATION_MAX = 0.3;
const CAR_ROTATION = 0.04 * Math.PI;
const GROUNDSPEED_DECAY_MULT = 0.94;
const CAR_MIN_TURN_SPEED = 0.5; // Minimum speed to turn
const CAR_MIN_SPEED = 0.1; // Minimum speed the car can go
const CAR_BOUNCE_TIMER = 15;

export default class Car {
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
    radius = CAR_RADIUS,
    speed = CAR_START_SPEED,
    angle = CAR_START_ANGLE
  ) {
    this.element = element;
    this.world = world;

    this.x = this.startX = 0;
    this.y = this.startY = 0;

    this.speed = speed;
    this.angle = angle;
    this.outOfControlTimer = CAR_BOUNCE_TIMER;
  }

  updateByVolume(isLeft: boolean, isRight: boolean, volume: number) {
    const forward = volume > 0;
    const acceleration = Math.min(
      Math.max(CAR_ACCELERATION_MIN, volume),
      CAR_ACCELERATION_MAX
    );

    if (this.outOfControlTimer > 0) {
      if (forward) {
        this.speed = this.speed + acceleration;
      }

      if (isLeft && Math.abs(this.speed) > CAR_MIN_TURN_SPEED) {
        this.angle = this.angle - CAR_ROTATION;
      }
      if (isRight && Math.abs(this.speed) > CAR_MIN_TURN_SPEED) {
        this.angle = this.angle + CAR_ROTATION;
      }
    }

    // Move
    this.x = this.x + Math.cos(this.angle) * this.speed;
    this.y = this.y + Math.sin(this.angle) * this.speed;

    // Automatic deceleration
    if (Math.abs(this.speed) > CAR_MIN_SPEED)
      this.speed = this.speed * GROUNDSPEED_DECAY_MULT;
    else this.speed = 0;

    if (this.checkCollision()) {
      this.trackBounce();
      this.checkStandStillAndReset();
    }

    return this.getTransform();
  }

  reset() {
    this.x = this.startX;
    this.y = this.startY;
    this.speed = CAR_START_SPEED;
    this.angle = CAR_START_ANGLE;
    this.outOfControlTimer = CAR_BOUNCE_TIMER;
  }

  private getTransform(): TransformData {
    return {
      x: this.x,
      y: this.y,
      degrees: toDegrees(this.angle),
    };
  }

  private trackBounce() {
    this.outOfControlTimer -= 1;
    this.speed = this.speed * -0.5;
  }

  private checkCollision() {
    const els = this.world.obstacles();
    var playerRect = this.element.getBoundingClientRect();
    return Array.from(els).some((item) => {
      if (item == this.element) return false;
      var other = item.getBoundingClientRect();

      return !(
        other.left > playerRect.right ||
        other.right < playerRect.left ||
        other.top > playerRect.bottom ||
        other.bottom < playerRect.top
      );
    });
  }

  private checkStandStillAndReset() {
    if (this.outOfControlTimer < 0) {
      this.reset();
    }
  }
}

function toDegrees(angle: number) {
  return angle * (180 / Math.PI);
}
