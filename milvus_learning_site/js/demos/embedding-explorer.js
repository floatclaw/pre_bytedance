/**
 * Embedding Explorer Demo
 * 2D 向量空间探索器：点击设置查询向量，观察 top-k 最近邻
 */

(function() {
    'use strict';

    const container = document.getElementById('embedding-explorer-demo');
    if (!container) return;

    const CLUSTER_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#f96167', '#8b5cf6'];
    const HIGHLIGHT = '#f59e0b';

    let state = {
        metric: 'cosine',
        topK: 5,
        queryIndex: -1,
        data: []
    };

    function initData() {
        const clusters = MVUtils.generateClusters(4, 2, 0.5);
        state.data = clusters.vectors.map((v, i) => ({
            vector: v,
            label: clusters.labels[i],
            neighbor: false
        }));
        state.queryIndex = 0;
        updateNeighbors();
    }

    function updateNeighbors() {
        if (state.queryIndex < 0) return;
        const query = state.data[state.queryIndex].vector;
        const ranked = MVUtils.rank(query, state.data.map(d => d.vector), state.metric, state.metric === 'euclidean');
        state.data.forEach((d, i) => {
            d.neighbor = ranked.slice(0, state.topK).includes(i);
        });
    }

    function getCssVar(name) {
        return getComputedStyle(document.body).getPropertyValue(name).trim();
    }

    function render() {
        container.innerHTML = `
            <div class="demo-controls">
                <div class="demo-control-group">
                    <label>相似度度量</label>
                    <select id="ee-metric">
                        <option value="cosine" selected>Cosine（余弦相似度）</option>
                        <option value="euclidean">Euclidean（欧氏距离）</option>
                        <option value="ip">Inner Product（内积）</option>
                    </select>
                </div>
                <div class="demo-control-group">
                    <label>Top-K</label>
                    <input type="range" id="ee-topk" min="1" max="15" value="5">
                    <span id="ee-topk-value">5</span>
                </div>
                <button class="btn btn-secondary" id="ee-reset">重新生成数据</button>
            </div>
            <canvas id="ee-canvas" class="demo-canvas"></canvas>
            <div class="demo-output" id="ee-output">点击画布上的点设为查询向量，黄色高亮的为 Top-K 最近邻。</div>
        `;

        bindEvents();
        resizeCanvas();
        draw();
    }

    function bindEvents() {
        const metricSelect = document.getElementById('ee-metric');
        const topkInput = document.getElementById('ee-topk');
        const topkValue = document.getElementById('ee-topk-value');
        const resetBtn = document.getElementById('ee-reset');
        const canvas = document.getElementById('ee-canvas');

        metricSelect.addEventListener('change', e => {
            state.metric = e.target.value;
            updateNeighbors();
            draw();
            updateOutput();
        });

        topkInput.addEventListener('input', e => {
            state.topK = parseInt(e.target.value);
            topkValue.textContent = state.topK;
            updateNeighbors();
            draw();
            updateOutput();
        });

        resetBtn.addEventListener('click', () => {
            initData();
            draw();
            updateOutput();
        });

        canvas.addEventListener('click', e => {
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width * 2 - 1;
            const y = 1 - (e.clientY - rect.top) / rect.height * 2;
            findNearestPoint(x, y);
        });
    }

    function findNearestPoint(x, y) {
        let bestIdx = -1;
        let bestDist = Infinity;
        state.data.forEach((d, i) => {
            const dx = d.vector[0] - x;
            const dy = d.vector[1] - y;
            const dist = dx * dx + dy * dy;
            if (dist < bestDist) {
                bestDist = dist;
                bestIdx = i;
            }
        });
        if (bestIdx >= 0) {
            state.queryIndex = bestIdx;
            updateNeighbors();
            draw();
            updateOutput();
        }
    }

    function resizeCanvas() {
        const canvas = document.getElementById('ee-canvas');
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        const ctx = canvas.getContext('2d');
        ctx.scale(2, 2);
    }

    function draw() {
        const canvas = document.getElementById('ee-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width / 2;
        const height = canvas.height / 2;
        const bg = getCssVar('--bg-primary');
        const grid = getCssVar('--border');
        const text = getCssVar('--text-secondary');

        ctx.clearRect(0, 0, width, height);

        // Background
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

        // Points
        const centerX = width / 2;
        const centerY = height / 2;
        const scale = Math.min(width, height) * 0.4;

        state.data.forEach((d, i) => {
            const x = centerX + d.vector[0] * scale;
            const y = centerY - d.vector[1] * scale;
            const isQuery = i === state.queryIndex;
            const r = isQuery ? 8 : (d.neighbor ? 6 : 4);

            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = isQuery ? HIGHLIGHT : CLUSTER_COLORS[d.label % CLUSTER_COLORS.length];
            ctx.fill();

            if (d.neighbor || isQuery) {
                ctx.strokeStyle = HIGHLIGHT;
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        });

        // Labels
        ctx.fillStyle = text;
        ctx.font = '12px sans-serif';
        ctx.fillText('x', width - 12, centerY - 6);
        ctx.fillText('y', centerX + 6, 12);
    }

    function updateOutput() {
        const output = document.getElementById('ee-output');
        if (!output) return;
        const metricNames = { cosine: '余弦相似度', euclidean: '欧氏距离', ip: '内积' };
        output.innerHTML = `
            查询向量：第 ${state.queryIndex + 1} 个点（黄色）<br>
            度量方式：${metricNames[state.metric]}<br>
            高亮显示 Top-${state.topK} 最近邻。
        `;
    }

    window.addEventListener('resize', () => {
        resizeCanvas();
        draw();
    });

    document.addEventListener('themeChanged', () => {
        draw();
    });

    initData();
    render();
})();
