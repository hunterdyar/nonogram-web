import {theme} from "./theme.js";

//make a class? it is kind of just data.
const puzzle = {
    boxDisplaySize: 64,//display size
    width: 5,//cols
    height: 5,// rows
    level: [],
    rowHints: [],
    colHints: [],
    rowHintItems: [],
    colHintItems: [],
    changedThisTick: false,
}

const padding = {x:0,y:0};
const field = new PIXI.Container();
const white = PIXI.Texture.from("../img/white.png");
const boxElements = [];//pile of grid sprites


//A single grid. Keeps track of it's position, draws itself, and changes color as needed.
class PuzzleSquare {
    constructor(x,y,square) {
        this.x = x;
        this.y = y;
        this.filled = 0;
        this.box = square
        this.box.tint = theme.emptyColor;
    }
    isFilled(){return this.filled === 1};
    filled = 0;//todo: replace with Enum when we switch to typescript.
    solverFilled = 0;
    flip()
    {
        if(this.isFilled())
        {
            this.setFilled(0);
        }else{
            this.setFilled(1);
        }
    }
    setFilled(f)
    {
        this.filled = f;
        this.box.tint = this.filled === 1 ? theme.filledColor : theme.emptyColor;
        //todo: draw an x?
        puzzle.changedThisTick = true;
    }
}

function initializeGrid(app){
    //initialize level + grid
    for (let i = 0; i < puzzle.width; i++) {
        puzzle.level[i] = [];
        for(let j = 0; j < puzzle.height; j++) {
            // create a Sprite for the box.
            const square = PIXI.Sprite.from(white);//16x16
            // set the anchor point to the top left.
            square.anchor.set(0,0);
            let scale = puzzle.boxDisplaySize/16;//16 = texture->width
            square.scale.set(scale);

            let c = gridToWorldCoordinates(i,j);
            square.x = c.x;
            square.y = c.y;

            square.tint = theme.emptyColor;

            boxElements.push(square);
            puzzle.level[i][j] = new PuzzleSquare(i,j,square);
            field.addChild(square);
        }
    }

    // Move container to the center
    field.x = (app.screen.width / 2) - (puzzle.boxDisplaySize*puzzle.width/2);
    field.y = (app.screen.height / 2) - (puzzle.boxDisplaySize*puzzle.height/2);
    app.stage.addChild(field);
}

//save/load
//serialize/deserialize

//Utility functions
function gridToWorldCoordinates(x,y)
{
    return {x:x*puzzle.boxDisplaySize+padding.x+field.x,y:y*puzzle.boxDisplaySize+padding.y+field.y};
}
function worldToGridCoordinates(wx,wy)
{
    return {x:Math.floor((wx-field.x-padding.x)/puzzle.boxDisplaySize),y:Math.floor((wy-field.y-padding.y)/puzzle.boxDisplaySize)};
}
function isCoordInBounds(c)
{
    return c.x >= 0 && c.x < puzzle.width && c.y >= 0 && c.y< puzzle.height;
}

export {puzzle, field, initializeGrid,gridToWorldCoordinates,worldToGridCoordinates, isCoordInBounds};