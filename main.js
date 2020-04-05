'use strict';

const screenLength = document.getElementById('screen').clientWidth;
const noOfCells = 50;

function randomInt(min, max, divBy = 1) {
    const random = min + Math.floor((max - min) * Math.random());
    // Only integers divisible by divBy
    return random - (random % divBy);
}

class Vector2D {
    constructor(x, y) {
        this.setPos(x, y);
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    set x(val) {
        this._x = val;
    }

    set y(val) {
        this._y = val;
    }

    setPos(x, y) {
        this._x = x;
        this._y = y;
    }

    toString() {
        return this._x + ", " + this._y;
    }
}

class Cell {
    constructor(pos, color = '#ff0000') {
        if (!(pos instanceof Vector2D)) {
            throw "pos argument should be Vector2D!";
        }

        this.color = color;
        this._pos = new Vector2D(pos.x, pos.y);
    }

    draw(ctx) {
        ctx.fillStyle = this._color;
        ctx.fillRect(this._pos.x, this._pos.y, Cell.edgeLength, Cell.edgeLength);
    }

    intersects(cell) {
        return this.pos.x == cell.pos.x && this.pos.y == cell.pos.y;
    }

    get pos() {
        return this._pos;
    }

    set pos(val) {
        this._pos = val;
    }

    set color(val) {
        if (typeof (val) != "string")
            throw "Color has to be a string!";

        this._color = val;
    }

    get color() {
        return this._color;
    }

    static get edgeLength() {
        return screenLength / noOfCells;
    }
}

class Snake {
    constructor(numOfSegs = 2) {
        if (numOfSegs < 2)
            numOfSegs = 2;

        this._body = new Array();
        this._numOfSegs = 0;

        for (let i = 0; i <= numOfSegs; i++)
            this.grow();

        this._direction = 'u';
    }

    grow() {
        if (this._body.length == 0) {
            this._body.push(new Cell(new Vector2D((randomInt(0, screenLength, Cell.edgeLength)) - Cell.edgeLength,
                screenLength / 2)));
        }
        else {
            // New cell position is translated down 
            let newPos = new Vector2D(this._body[this._numOfSegs - 1].pos.x,
                this._body[this._numOfSegs - 1].pos.y - Cell.edgeLength);

            // Prevent new cells from spawning out of screen
            if (newPos.y > screenLength) {
                // If we are near the left screen edge
                if (newPos.x - Cell.edgeLength < 0) {
                    newPos.x = this._body[this._numOfSegs - 1].pos.x + Cell.edgeLength;
                }
                // If we are near the right screen edge
                else if (newPos.x + Cell.edgeLength >= screenLength) {
                    newPos.x = this._body[this._numOfSegs - 1].pos.x - Cell.edgeLength;
                }
                else {
                    newPos.x = this._body[this._numOfSegs - 1].pos.x + Cell.edgeLength;
                }
            }

            this._body.push(new Cell(newPos));
        }

        this._numOfSegs++;
    }

    draw(ctx) {
        for (const seg of this._body) {
            seg.draw(ctx);
        }
    }

    _getNewPos() {
        const newPos = new Vector2D(this._body[0].pos.x, this._body[0].pos.y);

        switch (this._direction) {
            case 'l':
                newPos.x -= Cell.edgeLength;
                break;

            case 'u':
                newPos.y -= Cell.edgeLength;
                break;

            case 'r':
                newPos.x += Cell.edgeLength;
                break;

            case 'd':
                newPos.y += Cell.edgeLength;
                break;
        }

        return newPos;
    }

    move() {
        const newPos = this._getNewPos();
        const newBody = Array.from(this._body);

        for (let i = this._body.length - 1; i > 0; i--) {
            newBody[i].pos = this._body[i - 1].pos;
        }

        // Remove the first cell
        newBody.shift();
        // Add a cell to the front with new pos
        newBody.unshift(new Cell(new Vector2D(newPos.x, newPos.y)));
        this._body = newBody;
    }

    get head() {
        return this._body[0];
    }

    get direction() {
        return this._direction;
    }

    set direction(val) {
        if ((val === 'l' && this._direction !== 'r') ||
            (val === 'r' && this._direction !== 'l') ||
            (val === 'u' && this._direction !== 'd') ||
            (val === 'd' && this._direction !== 'u'))
            this._direction = val;
    }
}

class Game {
    constructor() {
        this._ctx = document.getElementById('screen').getContext('2d');
        this._snake = new Snake(3);
        this._apple = this.newApple();
        setInterval(() => this.update(), 100);

        document.addEventListener('keydown', (e) => {
            const keyName = e.key;

            switch (keyName) {
                case "a":
                    this._snake.direction = 'l';
                    break;

                case "d":
                    this._snake.direction = 'r';
                    break;

                case "s":
                    this._snake.direction = 'd';
                    break;

                case "w":
                    this._snake.direction = 'u';
            }
        }, false);
    }

    clear() {
        this._ctx.clearRect(0, 0, screenLength, screenLength);
    }

    update() {
        this.clear();
        this.manageCollisions();
        this._snake.move();
        this._apple.draw(this._ctx);
        this._snake.draw(this._ctx);
    }

    newApple() {
        console.log("New apple has appeared");
        return new Cell(new Vector2D(randomInt(0, screenLength, Cell.edgeLength),
            randomInt(0, screenLength, Cell.edgeLength)), '#00ff00');
    }

    manageCollisions() {
        if (this._apple.intersects(this._snake.head)) {
            this._apple = this.newApple();
            this._snake.grow();
        }
    }
}

const snakeGame = new Game;