//Recalculates hints and creates text items that get added to the "hints" container
import {gridToWorldCoordinates, puzzle} from "./puzzle.js";
import {theme} from "./theme.js";

const hintElements = [];//pile of text boxes
const hints = new PIXI.Container();

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
        //puzzle.colHints[c].reverse();
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
        puzzle.rowHintItems[r] = [];
        for(let i = 0;i<puzzle.rowHints[r].length;i++)
        {
            //add to array of hintsObjects.
            puzzle.rowHintItems[r][i] = createHint(-1-i,r,hints[i])
        }
    }
    //col text items
    puzzle.colHintItems = [];
    for(let c = 0;c<puzzle.width;c++)
    {
        let hints = puzzle.colHints[c];
        hints.reverse();
        puzzle.colHintItems[c] = [];
        for(let i = 0;i<puzzle.colHints[c].length;i++)
        {
            puzzle.colHintItems[c][i] = createHint(c,-1-i,hints[i])
        }
    }
}

export {createHints, initializeHints, hints};