"use strict";

const UP = Symbol("up");
const RIGHT = Symbol("right");
const DOWN = Symbol("down");
const LEFT = Symbol("left");

class GameScene extends Phaser.Scene {

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

    isWall(x, y) {
        const candidate = this.levelmap.getTileAt(x, y, false, 0);
        return candidate !== null && candidate.index == 1;
    }

    isPlayer(x, y) {
        const candidate = this.levelmap.getTileAt(x, y, false, "dynLayer");
        return candidate !== null && candidate.index == 2;
    }

    isFood(x, y) {
        const candidate = this.levelmap.getTileAt(x, y, false, "dynLayer");
        return candidate !== null && candidate.index == 3;
    }

    getRandomInt(min, max) {
        return min + Math.floor(Math.random() * (max - min));
    }

    placeFood() {
        let foundSpot = false;
        while (!foundSpot) {
            const x = this.getRandomInt(0, 32);
            const y = this.getRandomInt(0, 32);
            if (!this.isWall(x, y) && !this.isPlayer(x, y) && !this.isFood(x, y)) {
                const foodTile = this.levelmap.putTileAt(3, x, y, false, "dynLayer");
                foodTile.tint = 0xffff00;
                foundSpot = true;
            }
        }
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
        this.levelmap.createBlankLayer("dynLayer", tiles, 0, 0);

        this.input.keyboard.enabled = true;
        this.input.keyboard.addCapture("UP,RIGHT,DOWN,LEFT");
        this.input.keyboard.on("keydown", this.keydown, this);
        this.input.keyboard.on("keyup", this.keyup, this);

        // Reset these values every time the level is (re)started
        this.requestDir = null;
        this.headX = 15;
        this.headY = 15;
        this.headDir = RIGHT;
        this.bodyLengthMax = 1024;
        this.bodyX = Array(this.bodyLengthMax);
        this.bodyY = Array(this.bodyLengthMax);
        this.bodyHead = 0;
        this.bodyLength = 4;
        this.movedAtMs = null;
        this.moveMs = 16.66667 * 5;
        this.levelMap = null;

        this.placeFood();
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
            // Check if head collided with anything
            if (this.isWall(this.headX, this.headY) || this.isPlayer(this.headX, this.headY)) {
                this.scene.restart();
            } else {
                if (this.isFood(this.headX, this.headY)) {
                    this.levelmap.removeTileAt(this.headX, this.headY, true, false, "dynLayer");
                    this.placeFood();
                    this.bodyLength += 10;
                    if (this.bodyLength > this.bodyLengthMax) {
                        this.bodyLength = this.bodyLengthMax;
                    }
                }
                // Put body piece in new position
                this.bodyX[this.bodyHead] = this.headX;
                this.bodyY[this.bodyHead] = this.headY;
                const playerTile = this.levelmap.putTileAt(2, this.headX, this.headY, false, "dynLayer");
                playerTile.tint = 0x2fff2f;
                this.bodyHead = (this.bodyHead + 1) % this.bodyLengthMax;

                // Remove body piece "tail"
                const tail = (this.bodyHead + this.bodyLengthMax - this.bodyLength) % this.bodyLengthMax;
                this.levelmap.removeTileAt(this.bodyX[tail], this.bodyY[tail], true, false, "dynLayer");
                this.bodyX[tail] = undefined;
                this.bodyY[tail] = undefined;
            }
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