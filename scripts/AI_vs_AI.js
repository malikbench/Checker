
function drawBoard(origin, cellWidth, boardCanvas) {
    var boardState = initializeBoard();
    var cells = boardState.cells;
    var pieces = boardState.pieces;

    //Draw cell rects
    boardCanvas.append("g")
        .selectAll("rect")
        .data(cells)
        .enter().append("rect")
        .attr("x", function(d) { return mapCellToCoordinates(origin, cellWidth, d).x})
        .attr("y", function(d) { return mapCellToCoordinates(origin, cellWidth, d).y})
        .attr("height", cellWidth)
        .attr("width", cellWidth)
        .style("fill", function(d) { if (d.state == empty) return "lightgrey"; else return "grey"})
        .style("stroke", "black")
        .style("stroke-width", "1px");

    //Draw pieces

    var dragEndedDimensions = function(d) {
        node = d3.select(this);
        dragEnded(origin, cellWidth, node, d);
    }


    var drag = d3.drag()
        .on("start", dragStarted)
        .on("drag", dragged)
        .on("end", dragEndedDimensions);

    boardCanvas.append("g")
        .selectAll("circle")
        .data(pieces)
        .enter().append("circle")
        .attr("r", cellWidth/2)
        .attr("cx", function(d) { var x = mapCellToCoordinates(origin, cellWidth, d).x; return x+cellWidth/2;})
        .attr("cy", function(d) { var y = mapCellToCoordinates(origin, cellWidth, d).y; return y+cellWidth/2;})
        .style("fill", function(d) { if (d.state == white) return "white"; else return "black";})
        /*.style("border-style", function() { return "solid";})
        .style("border-color", function(d) { if (d.state == white) return "black"; else return "white";})*/
        .call(drag)
    ;

    //Draw scoreboard
    d3.select("#divScoreboard").remove();
    d3.select("body").append("div")
        .attr("id", "divScoreboard")
        .style("font-size", "36")
        .html("SCOREBOARD")

    d3.select("#divScoreboard")
        .append("div")
        .style("font-size", "24")
        .attr("id", "winner");

    d3.select("#divScoreboard")
        .append("div")
        .attr("id", "whiteScore")
        .style("font-size", "18")
        .html("White: 20")

    d3.select("#divScoreboard")
        .append("div")
        .attr("id", "blackScore")
        .style("font-size", "18")
        .html("Black: 20")


    d3.select("#divScoreBoard")
        .style("margin-left", "880px")
        .style("color", "red")
        .style("margin-top", "-750px")

    d3.select("#divScoreboard")
        .append("div")
        .attr("id", "instructions")
        .style("font-size", "24")
        .style("margin-top", "30px")
        .html("The"+"&quot"+"launch"+"&quot"+" button will start a non interruptible AI vs. AI game"+"&#013;&#010;"
                +    "The"+"&quot"+"next move"+"&quot"+" button will only perform the AI move who's turn it is")

    //d3.select("#instructions").append('br')
    d3.select("#instructions").append("p").html("Difficulty level")

    ;

    return boardState;
}




/* COMPUTER AI FUNCTIONS */



function alpha_beta_for_max(calc_board, depth) {
    var alpha = NEG_INFINITY;
    var beta = INFINITY;

    //get available moves for computer
    var available_moves = get_available_moves(black, calc_board);

    //get max value for each available move
    var max = min_value(calc_board,available_moves,depth,alpha,beta);

    //find all moves that have max-value
    var best_moves = [];
    var max_move = null;
    for(var i=0;i<available_moves.length;i++){
        var next_move = available_moves[i];
        if (next_move.score == max){
            max_move = next_move;
            best_moves.push(next_move);
        }
    }

    //randomize selection, if multiple moves have same max-value
    if (best_moves.length > 1){
        max_move = select_random_move(best_moves);
    }

    return max_move;
}

//alpha beta search for white AI (minimizing player)
function alpha_beta_for_min(board, depth){
    var alpha = NEG_INFINITY;
    var beta = INFINITY;

    //get available moves for computer
    var available_moves = get_available_moves(white, board);

    //get min value for each available move
    var min = min_value(board,available_moves,depth,alpha,beta);

    //find all moves that have max-value
    var best_moves = [];
    var min_move = null;
    for(var i=0;i<available_moves.length;i++){
        var next_move = available_moves[i];
        if (next_move.score == min){
            min_move = next_move;
            best_moves.push(next_move);
        }
    }

    //randomize selection, if multiple moves have same max-value
    if (best_moves.length > 1){
        min_move = select_random_move(best_moves);
    }

    return min_move;
}



