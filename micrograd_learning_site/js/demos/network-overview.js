/**
 * Demo: 神经网络结构一览
 * 展示一个简单的三层 MLP，数据如何前向流动。
 */

(function() {
    'use strict';

    const container = document.getElementById('mg-network-overview-demo');
    if (!container) return;

    let animationStep = -1;

    function init() {
        container.innerHTML = `
            <div class="demo-controls">
                <button class="btn btn-primary" id="no-animate">▶️ 播放前向传播</button>
                <button class="btn btn-secondary" id="no-reset">重置</button>
            </div>
            <canvas id="no-canvas" class="demo-canvas" width="720" height="320"></canvas>
            <div class="demo-output" id="no-output">点击「播放前向传播」观察数据如何从输入层经过隐藏层，最终到达输出层。</div>
        `;

        document.getElementById('no-animate').addEventListener('click', animate);
        document.getElementById('no-reset').addEventListener('click', reset);

        draw();
    }

    function reset() {
        animationStep = -1;
        document.getElementById('no-output').textContent = '点击「播放前向传播」观察数据如何从输入层经过隐藏层，最终到达输出层。';
        draw();
    }

    function animate() {
        animationStep = 0;
        document.getElementById('no-output').textContent = '数据进入输入层...';
        step();
    }

    function step() {
        draw();

        const messages = [
            '数据进入输入层：x₁、x₂',
            '隐藏层神经元各自做加权求和 + 激活',
            '隐藏层输出继续传递到输出层',
            '输出层给出最终预测结果'
        ];

        if (animationStep < messages.length - 1) {
            animationStep++;
            document.getElementById('no-output').textContent = messages[animationStep];
            setTimeout(step, 900);
        } else {
            document.getElementById('no-output').innerHTML = messages[animationStep] + '<br><span style="color: var(--text-secondary)">这就是一次完整的前向传播。</span>';
        }
    }

    function draw() {
        const canvas = document.getElementById('no-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-primary').trim() || '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const layers = [
            { name: '输入层', count: 2, x: 100 },
            { name: '隐藏层', count: 4, x: 360 },
            { name: '输出层', count: 1, x: 620 }
        ];

        const nodeRadius = 22;
        const layerHeight = 240;
        const startY = (canvas.height - layerHeight) / 2 + 20;

        // Draw connections
        for (let l = 0; l < layers.length - 1; l++) {
            const current = layers[l];
            const next = layers[l + 1];

            const currentActive = animationStep >= l;
            const nextActive = animationStep > l;

            for (let i = 0; i < current.count; i++) {
                const cy = startY + i * (layerHeight / (current.count + 1)) + 30;
                for (let j = 0; j < next.count; j++) {
                    const ny = startY + j * (layerHeight / (next.count + 1)) + 30;

                    let alpha = 0.15;
                    let width = 1;
                    if (currentActive && nextActive) {
                        alpha = 0.6;
                        width = 2;
                    }

                    ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
                    ctx.lineWidth = width;
                    ctx.beginPath();
                    ctx.moveTo(current.x, cy);
                    ctx.lineTo(next.x, ny);
                    ctx.stroke();
                }
            }
        }

        // Draw nodes
        layers.forEach((layer, l) => {
            const isActive = animationStep >= l;

            for (let i = 0; i < layer.count; i++) {
                const y = startY + i * (layerHeight / (layer.count + 1)) + 30;

                ctx.fillStyle = isActive ? '#dbeafe' : '#f1f5f9';
                ctx.strokeStyle = isActive ? '#3b82f6' : '#94a3b8';
                ctx.lineWidth = isActive ? 3 : 2;
                ctx.beginPath();
                ctx.arc(layer.x, y, nodeRadius, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-primary').trim() || '#1e293b';
                ctx.font = 'bold 12px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                let label = '';
                if (layer.name === '输入层') label = `x${i + 1}`;
                else if (layer.name === '隐藏层') label = `h${i + 1}`;
                else label = 'y';
                ctx.fillText(label, layer.x, y);
                ctx.textBaseline = 'alphabetic';
            }

            // Layer label
            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-secondary').trim() || '#64748b';
            ctx.font = '13px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(layer.name, layer.x, startY - 10);
        });

        // Legend
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-secondary').trim() || '#64748b';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('蓝色节点 = 已激活', 20, canvas.height - 15);

        ctx.textAlign = 'left';
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    document.addEventListener('themeChanged', () => {
        if (document.getElementById('no-canvas')) draw();
    });
})();
