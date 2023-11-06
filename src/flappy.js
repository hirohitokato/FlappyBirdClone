// flappy bird clone for school visiting class
// 本プログラムのアルゴリズムは https://jsfiddle.net/83cgLwy7/1/ の内容を参考に作成しました。
"use strict";

const canvas = document.getElementById("flappyCanvas");
const ctx = canvas.getContext("2d");

//-------------------------------------
// ゲームに使う情報の定義
//

let firstPlay = true;
let isPlaying = false;

//// 鳥(主人公)の情報
let bx = canvas.width / 3; // 鳥の横位置
let by = canvas.height / 2; // 鳥の縦位置
let moment = 0; // 鳥の慣性
let score = 0; // スコア
let highscore = 0; // ハイスコア

const birdSize = 20; // 鳥の大きさ
// 鳥の画像
const bird_dataurl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAAsTAAALEwEAmpwYAAABe0lEQVQ4jZWUv0vDQBTHv9E4ilAw9D/QudI9Y0HM5JQu4lAMHTKaqYhT1gxScRAXO3WKFBwDdgtmrltHSaDQuWgc2rveb+x3uh/vPu+9u3fPAgCv5dZQKC0yS7Vuku213Prp/V7a6HUGdKxyqHNmkQPDUZsu7jcuOKjJoQimExIFCzYp8HNltBydTc0EDvwcL5/PdH51dk2hXIQiZFlN6Pjo+FwJE6F7uihYmDifTyvMpxUFsbLF6ESQDHW0+8CmbIajthFkkpi+NmWd4qTEXXgLAFza9FG8llvHSblzZFEop54WmWX/x1B0GIUOXk8PJLsu3NoWDeOkROPkkTMkvyJOSg7Wna2kCC22mFUwFhonJQ4/ftEfN9URzlZ8YZuAi68bRKGDh8tvAEB/3JRs6B3qOg6rtaNtByJgAievrCybXmfAta9dRAv7Z/HGbbBry2rCpcuKjQ7YfD1WgZ+D/TnrMpJh5A7FfminRWbBB33p7dwRDvBdW9ex/wCq0scKaXLQMQAAAABJRU5ErkJggg==";
const bird_img = new Image();
bird_img.src = bird_dataurl;

//// 壁の情報
let walls = []; // 画面上に表示されているすべての壁を管理
let wallDelay = 0; // 次の壁を表示するまでのタイマー

const wallDelayStart = 2.6 * 100; //最初のパイプが表示されるまでの時間
const wallWidth = 64; // 壁の幅
const wallColor = "#3CC128"; // 壁の色
const gapSizeDefault = 90 // 壁に空いた穴の大きさ
// 壁の画像
const wall_dataurl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAABCAIAAAAw6DswAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAM0lEQVQImWOc+yzcXcJo54tzDAwMDAwM129cZ2Bg0NTQhDBIBQ8Of2JgYFCw5YMwGBgYAKMwD/d8lhNeAAAAAElFTkSuQmCC";
const wall_img = new Image();
wall_img.src = wall_dataurl;

//// その他の情報
const tick = 16; // 1フレームごとの経過時間。単位ミリ秒(1/1000秒)

// ブラウザ上でキー入力があったときにonInputEvent関数が呼ばれるようにしておく
document.addEventListener("keydown", onInputEvent, false);
document.addEventListener("click", onInputEvent, false);

/**
 * ユーザーのマウスクリック/キー入力があったときに呼ばれます
 * @param {Event} e マウスクリック/キー入力の詳細情報。ただし今回は使用しません
 */
function onInputEvent(e) {
    if (isPlaying) {
        // 鳥に上向きの加速度を与える

    }
    else {
        // ゲームオーバーまたはプレイ前なので鳥や壁の位置、
        // スコアなどを初期化します。
        bx = canvas.width / 3;
        by = canvas.height / 2;
        moment = 0;
        walls = [];
        score = 0; // ハイスコアは初期化しない
        isPlaying = true;
    }
}

/**
 * ゲームのメインループです。この処理がtickミリ秒ごとに呼ばれます。
 * （プログラム末尾のsetInterval()によって定期的に呼ばれるようになっています）
 */
function mainLoop() {
    if (isPlaying) {
        update(); // 鳥や壁を動かす。衝突判定もこの中で行う
        drawElements(); // 動かした結果を画面に描画する
    }
}

/**
 * ゲームの状態(鳥や壁の位置、衝突の判定)を更新(update)します。
 * ここで計算した結果にもとづいて画面を描画します。
 */
function update() {
    moveWalls(); // 壁(ステージ)を動かす
    moveBirds(); // 鳥を動かす

    checkCollision(); // 鳥が壁や地面にぶつかっていないか調べる
    checkWalls(); // ステージに壁を新しく用意したりする
}

/**
 * 画面上に鳥や壁、スコアなどを描画します。
 */
function drawElements() {
    drawBackground(); // 背景
    drawWalls(); // 壁
    drawBird(); // 鳥
    drawScore(); // スコアやゲームオーバーの文字
}

