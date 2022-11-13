import {puzzle, isCoordInBounds,gridToWorldCoordinates,worldToGridCoordinates} from "./puzzle.js";
import {theme} from "./theme.js";

function initializeCursor(app)
{
    input.createCursor(app.stage);
}

class Input  {
    //mouse == cursor... for now!
    //config
    cursorSpriteSize = 64;//can we calculate this?
    cursorSprite = null;
    //usage
    pressed = false;
    setToFill = false;//when we click, trying to fill or trying to un-fill or what
    mouseWorldCoords = {x:0,y:0};
    mouseGridCoords = {x:0,y:0};
    cursorGridCoords = {x:0,y:0};
    cursorWorldCoords = {x:0,y:0};
    //functions
    tick()
    {
        //mouse world + pressed have been updated by events.
        this.mouseGridCoords = worldToGridCoordinates(this.mouseWorldCoords.x,this.mouseWorldCoords.y);
        //move cursor
        //todo: lerp
        if(this.cursorGridCoords.x !== this.mouseGridCoords.x || this.cursorGridCoords.y !== this.mouseGridCoords.y)
        {
            //if distance > 1, break
            if(this.pressed)
            {
                //allows us to click/drag over tiles.
                if(isCoordInBounds(this.mouseGridCoords)){
                    if(this.setToFill !== puzzle.level[this.mouseGridCoords.x][this.mouseGridCoords.y].filled)
                    {
                        puzzle.level[this.mouseGridCoords.x][this.mouseGridCoords.y].setFilled(this.setToFill);
                    }
                }
            }
            this.cursorGridCoords = this.mouseGridCoords;
        }

        this.cursorWorldCoords = gridToWorldCoordinates(this.mouseGridCoords.x,this.mouseGridCoords.y);
        this.cursorSprite.x = this.cursorWorldCoords.x;
        this.cursorSprite.y = this.cursorWorldCoords.y;
    }
    createCursor(stage){
        this.cursorSprite = PIXI.Sprite.from("..//img/cursor.png");
        this.cursorSprite.scale.set(puzzle.boxDisplaySize/this.cursorSpriteSize);//match box, only want to do the math once :p
        this.cursorSprite.tint = theme.cursorColor;
        let c = gridToWorldCoordinates(0,0);
        this.cursorSprite.x = c.x;
        this.cursorSprite.y = c.y;
        this.cursorSprite.roundPixels = true;
        stage.addChild(this.cursorSprite);
    }
    onPointerDown(){
        this.pressed = true;
        puzzle.level[this.cursorGridCoords.x][this.cursorGridCoords.y].flip();
        this.setToFill = puzzle.level[this.cursorGridCoords.x][this.cursorGridCoords.y].filled;
    }
    onPointerUp()
    {
        this.pressed = false;
    }
}

const input = new Input();
export {input,initializeCursor};