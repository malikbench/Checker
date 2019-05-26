//GRAPHICAL FUNCTIONS


//moves circle from event source point to given cell
function moveCircle(cell, moveNum) {
    var cellCoordinates = mapCellToCoordinates(board_origin, cell_width, cell);
    var delay = (moveNum*200);
    d3.selectAll("circle").each(function(d,i) {
        if (d.col === cell.col && d.row === cell.row){
            d3.select(this)
                .transition()
                .delay(delay)
                .attr("cx", d.x = cellCoordinates.x + cell_width/2)
                .attr("cy", d.y = cellCoordinates.y + cell_width/2);
        }
    });
}

//hides circle that has just been jumped
function hideCircle(cell, moveNum) {
    var delay = (moveNum*400);
    d3.selectAll("circle").each(function(d,i) {
        //piece that has just been jumped gets its state to 'empty'
        if (d.state === 0){
            console.log("Hide col=" + cell.col + ", row=" + cell.row);
            d3.select(this).transition().delay(delay)
                .style("display", "none");
        }
    });
}

//updates scoreboard
function updateScoreboard() {
    var pieceCount = getPieceCount(currentBoard);
    var whiteLabel = "White: " + pieceCount.white;
    var blackLabel = "Black: " + pieceCount.black;

    d3.select("#whiteScore")
        .html(whiteLabel);
    d3.select("#blackScore")
        .html(blackLabel);

    var winner = getWinner(currentBoard);
    var winnerLabel = "";
    if (winner === white) {
        winnerLabel = "White Wins!!";
    }
    else if (winner === black) {
        winnerLabel = "Black Wins!!";
    }

    if (winner != 0) {
        d3.select("#btnReplay")
            .style("display", "inline");
    }

    d3.select("#winner")
        .html(winnerLabel);
}

function drawText(data) {
    boardCanvas.append("g")
        .selectAll("text")
        .data(data)
        .enter().append("text")
        .attr("x", function(d) { var x = mapCellToCoordinates(board_origin, cell_width, d).x; return x+cell_width/2;})
        .attr("y", function(d) { var y = mapCellToCoordinates(board_origin, cell_width, d).y; return y+cell_width/2;})
        .style("fill", function() { return "red";})
        .text(function(d) { /*if (d.state === white) return "R";
									else if (d.state === black) return "B";
									else*/ if (d.state === whiteKing || d.state === blackKing) return "D";
        else return "";})
    ;
}

function showBoardState() {
    //hides king mark ("D") on previous cells
    d3.selectAll("text").each(function(d,i) {
        d3.select(this)
            .style("display", "none");
    });

    var cells = currentBoard.cells;
    var pieces = currentBoard.pieces;
    drawText(cells);
    drawText(pieces);
}