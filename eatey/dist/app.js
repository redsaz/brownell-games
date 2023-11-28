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
    bodyIndex = 0;
    bodyLength = 10;
    bodyLengthMax = 512;
    movedAtMs = null;
    moveMs = 16.66667 * 5;
    levelMap = null;

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
        this.load.setBaseURL(".");

        this.load.image("bg", "assets/bg/grayblur.jpg");
        this.load.image("tiles", 'assets/sprite/tiles32.png');
        this.load.tilemapCSV("levelmap", "assets/level/1.csv");
    }

    create() {
        this.add.image(512, 512, "bg").setTint(0x005f00);

        this.levelmap = this.make.tilemap({ key: "levelmap", tileWidth: 32, tileHeight: 32 });
        const tiles = this.levelmap.addTilesetImage("tiles", null, 32, 32, 0, 0);
        this.levelmap.createLayer(0, tiles, 0, 0);
        this.levelmap.createBlankLayer("playerLayer", tiles, 0, 0);

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

            // Put body piece in new position
            this.bodyX[this.bodyIndex] = this.headX;
            this.bodyY[this.bodyIndex] = this.headY;
            const playerTile = this.levelmap.putTileAt(2, this.headX, this.headY, false, "playerLayer");
            playerTile.tint = 0x2fff2f;

            // Remove body piece "tail"
            this.bodyIndex = (this.bodyIndex + 1) % this.bodyLength;
            this.levelmap.removeTileAt(this.bodyX[this.bodyIndex], this.bodyY[this.bodyIndex], true, false, "playerLayer");
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