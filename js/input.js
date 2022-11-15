import {puzzle, isCoordInBounds,gridToWorldCoordinates,worldToGridCoordinates} from "./puzzle.js";
import {theme} from "./theme.js";
import {keyboard} from "./keyboard.js";

function initializeCursor(app)
{
    input.createCursor(app.stage);
}

class Input  {
    //mouse == cursor... for now!
    //config
    inputMode = 'mouse';
    cursorSpriteSize = 64;//can we calculate this?
    cursorSprite = null;
    //usage
    pressed = false;
    setToFill = false;//when we click, trying to fill or trying to un-fill or what
    mouseWorldCoords = {x:0,y:0};
    mouseGridCoords = {x:0,y:0};
    cursorGridCoords = {x:0,y:0};
    cursorWorldCoords = {x:0,y:0};
    lastChanged = {x:0,y:0}
    //functions
    tick()
    {
        keyboard.tick();
        if(this.inputMode === 'keyboard'){
            this.checkKeyboard();
        }

        //mouse input
        if(this.inputMode === 'mouse'){
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
                        if(this.setToFill !== puzzle.level[this.mouseGridCoords.x][this.mouseGridCoords.y].isFilled())
                        {
                            puzzle.level[this.mouseGridCoords.x][this.mouseGridCoords.y].setFilled(this.setToFill);
                        }
                    }
                }
                this.cursorGridCoords = this.mouseGridCoords;
            }
        }
        //after input checks


        //update cursor
        this.cursorWorldCoords = gridToWorldCoordinates(this.cursorGridCoords.x,this.cursorGridCoords.y);
        this.cursorSprite.x = this.cursorWorldCoords.x;
        this.cursorSprite.y = this.cursorWorldCoords.y;

        //if mouse press, switch to mouse mode...
            //handled in pointer events.

        //if keyboard press, switch to keyboard mode
        if(this.inputMode !== 'keyboard' && this.checkSwitchToKeyboardMode())
        {
            console.log("switch to keyboard input");
            this.inputMode = 'keyboard';
        }
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
    onSelect(){
        this.pressed = true;
        puzzle.level[this.cursorGridCoords.x][this.cursorGridCoords.y].cycle();//.fip();
        this.setToFill = puzzle.level[this.cursorGridCoords.x][this.cursorGridCoords.y].filled;
    }
    onPointerDown()
    {
        if(input.inputMode === 'mouse'){
            this.onSelect();
        }else{
            console.log("switch to mouse input");
            input.inputMode = 'mouse';
        }
    }
    onPointerUp()
    {
        if(input.inputMode === 'mouse')
        {
            this.pressed = false;
        }
    }

    moveCursor(dx,dy, wrap)
    {
        this.cursorGridCoords.x = this.cursorGridCoords.x+dx;
        this.cursorGridCoords.y = this.cursorGridCoords.y+dy;
        //wrap
        if(this.cursorGridCoords.x < 0)
        {
            this.cursorGridCoords.x = wrap? puzzle.width-1 : 0;
        }
        if(this.cursorGridCoords.y < 0)
        {
            this.cursorGridCoords.y = wrap? puzzle.height-1 : 0;
        }
        if(this.cursorGridCoords.x >= puzzle.width)
        {
            this.cursorGridCoords.x = wrap ? 0 : puzzle.width-1;
        }
        if(this.cursorGridCoords.y >= puzzle.height)
        {
            this.cursorGridCoords.y = wrap ? 0 : puzzle.height-1;
        }
        //hold and move
        if(this.pressed)
        {
            if(this.setToFill !== puzzle.level[this.cursorGridCoords.x][this.cursorGridCoords.y].filled)
            {
                puzzle.level[this.cursorGridCoords.x][this.cursorGridCoords.y].setFilled(this.setToFill);
            }
        }
    }
    checkSwitchToKeyboardMode()
    {
        return keyboard.anyKeyDown();
    }
    checkKeyboard()
    {
        if(keyboard.upButton.isPressed)
        {
            this.moveCursor(0,-1,true);
        }
        if(keyboard.downButton.isPressed)
        {
            this.moveCursor(0,1,true);
        }
        if(keyboard.leftButton.isPressed)
        {
            this.moveCursor(-1,0,true);
        }
        if(keyboard.rightButton.isPressed)
        {
            this.moveCursor(1,0,true);
        }
        if(keyboard.flipButton.isPressed)
        {
            this.onSelect();
        }
        this.pressed = keyboard.flipButton.isDown;
    }
}

const input = new Input();
export {input,initializeCursor};