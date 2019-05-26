/* Drag functions : associated with drag events*/

//Function called when drag move is initiated
function dragStarted(d) {
    d3.select(this).classed("dragging", true);
}

//Function called once drag has been initiated & while dragging is happening
function dragged(d) {
    if (currentBoard.gameOver) return;

    d3.select(this)
        .attr("cx", d.x = d3.event.x)
        .attr("cy", d.y = d3.event.y);
}

//Function once drag is over (i.e. piece is dropped)
function dragEnded(origin, width, node, d) {

    //get matching cell of coordinates where drag ended
    var cell = mapCoordinatesToCell(origin, width, currentBoard.cells, d.x, d.y);

    //set source and destination cell (from & to)
    var from = d;
    var to = cell;

    //check if move is legal
    var legal = isMoveLegal(currentBoard.cells, currentBoard.pieces, d, from, to);

    //if not, recenter circle in middle of source cell
    if (!legal) {
        var cellCoordinates = mapCellToCoordinates(origin, width, from);
        node
            .attr("cx", d.x = cellCoordinates.x + width/2)
            .attr("cy", d.y = cellCoordinates.y + width/2);
    }
    else {
        //update board state
        currentBoard = movePiece(currentBoard, d, from, to, 1);

        //center circle in destination cell
        var cellCoordinates = mapCellToCoordinates(origin, width, to);
        node
            .attr("cx", d.x = cellCoordinates.x + width/2)
            .attr("cy", d.y = cellCoordinates.y + width/2);

        //var score = getScore(currentBoard);
        showBoardState();

        //set turn back to AI
        currentBoard.turn = black;

        //AI's move
        var delayCallback = function() {
            var winner = getWinner(currentBoard);
            if (winner != 0) {
                currentBoard.gameOver = true;
            }
            else {
                blackMove();
            }
            updateScoreboard();
            return true;
        };

        setTimeout(delayCallback, 1000);

    }
}