/**
 * Demo: 标量自动微分 playground
 * 选择表达式，拖动 x、y 滑块，实时观察前向值和反向梯度。
 */

(function() {
    'use strict';

    const container = document.getElementById('mg-scalar-autodiff-demo');
    if (!container) return;

    const expressions = {
        'mul': {
            label: 'z = x * y',
            build: (x, y) => {
                const vx = new MGUtils.Value(x, [], '', 'x');
                const vy = new MGUtils.Value(y, [], '', 'y');
                const vz = vx.mul(vy); vz.label = 'z';
                return { root: vz, nodes: [vx, vy, vz] };
            }
        },
        'square': {
            label: 'z = x² + y²',
            build: (x, y) => {
                const vx = new MGUtils.Value(x, [], '', 'x');
                const vy = new MGUtils.Value(y, [], '', 'y');
                const zx = vx.pow(2); zx.label = 'x²';
                const zy = vy.pow(2); zy.label = 'y²';
                const vz = zx.add(zy); vz.label = 'z';
                return { root: vz, nodes: [vx, vy, zx, zy, vz] };
            }
        },
        'complex': {
            label: 'z = (x*y + y)²',
            build: (x, y) => {
                const vx = new MGUtils.Value(x, [], '', 'x');
                const vy = new MGUtils.Value(y, [], '', 'y');
                const t1 = vx.mul(vy); t1.label = 'x*y';
                const t2 = t1.add(vy); t2.label = 'x*y+y';
                const vz = t2.pow(2); vz.label = 'z';
                return { root: vz, nodes: [vx, vy, t1, t2, vz] };
            }
        }
    };

    let currentExpr = 'mul';
    let xVal = 2.0;
    let yVal = 3.0;

    function init() {
        container.innerHTML = `
            <div class="demo-controls">
                <div class="demo-control-group">
                    <label for="sd-expr">表达式</label>
                    <select id="sd-expr">
                        <option value="mul">z = x * y</option>
                        <option value="square">z = x² + y²</option>
                        <option value="complex">z = (x*y + y)²</option>
                    </select>
                </div>
                <div class="demo-control-group">
                    <label for="sd-x">x = <span id="sd-x-val">2.0</span></label>
                    <input type="range" id="sd-x" min="-5" max="5" step="0.1" value="2.0">
                </div>
                <div class="demo-control-group">
                    <label for="sd-y">y = <span id="sd-y-val">3.0</span></label>
                    <input type="range" id="sd-y" min="-5" max="5" step="0.1" value="3.0">
                </div>
            </div>
            <div class="demo-grid-2">
                <div>
                    <canvas id="sd-canvas" class="demo-canvas" width="360" height="300"></canvas>
                </div>
                <div class="demo-panel" id="sd-info">
                    <h4>计算结果</h4>
                    <div id="sd-result"></div>
                </div>
            </div>
        `;

        document.getElementById('sd-expr').addEventListener('change', (e) => {
            currentExpr = e.target.value;
            update();
        });

        document.getElementById('sd-x').addEventListener('input', (e) => {
            xVal = parseFloat(e.target.value);
            document.getElementById('sd-x-val').textContent = xVal.toFixed(1);
            update();
        });

        document.getElementById('sd-y').addEventListener('input', (e) => {
            yVal = parseFloat(e.target.value);
            document.getElementById('sd-y-val').textContent = yVal.toFixed(1);
            update();
        });

        update();
    }

    function update() {
        const expr = expressions[currentExpr];
        const { root, nodes } = expr.build(xVal, yVal);
        root.backward();

        drawGraph(nodes, root);
        showResult(nodes);
    }

    function drawGraph(nodes, root) {
        const canvas = document.getElementById('sd-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-primary').trim() || '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Simple layout based on depth
        const levels = [];
        const assigned = new Map();

        function assignLevel(node, level) {
            if (level > (assigned.get(node) || -1)) {
                assigned.set(node, level);
                node._prev.forEach(child => assignLevel(child, level - 1));
            }
        }
        assignLevel(root, 0);

        const maxLevel = Math.max(...assigned.values());
        const levelNodes = new Map();
        assigned.forEach((lvl, node) => {
            if (!levelNodes.has(lvl)) levelNodes.set(lvl, []);
            levelNodes.get(lvl).push(node);
        });

        const positions = new Map();
        for (let l = 0; l <= maxLevel; l++) {
            const ns = levelNodes.get(l) || [];
            const y = canvas.height - 50 - (canvas.height - 100) * (l / (maxLevel || 1));
            ns.forEach((node, i) => {
                const x = canvas.width / (ns.length + 1) * (i + 1);
                positions.set(node, { x, y });
            });
        }

        // Draw edges
        nodes.forEach(node => {
            const p2 = positions.get(node);
            if (!p2) return;
            node._prev.forEach(child => {
                const p1 = positions.get(child);
                if (!p1) return;
                ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--border').trim() || '#e2e8f0';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            });
        });

        // Draw nodes
        nodes.forEach(node => {
            const pos = positions.get(node);
            if (!pos) return;

            ctx.fillStyle = node.label === 'x' || node.label === 'y' ? '#dbeafe' : (node === root ? '#fecaca' : '#f1f5f9');
            ctx.strokeStyle = node.label === 'x' || node.label === 'y' ? '#3b82f6' : (node === root ? '#F96167' : '#94a3b8');
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 28, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-primary').trim() || '#1e293b';
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(node.label || '', pos.x, pos.y - 4);

            ctx.font = '10px sans-serif';
            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-secondary').trim() || '#64748b';
            ctx.fillText(`d=${node.data.toFixed(2)}`, pos.x, pos.y + 8);
            ctx.fillText(`g=${node.grad.toFixed(2)}`, pos.x, pos.y + 20);
        });

        ctx.textAlign = 'left';
    }

    function showResult(nodes) {
        const root = nodes[nodes.length - 1];
        const xNode = nodes.find(n => n.label === 'x');
        const yNode = nodes.find(n => n.label === 'y');

        document.getElementById('sd-result').innerHTML = `
            <p><strong>${root.label} = ${root.data.toFixed(4)}</strong></p>
            <p>∂z/∂x = ${xNode.grad.toFixed(4)}</p>
            <p>∂z/∂y = ${yNode.grad.toFixed(4)}</p>
            <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 12px;">
            梯度表示：当 x 增加一个极小量时，z 会增加 ∂z/∂x 倍。</p>
        `;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    document.addEventListener('themeChanged', () => {
        if (document.getElementById('sd-canvas')) update();
    });
})();
