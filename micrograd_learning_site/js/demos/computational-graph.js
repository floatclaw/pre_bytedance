/**
 * Demo: 计算图可视化
 * 展示固定表达式的前向传播与反向传播过程。
 */

(function() {
    'use strict';

    const container = document.getElementById('mg-computational-graph-demo');
    if (!container) return;

    function init() {
        container.innerHTML = `
            <div class="demo-controls">
                <button class="btn btn-primary" id="cg-forward">前向传播</button>
                <button class="btn btn-primary" id="cg-backward">反向传播</button>
                <button class="btn btn-secondary" id="cg-reset">重置</button>
            </div>
            <canvas id="cg-canvas" class="demo-canvas" width="720" height="360"></canvas>
            <div class="demo-output" id="cg-output">点击「前向传播」开始逐步计算每个节点的 data 值。</div>
        `;

        document.getElementById('cg-forward').addEventListener('click', runForward);
        document.getElementById('cg-backward').addEventListener('click', runBackward);
        document.getElementById('cg-reset').addEventListener('click', reset);

        reset();
    }

    let nodes, topo, forwardIndex, backwardIndex;

    function buildExpression() {
        const a = new MGUtils.Value(2.0, [], '', 'a');
        const b = new MGUtils.Value(3.0, [], '', 'b');
        const c = a.mul(b); c.label = 'c=a*b';
        const d = a.add(b); d.label = 'd=a+b';
        const e = c.add(d); e.label = 'e=c+d';
        const f = e.pow(2); f.label = 'f=e²';

        const visited = new Set();
        const order = [];
        function build(v) {
            if (!visited.has(v)) {
                visited.add(v);
                v._prev.forEach(build);
                order.push(v);
            }
        }
        build(f);

        return { root: f, nodes: [a, b, c, d, e, f], topo: order };
    }

    function reset() {
        const expr = buildExpression();
        nodes = expr.nodes;
        topo = expr.topo;
        forwardIndex = -1;
        backwardIndex = -1;
        draw();
        document.getElementById('cg-output').textContent = '点击「前向传播」开始逐步计算每个节点的 data 值。';
    }

    function runForward() {
        if (forwardIndex >= topo.length - 1) return;
        forwardIndex++;
        draw();

        const current = topo[forwardIndex];
        document.getElementById('cg-output').innerHTML = `
            前向步骤 ${forwardIndex + 1}/${topo.length}：
            <strong>${current.label || '输出'}</strong> 的 data = <strong>${current.data.toFixed(4)}</strong>
        `;
    }

    function runBackward() {
        if (forwardIndex < topo.length - 1) {
            document.getElementById('cg-output').textContent = '请先完成前向传播。';
            return;
        }
        if (backwardIndex >= topo.length - 1) return;

        if (backwardIndex === -1) {
            const root = topo[topo.length - 1];
            root.grad = 1.0;
            backwardIndex = 0;
        } else {
            const idx = topo.length - 1 - backwardIndex;
            topo[idx]._backward();
            backwardIndex++;
        }

        draw();

        const idx = topo.length - 1 - backwardIndex;
        const current = topo[idx];
        if (backwardIndex < topo.length - 1) {
            document.getElementById('cg-output').innerHTML = `
                反向步骤 ${backwardIndex + 1}/${topo.length - 1}：
                <strong>${current.label || '输出'}</strong> 的 grad = <strong>${current.grad.toFixed(4)}</strong>
            `;
        } else {
            document.getElementById('cg-output').innerHTML = `
                反向传播完成。根节点 grad=1，所有叶子节点梯度已计算。
                <br>例如 a.grad = ${nodes.find(n => n.label === 'a').grad.toFixed(4)}
            `;
        }
    }

    function getNodePosition(index, total, width, height) {
        // Layout: leaves at bottom, root at top
        const levels = [
            [0, 1], // a, b
            [2, 3], // c, d
            [4],    // e
            [5]     // f
        ];
        for (let l = 0; l < levels.length; l++) {
            const pos = levels[l].indexOf(index);
            if (pos >= 0) {
                const count = levels[l].length;
                const x = width / (count + 1) * (pos + 1);
                const y = height - (height / (levels.length + 1)) * (l + 1);
                return { x, y };
            }
        }
        return { x: width / 2, y: height / 2 };
    }

    function draw() {
        const canvas = document.getElementById('cg-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-primary').trim() || '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const positions = nodes.map((_, i) => getNodePosition(i, nodes.length, canvas.width, canvas.height - 40));

        // Draw edges
        nodes.forEach((node, i) => {
            node._prev.forEach(child => {
                const j = nodes.indexOf(child);
                if (j < 0) return;

                const p1 = positions[j];
                const p2 = positions[i];

                // Determine edge highlight state
                const childIdx = topo.indexOf(child);
                const parentIdx = topo.indexOf(node);
                let active = false;
                if (forwardIndex >= parentIdx && forwardIndex <= parentIdx) {
                    active = true;
                }
                if (backwardIndex >= 0) {
                    const revParent = topo.length - 1 - backwardIndex;
                    if (parentIdx <= revParent && childIdx <= revParent) {
                        active = true;
                    }
                }

                ctx.strokeStyle = active ? '#3b82f6' : getComputedStyle(document.body).getPropertyValue('--border').trim() || '#e2e8f0';
                ctx.lineWidth = active ? 3 : 1.5;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            });
        });

        // Draw nodes
        nodes.forEach((node, i) => {
            const pos = positions[i];
            const topoIdx = topo.indexOf(node);

            let fill = getComputedStyle(document.body).getPropertyValue('--bg-secondary').trim() || '#f8fafc';
            let stroke = getComputedStyle(document.body).getPropertyValue('--border').trim() || '#e2e8f0';

            if (forwardIndex >= topoIdx) {
                fill = '#dbeafe';
                stroke = '#3b82f6';
            }
            if (backwardIndex >= 0 && topoIdx <= topo.length - 1 - backwardIndex) {
                fill = '#fecaca';
                stroke = '#F96167';
            }

            ctx.fillStyle = fill;
            ctx.strokeStyle = stroke;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 32, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-primary').trim() || '#1e293b';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(node.label || '', pos.x, pos.y - 6);

            ctx.font = '11px sans-serif';
            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-secondary').trim() || '#64748b';
            const dataStr = forwardIndex >= topoIdx ? `d=${node.data.toFixed(2)}` : 'd=?';
            const gradStr = backwardIndex >= 0 && topoIdx <= topo.length - 1 - backwardIndex ? `g=${node.grad.toFixed(2)}` : 'g=0';
            ctx.fillText(dataStr, pos.x, pos.y + 10);
            ctx.fillText(gradStr, pos.x, pos.y + 24);
        });

        ctx.textAlign = 'left';
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    document.addEventListener('themeChanged', draw);
})();
