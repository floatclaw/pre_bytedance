/**
 * Similarity Metrics Demo
 * 比较 Cosine、Euclidean、IP 三种度量
 */

(function() {
    'use strict';

    const container = document.getElementById('similarity-metrics-demo');
    if (!container) return;

    let state = {
        ax: 0.8, ay: 0.6,
        bx: -0.3, by: 0.9
    };

    function getCssVar(name) {
        return getComputedStyle(document.body).getPropertyValue(name).trim();
    }

    function render() {
        container.innerHTML = `
            <div class="demo-controls">
                <div class="demo-control-group">
                    <label>向量 A 角度</label>
                    <input type="range" id="sm-angle-a" min="0" max="360" value="37">
                </div>
                <div class="demo-control-group">
                    <label>向量 B 角度</label>
                    <input type="range" id="sm-angle-b" min="0" max="360" value="108">
                </div>
                <div class="demo-control-group">
                    <label>向量 A 长度</label>
                    <input type="range" id="sm-len-a" min="50" max="150" value="100">
                </div>
                <div class="demo-control-group">
                    <label>向量 B 长度</label>
                    <input type="range" id="sm-len-b" min="50" max="150" value="100">
                </div>
            </div>
            <div class="two-column-example">
                <div>
                    <canvas id="sm-canvas" class="demo-canvas" style="height: 260px;"></canvas>
                </div>
                <div id="sm-stats" style="text-align: left;">
                    <!-- stats -->
                </div>
            </div>
        `;

        bindEvents();
        resizeCanvas();
        update();
    }

    function bindEvents() {
        ['a', 'b'].forEach(label => {
            document.getElementById(`sm-angle-${label}`).addEventListener('input', update);
            document.getElementById(`sm-len-${label}`).addEventListener('input', update);
        });
    }

    function update() {
        const angleA = parseInt(document.getElementById('sm-angle-a').value) * Math.PI / 180;
        const angleB = parseInt(document.getElementById('sm-angle-b').value) * Math.PI / 180;
        const lenA = parseInt(document.getElementById('sm-len-a').value) / 100;
        const lenB = parseInt(document.getElementById('sm-len-b').value) / 100;

        state.ax = Math.cos(angleA) * lenA;
        state.ay = Math.sin(angleA) * lenA;
        state.bx = Math.cos(angleB) * lenB;
        state.by = Math.sin(angleB) * lenB;

        draw();
        updateStats();
    }

    function resizeCanvas() {
        const canvas = document.getElementById('sm-canvas');
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        const ctx = canvas.getContext('2d');
        ctx.scale(2, 2);
    }

    function draw() {
        const canvas = document.getElementById('sm-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width / 2;
        const height = canvas.height / 2;
        const bg = getCssVar('--bg-primary');
        const grid = getCssVar('--border');

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, width, height);

        // Grid
        ctx.strokeStyle = grid;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();

        const cx = width / 2;
        const cy = height / 2;
        const scale = Math.min(width, height) * 0.35;

        // Vector A
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + state.ax * scale, cy - state.ay * scale);
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = '#3b82f6';
        ctx.font = '14px sans-serif';
        ctx.fillText('A', cx + state.ax * scale + 8, cy - state.ay * scale);

        // Vector B
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + state.bx * scale, cy - state.by * scale);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = '#10b981';
        ctx.fillText('B', cx + state.bx * scale + 8, cy - state.by * scale);

        // Arc between vectors
        const angleA = Math.atan2(state.ay, state.ax);
        const angleB = Math.atan2(state.by, state.bx);
        ctx.beginPath();
        ctx.arc(cx, cy, 30, -angleA, -angleB, angleB < angleA);
        ctx.strokeStyle = getCssVar('--text-secondary');
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    function updateStats() {
        const a = [state.ax, state.ay];
        const b = [state.bx, state.by];
        const cosine = MVUtils.cosineSimilarity(a, b);
        const euclidean = MVUtils.euclideanDistance(a, b);
        const ip = MVUtils.innerProduct(a, b);

        const stats = document.getElementById('sm-stats');
        stats.innerHTML = `
            <p><strong>向量 A</strong>：[${state.ax.toFixed(2)}, ${state.ay.toFixed(2)}]，长度 ${MVUtils.norm(a).toFixed(2)}</p>
            <p><strong>向量 B</strong>：[${state.bx.toFixed(2)}, ${state.by.toFixed(2)}]，长度 ${MVUtils.norm(b).toFixed(2)}</p>
            <hr style="border-color: var(--border);">
            <p><strong>Cosine（余弦相似度）</strong>：${cosine.toFixed(3)}</p>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">只看方向，范围 [-1, 1]，1 表示方向完全相同。</p>
            <p><strong>Euclidean（欧氏距离）</strong>：${euclidean.toFixed(3)}</p>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">看终点距离，越小越近，受长度影响。</p>
            <p><strong>Inner Product（内积）</strong>：${ip.toFixed(3)}</p>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">同时受方向和长度影响，值越大越相似。</p>
        `;
    }

    window.addEventListener('resize', () => {
        resizeCanvas();
        draw();
    });

    render();
})();
