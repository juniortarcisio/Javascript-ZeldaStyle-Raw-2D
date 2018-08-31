/* Game HP script by junior.tarcisio 2014 */
var game;
var player;
var CONS_SPRITE_SIZE = 3;

var pointer = new Object();
pointer.active = false;
pointer.x = 0;
pointer.y = 0;
pointer.ax = 0;
pointer.ay = 0;

cancelMasterAnimations = true;

var map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 0, 0, 5, 5, 1, 1, 1, 5, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 6, 0, 5, 1, 1, 5, 0, 0, 5, 0, 0, 1, 1, 1, 1, 1, 1],
    [1, 0, 6, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 6, 0, 5, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 6, 0, 7, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 5, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 7, 0, 5, 1],
    [1, 1, 1, 1, 1, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 0, 0, 6, 0, 2, 2, 2, 3, 4, 0, 0, 0, 6, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 0, 0, 0, 2, 3, 3, 3, 3, 0, 6, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 0, 3, 3, 4, 3, 4, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 1, 1],
    [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 0, 0, 6, 0, 0, 6, 0, 0, 5, 0, 6, 0, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 5, 0, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

//TODO: create single spr file with partial selecion (index*xpto_pixels)
var spriteList = [];
spriteList[0] = new Image;
spriteList[0].src = "spr0_grass.png";

spriteList[1] = new Image;
spriteList[1].src = "spr1_water.png";

spriteList[2] = new Image;
spriteList[2].src = "spr2_water.png";

//Under development tile system
var spriteTable = new Image;
spriteTable.src = "spriteTable.png";

function Tile(_name, _blockable, _frames) {
    this.name = _name;
    this.blockable = _blockable;
    this.frames = _frames;
    this.currentFrame = 0;
    this.frameTimer = Date.now();
}

var tiles = [];
tiles[0] = new Tile("grass", false, [0]);
tiles[1] = new Tile("water", true, [1, 2]);
tiles[2] = new Tile("floor", false, [3]);
tiles[3] = new Tile("floor", false, [4]);
tiles[4] = new Tile("floor", false, [5]);
tiles[5] = new Tile("stone", true, [6]);
tiles[6] = new Tile("grass", false, [7]);
tiles[7] = new Tile("fire", true, [8, 9]);

//function GetMapTile(x, y) {
//    return tiles[map[x, y]];
//}

/* Load compatible */
$(document).ready(function () {
    if (!document.getElementById("myCanvas").getContext) {
        return;
    }

    game = new Game();
    game.start();

    document.body.addEventListener("keydown", function (e) {
        game.keys[e.keyCode] = true;
        var key = e.keyCode || e.which;

        if (key == 13)
            document.getElementById('message').focus();
        //e.preventDefault();
        //return false;
    });
    document.body.addEventListener("keyup", function (e) {
        game.keys[e.keyCode] = false;
        //e.preventDefault();
        //return false;
    });

    document.getElementById('btn-send').addEventListener("click", speak);
    document.getElementById('message').addEventListener("keydown", (e) =>{
        var key = e.keyCode || e.which;
        if (key == 13)
            speak();
    })
});

var speak = () => {
    let inputMessage = document.getElementById('message');
    
    if (inputMessage.value.length == 0)
        return;

    speech.pos.x = player.pos.x + 5;
    speech.pos.y = player.pos.y + 3;
    speech.msg = 'Player: ' + inputMessage.value;
    speech.createdAt = new Date();

    inputMessage.value = '';
}

var TO_RADIANS = Math.PI / 180;
function drawRotatedImage(image, x, y, angle) {
    // save the current co-ordinate system 
    // before we screw with it
    game.ctx.save();

    // move to the middle of where we want to draw our image
    game.ctx.translate(x, y);

    // rotate around that point, converting our 
    // angle from degrees to radians 
    game.ctx.rotate(angle * TO_RADIANS);

    // draw it up and to the left by half the width
    // and height of the image 
    game.ctx.drawImage(image, -(image.width / 2), -(image.height / 2));

    // and restore the co-ords to how they were when we began
    game.ctx.restore();
}


function canvas_MouseDown(e) {
    pointer.active = true;

    pointer.x = Math.floor(e.offsetX / 72) - 5;
    pointer.y = Math.floor(e.offsetY / 72) - 4;

    pointer.ax = player.pos.x + pointer.x;
    pointer.ay = player.pos.y + pointer.y;

    var p = new Object();
    p.x = pointer.ax;
    p.y = pointer.ay;

    game.addComponent(new MagicEffect(p));

    //DebugClear();
    //DebugWrite("player.x: " + player.pos.x.toString());
    //DebugWrite("player.y: " + player.pos.y.toString());
    //DebugWrite("pos.x: " + pos.x.toString());
    //DebugWrite("pos.y: " + pos.y.toString());
}

//function canvas_MouseUp(e) {
//    pointer.pressed = false;
//}

//function canvas_MouseMove(e) {
//    if (pointer.pressed) {
//        pointer.active = true;
//        pointer.x = e.offsetX;
//        pointer.y = e.offsetY;
//    }
//}

/* Game Class --------------------------------------------------------------------------------------------- */

function Game() {
    this.canvas = document.getElementById("myCanvas");
    this.ctx = this.canvas.getContext("2d");

    this.score = 0;
    this.startTime = Date.now();
    this.lblscore = document.getElementById("lblscore");
    this.lbltimer = document.getElementById("lbltimer");
    this.pSetTimeout;

    this.keys = [];
    this.componentList = [];

    this.drawX;
    this.drawY;
}

Game.prototype.start = function () {
    player = new Player();
    this.addComponent(player);

    this.canvas.addEventListener("click", canvas_MouseDown, false);

    this.update();
}


Game.prototype.addComponent = function (c) {
    this.componentList[this.componentList.length] = c;
}

Game.prototype.update = function (c) {

    for (i = 0; i < game.componentList.length; i++) {
        if (game.componentList[i].update && game.componentList[i].alive)
            game.componentList[i].update();
    }

    this.draw();

    for (i = 0; i < game.componentList.length; i++) {
        if (game.componentList[i].draw && game.componentList[i].alive)
            game.componentList[i].draw();
    }

    game.pSetTimeout = window.setTimeout("game.update()", 16); //~60 ciclos per sec
}

Game.prototype.EndGame = function () {
    window.clearTimeout(pSetTimeout);
}

Game.prototype.ElapsedTime = function () {
    return Math.ceil((Date.now() - this.startTime) / 1000);
}

Game.prototype.TimeLeft = function () {
    return 30 - this.ElapsedTime();
}

var tileTimer = Date.now();
var tileFrame = 1;

Game.prototype.draw = function (c) {
    game.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
    game.ctx.beginPath();
    game.ctx.stroke();

    //Map draw -> createClass to handlermap.

    this.drawX = 24 * CONS_SPRITE_SIZE;
    this.drawY = 24 * CONS_SPRITE_SIZE;

    //Get moving percent to screen
    if (player.movingTo != null && player.movingPercent != null) {
        switch (player.movingTo) {
            case CONST_MOVING_TO_LEFT:
                this.drawX -= (24 * CONS_SPRITE_SIZE) * (player.movingPercent / 100);
                break;
            case CONST_MOVING_TO_UP:
                this.drawY += (24 * CONS_SPRITE_SIZE) * (player.movingPercent / 100);
                break;
            case CONST_MOVING_TO_RIGHT:
                this.drawX += (24 * CONS_SPRITE_SIZE) * (player.movingPercent / 100);
                break;
            case CONST_MOVING_TO_DOWN:
                this.drawY -= (24 * CONS_SPRITE_SIZE) * (player.movingPercent / 100);
                break;
        }
    }

    var tileID;
    var tile;

    //draw tile by tile
    for (var i = -1; i < 10; i++) {
        for (var j = -1; j < 12; j++) {

            //if position invalid in map array threat as water tile (1)
            if (typeof map[i + player.pos.y - 4] == "undefined")
                tileID = 1;

            else if (typeof map[i + player.pos.y - 4][j + player.pos.x - 5] == "undefined")
                tileID = 1;
            else
                tileID = map[i + player.pos.y - 4][j + player.pos.x - 5];

            tile = tiles[tileID];

            if (tile.frames.length > 1) {
                if (Date.now() - tile.frameTimer > 500) {
                    tile.frameTimer = Date.now();

                    if (tile.currentFrame < tile.frames.length - 1)
                        tile.currentFrame++;
                    else
                        tile.currentFrame = 0;
                }
            }

            game.ctx.drawImage(spriteTable,
                1,
                tile.frames[tile.currentFrame] * 24 + 1, //fucking bug on resizing sprite table UPPER/BOTTOM tile mixing 1px with current TILE on resize
                22,
                22, //fucking bug on resizing sprite table
                j * 24 * CONS_SPRITE_SIZE - this.drawX + 72,
                i * 24 * CONS_SPRITE_SIZE - this.drawY + 72,
                24 * CONS_SPRITE_SIZE,
                24 * CONS_SPRITE_SIZE);

            
            //Debugging tiles x, y
            if (debugMode) {
                //game.ctx.font = "13px Calibri";
                game.ctx.fillStyle = '#000';
                game.ctx.fillText((j + player.pos.x - 5).toString() + "-" + (i + player.pos.y - 4).toString(),
                    j * 24 * CONS_SPRITE_SIZE - this.drawX + 72 + 27,
                    i * 24 * CONS_SPRITE_SIZE - this.drawY + 36 + 75);

                //laggy rect 
                //game.ctx.rect(j * 24 * CONS_SPRITE_SIZE - this.drawX + 72,
                //              i * 24 * CONS_SPRITE_SIZE - this.drawY + 72,
                //              72,
                //              72);
                //game.ctx.stroke();
            }
        }
    }


    if (pointer.active) {
        //DebugClear();
        //DebugWrite("pointer.x: " + (pointer.x + 5).toString())
        //DebugWrite("pointer.y: " + (pointer.y + 4).toString())
        //game.ctx.rect(
        //              (pointer.ax - player.pos.x + 5) * 72 - this.drawX + 72,
        //              (pointer.ay - player.pos.y + 4) * 72 - this.drawY + 72,
        //              72,
        //              72);
        //game.ctx.stroke();

        game.ctx.beginPath();
        game.ctx.arc((pointer.ax - player.pos.x + 5) * 72 - this.drawX + 72 + 37,
                     (pointer.ay - player.pos.y + 4) * 72 - this.drawY + 72 + 36,
                     10, 0, 2 * Math.PI);
        game.ctx.fillStyle = '#ee3333';
        game.ctx.fill();
        game.ctx.lineWidth = 2;
        game.ctx.strokeStyle = '#ff6666';
        game.ctx.stroke();
    }

    if (speech && Date.now() - speech.createdAt < 5000) {
        game.ctx.textAlign="center";
        game.ctx.font = "18px Calibri";
        game.ctx.fillStyle = '#ff0';
        game.ctx.fillText(speech.msg,
            (speech.pos.x - player.pos.x) * 24 * CONS_SPRITE_SIZE - this.drawX + 72 + 27,
            (speech.pos.y - player.pos.y) * 24 * CONS_SPRITE_SIZE - this.drawY + 60 + 75);
    }

    if (debugMode) {
        DebugClear();
        DebugWrite("player.pos x:" + player.pos.x.toString() + " y:" + player.pos.y.toString());
        DebugWrite("player.speed: " + player.speed);
    }
}

var speech = {
    pos : { x : 10, y : 10 },
    msg : 'Blablabla bla bla...',
    createdAt : new Date() + 1
}

const debugMode = false;
function DebugWrite(text) {
    $("#debugger").append(text + "<br/>");
}

function DebugClear() {
    $("#debugger").text("");
}

/* Player Class ------------------------------------------------------------------------------------ */

var CONST_MOVING_TO_LEFT = 0;
var CONST_MOVING_TO_UP = 1;
var CONST_MOVING_TO_RIGHT = 2;
var CONST_MOVING_TO_DOWN = 3;

function Player() {
    this.pos = new Object();
    this.pos.x = new Number(5);
    this.pos.y = new Number(4);

    this.frames = [];
    this.frames[0] = new Image;
    this.frames[0].src = "player_00.png";

    this.frames[1] = new Image;
    this.frames[1].src = "player_01.png";

    this.frames[2] = new Image;
    this.frames[2].src = "player_02.png";
    this.currentFrame = 0;
    this.frameTimer = 0;

    this.img = this.frames[0];

    this.speed = 60;
    this.movingTo = null;
    this.movingPercent = null;

    this.alive = true
}

Player.prototype.update = function () {

    //apply key command
    if (this.movingTo == null) {
        if (game.keys[37])
            this.movingTo = CONST_MOVING_TO_LEFT;

        else if (game.keys[40])
            this.movingTo = CONST_MOVING_TO_UP;

        else if (game.keys[39])
            this.movingTo = CONST_MOVING_TO_RIGHT;

        else if (game.keys[38])
            this.movingTo = CONST_MOVING_TO_DOWN;

        if (this.movingTo != null) {
            this.movingPercent = 0;
            pointer.active = false; //desativa o ponteiro caso seja pressionada uma tecla
        }
    }

    //TODO: pathfind depois, tem que ser leve
    if (pointer.active && this.movingTo == null) {

        if (pointer.x < 0) {
            this.movingTo = CONST_MOVING_TO_LEFT;
            pointer.x++;
        }
        else if (pointer.x > 0) {
            this.movingTo = CONST_MOVING_TO_RIGHT;
            pointer.x--;
        }
        else if (pointer.y < 0) {
            this.movingTo = CONST_MOVING_TO_DOWN;
            pointer.y++;
        }
        else if (pointer.y > 0) {
            this.movingTo = CONST_MOVING_TO_UP;
            pointer.y--;
        }

        if (pointer.x == 0 && pointer.y == 0) {
            pointer.active = false;
        }
    }

    //check block sqm
    switch (this.movingTo) {
        case (CONST_MOVING_TO_LEFT):
            if (tiles[map[this.pos.y][this.pos.x - 1]].blockable)
                this.movingTo = null;
            break;
        case (CONST_MOVING_TO_RIGHT):
            if (tiles[map[this.pos.y][this.pos.x + 1]].blockable)
                this.movingTo = null;
            break;
        case (CONST_MOVING_TO_UP):
            if (tiles[map[this.pos.y + 1][this.pos.x]].blockable)
                this.movingTo = null;
            break;
        case (CONST_MOVING_TO_DOWN):
            if (tiles[map[this.pos.y - 1][this.pos.x]].blockable)
                this.movingTo = null;
            break;
    }

    //apply movement
    if (this.movingTo != null) {

        this.movingPercent += this.speed / 10;

        if (this.movingPercent >= 100) {
            switch (this.movingTo) {
                case CONST_MOVING_TO_LEFT:
                    this.pos.x--;
                    break;
                case CONST_MOVING_TO_UP:
                    this.pos.y++;
                    break;
                case CONST_MOVING_TO_RIGHT:
                    this.pos.x++;
                    break;
                case CONST_MOVING_TO_DOWN:
                    this.pos.y--;
                    break;
            }
            this.movingTo = null;
            this.movingPercent = null;
        }
    }
    else {
        this.movingPercent = null;
    }

    if (this.movingPercent != null) {
        if (this.movingPercent < 20)
            this.currentFrame = 1;
        else if (this.movingPercent < 40)
            this.currentFrame = 2;
        else if (this.movingPercent < 60)
            this.currentFrame = 0;
        else if (this.movingPercent < 80)
            this.currentFrame = 1;
        else
            this.currentFrame = 2;
    }
    else {
        this.currentFrame = 0;
    }

    this.img = this.frames[this.currentFrame];
}

Player.prototype.draw = function () {

    game.ctx.drawImage(this.img,
        5 * 24 * CONS_SPRITE_SIZE,
        4 * 24 * CONS_SPRITE_SIZE,
        this.img.width * CONS_SPRITE_SIZE,
        this.img.height * CONS_SPRITE_SIZE);


}


/* Magic Effect Class ------------------------------------------------------------------------------------ */

function MagicEffect(position) {
    this.pos = new Object();
    this.pos.x = position.x;
    this.pos.y = position.y;

    this.frames = [];

    this.frames[0] = new Image;
    this.frames[0].src = "blood_05.png";

    this.frames[1] = new Image;
    this.frames[1].src = "blood_04.png";

    this.frames[2] = new Image;
    this.frames[2].src = "blood_03.png";

    this.frames[3] = new Image;
    this.frames[3].src = "blood_02.png";

    this.frames[4] = new Image;
    this.frames[4].src = "blood_01.png";

    this.frames[5] = new Image;
    this.frames[5].src = "blood_00.png";

    this.frames[6] = new Image;
    this.frames[6].src = "blood_01.png";

    this.frames[7] = new Image;
    this.frames[7].src = "blood_02.png";

    this.frames[8] = new Image;
    this.frames[8].src = "blood_03.png";

    this.frames[9] = new Image;
    this.frames[9].src = "blood_04.png";

    this.frames[10] = new Image;
    this.frames[10].src = "blood_05.png";

    this.currentFrame = 0;
    this.angle = 0;
    this.frameTimer = Date.now();

    this.img = this.frames[this.currentFrame];
    this.alive = true;
}

MagicEffect.prototype.update = function () {
    if (Date.now() - this.frameTimer > 30 && this.currentFrame < this.frames.length) {
        this.frameTimer = Date.now();
        this.currentFrame++;

        this.img = this.frames[this.currentFrame];
    }
}

MagicEffect.prototype.draw = function () {

    if (typeof this.img == "undefined")
        return;

    game.ctx.drawImage(this.img,
        (this.pos.x - player.pos.x + 5) * 72 - game.drawX + 72,// - (this.img.width * CONS_SPRITE_SIZE),
        (this.pos.y - player.pos.y + 4) * 72 - game.drawY + 72,// - (this.img.height * CONS_SPRITE_SIZE),
        this.img.width * CONS_SPRITE_SIZE, this.img.height * CONS_SPRITE_SIZE);
}
