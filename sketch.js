let dots = [];
let totalDots = 200;
let started = false;
let meltStartTime;
let meltDuration = 80000;
let originY;
let video;

const DOT_OPACITY = 200;
const FLICKER_SPEED = 0.0012;
const RETURN_THRESHOLD = 1;

// เพิ่มตัวแปรสำหรับ fade
let fadeOpacity = 0;
let fading = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  originY = height / 3.5;
  video = document.getElementById("candleVideo");
  frameRate(60);
}

function draw() {
  clear();

  let elapsed = millis() - meltStartTime;
  let meltProgress = constrain(elapsed / meltDuration, 0, 1);

  for (let dot of dots) {
    if (dot.clicked) {
      if (!dot.returned) {
        dot.x = lerp(dot.x, dot.originalX, 0.05);
        dot.y = lerp(dot.y, dot.originalY, 0.05);

        if (dist(dot.x, dot.y, dot.originalX, dot.originalY) < RETURN_THRESHOLD) {
          dot.returned = true;
          let angle = random(TWO_PI);
          let speed = random(0.5, 1.2);
          dot.vx = cos(angle) * speed;
          dot.vy = sin(angle) * speed;
        }
      } else {
        dot.x += dot.vx + sin(millis() * 0.002 + dot.offsetX) * 0.3;
        dot.y += dot.vy + cos(millis() * 0.002 + dot.offsetY) * 0.3;
      }
    } else {
      dot.x += dot.vx + sin(millis() * FLICKER_SPEED + dot.offsetX) * 0.5;
      dot.y += dot.vy + cos(millis() * FLICKER_SPEED + dot.offsetY) * 0.5;
    }

    let flickerColor = lerpColor(
      color(255, 255, 200, DOT_OPACITY),
      color(255, 150, 50, DOT_OPACITY),
      noise(dot.offsetX + frameCount * 0.01)
    );

    if (dot.clicked) {
      flickerColor = color(
        random(150, 200),   // แดง
        random(100, 100),   // เขียว
        random(100, 300),   // น้ำเงิน
        DOT_OPACITY
      );
    }

    noStroke();
    fill(flickerColor);
    drawingContext.shadowBlur = 30;
    drawingContext.shadowColor = flickerColor;
    ellipse(dot.x, dot.y, dot.baseSize, dot.baseSize);
  }

  // วาดแผ่นดำโปร่งแสงเพื่อเฟดดำ
  if (fading) {
    fadeOpacity += 2;  // ปรับความเร็ว fade ได้ที่นี่ (2 = เร็ว, 1 = ช้า)
    fadeOpacity = constrain(fadeOpacity, 0, 255);

    noStroke();
    fill(0, fadeOpacity);
    rect(0, 0, width, height);

    if (fadeOpacity >= 255) {
      fading = false;
      fadeOpacity = 0;

      // รีเซ็ตจริง ๆ หลัง fade ดำเต็มจอ
      dots = [];
      started = false;

      // ถ้าจะเริ่มใหม่ หรือเล่นวิดีโอใหม่ ก็ใส่โค้ดตรงนี้ได้
    }
  }
}

function mousePressed() {
  if (!started) {
    startExperience();
    return;
  }

  selectDotsNear(mouseX, mouseY);
}

function mouseDragged() {
  selectDotsNear(mouseX, mouseY);
}

function selectDotsNear(x, y) {
  const radius = 17;
  for (let dot of dots) {
    if (!dot.clicked && dist(x, y, dot.x, dot.y) < radius) {
      dot.clicked = true;
      dot.returned = false;

      let angle = random(TWO_PI);
      let force = random(4, 8);
      dot.vx = cos(angle) * force;
      dot.vy = sin(angle) * force;

      dot.baseSize = random(15, 50);
    }
  }
}

function startExperience() {
  started = true;
  meltStartTime = millis();

  const intro = document.getElementById("introVideo");
  const candle = document.getElementById("candleVideo");

  if (intro) {
    intro.pause();
    intro.style.display = "none";
  }

  if (candle) {
    candle.style.display = "block";
    candle.currentTime = 0;
    candle.play();
  }

  dots = [];
  for (let i = 0; i < totalDots; i++) {
    let angle = random(TWO_PI);
    let speed = random(1, 2);
    dots.push({
      originalX: width / 2,
      originalY: originY,
      x: width / 2,
      y: originY,
      vx: cos(angle) * speed,
      vy: sin(angle) * speed,
      offsetX: random(1000),
      offsetY: random(1000),
      clicked: false,
      returned: false,
      baseSize: random(8, 40)
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  resetExperience();

  const candleVideo = document.getElementById("candleVideo");
  const introVideo = document.getElementById("introVideo");

  if (candleVideo) {
    candleVideo.style.display = "none";
  }

  if (introVideo) {
    introVideo.style.display = "block";
    introVideo.currentTime = 0;
    introVideo.play();
  }

  if (candleVideo) {
    candleVideo.addEventListener("ended", () => {
      candleVideo.style.display = "none";

      if (introVideo) {
        introVideo.currentTime = 0;
        introVideo.style.display = "block";
        introVideo.play();
      }

      resetExperience();
    });
  }
});

// แก้ให้ resetExperience() เริ่ม fade ดำแทนรีเซ็ตทันที
function resetExperience() {
  if (!fading) {
    fading = true;
    fadeOpacity = 0;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  originY = height / 3;
}
