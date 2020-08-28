/*
Checkmate and stalemate feature [ ]

happen when the NEXT TURN will be out of move. If the current player is promoting, then only check after promoting and switch turn if the game is still continue

After player made a move, check all piece of the otherside if there is at least 1 legal move he/she can make

if there are no move, check if the that player is in check 

if so, turn win, if not stalemate
*/

const lookUpTable = {
    RB: '&#9820;',
    HB: '&#9822;',
    BB: '&#9821;',
    QB: '&#9819;',
    KB: '&#9818;',
    PB: '&#9823;',

    PW: '&#9817;',
    RW: '&#9814;',
    HW: '&#9816;',
    BW: '&#9815;',
    QW: '&#9813;',
    KW: '&#9812;',
};

const defaultTable = [
    ['RB', 'HB', 'BB', 'QB', 'KB', 'BB', 'HB', 'RB'],
    ['PB', 'PB', 'PB', 'PB', 'PB', 'PB', 'PB', 'PB'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['PW', 'PW', 'PW', 'PW', 'PW', 'PW', 'PW', 'PW'],
    ['RW', 'HW', 'BW', 'QW', 'KW', 'BW', 'HW', 'RW'],
];

let currentTable = [
    [...defaultTable[0]],
    [...defaultTable[1]],
    [...defaultTable[2]],
    [...defaultTable[3]],
    [...defaultTable[4]],
    [...defaultTable[5]],
    [...defaultTable[6]],
    [...defaultTable[7]],
];

let turn = 'W'; //Use for identify pieces
let status = 'thinking'; //
let allPossibleMove = null; //result from function findALLPossibleMove() which return an array of all ID of possible move
let currentChoice; //the ID of the location that player previosly clicked in status "thinking" that
let enPassant = null;
let promotePos = null;
let needToCheckCastle = true;
let isGameOver = false;

let castleVirgin = {
    RBL: true,
    RBR: true,
    KB: true,

    RWL: true,
    RWR: true,
    KW: true,
};

display();

function display() {
    for (let i = 0; i <= 7; i++) {
        for (let j = 0; j <= 7; j++) {
            let posID = i + '_' + j;
            let piece = currentTable[i][j];
            if (piece != '') {
                document.getElementById(posID).innerHTML = lookUpTable[piece];
            } else {
                document.getElementById(posID).innerHTML = '';
            }
        }
    }

    if (isGameOver == true) {
        let result;

        if (status == 'D') {
            result = 'GAME DRAW';
        } else if (status == 'W') {
            result = 'WHITE WON';
        } else {
            result = 'BLACK WON';
        }

        result = result + '<br>The game is over. Please restart the game to continue playing';
        document.getElementById('result').innerHTML = result;
        document.getElementById('chessboard').classList.toggle('noclick');
        return;
    }

    if (turn == 'B') {
        document.getElementById('result').innerHTML = 'BLACK TURN';
    } else if (turn == 'W') {
        document.getElementById('result').innerHTML = 'WHITE TURN';
    }
}

function checkGameOver() {
    for (let i = 0; i <= 7; i++) {
        for (let j = 0; j <= 7; j++) {
            if (currentTable[i][j] != '' && currentTable[i][j][1] != turn) {
                let allPossibleMove = findAllPossibleMove(i, j);

                //Remove all self check move here---------------

                if (allPossibleMove.length > 0) {
                    for (let I = 0; I < allPossibleMove.length; I++) {
                        let piece = currentTable[i][j];
                        currentTable[i][j] = '';
                        let temp;

                        //For when allPossibleMove[I] is an En Passant move
                        if (
                            enPassant != null &&
                            piece[0] == 'P' &&
                            piece[1] != enPassant[1] &&
                            allPossibleMove[I] == enPassant[0]
                        ) {
                            if (enPassant[0][0] == 5) {
                                temp = currentTable[4][enPassant[0][2]];
                                currentTable[4][enPassant[0][2]] = '';
                            } else {
                                temp = currentTable[3][enPassant[0][2]];
                                currentTable[3][enPassant[0][2]] = '';
                            }

                            currentTable[enPassant[0][0]][enPassant[0][2]] = piece;
                        }

                        //For when allPossibleMove[I] is a castle move
                        else if (
                            piece[0] == 'K' &&
                            (allPossibleMove[I][2] == j - 2 || allPossibleMove[I][2] == j + 2)
                        ) {
                            if (allPossibleMove[I][2] == j - 2) {
                                currentTable[allPossibleMove[I][0]][allPossibleMove[I][2]] = piece;
                                currentTable[i][j - 1] = currentTable[i][j - 4];
                                currentTable[i][j - 4] = '';
                                castleVirgin[piece] = false;
                            } else if (allPossibleMove[I][2] == j + 2) {
                                currentTable[allPossibleMove[I][0]][allPossibleMove[I][2]] = piece;
                                currentTable[i][j + 1] = currentTable[i][j + 3];
                                currentTable[i][j + 3] = '';
                                castleVirgin[piece] = false;
                            }
                        }

                        //Regular Move
                        else {
                            temp = currentTable[allPossibleMove[I][0]][allPossibleMove[I][2]];
                            currentTable[allPossibleMove[I][0]][allPossibleMove[I][2]] = piece;
                        }
                        //check every possible move of every piece of the other side if there is there spot that would over take the current side king spot

                        let isThisCheckMove = false;

                        for (let a = 0; a <= 7; a++) {
                            if (isThisCheckMove == true) {
                                break;
                            }
                            for (let z = 0; z <= 7; z++) {
                                if (isThisCheckMove == true) {
                                    break;
                                }

                                if (currentTable[a][z] != '' && currentTable[a][z][1] == turn) {
                                    let oppoAllPossibleMove = findAllPossibleMove(a, z);

                                    for (let J = 0; J < oppoAllPossibleMove.length; J++) {
                                        if (
                                            currentTable[oppoAllPossibleMove[J][0]][
                                                oppoAllPossibleMove[J][2]
                                            ] != '' &&
                                            currentTable[oppoAllPossibleMove[J][0]][
                                                oppoAllPossibleMove[J][2]
                                            ][0] == 'K' &&
                                            currentTable[oppoAllPossibleMove[J][0]][
                                                oppoAllPossibleMove[J][2]
                                            ][1] != turn
                                        ) {
                                            isThisCheckMove = true;
                                            break;
                                        }
                                    }
                                }
                            }
                        }

                        //Put back the piece as original

                        if (
                            enPassant != null &&
                            piece[0] == 'P' &&
                            piece[1] != enPassant[1] &&
                            allPossibleMove[I] == enPassant[0]
                        ) {
                            currentTable[i][j] = piece;
                            currentTable[enPassant[0][0]][enPassant[0][2]] = '';

                            if (enPassant[0][0] == 5) {
                                currentTable[4][enPassant[0][2]] = temp;
                            } else {
                                currentTable[3][enPassant[0][2]] = temp;
                            }
                        }

                        //Put back castle move
                        else if (
                            piece[0] == 'K' &&
                            (allPossibleMove[I][2] == j - 2 || allPossibleMove[I][2] == j + 2)
                        ) {
                            if (allPossibleMove[I][2] == j - 2) {
                                currentTable[i][j] = piece;
                                currentTable[allPossibleMove[I][0]][allPossibleMove[I][2]] = '';
                                currentTable[i][j - 4] = currentTable[i][j - 1];
                                currentTable[i][j - 1] = '';
                                castleVirgin[piece] = true;
                            } else if (allPossibleMove[I][2] == j + 2) {
                                currentTable[i][j] = piece;
                                currentTable[allPossibleMove[I][0]][allPossibleMove[I][2]] = '';
                                currentTable[i][j + 3] = currentTable[i][j + 1];
                                currentTable[i][j + 1] = '';
                                castleVirgin[piece] = true;
                            }
                        } else {
                            currentTable[i][j] = piece;
                            currentTable[allPossibleMove[I][0]][allPossibleMove[I][2]] = temp;
                        }

                        //if isThisCheckMove is true then allPossibleMove[I] is INVALID.
                        if (isThisCheckMove == true) {
                            allPossibleMove[I] = 'INVALID';
                        }
                    }

                    //Filter out all INVALID move here
                    allPossibleMove = allPossibleMove.filter(checkValid);
                }

                //--------------------------- Finish remove self-check move

                if (allPossibleMove.length > 0) {
                    return false;
                }
            }
        }
    }

    //LOOP finish means game is over, find out if turn win or draw

    let turnWin = false;

    for (let i = 0; i <= 7; i++) {
        if (turnWin == true) {
            break;
        }
        for (let j = 0; j <= 7; j++) {
            if (turnWin == true) {
                break;
            }
            if (currentTable[i][j] != '' && currentTable[i][j][1] == turn) {
                let allPossibleMove = findAllPossibleMove(i, j);
                for (let z = 0; z < allPossibleMove.length; z++) {
                    if (
                        currentTable[allPossibleMove[z][0]][allPossibleMove[z][2]] != '' &&
                        currentTable[allPossibleMove[z][0]][allPossibleMove[z][2]][0] == 'K' &&
                        currentTable[allPossibleMove[z][0]][allPossibleMove[z][2]][1] != turn
                    ) {
                        turnWin = true;
                        break;
                    }
                }
            }
        }
    }
    if (turnWin == false) {
        status = 'D';
    } else {
        status = turn;
    }

    return true;
}

function promote(piece) {
    piece = piece + turn;
    currentTable[promotePos[0]][promotePos[2]] = piece;
    document.getElementById('promote').classList.toggle('hide');
    document.getElementById('chessboard').classList.toggle('noclick');
    promotePos = null;

    //finsh move

    //clear allPossibleMove, currentChoice
    // switch turn
    allPossibleMove = null;
    currentChoice = null;

    isGameOver = checkGameOver();
    if (isGameOver == false) {
        if (turn == 'W') {
            turn = 'B';
        } else {
            turn = 'W';
        }
        status = 'thinking';
        display();
    } else {
        display();
    }
}

function checkValid(content) {
    return content != 'INVALID';
}

function clickOn(pos) {
    if (status == 'choosing move') {
        let piece = currentTable[currentChoice[0]][currentChoice[2]];

        for (let i = 0; i < allPossibleMove.length; i++) {
            if (pos == allPossibleMove[i]) {
                //This is for en passant

                //delete piece when player make en passant move

                if (
                    enPassant != null &&
                    piece[0] == 'P' &&
                    piece[1] != enPassant[1] &&
                    pos == enPassant[0]
                ) {
                    if (enPassant[0][0] == 5) {
                        currentTable[4][enPassant[0][2]] = '';
                    } else {
                        currentTable[3][enPassant[0][2]] = '';
                    }
                }

                //delete en passant position after 2 turn
                if (enPassant != null && enPassant[1] == turn) {
                    enPassant = null;
                }
                //------------

                //Create en passant square in ENPassant

                if (piece[0] == 'P') {
                    if (piece[1] == 'W') {
                        if (currentChoice[0] == 6 && pos[0] == 4) {
                            enPassant = [5 + '_' + pos[2], turn];
                        }
                    } else {
                        if (currentChoice[0] == 1 && pos[0] == 3) {
                            enPassant = [2 + '_' + pos[2], turn];
                        }
                    }
                }

                //----------------------------------------------

                //This is for castle move (move the rook to correct spot)

                if (piece[0] == 'K') {
                    if (pos[2] == Number(currentChoice[2]) - 2) {
                        let rook = currentTable[pos[0]][Number(pos[2]) - 2];
                        currentTable[pos[0]][Number(pos[2]) - 2] = '';
                        currentTable[pos[0]][Number(pos[2]) + 1] = rook;
                    } else if (pos[2] == Number(currentChoice[2]) + 2) {
                        let rook = currentTable[pos[0]][Number(pos[2]) + 1];
                        currentTable[pos[0]][Number(pos[2]) + 1] = '';
                        currentTable[pos[0]][Number(pos[2]) - 1] = rook;
                    }
                }

                //----------------------------------------------------

                //This is for disable castle virginity

                //disable King virginity
                if (piece[0] == 'K') {
                    if (castleVirgin['K' + turn] == true) {
                        castleVirgin['K' + turn] = false;
                    }
                }

                //disable Rook verginity

                if (piece[0] == 'R') {
                    if (piece[1] == 'B') {
                        if (currentChoice == '0_0') {
                            castleVirgin.RBL = false;
                        } else if (currentChoice == '0_7') {
                            castleVirgin.RBR = false;
                        }
                    } else {
                        if (currentChoice == '7_0') {
                            castleVirgin.RWL = false;
                        } else if (currentChoice == '7_7') {
                            castleVirgin.RWR = false;
                        }
                    }
                }

                //----------------------------------------------
                //Swaping position, move piece into new spot and delete last spot
                let temp = currentTable[currentChoice[0]][currentChoice[2]];
                currentTable[currentChoice[0]][currentChoice[2]] = '';
                currentTable[pos[0]][pos[2]] = temp;
                //finish swithcing position

                litInGreen(allPossibleMove); //turn off green square
                //promote pawn here

                if (
                    piece[0] == 'P' &&
                    ((piece[1] == 'W' && pos[0] == 0) || (piece[1] == 'B' && pos[0] == 7))
                ) {
                    document.getElementById('promote').classList.toggle('hide');
                    document.getElementById('chessboard').classList.toggle('noclick');
                    promotePos = pos;
                    document.getElementById('result').innerHTML =
                        'Please choose one from bellow to promote your pawn';
                    return;
                } else {
                    //finsh move

                    //clear allPossibleMove, currentChoice
                    // switch turn
                    allPossibleMove = null;
                    currentChoice = null;

                    isGameOver = checkGameOver();
                    if (isGameOver == false) {
                        if (turn == 'W') {
                            turn = 'B';
                        } else {
                            turn = 'W';
                        }
                        status = 'thinking';
                        display();
                    } else {
                        display();
                    }

                    return; //Because it can only happen once in the loop
                }
            }
        }

        //if loop finish that means user didn't make the right choice, return to thinking move

        status = 'thinking';
        litInGreen(allPossibleMove);
        allPossibleMove = null;
        currentChoice = null;
        return;
    }

    //find coordinate of position clicked in currentTable array
    let i = Number(pos[0]);
    let j = Number(pos[2]);

    //check if spot clicked is not '' or wrong turn
    if (currentTable[i][j] == '' || currentTable[i][j][1] !== turn) {
        console.log('Invalid Move');
        return;
    } else {
        allPossibleMove = findAllPossibleMove(i, j);

        //Remove all self check move here

        if (allPossibleMove.length > 0) {
            for (let I = 0; I < allPossibleMove.length; I++) {
                let piece = currentTable[i][j];
                currentTable[i][j] = '';
                let temp;

                //For when allPossibleMove[I] is an En Passant move
                if (
                    enPassant != null &&
                    piece[0] == 'P' &&
                    piece[1] != enPassant[1] &&
                    allPossibleMove[I] == enPassant[0]
                ) {
                    if (enPassant[0][0] == 5) {
                        temp = currentTable[4][enPassant[0][2]];
                        currentTable[4][enPassant[0][2]] = '';
                    } else {
                        temp = currentTable[3][enPassant[0][2]];
                        currentTable[3][enPassant[0][2]] = '';
                    }

                    currentTable[enPassant[0][0]][enPassant[0][2]] = piece;
                }

                //For when allPossibleMove[I] is a castle move
                else if (
                    piece[0] == 'K' &&
                    (allPossibleMove[I][2] == j - 2 || allPossibleMove[I][2] == j + 2)
                ) {
                    if (allPossibleMove[I][2] == j - 2) {
                        currentTable[allPossibleMove[I][0]][allPossibleMove[I][2]] = piece;
                        currentTable[i][j - 1] = currentTable[i][j - 4];
                        currentTable[i][j - 4] = '';
                        castleVirgin[piece] = false;
                    } else if (allPossibleMove[I][2] == j + 2) {
                        currentTable[allPossibleMove[I][0]][allPossibleMove[I][2]] = piece;
                        currentTable[i][j + 1] = currentTable[i][j + 3];
                        currentTable[i][j + 3] = '';
                        castleVirgin[piece] = false;
                    }
                }

                //Regular Move
                else {
                    temp = currentTable[allPossibleMove[I][0]][allPossibleMove[I][2]];
                    currentTable[allPossibleMove[I][0]][allPossibleMove[I][2]] = piece;
                }
                //check every possible move of every piece of the other side if there is there spot that would over take the current side king spot

                let isThisCheckMove = false;

                for (let a = 0; a <= 7; a++) {
                    if (isThisCheckMove == true) {
                        break;
                    }
                    for (let z = 0; z <= 7; z++) {
                        if (isThisCheckMove == true) {
                            break;
                        }

                        if (currentTable[a][z] != '' && currentTable[a][z][1] !== turn) {
                            let oppoAllPossibleMove = findAllPossibleMove(a, z);

                            for (let J = 0; J < oppoAllPossibleMove.length; J++) {
                                if (
                                    currentTable[oppoAllPossibleMove[J][0]][
                                        oppoAllPossibleMove[J][2]
                                    ] != '' &&
                                    currentTable[oppoAllPossibleMove[J][0]][
                                        oppoAllPossibleMove[J][2]
                                    ][0] == 'K' &&
                                    currentTable[oppoAllPossibleMove[J][0]][
                                        oppoAllPossibleMove[J][2]
                                    ][1] == turn
                                ) {
                                    isThisCheckMove = true;
                                    break;
                                }
                            }
                        }
                    }
                }

                //Put back the piece as original

                if (
                    enPassant != null &&
                    piece[0] == 'P' &&
                    piece[1] != enPassant[1] &&
                    allPossibleMove[I] == enPassant[0]
                ) {
                    currentTable[i][j] = piece;
                    currentTable[enPassant[0][0]][enPassant[0][2]] = '';

                    if (enPassant[0][0] == 5) {
                        currentTable[4][enPassant[0][2]] = temp;
                    } else {
                        currentTable[3][enPassant[0][2]] = temp;
                    }
                }

                //Put back castle move
                else if (
                    piece[0] == 'K' &&
                    (allPossibleMove[I][2] == j - 2 || allPossibleMove[I][2] == j + 2)
                ) {
                    if (allPossibleMove[I][2] == j - 2) {
                        currentTable[i][j] = piece;
                        currentTable[allPossibleMove[I][0]][allPossibleMove[I][2]] = '';
                        currentTable[i][j - 4] = currentTable[i][j - 1];
                        currentTable[i][j - 1] = '';
                        castleVirgin[piece] = true;
                    } else if (allPossibleMove[I][2] == j + 2) {
                        currentTable[i][j] = piece;
                        currentTable[allPossibleMove[I][0]][allPossibleMove[I][2]] = '';
                        currentTable[i][j + 3] = currentTable[i][j + 1];
                        currentTable[i][j + 1] = '';
                        castleVirgin[piece] = true;
                    }
                } else {
                    currentTable[i][j] = piece;
                    currentTable[allPossibleMove[I][0]][allPossibleMove[I][2]] = temp;
                }

                //if isThisCheckMove is true then allPossibleMove[I] is INVALID.
                if (isThisCheckMove == true) {
                    allPossibleMove[I] = 'INVALID';
                }
            }

            //Filter out all INVALID move here
            allPossibleMove = allPossibleMove.filter(checkValid);
        }

        //--------------------------- Finish remove self-check move

        if (allPossibleMove.length > 0) {
            currentChoice = pos;
            litInGreen(allPossibleMove); //This function take in ID of places to be turn green, which is the currentChoice and everything in allPossibleMove
            status = 'choosing move';
        } else {
            return;
        }
    }
}

function findAllPossibleMove(i, j) {
    let allPossibleMove = [];
    let piece = currentTable[i][j];

    if (piece[0] == 'P') {
        if (piece[1] == 'B') {
            if (i + 1 <= 7 && currentTable[i + 1][j] == '') {
                let possibleMove = i + 1 + '_' + j;
                allPossibleMove.push(possibleMove);
            }

            if (i == '1' && currentTable[i + 1][j] == '' && currentTable[i + 2][j] == '') {
                let possibleMove = i + 2 + '_' + j;
                allPossibleMove.push(possibleMove);
            }

            if (i + 1 <= 7 && j - 1 >= 0 && currentTable[i + 1][j - 1][1] == 'W') {
                let possibleMove = i + 1 + '_' + (j - 1);
                allPossibleMove.push(possibleMove);
            }

            if (i + 1 <= 7 && j + 1 <= 7 && currentTable[i + 1][j + 1][1] == 'W') {
                let possibleMove = i + 1 + '_' + (j + 1);
                allPossibleMove.push(possibleMove);
            }

            //En Passant case for black

            if (
                i + 1 <= 7 &&
                j - 1 >= 0 &&
                enPassant != null &&
                enPassant[1] == 'W' &&
                enPassant[0] == i + 1 + '_' + (j - 1)
            ) {
                let possibleMove = i + 1 + '_' + (j - 1);
                allPossibleMove.push(possibleMove);
            }

            if (
                i + 1 <= 7 &&
                j + 1 >= 0 &&
                enPassant != null &&
                enPassant[1] == 'W' &&
                enPassant[0] == i + 1 + '_' + (j + 1)
            ) {
                let possibleMove = i + 1 + '_' + (j + 1);
                allPossibleMove.push(possibleMove);
            }
        } else {
            if (i - 1 >= 0 && currentTable[i - 1][j] == '') {
                let possibleMove = i - 1 + '_' + j;
                allPossibleMove.push(possibleMove);
            }

            if (i == '6' && currentTable[i - 1][j] == '' && currentTable[i - 2][j] == '') {
                let possibleMove = i - 2 + '_' + j;
                allPossibleMove.push(possibleMove);
            }

            if (i - 1 >= 0 && j - 1 >= 0 && currentTable[i - 1][j - 1][1] == 'B') {
                let possibleMove = i - 1 + '_' + (j - 1);
                allPossibleMove.push(possibleMove);
            }

            if (i - 1 >= 0 && j + 1 <= 7 && currentTable[i - 1][j + 1][1] == 'B') {
                let possibleMove = i - 1 + '_' + (j + 1);
                allPossibleMove.push(possibleMove);
            }

            //En Passant case for white

            if (
                i - 1 >= 0 &&
                j - 1 >= 0 &&
                enPassant != null &&
                enPassant[1] == 'B' &&
                enPassant[0] == i - 1 + '_' + (j - 1)
            ) {
                let possibleMove = i - 1 + '_' + (j - 1);
                allPossibleMove.push(possibleMove);
            }

            if (
                i - 1 >= 0 &&
                j + 1 <= 7 &&
                enPassant != null &&
                enPassant[1] == 'B' &&
                enPassant[0] == i - 1 + '_' + (j + 1)
            ) {
                let possibleMove = i - 1 + '_' + (j + 1);
                allPossibleMove.push(possibleMove);
            }
        }
    } else if (piece[0] == 'R') {
        //Down direction
        for (let I = i + 1; I <= 7; I++) {
            //check if current position is occupied by the team
            if (currentTable[I][j][1] == piece[1]) {
                break;
            } else if (currentTable[I][j] == '') {
                let possibleMove = I + '_' + j;
                allPossibleMove.push(possibleMove);
            } else {
                let possibleMove = I + '_' + j;
                allPossibleMove.push(possibleMove);
                break;
            }
        }
        //Up direction
        for (let I = i - 1; I >= 0; I--) {
            //check if current position is occupied by the team
            if (currentTable[I][j][1] == piece[1]) {
                break;
            } else if (currentTable[I][j] == '') {
                let possibleMove = I + '_' + j;
                allPossibleMove.push(possibleMove);
            } else {
                let possibleMove = I + '_' + j;
                allPossibleMove.push(possibleMove);
                break;
            }
        }

        //Right direction
        for (let J = j + 1; J <= 7; J++) {
            if (currentTable[i][J][1] == piece[1]) {
                break;
            } else if (currentTable[i][J] == '') {
                let possibleMove = i + '_' + J;
                allPossibleMove.push(possibleMove);
            } else {
                let possibleMove = i + '_' + J;
                allPossibleMove.push(possibleMove);
                break;
            }
        }

        //Left direction
        for (let J = j - 1; J >= 0; J--) {
            if (currentTable[i][J][1] == piece[1]) {
                break;
            } else if (currentTable[i][J] == '') {
                let possibleMove = i + '_' + J;
                allPossibleMove.push(possibleMove);
            } else {
                let possibleMove = i + '_' + J;
                allPossibleMove.push(possibleMove);
                break;
            }
        }
    } else if (piece[0] == 'H') {
        if (i - 1 >= 0 && j - 2 >= 0 && currentTable[i - 1][j - 2][1] != piece[1]) {
            let possibleMove = i - 1 + '_' + (j - 2);
            allPossibleMove.push(possibleMove);
        }
        if (i - 2 >= 0 && j - 1 >= 0 && currentTable[i - 2][j - 1][1] != piece[1]) {
            let possibleMove = i - 2 + '_' + (j - 1);
            allPossibleMove.push(possibleMove);
        }

        if (i + 1 <= 7 && j - 2 >= 0 && currentTable[i + 1][j - 2][1] != piece[1]) {
            let possibleMove = i + 1 + '_' + (j - 2);
            allPossibleMove.push(possibleMove);
        }
        if (i + 2 <= 7 && j - 1 >= 0 && currentTable[i + 2][j - 1][1] != piece[1]) {
            let possibleMove = i + 2 + '_' + (j - 1);
            allPossibleMove.push(possibleMove);
        }

        if (i - 2 >= 0 && j + 1 <= 7 && currentTable[i - 2][j + 1][1] != piece[1]) {
            let possibleMove = i - 2 + '_' + (j + 1);
            allPossibleMove.push(possibleMove);
        }
        if (i - 1 >= 0 && j + 2 <= 7 && currentTable[i - 1][j + 2][1] != piece[1]) {
            let possibleMove = i - 1 + '_' + (j + 2);
            allPossibleMove.push(possibleMove);
        }

        if (i + 1 <= 7 && j + 2 <= 7 && currentTable[i + 1][j + 2][1] != piece[1]) {
            let possibleMove = i + 1 + '_' + (j + 2);
            allPossibleMove.push(possibleMove);
        }
        if (i + 2 <= 7 && j + 1 <= 7 && currentTable[i + 2][j + 1][1] != piece[1]) {
            let possibleMove = i + 2 + '_' + (j + 1);
            allPossibleMove.push(possibleMove);
        }
    } else if (piece[0] == 'B') {
        for (I = i - 1, J = j - 1; I >= 0 && J >= 0; I--, J--) {
            if (currentTable[I][J][1] == piece[1]) {
                break;
            } else if (currentTable[I][J] == '') {
                let possibleMove = I + '_' + J;
                allPossibleMove.push(possibleMove);
            } else {
                let possibleMove = I + '_' + J;
                allPossibleMove.push(possibleMove);
                break;
            }
        }

        for (I = i - 1, J = j + 1; I >= 0 && J <= 7; I--, J++) {
            if (currentTable[I][J][1] == piece[1]) {
                break;
            } else if (currentTable[I][J] == '') {
                let possibleMove = I + '_' + J;
                allPossibleMove.push(possibleMove);
            } else {
                let possibleMove = I + '_' + J;
                allPossibleMove.push(possibleMove);
                break;
            }
        }

        for (I = i + 1, J = j + 1; I <= 7 && J <= 7; I++, J++) {
            if (currentTable[I][J][1] == piece[1]) {
                break;
            } else if (currentTable[I][J] == '') {
                let possibleMove = I + '_' + J;
                allPossibleMove.push(possibleMove);
            } else {
                let possibleMove = I + '_' + J;
                allPossibleMove.push(possibleMove);
                break;
            }
        }

        for (I = i + 1, J = j - 1; I <= 7 && J >= 0; I++, J--) {
            if (currentTable[I][J][1] == piece[1]) {
                break;
            } else if (currentTable[I][J] == '') {
                let possibleMove = I + '_' + J;
                allPossibleMove.push(possibleMove);
            } else {
                let possibleMove = I + '_' + J;
                allPossibleMove.push(possibleMove);
                break;
            }
        }
    } else if (piece[0] == 'Q') {
        //+ direction
        //Down direction
        for (let I = i + 1; I <= 7; I++) {
            //check if current position is occupied by the team
            if (currentTable[I][j][1] == piece[1]) {
                break;
            } else if (currentTable[I][j] == '') {
                let possibleMove = I + '_' + j;
                allPossibleMove.push(possibleMove);
            } else {
                let possibleMove = I + '_' + j;
                allPossibleMove.push(possibleMove);
                break;
            }
        }
        //Up direction
        for (let I = i - 1; I >= 0; I--) {
            //check if current position is occupied by the team
            if (currentTable[I][j][1] == piece[1]) {
                break;
            } else if (currentTable[I][j] == '') {
                let possibleMove = I + '_' + j;
                allPossibleMove.push(possibleMove);
            } else {
                let possibleMove = I + '_' + j;
                allPossibleMove.push(possibleMove);
                break;
            }
        }

        //Right direction
        for (let J = j + 1; J <= 7; J++) {
            if (currentTable[i][J][1] == piece[1]) {
                break;
            } else if (currentTable[i][J] == '') {
                let possibleMove = i + '_' + J;
                allPossibleMove.push(possibleMove);
            } else {
                let possibleMove = i + '_' + J;
                allPossibleMove.push(possibleMove);
                break;
            }
        }

        //Left direction
        for (let J = j - 1; J >= 0; J--) {
            if (currentTable[i][J][1] == piece[1]) {
                break;
            } else if (currentTable[i][J] == '') {
                let possibleMove = i + '_' + J;
                allPossibleMove.push(possibleMove);
            } else {
                let possibleMove = i + '_' + J;
                allPossibleMove.push(possibleMove);
                break;
            }
        }

        //X direction

        for (I = i - 1, J = j - 1; I >= 0 && J >= 0; I--, J--) {
            if (currentTable[I][J][1] == piece[1]) {
                break;
            } else if (currentTable[I][J] == '') {
                let possibleMove = I + '_' + J;
                allPossibleMove.push(possibleMove);
            } else {
                let possibleMove = I + '_' + J;
                allPossibleMove.push(possibleMove);
                break;
            }
        }

        for (I = i - 1, J = j + 1; I >= 0 && J <= 7; I--, J++) {
            if (currentTable[I][J][1] == piece[1]) {
                break;
            } else if (currentTable[I][J] == '') {
                let possibleMove = I + '_' + J;
                allPossibleMove.push(possibleMove);
            } else {
                let possibleMove = I + '_' + J;
                allPossibleMove.push(possibleMove);
                break;
            }
        }

        for (I = i + 1, J = j + 1; I <= 7 && J <= 7; I++, J++) {
            if (currentTable[I][J][1] == piece[1]) {
                break;
            } else if (currentTable[I][J] == '') {
                let possibleMove = I + '_' + J;
                allPossibleMove.push(possibleMove);
            } else {
                let possibleMove = I + '_' + J;
                allPossibleMove.push(possibleMove);
                break;
            }
        }

        for (I = i + 1, J = j - 1; I <= 7 && J >= 0; I++, J--) {
            if (currentTable[I][J][1] == piece[1]) {
                break;
            } else if (currentTable[I][J] == '') {
                let possibleMove = I + '_' + J;
                allPossibleMove.push(possibleMove);
            } else {
                let possibleMove = I + '_' + J;
                allPossibleMove.push(possibleMove);
                break;
            }
        }
    } else if (piece[0] == 'K') {
        if (j - 1 >= 0 && currentTable[i][j - 1][1] != piece[1]) {
            let possibleMove = i + '_' + (j - 1);
            allPossibleMove.push(possibleMove);
        }

        if (i - 1 >= 0 && j - 1 >= 0 && currentTable[i - 1][j - 1][1] != piece[1]) {
            let possibleMove = i - 1 + '_' + (j - 1);
            allPossibleMove.push(possibleMove);
        }

        if (i - 1 >= 0 && currentTable[i - 1][j][1] != piece[1]) {
            let possibleMove = i - 1 + '_' + j;
            allPossibleMove.push(possibleMove);
        }

        if (i - 1 >= 0 && j + 1 <= 7 && currentTable[i - 1][j + 1][1] != piece[1]) {
            let possibleMove = i - 1 + '_' + (j + 1);
            allPossibleMove.push(possibleMove);
        }

        if (j + 1 <= 7 && currentTable[i][j + 1][1] != piece[1]) {
            let possibleMove = i + '_' + (j + 1);
            allPossibleMove.push(possibleMove);
        }

        if (i + 1 <= 7 && j + 1 <= 7 && currentTable[i + 1][j + 1][1] != piece[1]) {
            let possibleMove = i + 1 + '_' + (j + 1);
            allPossibleMove.push(possibleMove);
        }

        if (i + 1 <= 7 && currentTable[i + 1][j][1] != piece[1]) {
            let possibleMove = i + 1 + '_' + j;
            allPossibleMove.push(possibleMove);
        }

        if (i + 1 <= 7 && j - 1 >= 0 && currentTable[i + 1][j - 1][1] != piece[1]) {
            let possibleMove = i + 1 + '_' + (j - 1);
            allPossibleMove.push(possibleMove);
        }

        //CASTLE MOVE

        if (
            castleVirgin[piece] == true &&
            ((i == 0 && piece[1] == 'B') || (i == 7 && piece[1] == 'W')) &&
            j == 4 &&
            needToCheckCastle == true
        ) {
            let isKingCheck = false;
            needToCheckCastle = false; // no need to check castle move on the other side

            //Check if the current king is in check

            for (let I = 0; I <= 7; I++) {
                if (isKingCheck == true) {
                    break;
                }

                for (let J = 0; J <= 7; J++) {
                    if (isKingCheck == true) {
                        break;
                    }

                    if (currentTable[I][J] != '' && currentTable[I][J][1] != piece[1]) {
                        let oppoAllPossibleMove = findAllPossibleMove(I, J);

                        for (let Z = 0; Z < oppoAllPossibleMove.length; Z++) {
                            if (oppoAllPossibleMove[Z] == i + '_' + j) {
                                isKingCheck = true;
                                break;
                            }
                        }
                    }
                }
            }

            if (isKingCheck == false) {
                if (
                    castleVirgin['R' + piece[1] + 'L'] == true &&
                    currentTable[i][j - 4] == 'R' + piece[1]
                ) {
                    if (
                        currentTable[i][j - 1] == '' &&
                        currentTable[i][j - 2] == '' &&
                        currentTable[i][j - 3] == ''
                    ) {
                        let isNext2SquareCheck = false;

                        for (let I = 0; I <= 7; I++) {
                            if (isNext2SquareCheck == true) {
                                break;
                            }

                            for (let J = 0; J <= 7; J++) {
                                if (isNext2SquareCheck == true) {
                                    break;
                                }

                                if (currentTable[I][J] != '' && currentTable[I][J][1] != piece[1]) {
                                    let oppoAllPossibleMove = findAllPossibleMove(I, J);

                                    for (let Z = 0; Z < oppoAllPossibleMove.length; Z++) {
                                        if (
                                            oppoAllPossibleMove[Z] == i + '_' + (j - 1) ||
                                            oppoAllPossibleMove[Z] == i + '_' + (j - 2)
                                        ) {
                                            isNext2SquareCheck = true;
                                            break;
                                        }
                                    }
                                }
                            }
                        }

                        if (isNext2SquareCheck == false) {
                            let possibleMove = i + '_' + (j - 2);
                            allPossibleMove.push(possibleMove);
                        }
                    }
                }

                if (
                    castleVirgin['R' + piece[1] + 'R'] == true &&
                    currentTable[i][j + 3] == 'R' + piece[1]
                ) {
                    if (currentTable[i][j + 1] == '' && currentTable[i][j + 2] == '') {
                        let isNext2SquareCheck = false;

                        for (let I = 0; I <= 7; I++) {
                            if (isNext2SquareCheck == true) {
                                break;
                            }

                            for (let J = 0; J <= 7; J++) {
                                if (isNext2SquareCheck == true) {
                                    break;
                                }

                                if (currentTable[I][J] != '' && currentTable[I][J][1] != piece[1]) {
                                    let oppoAllPossibleMove = findAllPossibleMove(I, J);

                                    for (let Z = 0; Z < oppoAllPossibleMove.length; Z++) {
                                        if (
                                            oppoAllPossibleMove[Z] == i + '_' + (j + 1) ||
                                            oppoAllPossibleMove[Z] == i + '_' + (j + 2)
                                        ) {
                                            isNext2SquareCheck = true;
                                            break;
                                        }
                                    }
                                }
                            }
                        }

                        if (isNext2SquareCheck == false) {
                            let possibleMove = i + '_' + (j + 2);
                            allPossibleMove.push(possibleMove);
                        }
                    }
                }
            }

            needToCheckCastle = true;
        }
    }

    return allPossibleMove;
}

function litInGreen(allPossibleMove) {
    if (document.getElementById(currentChoice).className == 'black') {
        document.getElementById(currentChoice).className = 'blackg';
    } else if (document.getElementById(currentChoice).className == 'white') {
        document.getElementById(currentChoice).className = 'whiteg';
    } else if (document.getElementById(currentChoice).className == 'blackg') {
        document.getElementById(currentChoice).className = 'black';
    } else {
        document.getElementById(currentChoice).className = 'white';
    }
    for (let i = 0; i < allPossibleMove.length; i++) {
        if (document.getElementById(allPossibleMove[i]).className == 'black') {
            document.getElementById(allPossibleMove[i]).className = 'blackg';
        } else if (document.getElementById(allPossibleMove[i]).className == 'white') {
            document.getElementById(allPossibleMove[i]).className = 'whiteg';
        } else if (document.getElementById(allPossibleMove[i]).className == 'blackg') {
            document.getElementById(allPossibleMove[i]).className = 'black';
        } else {
            document.getElementById(allPossibleMove[i]).className = 'white';
        }
    }
}

function resetGame() {
    currentTable = [
        [...defaultTable[0]],
        [...defaultTable[1]],
        [...defaultTable[2]],
        [...defaultTable[3]],
        [...defaultTable[4]],
        [...defaultTable[5]],
        [...defaultTable[6]],
        [...defaultTable[7]],
    ];
    turn = 'W';
    if (status == 'choosing move') {
        litInGreen(allPossibleMove);
    }
    if (promotePos != null) {
        document.getElementById('promote').classList.toggle('hide');
        document.getElementById('chessboard').classList.toggle('noclick');
    }
    if (isGameOver == true) {
        document.getElementById('chessboard').classList.toggle('noclick');
    }
    status = 'thinking';
    allPossibleMove = null;
    currentChoice = null;
    enPassant = null;
    promotePos = null;
    isGameOver = false;

    castleVirgin = {
        RBL: true,
        RBR: true,
        KB: true,

        RWL: true,
        RWR: true,
        KW: true,
    };
    display();
}
