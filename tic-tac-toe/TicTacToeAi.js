function botLogic() { //need to return the best possible play, this function won't run if the game is over or no move left to make
    let testTable = table;
    let bestScore = -Infinity;
    let bestMove;


    for (let i = 1; i <= 9; i++) {
        if(testTable[i]=="") {
            testTable[i]="o";
            let score=miniMax(testTable, false, 0);
            console.log(score);
            testTable[i]="";
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            };
        }
    }

    return bestMove;

};

function miniMax(table, isMaximizing, depth) {
    let result = isGameOver(table);
    if (result != null) {
        return result; 
    };
    if(isMaximizing==false) {
        let bestScore = Infinity;    
        for(let i = 1; i<=9; i++) {
            if(table[i]=="") {
                table[i]="x";
                let score=miniMax(table, true);
                table[i]="";
                if(score < bestScore) {
                    bestScore = score;
                };
            }
        }
        return bestScore;
    }
    else {
        let bestScore = -Infinity;     
        for(let i = 1; i<=9; i++) {
            if(table[i]=="") {
                table[i]="o";
                let score=miniMax(table, false);
                table[i]="";
                if(score > bestScore) {
                    bestScore = score;
                };
            }
        }
        return bestScore;
    };
}

function isGameOver(table) {

    //ngang
    if(table[1]!==""&&table[1]==table[2]&&table[2]==table[3]) {
        return whatScore(table[1]);
    }
    else if(table[4]!==""&&table[4]==table[5]&&table[5]==table[6]) {
        return whatScore(table[4]);
    }
    else if(table[7]!==""&&table[7]==table[8]&&table[8]==table[9]) {
        return whatScore(table[7]);
    }

    //doc
    else if(table[1]!==""&&table[1]==table[4]&&table[4]==table[7]) {
        return whatScore(table[1]);
    }
    else if(table[2]!==""&&table[2]==table[5]&&table[5]==table[8]) {
        return whatScore(table[2]);
    }
    else if(table[3]!==""&&table[3]==table[6]&&table[6]==table[9]) {
        return whatScore(table[3]);
    }

    //cheo
    else if(table[1]!==""&&table[1]==table[5]&&table[5]==table[9]) {
        return whatScore(table[1]);
    }
    else if(table[3]!==""&&table[3]==table[5]&&table[5]==table[7]) {
        return whatScore(table[3]);
    }

    //DRAW (draw khi tat ca cac o khac rong va turn khac 0)

    else if(table[1]!==""&&table[2]!==""&&table[3]!==""&&table[4]!==""&&table[5]!==""&&table[6]!==""&&table[7]!==""&&table[8]!==""&&table[9]!=="") {
        return 0;
    }

    else {
        return null;
    };

};

function whatScore(winner) {
    if(winner=="o") {
        return 1;
    }
    else {
        return -1;
    };
}