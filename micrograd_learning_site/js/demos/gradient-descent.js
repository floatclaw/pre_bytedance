/**
 * Demo: 梯度下降可视化器
 * 展示 SGD 如何在 1D 损失曲面上一步步下降。
 */

(function() {
    'use strict';

    const container = document.getElementById('mg-gradient-descent-demo');
    if (!container) return;

    let learningRate = 0.15;
    let startX = 2.5;
    let steps = [];
    let currentStep = -1;

    function init() {
        container.innerHTML = `
            <div class="demo-controls">
                <div class="demo-control-group">
                    <label for="gd-lr">学习率</label>
                    <input type="range" id="gd-lr" min="0.01" max="0.5" step="0.01" value="0.15">
                    <span id="gd-lr-val">0.15</span>
                </div>
                <div class="demo-control-group">
                    <label for="gd-start">起始点 x = <span id="gd-start-val">2.5</span></label>
                    <input type="range" id="gd-start" min="-3" max="3" step="0.1" value="2.5">
                </div>
                <button class="btn btn-primary" id="gd-run">运行 SGD</button>
                <button class="btn btn-secondary" id="gd-reset">重置</button>
            </div>
            <canvas id="gd-canvas" class="demo-canvas" width="720" height="320"></canvas>
            <div class="demo-output" id="gd-output">点击「运行 SGD」观察参数如何沿负梯度方向下降到损失最低点。</div>
        `;

        document.getElementById('gd-lr').addEventListener('input', (e) => {
            learningRate = parseFloat(e.target.value);
            document.getElementById('gd-lr-val').textContent = learningRate.toFixed(2);
            resetSteps();
        });

        document.getElementById('gd-start').addEventListener('input', (e) => {
            startX = parseFloat(e.target.value);
            document.getElementById('gd-start-val').textContent = startX.toFixed(1);
            resetSteps();
        });

        document.getElementById('gd-run').addEventListener('click', runSGD);
        document.getElementById('gd-reset').addEventListener('click', resetSteps);

        resetSteps();
    }

    function loss(x) {
        // A simple convex function: (x - 0.5)^2 + 0.2*sin(3x)
        return (x - 0.5) ** 2 + 0.2 * Math.sin(3 * x);
    }

    function grad(x) {
        const h = 1e-5;
        return (loss(x + h) - loss(x - h)) / (2 * h);
    }

    function runSGD() {
        steps = [];
        let x = startX;
        for (let i = 0; i < 30; i++) {
            const g = grad(x);
            steps.push({ x, loss: loss(x), grad: g });
            if (Math.abs(g) < 0.01) break;
            x = x - learningRate * g;
        }
        steps.push({ x, loss: loss(x), grad: grad(x) });
        currentStep = 0;
        animate();
    }

    function animate() {
        if (currentStep < steps.length) {
            draw();
            const s = steps[currentStep];
            document.getElementById('gd-output').innerHTML = `
                第 <strong>${currentStep + 1}</strong> / ${steps.length} 步：
                x = <strong>${s.x.toFixed(3)}</strong>，
                loss = <strong>${s.loss.toFixed(4)}</strong>，
                梯度 = <strong>${s.grad.toFixed(4)}</strong>
                <br><span style="color: var(--text-secondary)">更新：x = x - lr × 梯度 = ${(s.x - learningRate * s.grad).toFixed(3)}</span>
            `;
            currentStep++;
            setTimeout(animate, 600);
        }
    }

    function resetSteps() {
        steps = [];
        currentStep = -1;
        document.getElementById('gd-output').textContent = '点击「运行 SGD」观察参数如何沿负梯度方向下降到损失最低点。';
        draw();
    }

    function draw() {
        const canvas = document.getElementById('gd-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-primary').trim() || '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const padding = 40;
        const plotW = canvas.width - 2 * padding;
        const plotH = canvas.height - 2 * padding;
        const xMin = -3.5, xMax = 3.5;
        const yMin = -0.5, yMax = 3.5;

        function toCanvasX(x) {
            return padding + (x - xMin) / (xMax - xMin) * plotW;
        }

        function toCanvasY(y) {
            return padding + (yMax - y) / (yMax - yMin) * plotH;
        }

        // Grid
        ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--border').trim() || '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;
        for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x++) {
            ctx.beginPath();
            ctx.moveTo(toCanvasX(x), padding);
            ctx.lineTo(toCanvasX(x), canvas.height - padding);
            ctx.stroke();
        }
        for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y++) {
            ctx.beginPath();
            ctx.moveTo(padding, toCanvasY(y));
            ctx.lineTo(canvas.width - padding, toCanvasY(y));
            ctx.stroke();
        }
        ctx.globalAlpha = 1;

        // Axes
        ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--text-secondary').trim() || '#64748b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(padding, toCanvasY(0));
        ctx.lineTo(canvas.width - padding, toCanvasY(0));
        ctx.stroke();

        // Loss curve
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let px = 0; px <= plotW; px += 2) {
            const x = xMin + px / plotW * (xMax - xMin);
            const y = loss(x);
            const cx = toCanvasX(x);
            const cy = toCanvasY(y);
            if (px === 0) ctx.moveTo(cx, cy);
            else ctx.lineTo(cx, cy);
        }
        ctx.stroke();

        // Draw SGD path
        if (steps.length > 0 && currentStep >= 0) {
            ctx.strokeStyle = '#F96167';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            for (let i = 0; i <= currentStep && i < steps.length; i++) {
                const s = steps[i];
                const cx = toCanvasX(s.x);
                const cy = toCanvasY(s.loss);
                if (i === 0) ctx.moveTo(cx, cy);
                else ctx.lineTo(cx, cy);
            }
            ctx.stroke();
            ctx.setLineDash([]);

            // Current point
            const s = steps[Math.min(currentStep, steps.length - 1)];
            ctx.fillStyle = '#F96167';
            ctx.beginPath();
            ctx.arc(toCanvasX(s.x), toCanvasY(s.loss), 7, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Starting point
            ctx.fillStyle = '#F96167';
            ctx.beginPath();
            ctx.arc(toCanvasX(startX), toCanvasY(loss(startX)), 7, 0, Math.PI * 2);
            ctx.fill();
        }

        // Labels
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-primary').trim() || '#1e293b';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('— 损失函数 L(x)', padding + 10, padding - 10);
        ctx.fillStyle = '#F96167';
        ctx.fillText('— SGD 下降路径', padding + 130, padding - 10);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    document.addEventListener('themeChanged', () => {
        if (document.getElementById('gd-canvas')) draw();
    });
})();
