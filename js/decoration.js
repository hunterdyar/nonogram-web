import {gridToWorldCoordinates, puzzle} from "./puzzle.js";
import {theme} from "./theme.js";

const decorationContainer = new PIXI.Container();

function initializeDecoration(app)
{
        let decoration = new PIXI.Graphics();
        let halfWidth = puzzle.lineWidth/puzzle.boxDisplaySize;

        //draw outer edge.
        let tl = gridToWorldCoordinates(0,0);
        let br = gridToWorldCoordinates(puzzle.width-1,puzzle.height-1);
        br.x += puzzle.boxDisplaySize;
        br.y += puzzle.boxDisplaySize;

        //borders
        decoration.lineStyle(puzzle.strongLineWidth,theme.gridLineColor,1)
        decoration.drawRect(tl.x-puzzle.lineWidth,tl.y,halfWidth,puzzle.boxDisplaySize*puzzle.height);
        decoration.drawRect(br.x+puzzle.lineWidth,tl.y,halfWidth,puzzle.boxDisplaySize*puzzle.height);
        decoration.drawRect(tl.x,tl.y-puzzle.lineWidth,puzzle.boxDisplaySize*puzzle.width,halfWidth);
        decoration.drawRect(tl.x,br.y+puzzle.lineWidth,puzzle.boxDisplaySize*puzzle.width,halfWidth);

        //Draw inner lines
        for (let i = 1; i < puzzle.width; i++) {
            let c = gridToWorldCoordinates(i,0);
            decoration.lineStyle(puzzle.lineWidth,theme.gridLineColor,1)
            decoration.drawRect(c.x-halfWidth,c.y,halfWidth,puzzle.boxDisplaySize*puzzle.height);
        }
        for(let j = 1; j < puzzle.height; j++) {
            // set the anchor point to the top left.
            let c = gridToWorldCoordinates(0,j);
            decoration.drawRect(c.x-halfWidth,c.y,puzzle.boxDisplaySize*puzzle.height,halfWidth);
        }

        // Move container to the center
//        decoration.x = (app.screen.width / 2) - (puzzle.boxDisplaySize*puzzle.width/2);
//        decoration.y = (app.screen.height / 2) - (puzzle.boxDisplaySize*puzzle.height/2);

        decorationContainer.addChild(decoration)
        app.stage.addChild(decorationContainer);
}

export {initializeDecoration};