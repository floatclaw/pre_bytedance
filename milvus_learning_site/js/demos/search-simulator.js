/**
 * Search Simulator Demo
 * 模拟 Milvus search() 行为：top-k、距离阈值、标量过滤
 */

(function() {
    'use strict';

    const container = document.getElementById('search-simulator-demo');
    if (!container) return;

    const CATEGORY_COLORS = { 'tech': '#3b82f6', 'life': '#10b981', 'news': '#f59e0b' };
    const CATEGORIES = ['tech', 'life', 'news'];

    let state = {
        data: [],
        query: [0.7, 0.3],
        metric: 'cosine',
        topK: 5,
        threshold: 0.0,
        categoryFilter: 'all'
    };

    function initData() {
        const clusters = MVUtils.generateClusters(3, 2, 0.5);
        state.data = clusters.vectors.map((v, i) => ({
            vector: v,
            category: CATEGORIES[clusters.labels[i]],
            title: `文档 ${i + 1}`
        }));
    }

    function getCssVar(name) {
        return getComputedStyle(document.body).getPropertyValue(name).trim();
    }

    function render() {
        container.innerHTML = `
            <div class="demo-controls">
                <div class="demo-control-group">
                    <label>相似度度量</label>
                    <select id="ss-metric">
                        <option value="cosine" selected>Cosine</option>
                        <option value="euclidean">Euclidean</option>
                    </select>
                </div>
                <div class="demo-control-group">
                    <label>Top-K</label>
                    <input type="range" id="ss-topk" min="1" max="15" value="5">
                    <span id="ss-topk-value">5</span>
                </div>
                <div class="demo-control-group">
                    <label>标量过滤</label>
                    <select id="ss-category">
                        <option value="all" selected>全部</option>
                        <option value="tech">tech</option>
                        <option value="life">life</option>
                        <option value="news">news</option>
                    </select>
                </div>
                <button class="btn btn-secondary" id="ss-reset">重新生成</button>
            </div>
            <div class="two-column-example">
                <div>
                    <canvas id="ss-canvas" class="demo-canvas" style="height: 300px;"></canvas>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 8px;">黄色星为查询向量，高亮圆点为命中结果。</p>
                </div>
                <div id="ss-results" style="text-align: left;">
                    <!-- results -->
                </div>
            </div>
            <div class="demo-output" id="ss-code">
                <!-- code snippet -->
            </div>
        `;

        bindEvents();
        resizeCanvas();
        update();
    }

    function bindEvents() {
        document.getElementById('ss-metric').addEventListener('change', e => {
            state.metric = e.target.value;
            update();
        });

        const topkInput = document.getElementById('ss-topk');
        topkInput.addEventListener('input', e => {
            state.topK = parseInt(e.target.value);
            document.getElementById('ss-topk-value').textContent = state.topK;
            update();
        });

        document.getElementById('ss-category').addEventListener('change', e => {
            state.categoryFilter = e.target.value;
            update();
        });

        document.getElementById('ss-reset').addEventListener('click', () => {
            initData();
            update();
        });

        const canvas = document.getElementById('ss-canvas');
        canvas.addEventListener('click', e => {
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width * 2 - 1;
            const y = 1 - (e.clientY - rect.top) / rect.height * 2;
            state.query = [x, y];
            update();
        });
    }

    function resizeCanvas() {
        const canvas = document.getElementById('ss-canvas');
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        const ctx = canvas.getContext('2d');
        ctx.scale(2, 2);
    }

    function getFilteredData() {
        if (state.categoryFilter === 'all') return state.data;
        return state.data.filter(d => d.category === state.categoryFilter);
    }

    function getResults() {
        const filtered = getFilteredData();
        const metric = state.metric;
        const ascending = metric === 'euclidean';

        const scored = filtered.map((d, i) => ({
            ...d,
            globalIndex: state.data.indexOf(d),
            score: MVUtils.distance(state.query, d.vector, metric)
        }));

        scored.sort((a, b) => ascending ? a.score - b.score : b.score - a.score);
        return scored.slice(0, state.topK);
    }

    function update() {
        draw();
        updateResults();
        updateCode();
    }

    function draw() {
        const canvas = document.getElementById('ss-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width / 2;
        const height = canvas.height / 2;
        const bg = getCssVar('--bg-primary');
        const grid = getCssVar('--border');

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, width, height);

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
        const scale = Math.min(width, height) * 0.4;
        const results = getResults();
        const resultIndices = new Set(results.map(r => r.globalIndex));

        state.data.forEach((d, i) => {
            const x = cx + d.vector[0] * scale;
            const y = cy - d.vector[1] * scale;
            const isHit = resultIndices.has(i);
            const isFiltered = state.categoryFilter !== 'all' && d.category !== state.categoryFilter;

            ctx.beginPath();
            ctx.arc(x, y, isHit ? 7 : 4, 0, Math.PI * 2);
            ctx.fillStyle = isFiltered ? grid : CATEGORY_COLORS[d.category];
            ctx.globalAlpha = isFiltered ? 0.3 : 1;
            ctx.fill();

            if (isHit) {
                ctx.strokeStyle = '#f59e0b';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
        });

        // Query star
        const qx = cx + state.query[0] * scale;
        const qy = cy - state.query[1] * scale;
        ctx.beginPath();
        ctx.arc(qx, qy, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
        ctx.strokeStyle = getCssVar('--text-primary');
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    function updateResults() {
        const results = getResults();
        const div = document.getElementById('ss-results');
        div.innerHTML = `
            <h4>命中结果（Top-${state.topK}）</h4>
            ${results.length === 0 ? '<p>没有命中结果</p>' : `<ul style="padding-left: 16px;">
                ${results.map((r, i) => `
                    <li style="margin-bottom: 8px;">
                        <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${CATEGORY_COLORS[r.category]}; margin-right: 6px;"></span>
                        ${r.title} [${r.category}] — ${state.metric === 'euclidean' ? '距离' : '相似度'}: ${r.score.toFixed(3)}
                    </li>
                `).join('')}
            </ul>`}
        `;
    }

    function updateCode() {
        const code = document.getElementById('ss-code');
        const metricMap = { cosine: 'COSINE', euclidean: 'L2' };
        const expr = state.categoryFilter === 'all' ? '' : `,\n    expr="category == '${state.categoryFilter}'"`;
        code.innerHTML = `
<pre style="margin: 0;"><code>results = collection.search(
    data=[[${state.query[0].toFixed(2)}, ${state.query[1].toFixed(2)}]],
    anns_field="embedding",
    param={"metric_type": "${metricMap[state.metric]}", "params": {}},
    limit=${state.topK}${expr},
    output_fields=["title", "category"]
)</code></pre>
        `;
    }

    window.addEventListener('resize', () => {
        resizeCanvas();
        draw();
    });

    initData();
    render();
})();
