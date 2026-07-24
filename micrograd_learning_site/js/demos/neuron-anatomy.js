/**
 * Demo: 单个神经元解剖图
 * 交互式展示输入、权重、偏置、加权求和与激活函数。
 */

(function() {
    'use strict';

    const container = document.getElementById('mg-neuron-anatomy-demo');
    if (!container) return;

    let weights = [0.5, -0.3];
    let bias = 0.2;
    let inputs = [1.0, -0.5];
    let activation = 'tanh';

    function init() {
        container.innerHTML = `
            <div class="demo-controls">
                <div class="demo-control-group">
                    <label for="na-activation">激活函数</label>
                    <select id="na-activation">
                        <option value="tanh">Tanh</option>
                        <option value="relu">ReLU</option>
                        <option value="sigmoid">Sigmoid</option>
                        <option value="linear">Linear</option>
                    </select>
                </div>
                <div class="demo-control-group">
                    <label for="na-x1">x₁ = <span id="na-x1-val">1.0</span></label>
                    <input type="range" id="na-x1" min="-2" max="2" step="0.1" value="1.0">
                </div>
                <div class="demo-control-group">
                    <label for="na-x2">x₂ = <span id="na-x2-val">-0.5</span></label>
                    <input type="range" id="na-x2" min="-2" max="2" step="0.1" value="-0.5">
                </div>
                <div class="demo-control-group">
                    <label for="na-w1">w₁ = <span id="na-w1-val">0.5</span></label>
                    <input type="range" id="na-w1" min="-2" max="2" step="0.1" value="0.5">
                </div>
                <div class="demo-control-group">
                    <label for="na-w2">w₂ = <span id="na-w2-val">-0.3</span></label>
                    <input type="range" id="na-w2" min="-2" max="2" step="0.1" value="-0.3">
                </div>
                <div class="demo-control-group">
                    <label for="na-b">b = <span id="na-b-val">0.2</span></label>
                    <input type="range" id="na-b" min="-2" max="2" step="0.1" value="0.2">
                </div>
            </div>
            <div class="demo-grid-2">
                <div>
                    <canvas id="na-canvas" class="demo-canvas" width="360" height="320"></canvas>
                </div>
                <div class="demo-panel" id="na-info">
                    <h4>计算过程</h4>
                    <div id="na-steps"></div>
                </div>
            </div>
        `;

        document.getElementById('na-activation').addEventListener('change', (e) => {
            activation = e.target.value;
            update();
        });

        ['x1', 'x2', 'w1', 'w2', 'b'].forEach(name => {
            document.getElementById(`na-${name}`).addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                if (name === 'x1') inputs[0] = val;
                else if (name === 'x2') inputs[1] = val;
                else if (name === 'w1') weights[0] = val;
                else if (name === 'w2') weights[1] = val;
                else if (name === 'b') bias = val;
                document.getElementById(`na-${name}-val`).textContent = val.toFixed(1);
                update();
            });
        });

        update();
    }

    function activate(x) {
        if (activation === 'tanh') return Math.tanh(x);
        if (activation === 'relu') return x < 0 ? 0 : x;
        if (activation === 'sigmoid') return 1 / (1 + Math.exp(-x));
        return x;
    }

    function update() {
        const weightedSum = weights[0] * inputs[0] + weights[1] * inputs[1] + bias;
        const output = activate(weightedSum);

        draw(weightedSum, output);
        showSteps(weightedSum, output);
    }

    function draw(weightedSum, output) {
        const canvas = document.getElementById('na-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-primary').trim() || '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const nodeX = canvas.width / 2;
        const nodeY = canvas.height / 2;
        const inputX = 60;
        const inputY1 = 100;
        const inputY2 = canvas.height - 100;

        // Draw edges with weights
        ctx.strokeStyle = weights[0] >= 0 ? '#3b82f6' : '#F96167';
        ctx.lineWidth = Math.min(5, Math.abs(weights[0]) * 3 + 1);
        ctx.beginPath();
        ctx.moveTo(inputX, inputY1);
        ctx.lineTo(nodeX, nodeY);
        ctx.stroke();

        ctx.strokeStyle = weights[1] >= 0 ? '#3b82f6' : '#F96167';
        ctx.lineWidth = Math.min(5, Math.abs(weights[1]) * 3 + 1);
        ctx.beginPath();
        ctx.moveTo(inputX, inputY2);
        ctx.lineTo(nodeX, nodeY);
        ctx.stroke();

        // Draw input nodes
        drawNode(ctx, inputX, inputY1, `x₁\n${inputs[0].toFixed(1)}`, '#dbeafe', '#3b82f6');
        drawNode(ctx, inputX, inputY2, `x₂\n${inputs[1].toFixed(1)}`, '#dbeafe', '#3b82f6');

        // Draw weight labels
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-primary').trim() || '#1e293b';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`w₁=${weights[0].toFixed(1)}`, (inputX + nodeX) / 2, (inputY1 + nodeY) / 2 - 10);
        ctx.fillText(`w₂=${weights[1].toFixed(1)}`, (inputX + nodeX) / 2, (inputY2 + nodeY) / 2 + 20);

        // Draw main neuron
        drawNode(ctx, nodeX, nodeY, `Σ+${activation}\n${output.toFixed(2)}`, '#fef3c7', '#f59e0b', 55);

        // Draw bias
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-secondary').trim() || '#64748b';
        ctx.font = '12px sans-serif';
        ctx.fillText(`bias = ${bias.toFixed(1)}`, nodeX, nodeY + 75);

        // Draw output arrow
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(nodeX + 55, nodeY);
        ctx.lineTo(nodeX + 110, nodeY);
        ctx.stroke();
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(`output = ${output.toFixed(2)}`, nodeX + 130, nodeY + 5);

        ctx.textAlign = 'left';
    }

    function drawNode(ctx, x, y, text, fill, stroke, radius = 40) {
        ctx.fillStyle = fill;
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-primary').trim() || '#1e293b';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const lines = text.split('\n');
        lines.forEach((line, i) => {
            const offset = (lines.length - 1) * 8;
            ctx.fillText(line, x, y - offset + i * 16);
        });
        ctx.textBaseline = 'alphabetic';
    }

    function showSteps(weightedSum, output) {
        const w1x1 = weights[0] * inputs[0];
        const w2x2 = weights[1] * inputs[1];

        document.getElementById('na-steps').innerHTML = `
            <p><strong>1. 加权求和</strong></p>
            <p>z = w₁·x₁ + w₂·x₂ + b</p>
            <p>z = ${weights[0].toFixed(1)} × ${inputs[0].toFixed(1)} + ${weights[1].toFixed(1)} × ${inputs[1].toFixed(1)} + ${bias.toFixed(1)}</p>
            <p>z = ${w1x1.toFixed(2)} + ${w2x2.toFixed(2)} + ${bias.toFixed(1)} = <strong>${weightedSum.toFixed(2)}</strong></p>
            <p><strong>2. 激活函数</strong></p>
            <p>${activation}(${weightedSum.toFixed(2)}) = <strong>${output.toFixed(2)}</strong></p>
        `;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    document.addEventListener('themeChanged', () => {
        if (document.getElementById('na-canvas')) update();
    });
})();
