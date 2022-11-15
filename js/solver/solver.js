import {puzzle} from "../puzzle.js";

//There is no way this line solver is going to be fast enough
//but uh... im going to learn about threading?
//the trick is that 1) I will start cacheing knowns for various inputs and outputs
//i may also cache allPossibles?
export let solveCounts =0;

const worker = new Worker("./js/solver/solverWorker.js");
worker.onmessage = function(e) {
    let solved = e.data.solved;
    solveCounts--;
    console.log('Message received from worker. Active:'+solveCounts);
    let infoHere = false;
    for(let i=0;i<e.data.size;i++)
    {
        if(e.data.line[i] === 0 && solved[i] !== 0)
        {
            infoHere = true;
            break;
        }
    }
    if(e.data.isRow)
    {
        puzzle.rowHintItems[e.data.index].setInfoHere(infoHere);
    }else{
        puzzle.colHintItems[e.data.index].setInfoHere(infoHere);
    }
}

function lineSolver(isRow,index)
{
    if(!window.Worker)
    {
        console.log("browser doesnt support workers, cant use hint system.")
        if(isRow)
        {
            puzzle.rowHintItems[index].setInfoHere(false);
        }else{
            puzzle.colHintItems[index].setInfoHere(false);
        }
        return;
    }

    let hint = [];
    let line = [];
    if(isRow)
    {
        hint = puzzle.rowHints[index];
        for(let i = 0;i<puzzle.width;i++)
        {
            line[i] = puzzle.level[i][index].filled;
        }
    }else{
        //col
        hint = puzzle.colHints[index];
        for(let i = 0;i<puzzle.height;i++)
        {
            line[i] = puzzle.level[index][i].filled;
        }
    }
    let size = isRow ? puzzle.width : puzzle.height;
//    let solved = solve_line(size,line, hint);
    worker.postMessage([size,line,hint,isRow,index]);
    solveCounts++;
}


export {lineSolver}