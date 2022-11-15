//Recalculates hints and creates text items that get added to the "hints" container
import {gridToWorldCoordinates, puzzle} from "./puzzle.js";
import {theme} from "./theme.js";

const hintElements = [];//pile of text boxes
const hints = new PIXI.Container();

class Hint {
    constructor() {
        this.items = [];
        this.isInfoHere = false;
    }
    items = [];//array of HintItems
    isInfoHere = false;
    setInfoHere(info)
    {
        this.isInfoHere = info;
        for(let i = 0;i<this.items.length;i++)
        {
            this.items[i].text.style.fill = this.isInfoHere ? theme.hintInfoTextColor : theme.hintTextColor;
        }
    }
}
class HintItem
{
    x;
    y;
    value;
    text;
    constructor(x,y,value) {
        this.x = x;
        this.y = y;
        this.value = value;
        this.text = new PIXI.Text(this.value.toString(),{
            align: 'center',
            fontSize: puzzle.boxDisplaySize,
            fill: theme.hintTextColor
        });
    }

}

function initializeHints(app)
{
    app.stage.addChild(hints);
}

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
            if(puzzle.solution[c][r] === 1)
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
//        puzzle.rowHints[r].reverse();
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
            if(puzzle.solution[c][r] === 1)
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
        //puzzle.colHints[c].reverse();
    }

    //DRAW the hints
    function createHint(gridX,gridY,value)
    {
        let world = gridToWorldCoordinates(gridX,gridY);
        let hint = new HintItem(gridX,gridY,value);
        hint.text.x = world.x+((puzzle.boxDisplaySize - hint.text.width)/2);
        hint.text.y = world.y+((puzzle.boxDisplaySize - hint.text.height)/2);
        hintElements.push(hint.text);
        hints.addChild(hint.text);
        return hint;
    }
    //row text items
    puzzle.rowHintItems = []
    for(let r = 0;r<puzzle.height;r++)
    {
        let hints = puzzle.rowHints[r];
        hints.reverse();
        puzzle.rowHintItems[r] = new Hint();
        for(let i = 0;i<puzzle.rowHints[r].length;i++)
        {
            //add to array of hintsObjects.
            puzzle.rowHintItems[r].items[i] = createHint(-1-i,r,hints[i])
        }
    }
    //col text items
    puzzle.colHintItems = [];
    for(let c = 0;c<puzzle.width;c++)
    {
        let hints = puzzle.colHints[c];
        hints.reverse();
        puzzle.colHintItems[c] = new Hint();
        for(let i = 0;i<puzzle.colHints[c].length;i++)
        {
            puzzle.colHintItems[c].items[i] = createHint(c,-1-i,hints[i])
        }
    }
}

export {createHints, initializeHints, hints};