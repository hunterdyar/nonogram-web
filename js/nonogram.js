import {input,initializeCursor} from "./input.js";
import {theme} from "./theme.js";
import {puzzle, isCoordInBounds, initializeGrid} from "./puzzle.js";
import {createHints, initializeHints} from "./hints.js";

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

//Top level Game Loop
app.ticker.add(() => {
    input.tick();

    if(puzzle.changedThisTick)
    {
        //draw mode
        createHints();
        //Check validation/solver
    }
    //reset
    puzzle.changedThisTick = false;
    // increment the ticker
    tick += 0.1;
});

