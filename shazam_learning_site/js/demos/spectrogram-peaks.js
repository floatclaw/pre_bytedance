/**
 * Demo: 频谱峰值提取器
 * 用 SZUtils 生成合成时频图，拖动阈值观察峰值变化。
 */

(function() {
    'use strict';

    const container = document.getElementById('spectrogram-peaks-demo');
    if (!container) return;

    const TIME_BINS = 40;
    const FREQ_BINS = 32;
    const SPECTROGRAM = SZUtils.generateSpectrogram(TIME_BINS, FREQ_BINS, 42);

    let threshold = 0.6;
    let neighborhood = 1;

    function init() {
        container.innerHTML = `
            <div class="demo-controls">
                <div class="demo-control-group">
                    <label for="sz-peak-threshold">能量阈值</label>
                    <input type="range" id="sz-peak-threshold" min="0.3" max="0.95" step="0.05" value="${threshold}">
                    <span id="sz-threshold-value">${threshold}</span>
                </div>
                <div class="demo-control-group">
                    <label for="sz-peak-neighborhood">邻域大小</label>
                    <select id="sz-peak-neighborhood">
                        <option value="1" selected>1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                    </select>
                </div>
            </div>
            <canvas id="sz-spectrogram-canvas" class="demo-canvas" width="720" height="360"></canvas>
            <div class="demo-output" id="sz-peak-output"></div>
        `;

        const thresholdInput = document.getElementById('sz-peak-threshold');
        const thresholdValue = document.getElementById('sz-threshold-value');
        const neighborhoodSelect = document.getElementById('sz-peak-neighborhood');

        thresholdInput.addEventListener('input', (e) => {
            threshold = parseFloat(e.target.value);
            thresholdValue.textContent = threshold.toFixed(2);
            draw();
        });

        neighborhoodSelect.addEventListener('change', (e) => {
            neighborhood = parseInt(e.target.value);
            draw();
        });

        draw();
    }

    function draw() {
        const canvas = document.getElementById('sz-spectrogram-canvas');
        const output = document.getElementById('sz-peak-output');
        if (!canvas || !output) return;

        const ctx = canvas.getContext('2d');
        const peaks = SZUtils.findPeaks(SPECTROGRAM, threshold, neighborhood);

        // Background
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-primary').trim() || '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const cellW = canvas.width / TIME_BINS;
        const cellH = canvas.height / FREQ_BINS;

        // Draw spectrogram cells
        for (let t = 0; t < TIME_BINS; t++) {
            for (let f = 0; f < FREQ_BINS; f++) {
                const val = SPECTROGRAM[t][f];
                const intensity = Math.floor(val * 255);
                ctx.fillStyle = `rgb(${40 + intensity * 0.6}, ${80 + intensity * 0.7}, ${180 + intensity * 0.4})`;
                ctx.fillRect(t * cellW + 1, (FREQ_BINS - 1 - f) * cellH + 1, cellW - 2, cellH - 2);
            }
        }

        // Draw peaks
        ctx.fillStyle = '#F96167';
        peaks.forEach(p => {
            const x = p.t * cellW + cellW / 2;
            const y = (FREQ_BINS - 1 - p.f) * cellH + cellH / 2;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
        });

        // Labels
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-secondary').trim() || '#64748b';
        ctx.font = '12px sans-serif';
        ctx.fillText('时间 →', canvas.width - 60, canvas.height - 10);
        ctx.save();
        ctx.translate(14, canvas.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('频率 →', 0, 0);
        ctx.restore();

        output.innerHTML = `
            当前阈值：<strong>${threshold.toFixed(2)}</strong>，
            邻域：<strong>${neighborhood}</strong>，
            检测到峰值：<strong>${peaks.length}</strong> 个
            <br><span style="color: var(--text-secondary)">
            红色圆点即为满足「能量 ≥ 阈值」且「比周围邻域都高」的局部最大值。</span>
        `;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
