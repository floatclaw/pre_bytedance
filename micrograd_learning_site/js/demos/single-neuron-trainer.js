/**
 * Demo: 单个神经元训练器
 * 用感知机学习规则训练一个神经元学会 AND 门，实时显示决策边界和参数变化。
 */

(function() {
    'use strict';

    const container = document.getElementById('mg-single-neuron-trainer-demo');
    if (!container) return;

    let w1, w2, b;
    let lr = 0.3;
    let epoch = 0;
    let history = [];
    let animationId = null;
    let isAnimating = false;

    const samples = [
        { x1: 0, x2: 0, y: 0 },
        { x1: 0, x2: 1, y: 0 },
        { x1: 1, x2: 0, y: 0 },
        { x1: 1, x2: 1, y: 1 }
    ];

    function init() {
        container.innerHTML = `
            <div class="demo-controls">
                <div class="demo-control-group">
                    <label for="snt-lr">学习率</label>
                    <input type="range" id="snt-lr" min="0.05" max="0.5" step="0.05" value="0.3">
                    <span id="snt-lr-val">0.3</span>
                </div>
                <button class="btn btn-primary" id="snt-reset">随机初始化</button>
                <button class="btn btn-primary" id="snt-step">训练 1 步</button>
                <button class="btn btn-primary" id="snt-train10">训练 10 步</button>
                <button class="btn btn-primary" id="snt-auto">自动训练</button>
                <button class="btn btn-secondary" id="snt-stop">停止</button>
            </div>
            <div class="demo-grid-2">
                <div>
                    <canvas id="snt-canvas" class="demo-canvas" width="360" height="360"></canvas>
                </div>
                <div class="demo-panel" id="snt-info">
                    <h4>训练状态</h4>
                    <div id="snt-status">点击「随机初始化」开始。</div>
                    <div id="snt-params" style="margin-top: 12px; font-family: monospace; font-size: 0.9rem;"></div>
                    <div id="snt-preds" style="margin-top: 12px;"></div>
                </div>
            </div>
            <div class="demo-output" id="snt-output">这个 Demo 用感知机学习规则：预测错了就调整权重和偏置，直到所有 AND 样本都正确。</div>
        `;

        document.getElementById('snt-lr').addEventListener('input', (e) => {
            lr = parseFloat(e.target.value);
            document.getElementById('snt-lr-val').textContent = lr.toFixed(2);
        });

        document.getElementById('snt-reset').addEventListener('click', reset);
        document.getElementById('snt-step').addEventListener('click', () => trainSteps(1));
        document.getElementById('snt-train10').addEventListener('click', () => trainSteps(10));
        document.getElementById('snt-auto').addEventListener('click', autoTrain);
        document.getElementById('snt-stop').addEventListener('click', stopAnimation);

        reset();
    }

    function reset() {
        stopAnimation();
        w1 = (Math.random() * 2 - 1);
        w2 = (Math.random() * 2 - 1);
        b = (Math.random() * 2 - 1);
        epoch = 0;
        history = [{ w1, w2, b }];
        updateInfo();
        draw();
        updateOutput('已随机初始化权重和偏置。点击「训练 1 步」观察学习过程。');
    }

    function predict(x1, x2) {
        return (w1 * x1 + w2 * x2 + b) > 0 ? 1 : 0;
    }

    function trainOneStep() {
        let errors = 0;
        for (const s of samples) {
            const pred = predict(s.x1, s.x2);
            if (pred !== s.y) {
                errors++;
                const error = s.y - pred;
                w1 += lr * error * s.x1;
                w2 += lr * error * s.x2;
                b += lr * error;
                history.push({ w1, w2, b });
            }
        }
        epoch++;
        return errors;
    }

    function trainSteps(steps) {
        stopAnimation();
        for (let i = 0; i < steps; i++) {
            const errors = trainOneStep();
            if (errors === 0) {
                updateInfo();
                draw();
                updateOutput(`训练完成！在第 ${epoch} 轮收敛。所有 AND 样本预测正确。`);
                return;
            }
        }
        updateInfo();
        draw();
        updateOutput(`已训练 ${epoch} 轮。当前仍有错误样本，继续训练。`);
    }

    function autoTrain() {
        if (isAnimating) return;
        isAnimating = true;
        updateOutput('自动训练中...');

        function loop() {
            if (!isAnimating) return;
            const errors = trainOneStep();
            updateInfo();
            draw();
            if (errors === 0) {
                isAnimating = false;
                updateOutput(`自动训练完成！在第 ${epoch} 轮收敛。`);
                return;
            }
            if (epoch >= 100) {
                isAnimating = false;
                updateOutput('已达到最大轮数（100），尚未收敛。尝试调整学习率或重新初始化。');
                return;
            }
            animationId = setTimeout(() => requestAnimationFrame(loop), 300);
        }

        loop();
    }

    function stopAnimation() {
        isAnimating = false;
        if (animationId) {
            clearTimeout(animationId);
            animationId = null;
        }
    }

    function updateInfo() {
        const status = document.getElementById('snt-status');
        const params = document.getElementById('snt-params');
        const preds = document.getElementById('snt-preds');
        if (!status || !params || !preds) return;

        status.textContent = `已训练 ${epoch} 轮`;
        params.innerHTML = `
            w₁ = ${w1.toFixed(4)}<br>
            w₂ = ${w2.toFixed(4)}<br>
            b = ${b.toFixed(4)}
        `;

        let predHtml = '<table style="width:100%; font-size:0.85rem;"><tr><th>x₁</th><th>x₂</th><th>目标</th><th>预测</th></tr>';
        for (const s of samples) {
            const pred = predict(s.x1, s.x2);
            const correct = pred === s.y ? '✅' : '❌';
            predHtml += `<tr><td>${s.x1}</td><td>${s.x2}</td><td>${s.y}</td><td>${pred} ${correct}</td></tr>`;
        }
        predHtml += '</table>';
        preds.innerHTML = predHtml;
    }

    function updateOutput(text) {
        const output = document.getElementById('snt-output');
        if (output) output.textContent = text;
    }

    function draw() {
        const canvas = document.getElementById('snt-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-primary').trim() || '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const padding = 40;
        const plotSize = Math.min(canvas.width, canvas.height) - 2 * padding;

        function toCanvasX(x) {
            return padding + x * plotSize;
        }

        function toCanvasY(y) {
            return padding + (1 - y) * plotSize;
        }

        // Grid
        ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--border').trim() || '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;
        for (let i = 0; i <= 2; i++) {
            const x = padding + i * 0.5 * plotSize;
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, canvas.height - padding);
            ctx.stroke();
        }
        for (let i = 0; i <= 2; i++) {
            const y = padding + i * 0.5 * plotSize;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(canvas.width - padding, y);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;

        // Axes labels
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-secondary').trim() || '#64748b';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('x₁', canvas.width / 2, canvas.height - 10);
        ctx.save();
        ctx.translate(15, canvas.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('x₂', 0, 0);
        ctx.restore();

        // Decision boundary
        ctx.strokeStyle = '#F96167';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        if (Math.abs(w2) > 1e-6) {
            const xA = 0;
            const yA = -(w1 * xA + b) / w2;
            const xB = 1;
            const yB = -(w1 * xB + b) / w2;
            ctx.moveTo(toCanvasX(xA), toCanvasY(yA));
            ctx.lineTo(toCanvasX(xB), toCanvasY(yB));
        } else if (Math.abs(w1) > 1e-6) {
            const xC = -b / w1;
            ctx.moveTo(toCanvasX(xC), toCanvasY(0));
            ctx.lineTo(toCanvasX(xC), toCanvasY(1));
        }
        ctx.stroke();

        // Data points
        samples.forEach(s => {
            const cx = toCanvasX(s.x1);
            const cy = toCanvasY(s.x2);
            ctx.fillStyle = s.y === 1 ? '#F96167' : '#3b82f6';
            ctx.beginPath();
            ctx.arc(cx, cy, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(s.y.toString(), cx, cy);
            ctx.textBaseline = 'alphabetic';
        });

        // Legend
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-primary').trim() || '#1e293b';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('● 类别 0', padding, padding - 10);
        ctx.fillStyle = '#F96167';
        ctx.fillText('● 类别 1', padding + 70, padding - 10);
        ctx.fillStyle = '#F96167';
        ctx.fillText('— 决策边界', padding + 140, padding - 10);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    document.addEventListener('themeChanged', () => {
        if (document.getElementById('snt-canvas')) draw();
    });
})();
