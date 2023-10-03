/*          flappy bird clone for school research thingie
              Gilles Coremans 2016
*/
// 本プログラムのアルゴリズムは https://jsfiddle.net/83cgLwy7/1/ の内容を参考に作成しました。
"use strict";

/*//////////////////
//global variables//
//////////////////*/
var canvas = document.getElementById("flappyCanvas");
var ctx = canvas.getContext("2d");

var started = false;

//bird data
var bx = canvas.width / 3;
var by = canvas.height / 2;
var moment = 0;
var birdSize = 10;
var score = 0;

// 壁の情報
var walls = []; // 画面上に表示されているすべての壁を管理
var wallDelayStart = 2.5 * 100; //最初のパイプが表示されるまでの時間
var wallDelay = 0; // 次の壁を表示するまでのタイマー
var wallWidth = 40; // 壁の幅
var wallColor = "#3CC128"; // 壁の色
var gapSizeDefault = 95 // 壁に空いた穴の大きさ

drawElements();
setInterval(mainLoop, 10);

/*///////
//input//
///////*/
document.addEventListener("keydown", inputHandler, false);
document.addEventListener("click", inputHandler, false);

function inputHandler(e) {
    if (started) {
        moment = 3;// Math.max(3, Math.min(mom + 2, 4));
    }
    else {
        bx = canvas.width / 3;
        by = canvas.height / 2;
        moment = 0;
        walls = [];
        score = 0;
        started = true;
    }
}


function mainLoop() {
    if (started) {
        action();
        drawElements();
    }
}


/*/////////////////////////
//changing the game state//
/////////////////////////*/
function action() {
    moveWalls();
    moveBirds();

    checkCollision();
    checkWalls();
}

function moveWalls() {
    walls.forEach(function (wall) {
        // 壁を少し左に動かす
        wall.x = wall.x - 1;
        if (!wall.scored && wall.x < bx) {
            // 壁を通過できたのでスコア＋１
            score++;
            // 通過済みの壁はスコア計算の対象から外す
            wall.scored = true;
        }
    });
}

function moveBirds() {
    // 鳥を現在の羽ばたきの効果を考慮しつつ自由落下させる
    // 空気抵抗を考慮して一定以上のスピードにはしない
    by -= moment;
    moment = Math.max(-5, moment - 0.100);
}

function checkCollision() {
    // 画面の外に出ていないか調べる。出ていたらゲームオーバー
    if (by - birdSize < 0 || by + birdSize > canvas.height) {
        gameover()
    }

    // 登場している壁を１つずつ調べ、キャラクターと衝突していないか調べる。
    // 衝突していたらゲームオーバー
    walls.forEach(function (wall) {
        //check both upper and lower rectangle. birdsize has some extra margin so it doesnt look like you didnt hit the wall but lost anyway
        const distanceToUpperWall = calculateDistance(bx, by, wall.x - wall.width, 0, wall.width, wall.gapStart);
        const distanceToLowerWall = calculateDistance(bx, by, wall.x - wall.width, wall.gapStart + wall.gapSize, wall.width, canvas.height - (wall.gapStart + wall.gapSize));
        if (distanceToUpperWall < birdSize - 2
            || distanceToLowerWall < birdSize - 2) {
            gameover();
        }
    });
}

// 壁の状態を調べ以下の処理を行う
// * 新しい壁の作成
// * 画面から見えなくなった壁の削除
function checkWalls() {
    wallDelay = Math.max(wallDelay - 1, 0)
    if (walls.length < 3 && wallDelay === 0) {
        wallDelay = wallDelayStart;
        walls[walls.length] =
        {
            x: canvas.width + wallWidth,
            width: wallWidth,
            gapStart: randomBetween(100, canvas.height - 100),
            gapSize: randomBetween(gapSizeDefault - 15, gapSizeDefault + 15),
            scored: false
        };
    }

    if (walls.length >= 1 && walls[0].x <= 0) {
        walls.shift();
    }

}

function gameover() {
    started = false;
}

/*/////////////////////////////
//drawing stuff to the screen//
/////////////////////////////*/
function drawElements() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawWalls();
    drawBird();
    drawScore();
}

function drawWalls() {
    let drawWall = (x, y, w, h, isUpper) => {
        if (isUpper) {
            y -= 10;
            h += 10;
        } else {
            h += 10;
        }
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.fillStyle = wallColor;
        ctx.strokeStyle = "#191D13"; // 線色をセット
        ctx.lineWidth = 3;   // 線幅をセット
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        let connectorWidth = w - 10;
        let connectorHeight = 20;
        ctx.beginPath();
        if (isUpper) {
            ctx.rect(x+5, y+h-connectorHeight, connectorWidth, connectorHeight);
        } else {
            ctx.rect(x+5, y, connectorWidth, connectorHeight);
        }
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    };

    walls.forEach(function (wall) {
        // 壁の上側
        drawWall(wall.x, 0,
            -wall.width, wall.gapStart,
            true);

        // 壁の下側
        drawWall(wall.x, wall.gapStart + wall.gapSize,
            -wall.width, canvas.height - (wall.gapStart + wall.gapSize),
            false);
    });
}

function drawBird() {
    ctx.beginPath();
    ctx.arc(bx, by, birdSize, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.rect(bx - birdSize, by - birdSize, birdSize*2,birdSize*2);
    ctx.strokeStyle = "#000000"
    ctx.stroke();
    ctx.closePath();
}

function drawScore() {
    ctx.fillStyle = "#000000"
    ctx.font = "32px san-serif";
    ctx.textAlign = "center"
    ctx.fillText(score, canvas.width / 2, 50);
    if (!started) {
        ctx.font = "25px sans-serif"
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 50)
        ctx.fillText("Press any key", canvas.width / 2, canvas.height / 2)
    }
}


function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

/// 点(px,py)と長方形との距離を計算して返す
function calculateDistance(px, py, rx, ry, rwidth, rheight) {
    var cx = Math.max(Math.min(px, rx + rwidth), rx);
    var cy = Math.max(Math.min(py, ry + rheight), ry);
    return Math.sqrt((px - cx) * (px - cx) + (py - cy) * (py - cy));
}
