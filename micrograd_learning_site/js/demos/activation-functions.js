/**
 * Demo: 激活函数探索器
 * 绘制 Tanh、Sigmoid、ReLU 及其导数，拖动输入点观察输出和导数。
 */

(function() {
    'use strict';

    const container = document.getElementById('mg-activation-functions-demo');
    if (!container) return;

    const functions = {
        tanh: { fn: Math.tanh, label: 'Tanh', color: '#3b82f6' },
        sigmoid: { fn: x => 1 / (1 + Math.exp(-x)), label: 'Sigmoid', color: '#10b981' },
        relu: { fn: x => x < 0 ? 0 : x, label: 'ReLU', color: '#f59e0b' }
    };

    let currentFn = 'tanh';
    let inputX = 0.5;

    function init() {
        container.innerHTML = `
            <div class="demo-controls">
                <div class="demo-control-group">
                    <label for="af-fn">函数</label>
                    <select id="af-fn">
                        <option value="tanh">Tanh</option>
                        <option value="sigmoid">Sigmoid</option>
                        <option value="relu">ReLU</option>
                    </select>
                </div>
                <div class="demo-control-group">
                    <label for="af-x">x = <span id="af-x-val">0.5</span></label>
                    <input type="range" id="af-x" min="-4" max="4" step="0.05" value="0.5">
                </div>
            </div>
            <canvas id="af-canvas" class="demo-canvas" width="720" height="300"></canvas>
            <div class="demo-output" id="af-output"></div>
        `;

        document.getElementById('af-fn').addEventListener('change', (e) => {
            currentFn = e.target.value;
            update();
        });

        document.getElementById('af-x').addEventListener('input', (e) => {
            inputX = parseFloat(e.target.value);
            document.getElementById('af-x-val').textContent = inputX.toFixed(2);
            update();
        });

        // Canvas drag interaction
        const canvas = document.getElementById('af-canvas');
        canvas.addEventListener('mousedown', handleDrag);
        canvas.addEventListener('mousemove', (e) => {
            if (e.buttons === 1) handleDrag(e);
        });
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length > 0) handleDrag(e.touches[0]);
        }, { passive: false });

        update();
    }

    function handleDrag(e) {
        const canvas = document.getElementById('af-canvas');
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX;
        const scaleX = canvas.width / rect.width;
        const canvasX = (clientX - rect.left) * scaleX;

        const xMin = -4, xMax = 4;
        const padding = 40;
        const plotWidth = canvas.width - 2 * padding;
        const newX = xMin + (canvasX - padding) / plotWidth * (xMax - xMin);

        if (newX >= xMin && newX <= xMax) {
            inputX = Math.round(newX * 20) / 20;
            document.getElementById('af-x').value = inputX;
            document.getElementById('af-x-val').textContent = inputX.toFixed(2);
            update();
        }
    }

    function derivative(fn, x) {
        const h = 1e-5;
        return (fn(x + h) - fn(x - h)) / (2 * h);
    }

    function update() {
        draw();
        const fn = functions[currentFn].fn;
        const y = fn(inputX);
        const d = derivative(fn, inputX);

        let note = '';
        if (currentFn === 'tanh' || currentFn === 'sigmoid') {
            if (Math.abs(inputX) > 2.5) note = 'x 进入饱和区，导数接近 0，容易出现梯度消失。';
        } else if (currentFn === 'relu') {
            if (inputX < 0) note = 'x < 0，ReLU 输出为 0，导数为 0，神经元暂时「死亡」。';
            else note = 'x > 0，ReLU 导数为 1，梯度可以顺畅通过。';
        }

        document.getElementById('af-output').innerHTML = `
            <strong>${functions[currentFn].label}(${inputX.toFixed(2)}) = ${y.toFixed(4)}</strong>
            <br>导数 f'(${inputX.toFixed(2)}) = ${d.toFixed(4)}
            ${note ? `<br><span style="color: var(--text-secondary)">${note}</span>` : ''}
        `;
    }

    function draw() {
        const canvas = document.getElementById('af-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-primary').trim() || '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const padding = 40;
        const plotWidth = canvas.width - 2 * padding;
        const plotHeight = canvas.height - 2 * padding;
        const xMin = -4, xMax = 4;
        const yMin = -1.2, yMax = 1.2;

        function toCanvasX(x) {
            return padding + (x - xMin) / (xMax - xMin) * plotWidth;
        }

        function toCanvasY(y) {
            return padding + (yMax - y) / (yMax - yMin) * plotHeight;
        }

        // Grid
        ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--border').trim() || '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;
        for (let x = xMin; x <= xMax; x++) {
            ctx.beginPath();
            ctx.moveTo(toCanvasX(x), padding);
            ctx.lineTo(toCanvasX(x), canvas.height - padding);
            ctx.stroke();
        }
        for (let y = Math.floor(yMin); y <= Math.ceil(yMax); y++) {
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
        ctx.beginPath();
        ctx.moveTo(toCanvasX(0), padding);
        ctx.lineTo(toCanvasX(0), canvas.height - padding);
        ctx.stroke();

        // Plot function
        const fn = functions[currentFn].fn;
        ctx.strokeStyle = functions[currentFn].color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let px = 0; px <= plotWidth; px += 2) {
            const x = xMin + px / plotWidth * (xMax - xMin);
            const y = fn(x);
            const cx = toCanvasX(x);
            const cy = toCanvasY(y);
            if (px === 0) ctx.moveTo(cx, cy);
            else ctx.lineTo(cx, cy);
        }
        ctx.stroke();

        // Plot derivative
        ctx.strokeStyle = '#F96167';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        for (let px = 0; px <= plotWidth; px += 2) {
            const x = xMin + px / plotWidth * (xMax - xMin);
            const y = derivative(fn, x);
            const cx = toCanvasX(x);
            const cy = toCanvasY(y);
            if (px === 0) ctx.moveTo(cx, cy);
            else ctx.lineTo(cx, cy);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Current point
        const cy = fn(inputX);
        const cdx = toCanvasX(inputX);
        const cdy = toCanvasY(cy);

        ctx.fillStyle = functions[currentFn].color;
        ctx.beginPath();
        ctx.arc(cdx, cdy, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = functions[currentFn].color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cdx, cdy);
        ctx.lineTo(cdx, toCanvasY(0));
        ctx.stroke();

        // Legend
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-primary').trim() || '#1e293b';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`— ${functions[currentFn].label}`, padding + 10, padding - 10);
        ctx.fillStyle = '#F96167';
        ctx.fillText('— 导数', padding + 120, padding - 10);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    document.addEventListener('themeChanged', () => {
        if (document.getElementById('af-canvas')) update();
    });
})();