//-------------------------------------
// update()から呼ばれる処理(詳細)。鳥や壁の位置を動かしたり、衝突していないかを調べます
//

/**
 * 壁を動かします。壁を動かすことによって、ステージがスクロール
 * しているように見せます。
 */
function moveWalls() {
    // 表示中の壁１つ１つを動かしスクロールしているように見せる
    walls.forEach(function (wall) {
        // 少し左に動かす

        if (!wall.scored && wall.x < bx) {
            // 壁を通過できたのでスコア＋１

            // 通過済みの壁はスコア計算の対象から外す
            wall.scored = true;
        }
    });

    // ハイスコアを更新していたら現在のスコアで更新
    if (score > highscore) {
        highscore = score;
    }
}

/**
 * 鳥を重力と羽ばたく力によって動かします。ゲームでは鳥を横に動かさず
 * 縦にだけ動かします。壁が左に動いているので、鳥が動いているように見えます。
 */
function moveBirds() {
    // 鳥を現在の羽ばたきの効果を考慮しつつ自由落下させる
    // 空気抵抗を考慮して一定以上のスピードにはしない
    by -= moment;

}

/**
 * 鳥と壁が衝突していないかを調べる
 */
function checkCollision() {
    // 画面の外に出ていないか調べる
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

        }
    });
}

/**
 * 壁の状態を調べ以下の処理を行います。
 * - 右から出てくる新しい壁の作成
 * - 画面から見えなくなった壁の削除
 */
function checkWalls() {
    wallDelay = Math.max(wallDelay - (tick / 11), 0)
    // 表示している壁の数が３未満で、次の壁を表示するまでのタイマーが切れていたら壁を追加
    if (walls.length < 3 && wallDelay === 0) {
        wallDelay = wallDelayStart;
        walls[walls.length] =
        {
            x: canvas.width + wallWidth + 20,
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

/**
 * ゲームオーバーになったとき(=衝突したとき)に呼ばれます。
 */
function gameover() {
    isPlaying = false; // ゲームの状態をプレイ中から切り替える
}

//-------------------------------------
// 画面への描画処理(詳細)
//

/**
 * 画面に背景を描画します
 */
function drawBackground() {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#84C3CB";
    ctx.fill();
    ctx.closePath();
    ctx.restore();
}

/**
 * 画面に壁(複数)を描画します
 */
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

/**
 * 画面に鳥を描画します
 */
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

/**
 * 画面に現在のスコアやゲームオーバー時の文字を描画します
 */
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

    let scoreText = ``;
    drawText(scoreText, "22pt Arial Black", canvas.width / 2, 50);
    if (!isPlaying) {
        if (firstPlay) {
            firstPlay = false;
            drawText("Flappy Bird Clone", "32px Arial Black", canvas.width / 2, canvas.height / 2 - 50);
        } else {
            drawText("GAME OVER", "32px Arial Black", canvas.width / 2, canvas.height / 2 - 50);
        }
        drawText("PRESS ANY KEY", "32px Arial Black", canvas.width / 2, canvas.height / 2)
    }
}

//-------------------------------------
// その他の便利なユーティリティ関数
//

/**
 * ランダムな値を計算して返します。
 * @param {number} min 最小値
 * @param {number} max 最大値
 * @returns 最小値～最大値の間の乱数
 */
function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * a～bの間にある値xを、c～dの範囲の値に変換した値を返します
 * `mapRange(0.26, 0, 1, 0, 100)`で呼ぶと26が得られます
 * @param {number} x 変換したい値
 * @param {number} a xが取りうる値の最小値
 * @param {number} b xが取りうる値の最大値
 * @param {number} c 変換したい範囲の最小値
 * @param {number} d 変換したい範囲の最大値
 * @returns c-dの範囲に変換した値
 */
function mapRange(x, a, b, c, d) {
    const percent = (x - a) / (b - a);
    const result = c + percent * (d - c);
    return result;
}

/**
 * 点(px,py)と長方形との距離を計算して返します。鳥と壁の距離計算に使います。
 * @param {number} px 点pのX座標
 * @param {number} py 点pのY座標
 * @param {number} rx 長方形の左上のX座標
 * @param {number} ry 長方形の左上のY座標
 * @param {number} rwidth 長方形の幅
 * @param {number} rheight 長方形の高さ
 * @returns 点pと長方形との距離
 */
function calculateDistance(px, py, rx, ry, rwidth, rheight) {
    const cx = Math.max(Math.min(px, rx + rwidth), rx);
    const cy = Math.max(Math.min(py, ry + rheight), ry);
    return Math.sqrt((px - cx) * (px - cx) + (py - cy) * (py - cy));
}

/**
 * ゲームを開始します。
 */
function gameStart() {
    drawElements();
    setInterval(mainLoop, tick);
}

// プログラムが読み込まれたときにこの処理が呼ばれ、ゲームが始まります。
gameStart();
