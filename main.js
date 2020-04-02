'use strict';

const screenLength = document.getElementById('screen').clientWidth;
const noOfCells = 48;

function randomInt(min, max) {
    return min + Math.floor((max - min) * Math.random());
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

        this._edgeLength = screenLength / noOfCells;
        this.color = color;
        this._pos = new Vector2D(pos.x, pos.y);
    }

    draw(ctx) {
        ctx.fillStyle = this._color;
        ctx.fillRect(this._pos.x, this._pos.y, this._edgeLength, this._edgeLength);
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

    get edgeLength() {
        return this._edgeLength;
    }

    set edgeLength(val) {
        this._edgeLength = val;
    }
}

class Snake {
    constructor(numOfSegs = 2) {
        if (numOfSegs < 2)
            numOfSegs = 2;

        this._numOfSegs = numOfSegs;
        this._initBody(this._numOfSegs);
        this._direction = 'u';
    }

    _initBody(numOfSegs) {
        let yPos = screenLength / 2;
        // Insert first cell at random x pos
        this._body = [new Cell(new Vector2D(randomInt(0, screenLength), yPos))];
        this._cellEdgeLength = this._body[0]._edgeLength;

        for (let i = 0; i < numOfSegs - 1; i++) {
            // Next cell is translated edgeLength units down 
            yPos += this._body[0]._edgeLength;
            this._body.push(new Cell(new Vector2D(this._body[0]._pos.x, yPos)));
        }
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
                newPos.x -= this._cellEdgeLength;
                break;

            case 'u':
                newPos.y -= this._cellEdgeLength;
                break;

            case 'r':
                newPos.x += this._cellEdgeLength;
                break;

            case 'd':
                newPos.y += this._cellEdgeLength;
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
        this._snake = new Snake(20);
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
        this._snake.draw(this._ctx);
        this._snake.move();
    }
}

const snakeGame = new Game;