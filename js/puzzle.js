import {theme} from "./theme.js";
import {createHints} from "./hints.js";
import {input} from "./input.js";

//make a class? it is kind of just data.
const puzzle = {
    width: 5,//cols
    height: 5,// rows
    soution: [],//given
    level: [],//user input
    rowHints: [],
    colHints: [],
    rowHintItems: [],
    colHintItems: [],
    changedThisTick: false,
    isSolved: function(){
        return this.rowHintItems.every(x => x.isCorrect) && this.colHintItems.every(x => x.isCorrect);
    }
}

const padding = {x:2,y:2};
const field = new PIXI.Container();
const white = PIXI.Texture.from("../img/white.png");
const boxElements = [];//pile of grid sprites


//A single grid. Keeps track of it's position, draws itself, and changes color as needed.
class PuzzleSquare {
    constructor(x,y,square,mark) {
        this.x = x;
        this.y = y;
        this.filled = 0;
        this.box = square
        this.mark = mark;
        this.box.tint = theme.emptyColor;

        this.mark.visible = false;
    }
    isFilled(){return this.filled === 1};
    isMarkEmpty(){return this.filled === -1}
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
    flipEmpty()
    {
        if(this.isMarkEmpty())
        {
            this.setFilled(0);
        }else{
            this.setFilled(-1);
        }
    }
    cycle()
    {
        if(this.filled === 0)
        {
            this.setFilled(1);
        }else if(this.filled === 1)
        {
            this.setFilled(-1);
        }else{
            this.setFilled(0);
        }
    }
    setFilled(f)
    {
        this.filled = f;
        this.box.tint = this.filled === 1 ? theme.filledColor : theme.emptyColor;
        this.box.tint = this.filled === -1 ? theme.emptyColor : this.box.tint;
        if(this.filled === -1){
            this.mark.visible = true;
            this.mark.tint = theme.markedEmptyColor;
        }else{
            this.mark.visible = false;
        }
        //todo: draw an x?
        puzzle.changedThisTick = true;
        input.lastChanged = {x:this.x,y:this.y};
    }
}

function initializeGrid(app){
    //initialize level + grid
    for (let i = 0; i < puzzle.width; i++) {
        puzzle.level[i] = [];
        for(let j = 0; j < puzzle.height; j++) {
            // create a Sprite for the box.
            const square = PIXI.Sprite.from(white);//16x16
            const mark = PIXI.Sprite.from("img/x32.png");
            // set the anchor point to the top left.
            square.anchor.set(0,0);
            mark.anchor.set(0,0);

            let scale = theme.boxDisplaySize/16;//16 = texture->width
            let markScale = theme.boxDisplaySize/32; //32 wide for x32.png
            square.scale.set(scale);
            mark.scale.set(markScale);

            let c = gridToWorldCoordinates(i,j);
            square.x = c.x;
            square.y = c.y;
            mark.x = c.x;
            mark.y = c.y;

            boxElements.push(square);
            boxElements.push(mark);
            puzzle.level[i][j] = new PuzzleSquare(i,j,square,mark);
            field.addChild(square);
            field.addChild(mark);

        }
    }

    // Move container to the center
    field.x = (app.screen.width / 2) - (theme.boxDisplaySize*puzzle.width/2);
    field.y = (app.screen.height / 2) - (theme.boxDisplaySize*puzzle.height/2);
    app.stage.addChild(field);
}

function createPuzzle()
{
    puzzle.solution = [];

    puzzle.solution.push([1,1,1,1,1]);
    puzzle.solution.push([1,0,1,1,1]);
    puzzle.solution.push([1,0,0,1,1]);
    puzzle.solution.push([1,0,0,0,1]);
    puzzle.solution.push([1,0,0,0,0]);


    //todo load data
    createHints();

}
//save/load
//serialize/deserialize

//Utility functions
function gridToWorldCoordinates(x,y)
{
    return {x:x*theme.boxDisplaySize+padding.x+field.x,y:y*theme.boxDisplaySize+padding.y+field.y};
}
function worldToGridCoordinates(wx,wy)
{
    return {x:Math.floor((wx-field.x-padding.x)/theme.boxDisplaySize),y:Math.floor((wy-field.y-padding.y)/theme.boxDisplaySize)};
}
function isCoordInBounds(c)
{
    return c.x >= 0 && c.x < puzzle.width && c.y >= 0 && c.y< puzzle.height;
}

export {puzzle, field, initializeGrid,createPuzzle,gridToWorldCoordinates,worldToGridCoordinates, isCoordInBounds};