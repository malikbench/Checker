/****GLOBAL VARIABLES & BASE REFERENCES****/

//References for white
var white = 1;
var whiteKing = 1.1;

//References for black
var black = -1;
var blackKing = -1.1;

//Reference for empty state
var empty = 0;

//Reference for current state of board
var currentBoard = {
    cells : null,
    pieces : null,
    turn : white,
    gameOver : false
};

//Variables
var INFINITY = 10000;
var NEG_INFINITY = -10000;
var cell_width = 0;
var board_origin = 0;

/*****FUNCTIONS*****/

//Getters

/*gets jumped piece from cell 'from' to cell 'to'*/
function getJumpedPiece(cells, pieces, from, to) {
    var distance = {x : to.col - from.col, y : to.row - from.row};
    if (abs(distance.x) == 2) {
        var jumpRow = from.row+sign(distance.y);
        var jumpCol = from.col+sign(distance.x);
        var index = getPieceIndex(pieces, jumpRow, jumpCol);
        var jumpedPiece = pieces[index];
        return jumpedPiece;
    }
    else return null;

}

/*gets piece at index [row, col]*/
function getPieceIndex(pieces, row, col) {
    var index = -1;
    for (var i=0; i<pieces.length;i++){
        var piece = pieces[i];
        if (piece.row===row && piece.col===col){
            index = i;
            break;
        }
    }
    return index;
}

/*gets number of pieces of both sides for given board*/
function getPieceCount(boardState) {
    var numWhite = 0;
    var numBlack = 0;
    var pieces = boardState.pieces;
    for (var i=0;i<pieces.length;i++) {
        var piece = pieces[i];
        if (piece.col >=0 && piece.row >=0){
            if (piece.state === white || piece.state === whiteKing) {
                numWhite += 1;
            }
            else if (piece.state === black || piece.state === blackKing) {
                numBlack += 1;
            }
        }
    }

    return {white: numWhite, black: numBlack};
}

/*gets winner, if game is ongoing returns 0*/
function getWinner(boardState) {
    var pieceCount = getPieceCount(boardState);
    if (pieceCount.white > 0  && pieceCount.black === 0) {
        return white;
    }
    else if (pieceCount.black > 0 && pieceCount.white === 0) {
        return black;
    }
    else return 0;
}

/*gets matching coordinates of given cell*/
function mapCellToCoordinates(origin, width, cell) {
    var key = "" + cell.row + ":" + cell.col;

    mapCellToCoordinates.answers = {};
    if (mapCellToCoordinates.answers[key] != null){
        return mapCellToCoordinates.answers[key];
    }
    var x = origin.x + (cell.col * width);
    var y = origin.y + (cell.row * width);
    return mapCellToCoordinates.answers[key] = {x: x , y: y};
}

/*gets matching cell of given coordinates*/
function mapCoordinatesToCell(origin, width, cells, x, y){
    var numSquares = 10;
    var boardLength = numSquares * width;

    if (x > (origin.x + boardLength)) return null;
    if (y > (origin.y + boardLength)) return null;

    var col = Math.ceil((x - origin.x) / width) - 1;
    var row = Math.ceil((y - origin.y) / width) - 1;
    var index = ((row * numSquares) + col);
    var cell = cells[index];

    return cell;
}

/*gets pieces of given player*/
function get_player_pieces(player, target_board) {
    player_pieces = new Array();
    for (var i=0;i<target_board.pieces.length;i++){
        var piece = target_board.pieces[i];
        if (piece.state === player || piece.state === (player+.1) || piece.state === (player-.1) ) {
            player_pieces.push(piece);
        }
    }
    return player_pieces;
}

/*gets cell index from given cell row and column*/
function get_cell_index(target_board, col, row) {
    var index = -1;
    for (var i=0;i<target_board.cells.length;i++) {
        var cell = target_board.cells[i];
        if (cell.col === col && cell.row ===row) {
            index = i;
            break;
        }
    }
    return index;
}

