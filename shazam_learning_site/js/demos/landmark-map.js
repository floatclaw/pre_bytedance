/**
 * Demo: Landmark 星座图可视化
 * 在时频平面上显示峰值点，并展示加噪声后主峰结构仍然保留。
 */

(function() {
    'use strict';

    const container = document.getElementById('landmark-map-demo');
    if (!container) return;

    const TIME_BINS = 50;
    const FREQ_BINS = 36;
    const BASE_SPECTROGRAM = SZUtils.generateSpectrogram(TIME_BINS, FREQ_BINS, 123);
    let noiseLevel = 0.2;

    function init() {
        container.innerHTML = `
            <div class="demo-controls">
                <div class="demo-control-group">
                    <label for="sz-landmark-noise">噪声强度</label>
                    <input type="range" id="sz-landmark-noise" min="0" max="0.8" step="0.05" value="${noiseLevel}">
                    <span id="sz-noise-value">${noiseLevel}</span>
                </div>
                <div class="demo-control-group">
                    <label><input type="checkbox" id="sz-show-density" checked> 显示时频背景</label>
                </div>
            </div>
            <canvas id="sz-landmark-canvas" class="demo-canvas" width="720" height="360"></canvas>
            <div class="demo-output" id="sz-landmark-output"></div>
        `;

        const noiseInput = document.getElementById('sz-landmark-noise');
        const noiseValue = document.getElementById('sz-noise-value');
        const showDensity = document.getElementById('sz-show-density');

        noiseInput.addEventListener('input', (e) => {
            noiseLevel = parseFloat(e.target.value);
            noiseValue.textContent = noiseLevel.toFixed(2);
            draw();
        });

        showDensity.addEventListener('change', draw);

        draw();
    }

    function addNoise(spectrogram, level) {
        const out = [];
        for (let t = 0; t < spectrogram.length; t++) {
            const frame = [];
            for (let f = 0; f < spectrogram[t].length; f++) {
                const n = SZUtils.seededRandom(t * 1000 + f + 999) * level;
                frame.push(Math.min(1, spectrogram[t][f] + n));
            }
            out.push(frame);
        }
        return out;
    }

    function draw() {
        const canvas = document.getElementById('sz-landmark-canvas');
        const output = document.getElementById('sz-landmark-output');
        if (!canvas || !output) return;

        const ctx = canvas.getContext('2d');
        const spectrogram = addNoise(BASE_SPECTROGRAM, noiseLevel);
        const peaks = SZUtils.findPeaks(spectrogram, 0.65, 1);

        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-primary').trim() || '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const cellW = canvas.width / TIME_BINS;
        const cellH = canvas.height / FREQ_BINS;
        const showDensity = document.getElementById('sz-show-density').checked;

        // Draw density background
        if (showDensity) {
            for (let t = 0; t < TIME_BINS; t++) {
                for (let f = 0; f < FREQ_BINS; f++) {
                    const val = spectrogram[t][f];
                    const alpha = val * 0.35;
                    ctx.fillStyle = `rgba(59, 130, 246, ${alpha})`;
                    ctx.fillRect(t * cellW, (FREQ_BINS - 1 - f) * cellH, cellW, cellH);
                }
            }
        }

        // Draw grid
        ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--border').trim() || '#e2e8f0';
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = 0.4;
        for (let t = 0; t <= TIME_BINS; t++) {
            ctx.beginPath();
            ctx.moveTo(t * cellW, 0);
            ctx.lineTo(t * cellW, canvas.height);
            ctx.stroke();
        }
        for (let f = 0; f <= FREQ_BINS; f++) {
            ctx.beginPath();
            ctx.moveTo(0, f * cellH);
            ctx.lineTo(canvas.width, f * cellH);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;

        // Draw constellation peaks
        ctx.fillStyle = '#F96167';
        ctx.shadowColor = 'rgba(249, 97, 103, 0.6)';
        ctx.shadowBlur = 8;
        peaks.forEach(p => {
            const x = p.t * cellW + cellW / 2;
            const y = (FREQ_BINS - 1 - p.f) * cellH + cellH / 2;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.shadowBlur = 0;

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
            噪声强度：<strong>${noiseLevel.toFixed(2)}</strong>，
            检测到的 landmark 峰值：<strong>${peaks.length}</strong> 个
            <br><span style="color: var(--text-secondary)">
            即使加入噪声，能量最强的峰值位置仍然保持稳定，整体星座模式仍然可辨认。</span>
        `;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
