/**
 * CNN 卷积核滑动动画
 */

(function() {
    'use strict';

    const CNNAnimation = {
        isPlaying: false,
        currentX: 0,
        currentY: 0,
        animationId: null,
        speed: 500,

        init() {
            const container = document.getElementById('cnn-animation-demo');
            if (!container) return;

            this.container = container;
            this.render();
            this.draw();
        },

        render() {
            this.container.innerHTML = `
                <div class="cnn-animation-container">
                    <div class="cnn-panel">
                        <h4>输入 CQT</h4>
                        <canvas id="cnn-input-canvas" class="cnn-canvas"></canvas>
                    </div>
                    <div class="cnn-panel">
                        <h4>特征图</h4>
                        <canvas id="cnn-output-canvas" class="cnn-canvas"></canvas>
                    </div>
                </div>
                <div class="animation-controls">
                    <button class="btn btn-primary" id="cnn-play-btn">▶ 播放</button>
                    <button class="btn btn-secondary" id="cnn-pause-btn">⏸ 暂停</button>
                    <button class="btn btn-secondary" id="cnn-reset-btn">↺ 重置</button>
                    <div class="demo-control-group">
                        <label>速度：</label>
                        <input type="range" id="cnn-speed" min="100" max="1000" value="500">
                    </div>
                </div>
                <div class="demo-output" id="cnn-output-text">
                    卷积核在输入图上滑动，计算局部加权和，生成特征图。
                </div>
            `;

            this.inputCanvas = document.getElementById('cnn-input-canvas');
            this.outputCanvas = document.getElementById('cnn-output-canvas');

            this.resizeCanvases();
            window.addEventListener('resize', () => {
                this.resizeCanvases();
                this.draw();
            });

            document.getElementById('cnn-play-btn').addEventListener('click', () => this.play());
            document.getElementById('cnn-pause-btn').addEventListener('click', () => this.pause());
            document.getElementById('cnn-reset-btn').addEventListener('click', () => this.reset());
            document.getElementById('cnn-speed').addEventListener('input', (e) => {
                this.speed = 1100 - parseInt(e.target.value);
            });
        },

        resizeCanvases() {
            [this.inputCanvas, this.outputCanvas].forEach(canvas => {
                if (!canvas) return;
                const rect = canvas.getBoundingClientRect();
                canvas.width = rect.width * 2;
                canvas.height = rect.height * 2;
                const ctx = canvas.getContext('2d');
                ctx.scale(2, 2);
            });
        },

        generateInputData() {
            // 8x8 simplified CQT patch with a diagonal pattern
            const size = 8;
            const data = [];
            for (let y = 0; y < size; y++) {
                data[y] = [];
                for (let x = 0; x < size; x++) {
                    // Create a pattern: higher values along diagonal and lower harmonics
                    let val = Math.exp(-((x - y) ** 2) / 2) * 0.8;
                    if (x === y + 2) val += 0.4;
                    if (x === y - 1) val += 0.3;
                    data[y][x] = Math.min(1, val);
                }
            }
            return data;
        },

        draw() {
            const inputData = this.generateInputData();
            this.drawInput(inputData);
            this.drawOutput(inputData);
        },

        drawInput(data) {
            if (!this.inputCanvas) return;
            const ctx = this.inputCanvas.getContext('2d');
            const width = this.inputCanvas.width / 2;
            const height = this.inputCanvas.height / 2;
            const size = data.length;
            const cellW = width / size;
            const cellH = height / size;

            ctx.clearRect(0, 0, width, height);

            // Draw cells
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    const val = data[y][x];
                    const r = Math.round(59 + (246 - 59) * val);
                    const g = Math.round(130 + (173 - 130) * val);
                    const b = Math.round(246 + (85 - 246) * val);
                    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                    ctx.fillRect(x * cellW + 1, y * cellH + 1, cellW - 2, cellH - 2);
                }
            }

            // Draw kernel highlight
            if (this.isPlaying || this.currentX > 0 || this.currentY > 0) {
                ctx.strokeStyle = '#F96167';
                ctx.lineWidth = 3;
                ctx.strokeRect(
                    this.currentX * cellW + 1,
                    this.currentY * cellH + 1,
                    3 * cellW - 2,
                    3 * cellH - 2
                );
            }

            // Grid
            ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--border').trim() || '#e2e8f0';
            ctx.lineWidth = 0.5;
            for (let i = 0; i <= size; i++) {
                ctx.beginPath();
                ctx.moveTo(i * cellW, 0);
                ctx.lineTo(i * cellW, height);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, i * cellH);
                ctx.lineTo(width, i * cellH);
                ctx.stroke();
            }
        },

        drawOutput(data) {
            if (!this.outputCanvas) return;
            const ctx = this.outputCanvas.getContext('2d');
            const width = this.outputCanvas.width / 2;
            const height = this.outputCanvas.height / 2;
            const size = 6; // 8 - 3 + 1 = 6
            const cellW = width / size;
            const cellH = height / size;

            ctx.clearRect(0, 0, width, height);

            // Simple kernel: edge detector
            const kernel = [
                [-1, 0, 1],
                [-2, 0, 2],
                [-1, 0, 1]
            ];

            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    let sum = 0;
                    for (let ky = 0; ky < 3; ky++) {
                        for (let kx = 0; kx < 3; kx++) {
                            sum += data[y + ky][x + kx] * kernel[ky][kx];
                        }
                    }
                    const val = (sum + 4) / 8; // normalize roughly to 0-1
                    const intensity = Math.max(0, Math.min(1, val));

                    const r = Math.round(255 * intensity);
                    const g = Math.round(100 * (1 - intensity));
                    const b = Math.round(100 * (1 - intensity));

                    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                    ctx.fillRect(x * cellW + 1, y * cellH + 1, cellW - 2, cellH - 2);

                    // Highlight current computed cell
                    if (x === this.currentX && y === this.currentY) {
                        ctx.strokeStyle = '#F96167';
                        ctx.lineWidth = 3;
                        ctx.strokeRect(x * cellW + 1, y * cellH + 1, cellW - 2, cellH - 2);
                    }
                }
            }

            // Grid
            ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--border').trim() || '#e2e8f0';
            ctx.lineWidth = 0.5;
            for (let i = 0; i <= size; i++) {
                ctx.beginPath();
                ctx.moveTo(i * cellW, 0);
                ctx.lineTo(i * cellW, height);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, i * cellH);
                ctx.lineTo(width, i * cellH);
                ctx.stroke();
            }
        },

        play() {
            if (this.isPlaying) return;
            this.isPlaying = true;
            this.step();
        },

        step() {
            if (!this.isPlaying) return;

            this.draw();

            const outputText = document.getElementById('cnn-output-text');
            if (outputText) {
                outputText.innerHTML = `
                    卷积核当前位置：(${this.currentX}, ${this.currentY})<br>
                    计算该位置 3×3 区域与卷积核的加权和，生成特征图对应像素。
                `;
            }

            this.animationId = setTimeout(() => {
                this.currentX++;
                if (this.currentX >= 6) {
                    this.currentX = 0;
                    this.currentY++;
                    if (this.currentY >= 6) {
                        this.currentY = 0;
                    }
                }
                this.step();
            }, this.speed);
        },

        pause() {
            this.isPlaying = false;
            if (this.animationId) {
                clearTimeout(this.animationId);
                this.animationId = null;
            }
        },

        reset() {
            this.pause();
            this.currentX = 0;
            this.currentY = 0;
            this.draw();
            const outputText = document.getElementById('cnn-output-text');
            if (outputText) {
                outputText.textContent = '卷积核在输入图上滑动，计算局部加权和，生成特征图。';
            }
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => CNNAnimation.init());
    } else {
        CNNAnimation.init();
    }
})();
