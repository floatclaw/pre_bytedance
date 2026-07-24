/**
 * Demo: MLP Moon 分类器
 * 用 micrograd 风格的 MLP 训练 2D Moon 数据集，实时显示决策边界和损失曲线。
 */

(function() {
    'use strict';

    const container = document.getElementById('mg-mlp-trainer-demo');
    if (!container) return;

    let model;
    let dataset;
    let lossHistory = [];
    let hiddenSize = 8;
    let learningRate = 0.1;
    let activation = 'tanh';
    let isTraining = false;
    let animationId = null;
    let animationStepsRemaining = 0;

    function init() {
        container.innerHTML = `
            <div class="demo-controls">
                <div class="demo-control-group">
                    <label for="mt-hidden">隐藏层大小</label>
                    <input type="number" id="mt-hidden" min="2" max="16" value="8">
                </div>
                <div class="demo-control-group">
                    <label for="mt-lr">学习率</label>
                    <input type="range" id="mt-lr" min="0.01" max="0.5" step="0.01" value="0.1">
                    <span id="mt-lr-val">0.1</span>
                </div>
                <div class="demo-control-group">
                    <label for="mt-activation">激活函数</label>
                    <select id="mt-activation">
                        <option value="tanh">Tanh</option>
                        <option value="relu">ReLU</option>
                    </select>
                </div>
                <button class="btn btn-primary" id="mt-init">初始化</button>
                <button class="btn btn-primary" id="mt-step10">训练 10 步</button>
                <button class="btn btn-primary" id="mt-step100">训练 100 步</button>
                <button class="btn btn-primary" id="mt-animate">动画训练 50 步</button>
                <button class="btn btn-secondary" id="mt-reset">重置</button>
            </div>
            <div class="demo-grid-2">
                <div>
                    <canvas id="mt-boundary-canvas" class="demo-canvas" width="360" height="300"></canvas>
                </div>
                <div>
                    <canvas id="mt-loss-canvas" class="demo-canvas" width="360" height="300"></canvas>
                </div>
            </div>
            <div class="demo-output" id="mt-output">点击「初始化」生成数据集和模型。</div>
        `;

        document.getElementById('mt-hidden').addEventListener('change', (e) => {
            hiddenSize = parseInt(e.target.value);
            initModel();
        });

        document.getElementById('mt-lr').addEventListener('input', (e) => {
            learningRate = parseFloat(e.target.value);
            document.getElementById('mt-lr-val').textContent = learningRate.toFixed(2);
        });

        document.getElementById('mt-activation').addEventListener('change', (e) => {
            activation = e.target.value;
            initModel();
        });

        document.getElementById('mt-init').addEventListener('click', () => {
            initModel();
        });

        document.getElementById('mt-step10').addEventListener('click', () => train(10));
        document.getElementById('mt-step100').addEventListener('click', () => train(100));
        document.getElementById('mt-animate').addEventListener('click', () => animateTrain(50));
        document.getElementById('mt-reset').addEventListener('click', reset);

        dataset = MGUtils.generateMoons(80, 0.15);
        initModel();
    }

    function reset() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        animationStepsRemaining = 0;
        isTraining = false;
        dataset = MGUtils.generateMoons(80, 0.15);
        lossHistory = [];
        initModel();
        document.getElementById('mt-output').textContent = '数据集和模型已重置。';
    }

    function initModel() {
        model = new MGUtils.MLP(2, [hiddenSize, 1], activation);
        lossHistory = [];
        draw();
        updateOutput('模型已初始化。隐藏层大小：' + hiddenSize + '，激活函数：' + activation);
    }

    function trainOneStep() {
        let totalLoss = new MGUtils.Value(0.0);
        let n = 0;
        for (const point of dataset.points) {
            const x = [new MGUtils.Value(point.x), new MGUtils.Value(point.y)];
            const pred = model.forward(x);
            const label = new MGUtils.Value(point.label * 2 - 1);
            const diff = label.sub(pred);
            const loss = diff.pow(2);
            totalLoss = totalLoss.add(loss);
            n++;
        }

        const avgLoss = totalLoss.mul(1.0 / n);

        model.parameters().forEach(p => p.grad = 0.0);
        avgLoss.backward();

        model.parameters().forEach(p => {
            p.data -= learningRate * p.grad;
        });

        lossHistory.push(avgLoss.data);
        if (lossHistory.length > 200) lossHistory.shift();
    }

    function train(steps) {
        if (isTraining) return;
        isTraining = true;

        const output = document.getElementById('mt-output');
        output.textContent = `训练中... (${steps} 步)`;

        setTimeout(() => {
            for (let step = 0; step < steps; step++) {
                trainOneStep();
            }

            draw();
            const lastLoss = lossHistory[lossHistory.length - 1];
            updateOutput(`完成 ${steps} 步训练。当前损失：${lastLoss.toFixed(4)}，总步数：${lossHistory.length}`);
            isTraining = false;
        }, 10);
    }

    function animateTrain(totalSteps) {
        if (isTraining || animationStepsRemaining > 0) return;
        animationStepsRemaining = totalSteps;
        updateOutput('动画训练中...');

        function step() {
            if (animationStepsRemaining <= 0) {
                isTraining = false;
                const lastLoss = lossHistory[lossHistory.length - 1];
                updateOutput(`动画训练完成。当前损失：${lastLoss.toFixed(4)}，总步数：${lossHistory.length}`);
                return;
            }

            isTraining = true;
            trainOneStep();
            animationStepsRemaining--;
            draw();
            const lastLoss = lossHistory[lossHistory.length - 1];
            updateOutput(`动画训练：第 ${totalSteps - animationStepsRemaining} / ${totalSteps} 步，损失 ${lastLoss.toFixed(4)}`);
            animationId = requestAnimationFrame(() => setTimeout(step, 50));
        }

        step();
    }

    function updateOutput(text) {
        const output = document.getElementById('mt-output');
        if (output) output.textContent = text;
    }

    function predict(x, y) {
        const inputs = [new MGUtils.Value(x), new MGUtils.Value(y)];
        return model.forward(inputs).data;
    }

    function draw() {
        drawBoundary();
        drawLoss();
    }

    function drawBoundary() {
        const canvas = document.getElementById('mt-boundary-canvas');
        if (!canvas || !model) return;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-primary').trim() || '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const padding = 20;
        const plotSize = Math.min(canvas.width, canvas.height) - 2 * padding;
        const xMin = -1.5, xMax = 2.5;
        const yMin = -1.0, yMax = 2.0;

        function toCanvasX(x) {
            return padding + (x - xMin) / (xMax - xMin) * plotSize;
        }

        function toCanvasY(y) {
            return padding + (yMax - y) / (yMax - yMin) * plotSize;
        }

        const gridSize = 20;
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const x = MGUtils.lerp(xMin, xMax, i / (gridSize - 1));
                const y = MGUtils.lerp(yMin, yMax, j / (gridSize - 1));
                const score = predict(x, y);
                const alpha = Math.min(1, Math.max(0, (score + 1) / 2));
                const r = Math.floor(254 * alpha + 219 * (1 - alpha));
                const g = Math.floor(129 * alpha + 234 * (1 - alpha));
                const b = Math.floor(129 * alpha + 254 * (1 - alpha));
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                const cx = toCanvasX(x);
                const cy = toCanvasY(y);
                const cellW = plotSize / gridSize + 1;
                const cellH = plotSize / gridSize + 1;
                ctx.fillRect(cx - cellW/2, cy - cellH/2, cellW, cellH);
            }
        }

        dataset.points.forEach(p => {
            const cx = toCanvasX(p.x);
            const cy = toCanvasY(p.y);
            ctx.fillStyle = p.label === 0 ? '#3b82f6' : '#F96167';
            ctx.beginPath();
            ctx.arc(cx, cy, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-primary').trim() || '#1e293b';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('● 类别 0', padding, canvas.height - 10);
        ctx.fillStyle = '#F96167';
        ctx.fillText('● 类别 1', padding + 70, canvas.height - 10);
    }

    function drawLoss() {
        const canvas = document.getElementById('mt-loss-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-primary').trim() || '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (lossHistory.length < 2) {
            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-secondary').trim() || '#64748b';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('训练后显示损失曲线', canvas.width / 2, canvas.height / 2);
            return;
        }

        const padding = 30;
        const plotW = canvas.width - 2 * padding;
        const plotH = canvas.height - 2 * padding;

        const maxLoss = Math.max(...lossHistory);
        const minLoss = Math.min(...lossHistory);
        const lossRange = Math.max(0.1, maxLoss - minLoss);

        ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--border').trim() || '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;
        for (let i = 0; i <= 4; i++) {
            const y = padding + plotH * i / 4;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(canvas.width - padding, y);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;

        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        lossHistory.forEach((loss, i) => {
            const x = padding + (i / (lossHistory.length - 1)) * plotW;
            const y = padding + (1 - (loss - minLoss) / lossRange) * plotH;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-primary').trim() || '#1e293b';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Loss', padding, padding - 10);
        ctx.fillText(maxLoss.toFixed(3), padding - 25, padding + 5);
        ctx.fillText(minLoss.toFixed(3), padding - 25, canvas.height - padding);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    document.addEventListener('themeChanged', () => {
        if (document.getElementById('mt-boundary-canvas')) draw();
    });
})();