/*returns true if attempted move is legal, false otherwise*/
function isMoveLegal(cells, pieces, piece, from, to) {

    var distance = {x: to.col - from.col, y: to.row - from.row};

    //restrict horizontal & vertical move
    if ((distance.x == 0) || (distance.y == 0)) {
        return false;
    }

    //restrict non-diagonal move
    if (abs(distance.x) != abs(distance.y)) {
        return false;
    }

    /**
     * && (abs(piece.state) ==  1) <=> allows kings to jump over 2 cells
     */
    //restrict more than 2 cells on diagonal jump
    if ((abs(distance.x) > 2) ) {
        return false;
    }

    //restrict move to occupied cell
    if (to.state != empty) {
        return false;
    }

    //if move is a jump move
    if (abs(distance.x) == 2) {
        var jumpedPiece = getJumpedPiece(cells, pieces, from, to);

        //restrict jump if there is no piece to jump
        if (jumpedPiece == null) {
            return false;
        }

        //restrict jump if piece is of same color
        var pieceState = piece.state;
        var jumpedState = jumpedPiece.state;
        if (pieceState != -jumpedState) {
            return false;
        }
    }

    //restrict backwards move (only if piece is not king)
    if ((integ(piece.state) === piece.state) && (sign(piece.state) != sign(distance.y))) {
        return false;
    }

    //move is legal
    return true;
}

/*gets possible moves for given piecee*/
function get_available_piece_moves(target_board, target_piece, player) {
    var moves = [];
    var from = target_piece;

    // check for slides
    var x = [-1, 1];
    x.forEach(function(entry) {
        var cell_index = get_cell_index(target_board, from.col+entry, from.row+(player));
        if (cell_index >= 0){
            var to = target_board.cells[cell_index];
            if (isMoveLegal(target_board.cells, target_board.pieces, from, from, to)) {
                move = {move_type: 'slide', piece: player, from: {col: from.col, row: from.row}, to: {col: to.col, row: to.row}};
                moves[moves.length] = move;
            }
        }
    });

    // check for jumps
    x = [-2, 2];
    x.forEach(function(entry) {
        var cell_index = get_cell_index(target_board, from.col+entry, from.row+(player*2));
        if (cell_index >= 0) {
            var to = target_board.cells[cell_index];
            if (isMoveLegal(target_board.cells, target_board.pieces, from, from, to)) {
                move = {move_type: 'jump', piece: player, from: {col: from.col, row: from.row}, to: {col: to.col, row: to.row}};
                moves[moves.length] = move;
            }
        }
    });

    // kings
    if (Math.abs(from.state) === 1.1) {
        // check for slides
        var x = [-1, 1];
        var y = [-1, 1];
        x.forEach(function(xmove) {
            y.forEach(function(ymove){
                var cell_index = get_cell_index(target_board, from.col+xmove, from.row+ymove);
                if (cell_index >= 0){
                    var to = target_board.cells[cell_index];
                    if (isMoveLegal(target_board.cells, target_board.pieces, from, from, to)) {
                        move = {move_type: 'slide', piece: player, from: {col: from.col, row: from.row}, to: {col: to.col, row: to.row}};
                        moves[moves.length] = move; //add move to possible moves
                    }
                }
            });
        });

        // check for jumps
        x = [-2, 2];
        y = [-2, 2];
        x.forEach(function(xmove) {
            y.forEach(function(ymove){
                var cell_index = get_cell_index(target_board, from.col+xmove, from.row+ymove);
                if (cell_index >= 0){
                    var to = target_board.cells[cell_index];
                    if (isMoveLegal(target_board.cells, target_board.pieces, from, from, to)) {
                        move = {move_type: 'jump',
                            piece: player,
                            from: {col: from.col, row: from.row},
                            to: {col: to.col, row: to.row}};
                        moves[moves.length] = move;
                    }
                }
            });
        });
    }

    return moves;
}

