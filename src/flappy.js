// flappy bird clone for school visiting class
// 本プログラムのアルゴリズムは https://jsfiddle.net/83cgLwy7/1/ の内容を参考に作成しました。
"use strict";

/*//////////////////
//global variables//
//////////////////*/
let canvas = document.getElementById("flappyCanvas");
let ctx = canvas.getContext("2d");

let started = false;

// 鳥(主人公)の情報
let bx = canvas.width / 3; // 鳥の横位置
let by = canvas.height / 2; // 鳥の縦位置
let moment = 0; // 鳥の慣性
let score = 0; // スコア

const birdSize = 20; // 鳥の大きさ
const bird_dataurl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAAsTAAALEwEAmpwYAAABe0lEQVQ4jZWUv0vDQBTHv9E4ilAw9D/QudI9Y0HM5JQu4lAMHTKaqYhT1gxScRAXO3WKFBwDdgtmrltHSaDQuWgc2rveb+x3uh/vPu+9u3fPAgCv5dZQKC0yS7Vuku213Prp/V7a6HUGdKxyqHNmkQPDUZsu7jcuOKjJoQimExIFCzYp8HNltBydTc0EDvwcL5/PdH51dk2hXIQiZFlN6Pjo+FwJE6F7uihYmDifTyvMpxUFsbLF6ESQDHW0+8CmbIajthFkkpi+NmWd4qTEXXgLAFza9FG8llvHSblzZFEop54WmWX/x1B0GIUOXk8PJLsu3NoWDeOkROPkkTMkvyJOSg7Wna2kCC22mFUwFhonJQ4/ftEfN9URzlZ8YZuAi68bRKGDh8tvAEB/3JRs6B3qOg6rtaNtByJgAievrCybXmfAta9dRAv7Z/HGbbBry2rCpcuKjQ7YfD1WgZ+D/TnrMpJh5A7FfminRWbBB33p7dwRDvBdW9ex/wCq0scKaXLQMQAAAABJRU5ErkJggg==";
const wall_dataurl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAABCAIAAAAw6DswAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAM0lEQVQImWOc+yzcXcJo54tzDAwMDAwM129cZ2Bg0NTQhDBIBQ8Of2JgYFCw5YMwGBgYAKMwD/d8lhNeAAAAAElFTkSuQmCC";
const bird_img = new Image();
bird_img.src = bird_dataurl;
const wall_img = new Image();
wall_img.src = wall_dataurl;

// 壁の情報
let walls = []; // 画面上に表示されているすべての壁を管理
let wallDelay = 0; // 次の壁を表示するまでのタイマー

const wallDelayStart = 2.5 * 100; //最初のパイプが表示されるまでの時間
const wallWidth = 64; // 壁の幅
const wallColor = "#3CC128"; // 壁の色
const gapSizeDefault = 90 // 壁に空いた穴の大きさ

const tick = 16; // 1フレームごとの経過時間

/*///////
//input//
///////*/
document.addEventListener("keydown", inputHandler, false);
document.addEventListener("click", inputHandler, false);

function inputHandler(e) {
    if (started) {
        moment = 4;
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
        wall.x = wall.x - (tick / 9.0);
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
    moment = Math.max(-9, moment - (tick * 0.017));
}

// 鳥と壁が衝突していないかを調べる
function checkCollision() {
    // 画面の外に出ていないか
    if (by - birdSize < 0 || by + birdSize > canvas.height) {
        gameover()
    }

    // 鳥と壁が衝突していないかを、登場している壁１つずつ調べる
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
    wallDelay = Math.max(wallDelay - (tick / 11), 0)
    // 表示している壁の数が３未満で、次の壁を表示するまでのタイマーが切れていたら壁を追加
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

    // 画面から消えた壁は削除
    if (walls.length >= 1 && walls[0].x <= 0) {
        walls.shift();
    }

}

function gameover() {
    started = false;
}

/***
 画面へのの描画処理
*/
function drawElements() {
    // 一旦画面をクリアして描画する
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawWalls();
    drawBird();
    drawScore();
}

function drawBackground() {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#84C3CB";
    ctx.fill();
    ctx.closePath();
    ctx.restore();
}

function drawWalls() {
    let drawWall = (x, y, w, h, isUpper) => {
        ctx.save();

        if (isUpper) {
            y -= 10;
            h += 10;
        } else {
            h += 10;
        }

        ctx.imageSmoothingEnabled = false;
        ctx.strokeStyle = "#513E41"; // 線色をセット
        ctx.lineWidth = 2;   // 線幅をセット

        // 壁のテクスチャを描画
        ctx.drawImage(wall_img, x, y, w, h);
        // 壁周囲の線を描画
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.stroke();
        ctx.closePath();

        let x2, y2, w2, h2;
        const connectorWidth = w - 10;
        const connectorHeight = 20;
        if (isUpper) {
            [x2, y2, w2, h2] = [x + 5, y + h - connectorHeight, connectorWidth, connectorHeight];
        } else {
            [x2, y2, w2, h2] = [x + 5, y, connectorWidth, connectorHeight];
        }

        // 壁先端のテクスチャを描画
        ctx.drawImage(wall_img, x2, y2, w2, h2);
        // 壁先端の周囲の線を描画
        ctx.beginPath();
        ctx.rect(x2, y2, w2, h2);
        ctx.stroke();
        ctx.closePath();

        ctx.restore();
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

// 鳥を描画する
function drawBird() {
    // -9〜3: 90〜-30
    const x = Math.max(mapRange(moment, -12, 3, 90, -30), 0);
    
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(bx, by);
    ctx.rotate((x * Math.PI) / 180);
    ctx.drawImage(bird_img, -birdSize, -birdSize, birdSize * 2.1, birdSize * 2);
    ctx.restore();
}

// 現在のスコアやゲームオーバー時の
function drawScore() {
    // 縁取り付きのテキストを描画する
    const drawText = (text, font, x, y) => {
        ctx.save();
        ctx.strokeStyle = "#513E41";
        ctx.fillStyle = "#FFFFFF";
        ctx.lineWidth = 2;
        ctx.font = font;
        ctx.textAlign = "center"
        ctx.fillText(text, x, y);
        ctx.strokeText(text, x, y);
        ctx.restore();
    };

    drawText(score, "42pt Arial Black", canvas.width / 2, 50);
    if (!started) {
        drawText("GAME OVER", "32px Arial Black", canvas.width / 2, canvas.height / 2 - 50);
        drawText("PRESS ANY KEY", "32px Arial Black", canvas.width / 2, canvas.height / 2)
    }
}

/*
ユーティリティ関数
*/
function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function mapRange(x, a, b, c, d) {
    const percent = (x - a) / (b - a);
    const result = c + percent * (d - c);
    return result;
}

/// 点(px,py)と長方形との距離を計算して返す
function calculateDistance(px, py, rx, ry, rwidth, rheight) {
    const cx = Math.max(Math.min(px, rx + rwidth), rx);
    const cy = Math.max(Math.min(py, ry + rheight), ry);
    return Math.sqrt((px - cx) * (px - cx) + (py - cy) * (py - cy));
}

drawElements();
setInterval(mainLoop, tick);
