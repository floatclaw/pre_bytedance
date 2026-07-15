/**
 * MaxMean 交互计算器
 * 展示 query chunks 和 candidate chunks 之间的余弦相似度，以及 MaxMean 计算过程
 */

(function() {
    'use strict';

    const MaxMeanCalculator = {
        queryPattern: 'clustered',
        candidatePattern: 'shifted',
        queryVectors: [],
        candidateVectors: [],
        animationStep: -1,
        animationTimer: null,

        patterns: {
            'clustered': { name: 'Query 聚集 / Candidate 同向聚集', queryCenter: 0.5, candidateCenter: 0.5, spread: 0.4 },
            'shifted': { name: 'Query 聚集 / Candidate 偏移', queryCenter: 0.5, candidateCenter: 2.5, spread: 0.4 },
            'scattered': { name: 'Query 聚集 / Candidate 分散', queryCenter: 0.5, candidateCenter: 0, spread: 2.0 },
            'opposite': { name: 'Query 聚集 / Candidate 反向', queryCenter: 0.5, candidateCenter: 0.5 + Math.PI, spread: 0.3 },
            'mixed': { name: 'Query 分散 / Candidate 部分匹配', queryCenter: 0, spread: 3.0 }
        },

        init() {
            const container = document.getElementById('maxmean-calculator-demo');
            if (!container) return;

            this.container = container;
            this.render();
            this.generateVectors();
            this.draw();
        },

        render() {
            this.container.innerHTML = `
                <div class="demo-controls">
                    <div class="demo-control-group">
                        <label>Query 分布：</label>
                        <select id="mm-query-pattern">
                            <option value="clustered">聚集</option>
                            <option value="scattered">分散</option>
                            <option value="mixed">混合</option>
                        </select>
                    </div>
                    <div class="demo-control-group">
                        <label>Candidate 分布：</label>
                        <select id="mm-candidate-pattern">
                            <option value="shifted" selected>同旋律但升调（偏移）</option>
                            <option value="clustered">同向聚集</option>
                            <option value="scattered">分散</option>
                            <option value="opposite">反向</option>
                        </select>
                    </div>
                    <button class="btn btn-primary" id="mm-animate-btn">▶ 播放 MaxMean 计算</button>
                    <button class="btn btn-secondary" id="mm-reset-btn">重置</button>
                </div>

                <div class="maxmean-layout">
                    <div class="maxmean-panel">
                        <h4>Query (短查询)</h4>
                        <canvas id="mm-query-canvas" class="maxmean-canvas"></canvas>
                    </div>
                    <div class="maxmean-panel">
                        <h4>相似度矩阵</h4>
                        <canvas id="mm-matrix-canvas" class="maxmean-canvas"></canvas>
                    </div>
                    <div class="maxmean-panel">
                        <h4>Candidate (完整歌曲)</h4>
                        <canvas id="mm-candidate-canvas" class="maxmean-canvas"></canvas>
                    </div>
                </div>

                <div class="demo-output" id="mm-output">
                    点击"播放 MaxMean 计算"查看每一步。
                </div>
            `;

            // Bind events
            document.getElementById('mm-query-pattern').addEventListener('change', (e) => {
                this.queryPattern = e.target.value;
                this.resetAnimation();
                this.generateVectors();
                this.draw();
            });

            document.getElementById('mm-candidate-pattern').addEventListener('change', (e) => {
                this.candidatePattern = e.target.value;
                this.resetAnimation();
                this.generateVectors();
                this.draw();
            });

            document.getElementById('mm-animate-btn').addEventListener('click', () => this.animate());
            document.getElementById('mm-reset-btn').addEventListener('click', () => {
                this.resetAnimation();
                this.draw();
            });

            // Setup canvases
            this.queryCanvas = document.getElementById('mm-query-canvas');
            this.candidateCanvas = document.getElementById('mm-candidate-canvas');
            this.matrixCanvas = document.getElementById('mm-matrix-canvas');

            this.resizeCanvases();
            window.addEventListener('resize', () => {
                this.resizeCanvases();
                this.draw();
            });
        },

        resizeCanvases() {
            [this.queryCanvas, this.candidateCanvas, this.matrixCanvas].forEach(canvas => {
                if (!canvas) return;
                const rect = canvas.getBoundingClientRect();
                canvas.width = rect.width * 2;
                canvas.height = rect.height * 2;
                const ctx = canvas.getContext('2d');
                ctx.scale(2, 2);
            });
        },

        generateVectors() {
            const dim = 2;
            const queryCount = 4;
            const candidateCount = 8;

            const qPattern = this.patterns[this.queryPattern] || this.patterns.clustered;
            const cPattern = this.patterns[this.candidatePattern] || this.patterns.shifted;

            if (this.queryPattern === 'mixed') {
                // Some match, some don't
                this.queryVectors = [];
                for (let i = 0; i < queryCount; i++) {
                    if (i < 2) {
                        this.queryVectors.push(BCUtils.clusteredVectors(1, dim, cPattern.candidateCenter, 0.2)[0]);
                    } else {
                        this.queryVectors.push(BCUtils.clusteredVectors(1, dim, cPattern.candidateCenter + Math.PI, 0.5)[0]);
                    }
                }
            } else {
                this.queryVectors = BCUtils.clusteredVectors(queryCount, dim, qPattern.queryCenter, qPattern.spread);
            }

            this.candidateVectors = BCUtils.clusteredVectors(candidateCount, dim, cPattern.candidateCenter, cPattern.spread);
        },

        draw() {
            this.drawVectorPanel(this.queryCanvas, this.queryVectors, 'Query chunks', '#3b82f6');
            this.drawVectorPanel(this.candidateCanvas, this.candidateVectors, 'Candidate chunks', '#10b981');
            this.drawMatrix();
            this.updateOutput();
        },

        drawVectorPanel(canvas, vectors, title, color) {
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const width = canvas.width / 2;
            const height = canvas.height / 2;

            ctx.clearRect(0, 0, width, height);

            // Background
            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-secondary').trim() || '#f8fafc';
            ctx.fillRect(0, 0, width, height);

            const cx = width / 2;
            const cy = height / 2;
            const radius = Math.min(width, height) * 0.35;

            // Unit circle
            ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--border').trim() || '#e2e8f0';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.stroke();

            // Axes
            ctx.beginPath();
            ctx.moveTo(cx - radius - 10, cy);
            ctx.lineTo(cx + radius + 10, cy);
            ctx.moveTo(cx, cy - radius - 10);
            ctx.lineTo(cx, cy + radius + 10);
            ctx.stroke();

            // Vectors
            vectors.forEach((v, i) => {
                const x = cx + v[0] * radius;
                const y = cy - v[1] * radius;

                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(x, y);
                ctx.stroke();

                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-secondary').trim() || '#64748b';
                ctx.font = '11px sans-serif';
                ctx.fillText(`q${i + 1}`, x + 8, y);
            });

            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-primary').trim() || '#1e293b';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(title, width / 2, 16);
        },

        drawMatrix() {
            if (!this.matrixCanvas) return;
            const ctx = this.matrixCanvas.getContext('2d');
            const width = this.matrixCanvas.width / 2;
            const height = this.matrixCanvas.height / 2;

            ctx.clearRect(0, 0, width, height);

            const rows = this.queryVectors.length;
            const cols = this.candidateVectors.length;
            const cellW = (width - 50) / cols;
            const cellH = (height - 40) / rows;
            const offsetX = 35;
            const offsetY = 25;

            // Compute similarities
            const sims = [];
            for (let i = 0; i < rows; i++) {
                sims[i] = [];
                for (let j = 0; j < cols; j++) {
                    sims[i][j] = BCUtils.cosineSimilarity(this.queryVectors[i], this.candidateVectors[j]);
                }
            }

            // Draw cells
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    const sim = sims[i][j];
                    const intensity = (sim + 1) / 2; // -1 to 1 -> 0 to 1

                    let r, g, b;
                    if (intensity < 0.5) {
                        // Blue to white
                        const t = intensity * 2;
                        r = Math.round(59 + (255 - 59) * t);
                        g = Math.round(130 + (255 - 130) * t);
                        b = Math.round(246 + (255 - 246) * t);
                    } else {
                        // White to red
                        const t = (intensity - 0.5) * 2;
                        r = 255;
                        g = Math.round(255 * (1 - t));
                        b = Math.round(255 * (1 - t));
                    }

                    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                    ctx.fillRect(offsetX + j * cellW, offsetY + i * cellH, cellW - 2, cellH - 2);

                    // Highlight if in animation
                    if (this.animationStep >= 0 && i <= this.animationStep) {
                        // Find max for this row
                        let maxJ = 0;
                        for (let k = 1; k < cols; k++) {
                            if (sims[i][k] > sims[i][maxJ]) maxJ = k;
                        }

                        if (j === maxJ) {
                            ctx.strokeStyle = '#F96167';
                            ctx.lineWidth = 3;
                            ctx.strokeRect(offsetX + j * cellW + 1, offsetY + i * cellH + 1, cellW - 4, cellH - 4);
                        }
                    }

                    // Text
                    ctx.fillStyle = intensity > 0.6 ? '#fff' : '#1e293b';
                    ctx.font = '10px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(sim.toFixed(2), offsetX + j * cellW + cellW / 2, offsetY + i * cellH + cellH / 2 + 3);
                }
            }

            // Labels
            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-secondary').trim() || '#64748b';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            for (let j = 0; j < cols; j++) {
                ctx.fillText(`d${j + 1}`, offsetX + j * cellW + cellW / 2, offsetY - 5);
            }
            ctx.textAlign = 'right';
            for (let i = 0; i < rows; i++) {
                ctx.fillText(`q${i + 1}`, offsetX - 5, offsetY + i * cellH + cellH / 2 + 3);
            }
        },

        animate() {
            this.resetAnimation();
            this.animationStep = 0;
            this.playStep();
        },

        playStep() {
            if (this.animationStep >= this.queryVectors.length) {
                this.animationStep = this.queryVectors.length - 1;
                this.draw();
                this.updateOutput(true);

                // Show final result
                const result = BCUtils.maxMean(this.queryVectors, this.candidateVectors);
                const output = document.getElementById('mm-output');
                if (output) {
                    output.innerHTML = `
                        <strong>计算完成！</strong><br>
                        每行最大值：${result.maxIndices.map((idx, i) => `s${i+1}=cos(q${i+1}, d${idx+1})`).join('，')}<br>
                        MaxMean = ${result.score.toFixed(3)}
                    `;
                }
                return;
            }

            this.draw();
            this.updateOutput(false, this.animationStep);

            this.animationTimer = setTimeout(() => {
                this.animationStep++;
                this.playStep();
            }, 1200);
        },

        resetAnimation() {
            if (this.animationTimer) {
                clearTimeout(this.animationTimer);
                this.animationTimer = null;
            }
            this.animationStep = -1;
        },

        updateOutput(final = false, currentRow = -1) {
            const output = document.getElementById('mm-output');
            if (!output) return;

            if (final) return; // Final handled in playStep

            if (currentRow >= 0) {
                const sims = [];
                for (let j = 0; j < this.candidateVectors.length; j++) {
                    sims.push(BCUtils.cosineSimilarity(this.queryVectors[currentRow], this.candidateVectors[j]));
                }
                const maxIdx = sims.indexOf(Math.max(...sims));
                const maxVal = sims[maxIdx];

                output.innerHTML = `
                    <strong>第 ${currentRow + 1} 步</strong>：
                    s${currentRow + 1} = max(cos(q${currentRow + 1}, d_j)) = cos(q${currentRow + 1}, d${maxIdx + 1}) = ${maxVal.toFixed(3)}
                `;
            }
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => MaxMeanCalculator.init());
    } else {
        MaxMeanCalculator.init();
    }
})();