/*gets possible moves for given player*/
function get_available_moves(player, target_board) {

    var moves = [];
    var move = null;
    var player_pieces = get_player_pieces(player, target_board);

    for (var i=0;i<player_pieces.length;i++) {
        var from = player_pieces[i];
        var piece_moves = get_available_piece_moves(target_board, from, player);
        moves.push.apply(moves, piece_moves);
    }

    //prune non-jumps, if applicable
    var jump_moves = [];
    for (var i=0; i<moves.length;i++) {
        var move = moves[i];
        if (move.move_type == "jump") {
            jump_moves.push(move);
        }
    }
    if (jump_moves.length > 0){
        moves = jump_moves;
    }

    return moves;
}

//Operations

/*initializes and returns the board game object*/
function initializeBoard() {

    var initialBoard = [
        [0, 1, empty, 1, 0, white, empty, white, empty, white],
        [white, empty, white, empty, white, empty, white, empty, white, empty],
        [empty, white, empty, white, empty, white, empty, white, empty, white],
        [white, empty, white, empty, white, empty, white, empty, white, empty],

        [empty, empty, empty, empty, empty, empty, empty, empty, empty, empty],
        [empty, empty, empty, empty, empty, empty, empty, empty, empty, empty],

        [empty, black, empty, black, empty, black, empty, black, empty, black],
        [black, empty, black, empty, black, empty, black, empty, black, empty],
        [empty, black, empty, black, empty, black, empty, black, empty, black],
        [black, empty, black, empty, black, empty, black, empty, black, empty]
    ];



    var cells = new Array();
    var pieces = new Array();
    for (var i=0;i<initialBoard.length;i++){
        var row = initialBoard[i];
        for (var j=0;j<row.length;j++) {
            var cellState = row[j];
            if (cellState != empty) {
                var piece = {row: i, col: j, state: cellState};
                pieces.push(piece);
            }
            var cell = {row: i, col: j, state: cellState};
            cells.push(cell);
        }
    }

    var boardState = {cells: cells, pieces: pieces, turn: white};
    return boardState;
}

/*initializeGame : draws initial board using origin point and given cell width*/
function startGame(origin, cellWidth, boardCanvas) {

    cell_width = cellWidth;
    board_origin = origin;
    currentBoard = drawBoard(origin, cellWidth, boardCanvas);

    showBoardState();
}

/*randomly selects a move in given move set*/
function select_random_move(moves){
    // Randomly select move
    var index = Math.floor(Math.random() * (moves.length - 1));
    var selected_move = moves[index];

    return selected_move;
}

/*checks for jump move available in given move set*/
function jump_available(available_moves) {
    var jump = false;
    for (var i=0;i<available_moves.length;i++){
        var move = available_moves[i];
        if (move.move_type == "jump") {
            jump = true;
            break;
        }
    }

    return jump;
}


