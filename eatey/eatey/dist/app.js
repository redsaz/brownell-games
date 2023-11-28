"use strict";

const UP = Symbol("up");
const RIGHT = Symbol("right");
const DOWN = Symbol("down");
const LEFT = Symbol("left");

const GROW_AMOUNT = 10;
const DELAY_MS = 16.66666 * 5;
const START_X = 15;
const START_Y = 15;
const START_LENGTH = 4;
const MAX_BODY_LENGTH = 1024;
const BODY_TINT = 0x2fff2f;
const BACKGROUND_IMAGE = "assets/bg/grayblur.jpg";
const BACKGROUND_TINT = 0x005f00;
const FOOD_TINT = 0xffff00;
const LEVEL_WIDTH = 32;
const LEVEL_HEIGHT = 32;
const TILE_LENGTH = 32;


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
            const x = this.getRandomInt(0, LEVEL_WIDTH);
            const y = this.getRandomInt(0, LEVEL_HEIGHT);
            if (!this.isWall(x, y) && !this.isPlayer(x, y) && !this.isFood(x, y)) {
                const foodTile = this.levelmap.putTileAt(3, x, y, false, "dynLayer");
                foodTile.tint = FOOD_TINT;
                foundSpot = true;
            }
        }
    }

    preload() {
        this.load.setBaseURL(".");

        if (BACKGROUND_IMAGE) {
            this.load.image("bg", BACKGROUND_IMAGE);
        }
        this.load.image("tiles", 'assets/sprite/tiles32.png');
        this.load.tilemapCSV("levelmap", "assets/level/1.csv");
    }

    create() {
        if (BACKGROUND_IMAGE) {
            const bg = this.add.image(512, 512, "bg");
            if (BACKGROUND_TINT !== undefined && BACKGROUND_TINT !== null) {
                bg.setTint(BACKGROUND_TINT);
            }
        }

        this.levelmap = this.make.tilemap({ key: "levelmap", tileWidth: TILE_LENGTH, tileHeight: TILE_LENGTH });
        const tiles = this.levelmap.addTilesetImage("tiles", null, TILE_LENGTH, TILE_LENGTH, 0, 0);
        this.levelmap.createLayer(0, tiles, 0, 0);
        this.levelmap.createBlankLayer("dynLayer", tiles, 0, 0);

        this.input.keyboard.enabled = true;
        this.input.keyboard.addCapture("UP,RIGHT,DOWN,LEFT");
        this.input.keyboard.on("keydown", this.keydown, this);
        this.input.keyboard.on("keyup", this.keyup, this);

        // Reset these values every time the level is (re)started
        this.requestDir = null;
        this.headX = START_X;
        this.headY = START_Y;
        this.headDir = RIGHT;
        this.bodyX = Array(MAX_BODY_LENGTH);
        this.bodyY = Array(MAX_BODY_LENGTH);
        this.bodyHead = 0;
        this.bodyLength = START_LENGTH;
        this.movedAtMs = null;
        this.moveMs = DELAY_MS;
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
                    this.bodyLength += GROW_AMOUNT;
                    if (this.bodyLength > MAX_BODY_LENGTH) {
                        this.bodyLength = MAX_BODY_LENGTH;
                    }
                }
                // Put body piece in new position
                this.bodyX[this.bodyHead] = this.headX;
                this.bodyY[this.bodyHead] = this.headY;
                const playerTile = this.levelmap.putTileAt(2, this.headX, this.headY, false, "dynLayer");
                playerTile.tint = BODY_TINT;
                this.bodyHead = (this.bodyHead + 1) % MAX_BODY_LENGTH;

                // Remove body piece "tail"
                const tail = (this.bodyHead + MAX_BODY_LENGTH - this.bodyLength) % MAX_BODY_LENGTH;
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