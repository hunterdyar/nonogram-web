import {puzzle} from "./puzzle.js";
import {input} from "./input.js";

//There is no way this line solver is going to be fast enough
//but uh... im going to learn about threading?
//the trick is that 1) I will start cacheing knowns for various inputs and outputs
//i may also cache allPossibles?
function lineSolver(isRow,index)
{
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
    let solved = solve_line(size,line, hint);
    let infoHere = false;
    for(let i=0;i<size;i++)
    {
        if(line[i] === 0 && solved[i] !== 0)
        {
            infoHere = true;
            break;
        }
    }
    if(isRow)
    {
        puzzle.rowHintItems[index].setInfoHere(infoHere);
    }else{
        puzzle.colHintItems[index].setInfoHere(infoHere);
    }
}

function solve_line(size,line,hint)
{
    let allPossible = getAllPossible(line,hint);
    let knownValue = getKnown(size,allPossible);
    return knownValue;
}

function getKnown(size,all)
{
    if(all == null)
    {
        return new Array(size).fill(-1)
    }
    if(all.length === 0){
        return new Array(size).fill(-1)
    }

    let known = all[0].slice(0);
    for(let i = 0;i<size;i++)//col
    {
        for(let a = 1;a<all.length;a++)//row
        {
            if(all[a][i] !== known[i])
            {
                known[i] = 0;
                break;//break 1
            }
        }
    }
    return known;
}
//todo: This needs to start with our starting values and weed out ones that dont match instead of not.

function getAllPossible(known,hint)
{
    let length = known.length-1;
    let leftMosts = [];
    let rightMosts = [];
    for(let i = 0;i<hint.length;i++)
    {
        //count of all items before i + gaps.
        //we could use .reduce but i cant figure out a clever way to make it operate on a slice of the array
        let sum = 0;
        for(let l = 0;l<i;l++)
        {
            sum += hint[l];
            sum += 1;//gap between hints... fence post problem?
        }
        leftMosts[i] = sum;

        sum = length-hint[i]+1;//4
        for(let r = hint.length-1;r>i;r--)
        {
            sum -= hint[r];
            sum -= 1//gap between hints
        }
        rightMosts[i] = sum;
    }

    //get all hint options.
    let lines = [];
    function getAllLinesRecursive(h,s,left)
    {
        let start = leftMosts[h] > left ? leftMosts[h] : left;//get max.
        for(let x = start;x<=rightMosts[h];x++)
        {
            let l = s.slice(0);
            l = setLine(l,x,hint[h]);
            let rightEdge = x+hint[h]+1;
            if(h<hint.length-1)
            {
                getAllLinesRecursive(h+1,l,rightEdge);
            }else{
                let addLine = true;
                for(let i = 0;i<known.length;i++){
                    //if we say we know something, only add solutions where that matches.
                    //ie: ignore solutions where there is any spot where that doesnt match.
                    if(known[i] !== 0)
                    {
                        if(l[i] !== known[i]){
                            addLine = false;
                            break;
                        }
                    }
                }
                if(addLine){
                    lines.push(l);
                }
            }
        }

    }

    let empty = getEmpty(known.length);
    getAllLinesRecursive(0,empty, leftMosts[0])
    return lines;
}

function setLine(line,position,hintSize)
{
    for(let x = 0;x<hintSize;x++)
    {
        line[position+x] = 1;
    }
    if(position-1 >= 0)
    {
        line[position-1] = -1;
    }
    if(position+hintSize+1 <= line.length)
    {
        line[position+hintSize] = -1;
    }
    return line;
}

function getEmpty(size)
{
    return new Array(size).fill(0);
}

export {lineSolver}