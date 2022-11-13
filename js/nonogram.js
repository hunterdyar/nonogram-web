//set width to html width?
//tbh we should do full-page and use an iframe.
const app = new PIXI.Application({
    background: 0xcccccc
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
    boxDisplaySize: 32,//display size
    width: 10,//cols
    height: 10,// rows
    level: [],
    rowHints: [],
    colHints: [],
    rowHintItems: [],
    colHintItems: []
}
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
                this.box.tint = this.filled ? 0x000000 : 0xFFFFFF;
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
                fontSize: 32,
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
const cursor = PIXI.Sprite.from("..//img/cursor.png");
cursor.scale = boxElements[0].scale;//match box, only want to do the math once :p
let c = gridToWorldCoordinates(0,0);
cursor.x = c.x;
cursor.y = c.y;
cursor.roundPixels = true;
app.stage.addChild(cursor);

// Move container to the center
field.x = (app.screen.width / 2) - (puzzle.boxDisplaySize*puzzle.width/2);
field.y = (app.screen.height / 2) - (puzzle.boxDisplaySize*puzzle.height/2);

//High-level input things. (other input handled in object methods).
let tick = 0;
const mouseCoords = { x: 0, y: 0 };
let mouseGridCoords = {x:0,y:0};
app.stage.interactive = true;
app.stage.hitArea = app.screen;
app.stage.on('mousemove', (event) => {
    mouseCoords.x = event.global.x;
    mouseCoords.y = event.global.y;
});

app.stage.on('click', (event) => {
    console.log("click");
    let c = mouseGridCoords;
    if(c.x >= 0 && c.x <puzzle.width && c.y >= 0 && c.y < puzzle.height)
    {
        puzzle.level[c.x][c.y].flip();
        createHints();
    }
});

app.ticker.add(() => {
    mouseGridCoords = worldToGridCoordinates(mouseCoords.x,mouseCoords.y);
    //move cursor
    let c = gridToWorldCoordinates(mouseGridCoords.x,mouseGridCoords.y);
    cursor.x = c.x;
    cursor.y = c.y;
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