function launch() {

        var delayCallback = function () {
            var winner = getWinner(currentBoard);
            if (currentBoard.turn === white) {
                whiteMove();
                sleep(5000);
            } else {
                blackMove();
                sleep(5000);
            }

            updateScoreboard();
            return true;
        };


        setInterval(delayCallback, 1000);

}

function nextMove(){
    if(currentBoard.turn === white) {
        whiteMove();
        updateScoreboard();
    }else {
        blackMove();
        updateScoreboard();
    }
}

function whiteMove(){
    // clone board
    var simulated_board = clone_board(currentBoard);

    // Run algorithm to select next move
    var selected_move = alpha_beta_for_min(simulated_board, 5);

    // Make computer's move
    var pieceIndex = getPieceIndex(currentBoard.pieces, selected_move.from.row, selected_move.from.col);
    var piece = currentBoard.pieces[pieceIndex];
    currentBoard = movePiece(currentBoard, piece, selected_move.from, selected_move.to, 1);
    //
    //moveCircle(selected_move.to, 1);
    showBoardState();

    var winner = getWinner(currentBoard);
    if (winner != 0) {
        currentBoard.gameOver = true;
    }
    else {
        currentBoard.turn = black;
    }

}

function blackMove() {

    // Copy board into simulated board
    var simulated_board = clone_board(currentBoard);

    // Run algorithm to select next move
    var selected_move = alpha_beta_for_max(simulated_board, 5);
    console.log("best move: " + selected_move.from.col + ":" + selected_move.from.row + " to " + selected_move.to.col + ":" + selected_move.to.row);
    //show on side log

    // Make computer's move
    var pieceIndex = getPieceIndex(currentBoard.pieces, selected_move.from.row, selected_move.from.col);
    var piece = currentBoard.pieces[pieceIndex];
    currentBoard = movePiece(currentBoard, piece, selected_move.from, selected_move.to, 1);
    //moveCircle(selected_move.to, 1); //movePiece already calls moveCircle
    showBoardState();

    var winner = getWinner(currentBoard);
    if (winner != 0) {
        currentBoard.gameOver = true;
    }
    else {
        currentBoard.turn = white;
    }
}



function min_value(board, white_moves, depth, alpha, beta) {
    if (depth <=0 && !jump_available(white_moves)) {
        return heuristic_value(board);
    }
    var min = INFINITY;

    //for each move, get min
    if (white_moves.length > 0){
        for (var i=0; i<white_moves.length; i++){
            var simulated_board = clone_board(board);

            //move white piece
            var white_move = white_moves[i];
            var pieceIndex = getPieceIndex(simulated_board.pieces, white_move.from.row, white_move.from.col);
            var piece = simulated_board.pieces[pieceIndex];
            simulated_board = movePiece(simulated_board, piece, white_move.from, white_move.to);

            //get available moves for computer
            var black_moves = get_available_moves(black, simulated_board);

            //get max value for this move
            var max_score = max_value(simulated_board, black_moves, depth-1, alpha, beta);

            //compare to min and update, if necessary
            if (max_score < min) {
                min = max_score;
            }
            white_moves[i].score = min;
            if (min <= alpha) {
                break;
            }
            if (min < beta) {
                beta = min;
            }
        }
    }
    else {
        //log("NO MORE MOVES FOR MIN: l=" + limit);
    }

    return min;
}

function max_value(board, black_moves, depth, alpha, beta) {

    //leaf reached
    if (depth <= 0 && !jump_available(black_moves)) {
        return heuristic_value(board);
    }

    var max = NEG_INFINITY;

    //for each move black AI can make, get max heuristic value
    if (black_moves.length > 0){
        for (var i=0; i<black_moves.length; i++){

            //clone the board
            var simulated_board = clone_board(board);

            //move piece : use move's origin point (from) to retrieve matching piece on the board clone
            var black_move = black_moves[i];
            var pieceIndex = getPieceIndex(simulated_board.pieces, black_move.from.row, black_move.from.col);
            var piece = simulated_board.pieces[pieceIndex];
            simulated_board = movePiece(simulated_board, piece, black_move.from, black_move.to);

            //get available moves for white
            var white_moves = get_available_moves(white, simulated_board);

            //get min heuristic value for this move
            var min_score = min_value(simulated_board, white_moves, depth - 1, alpha, beta);
            black_moves[i].score = min_score;

            //compare to min and update, if necessary
            if (min_score > max) {
                max = min_score;
            }
            if (max >= beta) {
                break;
            }
            if (max > alpha) {
                alpha = max;
            }
        }
    }
    else {
        //log("NO MORE MOVES FOR MAX: l=" + limit);
    }

    return max;

}


