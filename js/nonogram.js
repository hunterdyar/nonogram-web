
const theme = {
    //https://lospec.com/palette-list/insecta
    backgroundColor: 0x7c8381,
    emptyColor: 0xd9cbae,
    filledColor: 0x21a1417,
    hintTextColor: 0x1a1417,
    errorColor: 0xaf4b3b,
}

//set width to html width?
//tbh we should do full-page and use an iframe.
const app = new PIXI.Application({
    antialias: true,
    background: theme.backgroundColor
});
let HTMLContainer = document.getElementById('app');
HTMLContainer.appendChild(app.view);
// document.body.appendChild(app.view);

const field = new PIXI.Container();
const hints = new PIXI.Container();
app.stage.addChild(field);
// create an array to store all the sprites
const boxElements = [];//pile of grid sprites
const hintElements = [];//pile of text boxes

const puzzle = {
    boxDisplaySize: 64,//display size
    width: 5,//cols
    height: 5,// rows
    level: [],
    rowHints: [],
    colHints: [],
    rowHintItems: [],
    colHintItems: []
}
const input = {
    //mouse == cursor... for now!
    mouseWorldCoords: {x:0,y:0},
    mouseGridCoords: {x:0,y:0},
    cursorGridCoords: {x:0,y:0},
    cursorCoords: {x:0,y:0},
    cursorSprite: null,
    tick: function()
    {
        this.mouseGridCoords = worldToGridCoordinates(this.mouseWorldCoords.x,this.mouseWorldCoords.y);
        //move cursor
        //todo: lerp
        this.cursorGridCoords = this.mouseGridCoords;//animation is uh... todo
        this.cursorCoords = gridToWorldCoordinates(this.mouseGridCoords.x,this.mouseGridCoords.y);
        this.cursorSprite.x = this.cursorCoords.x;
        this.cursorSprite.y = this.cursorCoords.y;
    },
    onPointerDown: function(){
        puzzle.level[this.cursorGridCoords.x][this.cursorGridCoords.y].flip();
        createHints();
    }
}
console.log("configure input");
//extra push. This is after centering, so 0 by default is fine.
const padding = {x:0,y:0};
//todo: replace with spritesheet.
const white = PIXI.Texture.from("../img/white.png");
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
        //level data
        puzzle.level[i][j] = {
            x: i,
            y: j,
            filled:false,
            box:square,
            flip: function(){
                this.setFilled(!this.filled);
                },
            setFilled: function(f)
            {
                this.filled = f;
                this.box.tint = this.filled ? theme.filledColor : theme.emptyColor;
            }
        };

        field.addChild(square);
    }
}

//Recalculates hints and creates text items that get added to the "hints" container
function createHints()
{
    //clear existing hints
    hints.removeChildren();
    hintElements.splice(0,hintElements.length);//clear hintElements
    //RECALCULATE hints
    //recalc ROWS
    puzzle.rowHints = [];
    for(let r = 0;r<puzzle.height;r++)
    {
        let prevFilled = false;
        let blockNumber = 0;
        puzzle.rowHints[r] = [];
        puzzle.rowHints[r][blockNumber] = 0;

        for(let c = 0;c<puzzle.width;c++){
            if(puzzle.level[c][r].filled)
            {
                //we have a block
                if(prevFilled)
                {
                    puzzle.rowHints[r][blockNumber] += 1;
                }else{
                    blockNumber++;
                    puzzle.rowHints[r][blockNumber] = 1;//initialize new hint
                }
                prevFilled = true;//set previous
            }else{
                prevFilled = false;//set previous
            }
        }
        puzzle.rowHints[r].shift();
        puzzle.rowHints[r].reverse();
    }
    //recalc COLS
    puzzle.colHints = [];
    for(let c = 0;c<puzzle.width;c++)
    {
        let blockNumber = 0;
        let prevFilled = false;
        puzzle.colHints[c] = [];
        puzzle.colHints[c][blockNumber] = 0;

        for(let r = 0;r<puzzle.width;r++){
            if(puzzle.level[c][r].filled)
            {
                //we have a block
                if(prevFilled)
                {
                    puzzle.colHints[c][blockNumber] += 1;
                }else{
                    blockNumber++;
                    puzzle.colHints[c][blockNumber] = 1;//initialize new hint
                }
                prevFilled = true;//set previous
            }else{
                prevFilled = false;//set previous
            }
        }
        puzzle.colHints[c].shift();
        puzzle.colHints[c].reverse();
    }

    //DRAW the hints
    function createHint(gridX,gridY,value)
    {
        let world = gridToWorldCoordinates(gridX,gridY);
        let hint = {
            x: gridX,
            y: gridY,
            value:  value,
            text: new PIXI.Text(value.toString(),{
                align: 'center',
                fontSize: puzzle.boxDisplaySize,
                fill: theme.hintTextColor
            })
        };
        let offset = (puzzle.boxDisplaySize - hint.text.width)/2
        hint.text.x = world.x+offset;
        hint.text.y = world.y;
        hintElements.push(hint.text);
        hints.addChild(hint.text);
        return hint;
    }
    //row text items
    puzzle.rowHintItems = []
    for(let r = 0;r<puzzle.height;r++)
    {
        puzzle.rowHintItems[r] = [];
        for(let i = 0;i<puzzle.rowHints[r].length;i++)
        {
            //add to array of hintsObjects.
            puzzle.rowHintItems[r][i] = createHint(-1-i,r,puzzle.rowHints[r][i])
        }
    }
    //col text items
    puzzle.colHintItems = [];
    for(let c = 0;c<puzzle.width;c++)
    {
        puzzle.colHintItems[c] = [];
        for(let i = 0;i<puzzle.colHints[c].length;i++)
        {
            puzzle.colHintItems[c][i] = createHint(c,-1-i,puzzle.colHints[c][i])
        }
    }
}

//
app.stage.addChild(hints);


//create cursor
input.cursorSprite = PIXI.Sprite.from("..//img/cursor.png");
input.cursorSprite.scale = boxElements[0].scale;//match box, only want to do the math once :p
let c = gridToWorldCoordinates(0,0);
input.cursorSprite.x = c.x;
input.cursorSprite.y = c.y;
input.cursorSprite.roundPixels = true;
app.stage.addChild(input.cursorSprite);

// Move container to the center
field.x = (app.screen.width / 2) - (puzzle.boxDisplaySize*puzzle.width/2);
field.y = (app.screen.height / 2) - (puzzle.boxDisplaySize*puzzle.height/2);

//High-level input things. (other input handled in object methods).
let tick = 0;
app.stage.interactive = true;
app.stage.hitArea = app.screen;
app.stage.on('mousemove', (event) => {
    input.mouseWorldCoords.x = event.global.x;
    input.mouseWorldCoords.y = event.global.y;
});

app.stage.on('pointerdown', (event) => {
    console.log("click");
    let c = input.mouseGridCoords;
    if(c.x >= 0 && c.x <puzzle.width && c.y >= 0 && c.y < puzzle.height)
    {
        input.onPointerDown();
    }
});

app.ticker.add(() => {
    input.tick();
    // increment the ticker
    tick += 0.1;
});

function gridToWorldCoordinates(x,y)
{
    return {x:x*puzzle.boxDisplaySize+padding.x+field.x,y:y*puzzle.boxDisplaySize+padding.y+field.y};
}
function worldToGridCoordinates(wx,wy)
{
    return {x:Math.floor((wx-field.x-padding.x)/puzzle.boxDisplaySize),y:Math.floor((wy-field.y-padding.y)/puzzle.boxDisplaySize)};
}