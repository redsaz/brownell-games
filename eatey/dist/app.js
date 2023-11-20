"use strict";

const UP = Symbol("up");
const RIGHT = Symbol("right");
const DOWN = Symbol("down");
const LEFT = Symbol("left");

class GameScene extends Phaser.Scene {

    requestDir = null;
    headX = 15;
    headY = 15;
    headDir = RIGHT;
    bodyX = [];
    bodyY = [];
    bodySegments = [];
    bodyIndex = 0;
    bodyLength = 10;
    bodyLengthMax = 512;
    movedAtMs = null;
    moveMs = 16.66667 * 5;

    keydown(event) {
        switch (event.key) {
            case "ArrowUp":
                this.requestDir = UP;
                break;
            case "ArrowRight":
                this.requestDir = RIGHT;
                break;
            case "ArrowDown":
                this.requestDir = DOWN;
                break;
            case "ArrowLeft":
                this.requestDir = LEFT;
                break;
        }

    }

    keyup(event) {
        // Do nothing.
    }

    preload() {
        this.load.setBaseURL("/");

        this.load.image("bg", "assets/bg/grayblur.jpg");
        this.load.image("bodySegment", "assets/sprite/sphere.png");
    }

    create() {
        this.add.image(512, 512, "bg").setTint(0x005f00);

        // const sphere = this.physics.add.image(400, 100, "bodySegment");
        // sphere.setVelocity(100, 200);
        // sphere.setBounce(1, 1);
        // sphere.setCollideWorldBounds(true);

        for (let i = 0; i < this.bodyLengthMax; ++i) {
            const bodyPart = this.add.image(-1024, -1024, "bodySegment");
            bodyPart.setTint(0x2fff2f);
            bodyPart.setScale(0.125);
            bodyPart.setVisible(false);

            this.bodySegments.push(bodyPart);
        }

        this.input.keyboard.enabled = true;
        this.input.keyboard.addCapture("UP,RIGHT,DOWN,LEFT");
        this.input.keyboard.on("keydown", this.keydown, this);
        this.input.keyboard.on("keyup", this.keyup, this);
    }

    update(time, delta) {
        if (this.movedAtMs == null) {
            this.movedAtMs = time;
        } else if (time - this.movedAtMs >= this.moveMs) {
            this.movedAtMs += this.moveMs;
            switch (this.requestDir) {
                case UP:
                    if (this.headDir != DOWN) {
                        this.headDir = UP;
                    }
                    break;
                case RIGHT:
                    if (this.headDir != LEFT) {
                        this.headDir = RIGHT;
                    }
                    break;
                case DOWN:
                    if (this.headDir != UP) {
                        this.headDir = DOWN;
                    }
                    break;
                case LEFT:
                    if (this.headDir != RIGHT) {
                        this.headDir = LEFT;
                    }
                    break;
            }
            this.requestDir = null;

            switch (this.headDir) {
                case UP:
                    this.headY -= 1;
                    break;
                case RIGHT:
                    this.headX += 1;
                    break;
                case DOWN:
                    this.headY += 1;
                    break;
                case LEFT:
                    this.headX -= 1;
                    break;
            }
            this.bodySegments[this.bodyIndex].setPosition((this.headX * 32) + 16, (this.headY * 32) + 16);
            this.bodySegments[this.bodyIndex].setVisible(true);
            this.bodyIndex = (this.bodyIndex + 1) % this.bodyLength;
        }
    }
}

const config = {
    type: Phaser.AUTO,
    parent: "content",
    autoCenter: true,
    expandParent: true,
    scaleMode: Phaser.Scale.ScaleModes.FIT,
    width: 1024,
    height: 1024,
    scene: GameScene,
};

const game = new Phaser.Game(config);