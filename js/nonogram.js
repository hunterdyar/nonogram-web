import {input,initializeCursor} from "./input.js";
import {theme} from "./theme.js";
import {puzzle, isCoordInBounds, initializeGrid, createPuzzle} from "./puzzle.js";
import {createHints, initializeHints} from "./hints.js";
import {lineSolver, solveCounts} from "./solver/solver.js";
//set width to html width?
//tbh we should do full-page and use an iframe.
const app = new PIXI.Application({
    antialias: true,
    background: theme.backgroundColor
});
let HTMLContainer = document.getElementById('app');
HTMLContainer.appendChild(app.view);


//create puzzle then initialize it.
initializeGrid(app);
//Init hints.
initializeHints(app);
//Init cursor
initializeCursor(app);


createPuzzle();

//Reacting to events
let tick = 0;
app.stage.interactive = true;
app.stage.hitArea = app.screen;
//pointer combines mouse and tap/touch
app.stage.on('pointermove', (event) => {
    input.mouseWorldCoords.x = event.global.x;
    input.mouseWorldCoords.y = event.global.y;
});

app.stage.on('pointerdown', (event) => {
    let c = input.mouseGridCoords;
    if(isCoordInBounds(c))
    {
        input.onPointerDown();
    }
});
app.stage.on('pointerup', (event) => {
        input.onPointerUp();
});

let allChecked = false;
//Top level Game Loop
app.ticker.add(() => {
    input.tick();

    if(puzzle.changedThisTick)
    {
        allChecked = false;
        //instantly solve the one we expect to have changed.
        lineSolver(true,input.lastChanged.y);
        lineSolver(false,input.lastChanged.x);

    }
    //I intended to do two optimizations. The first was to cancel previous 'threads' and restart on changes, the second was hash map.
    //hash maps worked so well for my 30x30 that im just gonna call it good enough for now. I can optimize later.

    //then, do the rest. THis is mostly not needed, but we can change more than one input per tick.
    //plus, it will be fast because repetative work will just be polling a hashmap. That's O(n) not O(n^2) like the solve.
    if(!allChecked && solveCounts === 0){
        //we need to track if we are solving or not.
        for(let r = 0;r<puzzle.height;r++){
            lineSolver(true,r);
        }
        for(let c = 0;c<puzzle.width;c++){
            lineSolver(false,c);
        }
        allChecked = true;
    }

    //reset
    puzzle.changedThisTick = false;
    // increment the ticker
    tick += 0.1;
});

