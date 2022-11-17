import {puzzle} from "./puzzle.js";

function validateLine(isRow,index)
{
    let hint = [];
    let s = puzzle.height;

    let r = isRow ? 0 : index;
    let c = isRow ? index : 0;

    let prevFilled = false;
    let blockNumber = 0;
    hint[blockNumber] = 0;

    let complete = true;

    for(let i = 0;i<s;i++)
    {
        r = isRow ? i : index;
        c = isRow ? index : i;
        if(puzzle.level[r][c].filled === 0)
        {
            complete = false;
        }

        if(puzzle.level[r][c].filled === 1)
        {
            //we have a block
            if(prevFilled)
            {
                hint[blockNumber] += 1;
            }else{
                blockNumber++;
                hint[blockNumber] = 1;//initialize new hint
            }
            prevFilled = true;//set previous
        }else{
            prevFilled = false;//set previous
        }
    }
    hint.shift();

    if(isRow){
        puzzle.rowHintItems[index].setCompleteCorrect(complete,compareArrays(puzzle.rowHints[index],hint));
    }else{
        puzzle.colHintItems[index].setCompleteCorrect(complete,compareArrays(puzzle.colHints[index],hint));
    }
}

function compareArrays(a,b)
{
    if(a.length !== b.length)
    {
        return false;
    }
    for(let i = 0;i<a.length;i++)
    {
        if(a[i] !== b[i])
        {
            return false;
        }
    }
    return true;
}

export { validateLine }