/*moves given piece on given board from given source and destination cell */
function movePiece(boardState, piece, fromCell, toCell, moveNum) {

    // Get jumped piece
    var jumpedPiece = getJumpedPiece(boardState.cells, boardState.pieces, fromCell, toCell);

    // Update states
    var fromIndex = get_cell_index(boardState, fromCell.col, fromCell.row);
    var toIndex = get_cell_index(boardState, toCell.col, toCell.row);

    //If piece gets on last or first row, piece becomes a king (i.e. piece.state * 1.1)
    if ((toCell.row === 0 || toCell.row === 9) && Math.abs(piece.state) === 1) {
        boardState.cells[toIndex].state = piece.state * 1.1;
        piece.state *= 1.1;
    }
    else {
        boardState.cells[toIndex].state = piece.state;
    }

    //Set 'fromCell' to empty state
    boardState.cells[fromIndex].state = empty;

    //Set piece's new coordinates
    piece.col = toCell.col;
    piece.row = toCell.row;

    //Move matching circle on the graphical game
    moveCircle(toCell, moveNum);

    //If move was a jump
    if (jumpedPiece != null) {

        //Get jumped piece's index
        var jumpedIndex = getPieceIndex(boardState.pieces, jumpedPiece.row, jumpedPiece.col);

        //Discard piece from board
        jumpedPiece.state = 0;

        //Set cell to empty
        var cellIndex = get_cell_index(boardState, jumpedPiece.col, jumpedPiece.row);
        var jumpedCell = boardState.cells[cellIndex];
        jumpedCell.state = empty;

        //Offset piece from board (used for heuristic_value())
        boardState.pieces[jumpedIndex].col = -1;
        boardState.pieces[jumpedIndex].row = -1;

        hideCircle(jumpedCell, moveNum);

        //Check if multiple jumps are possible
        var more_moves = get_available_piece_moves(boardState, piece, boardState.turn);
        var another_move = null;

        //Among available moves of piece, check for jump
        for (var i=0; i<more_moves.length; i++) {
            var next_move = more_moves[i];

            //If jump move exist, break out of loop
            if (next_move.move_type === "jump") {
                another_move = next_move;
                break;
            }
        }

        //Perform jump move
        if (another_move != null) {
            moveNum += 1;

            //Recursive call
            boardState = movePiece(boardState, piece, another_move.from, another_move.to, moveNum);
            //moveCircle(another_move.to, moveNum);

        }
    }


    return boardState;
}




/*creates a board clone, used for running algorithms before applying them to game board*/
function clone_board(board) {

    var board_clone = {};

    var cells = new Array();
    var pieces = new Array();

    for (var i=0;i<board.cells.length;i++) {
        var cell = board.cells[i];
        var newCell = {row: cell.row, col: cell.col, state: cell.state};
        cells.push(newCell);
    }
    for (var i=0;i<board.pieces.length;i++){
        var piece = board.pieces[i];
        var newPiece = {row: piece.row, col: piece.col, state: piece.state};
        pieces.push(newPiece);
    }

    board_clone = {cells: cells, pieces: pieces, turn: board.turn};
    return board_clone ;
}

/*position heuristic, returns a value based on piece's position on board*/
function position_heuristic(col , row) {
    //if piece is on edges
    if (col == 0 || col == 9 || row == 0 || row == 9){
        return 5;
    }
    else {
        return 3;
    }
}

/*computes heuristic value for given board configuration*/
function heuristic_value(target_board) {
    var sum = 0;
    var black_pieces = 0;
    var black_kings = 0;
    var white_pieces = 0;
    var white_kings = 0;

    //position heuristic
    var white_positions = 0;
    var black_positions = 0;


    for (var i=0; i<target_board.pieces.length; i++) {
        var piece = target_board.pieces[i];
        if (piece.row > -1) { // only count pieces still on the board
            if (piece.state > 0) { // white
                white_pieces += 1;
                if (piece.state === 1.1){ //white king
                    white_kings += 1;
                }
                var white_position = position_heuristic(piece.col, piece.row);
                white_positions  += white_position;
            }
            else { // black
                black_pieces += 1;
                if (piece.state === -1.1){ //black king
                    black_kings += 1;
                }

                var black_position = position_heuristic(piece.col, piece.row);
                black_positions += black_position;
            }
        }
    }

    var piece_difference = black_pieces - white_pieces;
    var king_difference = black_kings - white_kings;
    //for each player : position heuristic / number of pieces ???
    var positions_difference = black_positions - white_positions;

    /*var avg_human_pos = human_pos_sum / human_pieces;

    var avg_computer_pos = computer_pos_sum / computer_pieces;
    var avg_pos_diff = avg_computer_pos - avg_human_pos;*/

    //var features = [piece_difference, king_difference, avg_pos_diff];
    //var weights = [100, 10, 1];
    var features = [piece_difference, king_difference, positions_difference];
    var weights = [100, 10, 1];

    var board_utility = 0;

    for (var f=0; f<features.length; f++){
        var fw = features[f] * weights[f];
        board_utility += fw;
    }

    return board_utility;
}