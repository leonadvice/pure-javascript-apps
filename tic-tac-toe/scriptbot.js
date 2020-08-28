let table = ["1","","","","","","","","",""];
let winner;

display();


function mark(pos) {
    if(table[0]==0) {
        alert("The game has finsihed, please restart the game");
        return
    };
    if(table[pos]!=="") {
        alert("You cannot go there");
        return
    };

    table[pos] = "x";


    checkWinCon();
    display();

    if(table[0]!==0) {
        botPlay();
    };
    

};

function botPlay() {
    let playPos = botLogic(); /* botLogic() should only return 0-9 */

    if(playPos==0) {
        return;
    }

    else {
        table[playPos] = "o";
    };

    checkWinCon();
    display();
};





function checkWinCon() {
    //ngang
    if(table[1]!==""&&table[1]==table[2]&&table[2]==table[3]) {
        whoWon(1);
    }
    else if(table[4]!==""&&table[4]==table[5]&&table[5]==table[6]) {
        whoWon(4);
    }
    else if(table[7]!==""&&table[7]==table[8]&&table[8]==table[9]) {
        whoWon(7);
    }

    //doc
    else if(table[1]!==""&&table[1]==table[4]&&table[4]==table[7]) {
        whoWon(1);
    }
    else if(table[2]!==""&&table[2]==table[5]&&table[5]==table[8]) {
        whoWon(2);
    }
    else if(table[3]!==""&&table[3]==table[6]&&table[6]==table[9]) {
        whoWon(3);
    }

    //cheo
    else if(table[1]!==""&&table[1]==table[5]&&table[5]==table[9]) {
        whoWon(1);
    }
    else if(table[3]!==""&&table[3]==table[5]&&table[5]==table[7]) {
        whoWon(3);
    }

    //DRAW (draw khi tat ca cac o khac rong va turn khac 0)

    else if(table[1]!==""&&table[2]!==""&&table[3]!==""&&table[4]!==""&&table[5]!==""&&table[6]!==""&&table[7]!==""&&table[8]!==""&&table[9]!==""&&table[0]!==0) {
        whoWon(0);
    }
};

function whoWon(num) {
    if(num==0) {
        winner = "GAME DRAW";
        table[0] = 0;
        return
    };
    if(table[num]=="x") {
        winner = "You has won the game";
    }
    else {
        winner = "AI has won the game";
    }

    table[0] = 0;
}


function display() {
    for(let i = 1; i<=9; i++) {
        document.getElementById("s"+i).innerHTML = table[i];
    }

    if(table[0]==1) {
        document.getElementById("result").innerHTML = "Game In Progress";
    }

    else {
        document.getElementById("result").innerHTML = winner;
    }

}

function resetgame() {
    table = ["1","","","","","","","","",""];
    display();
};