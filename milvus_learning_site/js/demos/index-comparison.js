/**
 * Index Comparison Demo
 * 模拟 FLAT / IVF / HNSW 三种索引的查询耗时和召回率
 */

(function() {
    'use strict';

    const container = document.getElementById('index-comparison-demo');
    if (!container) return;

    let state = {
        dataSize: 10000,
        nlist: 16,
        nprobe: 2,
        ef: 16,
        queryRuns: 50
    };

    function getCssVar(name) {
        return getComputedStyle(document.body).getPropertyValue(name).trim();
    }

    function render() {
        container.innerHTML = `
            <div class="demo-controls">
                <div class="demo-control-group">
                    <label>数据量</label>
                    <select id="ic-size">
                        <option value="1000">1,000</option>
                        <option value="10000" selected>10,000</option>
                        <option value="100000">100,000</option>
                        <option value="1000000">1,000,000</option>
                    </select>
                </div>
                <div class="demo-control-group">
                    <label>IVF nlist</label>
                    <input type="range" id="ic-nlist" min="4" max="64" value="16">
                    <span id="ic-nlist-value">16</span>
                </div>
                <div class="demo-control-group">
                    <label>IVF nprobe</label>
                    <input type="range" id="ic-nprobe" min="1" max="16" value="2">
                    <span id="ic-nprobe-value">2</span>
                </div>
                <div class="demo-control-group">
                    <label>HNSW ef</label>
                    <input type="range" id="ic-ef" min="8" max="128" value="16">
                    <span id="ic-ef-value">16</span>
                </div>
                <button class="btn btn-primary" id="ic-run">运行对比</button>
            </div>
            <div class="retrieval-stats" id="ic-stats">
                <!-- stats -->
            </div>
            <div class="demo-output" id="ic-output">点击"运行对比"，估算三种索引在选定参数下的相对查询耗时和召回率。</div>
        `;

        bindEvents();
        updateStats();
    }

    function bindEvents() {
        document.getElementById('ic-size').addEventListener('change', e => {
            state.dataSize = parseInt(e.target.value);
        });

        const sliders = [
            { id: 'ic-nlist', key: 'nlist', display: 'ic-nlist-value' },
            { id: 'ic-nprobe', key: 'nprobe', display: 'ic-nprobe-value' },
            { id: 'ic-ef', key: 'ef', display: 'ic-ef-value' }
        ];

        sliders.forEach(s => {
            const input = document.getElementById(s.id);
            const display = document.getElementById(s.display);
            input.addEventListener('input', e => {
                state[s.key] = parseInt(e.target.value);
                display.textContent = state[s.key];
            });
        });

        document.getElementById('ic-run').addEventListener('click', runComparison);
    }

    function runComparison() {
        const n = state.dataSize;
        const dim = 128;

        // FLAT: scan all, exact
        const flatLatency = n * dim * 0.000005;
        const flatRecall = 1.0;

        // IVF: scan nprobe buckets, each has n/nlist items
        const ivfScanned = (n / state.nlist) * state.nprobe;
        const ivfLatency = ivfScanned * dim * 0.000005 * 1.2; // overhead
        const ivfRecall = Math.min(0.95, 0.4 + (state.nprobe / state.nlist) * 2.5);

        // HNSW: graph traversal, ~ef*log(n) nodes
        const hnswVisited = state.ef * Math.log10(n) * 3;
        const hnswLatency = hnswVisited * dim * 0.000006 * 1.5;
        const hnswRecall = Math.min(0.99, 0.5 + state.ef / 200);

        updateStats({
            flat: { latency: flatLatency, recall: flatRecall, scanned: n },
            ivf: { latency: ivfLatency, recall: ivfRecall, scanned: Math.round(ivfScanned) },
            hnsw: { latency: hnswLatency, recall: hnswRecall, scanned: Math.round(hnswVisited) }
        });
    }

    function updateStats(results) {
        const stats = document.getElementById('ic-stats');
        const output = document.getElementById('ic-output');

        if (!results) {
            stats.innerHTML = '';
            return;
        }

        const maxLatency = Math.max(results.flat.latency, results.ivf.latency, results.hnsw.latency);

        function bar(value, max, label, color) {
            const pct = max > 0 ? (value / max) * 100 : 0;
            return `
                <div class="stat-box">
                    <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 4px;">${label}</div>
                    <div style="background: var(--bg-tertiary); border-radius: 4px; height: 8px; overflow: hidden;">
                        <div style="background: ${color}; height: 100%; width: ${pct}%;"></div>
                    </div>
                    <div style="font-size: 0.8rem; margin-top: 4px;">${value.toFixed(2)} ms</div>
                </div>
            `;
        }

        stats.innerHTML = `
            <div class="stat-box">
                <div style="font-weight: 600;">FLAT</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary);">精确暴力搜索</div>
                ${bar(results.flat.latency, maxLatency, '查询耗时', '#3b82f6')}
                <div style="font-size: 0.85rem; margin-top: 8px;">召回率：${(results.flat.recall * 100).toFixed(1)}%</div>
                <div style="font-size: 0.85rem;">扫描向量：${results.flat.scanned.toLocaleString()}</div>
            </div>
            <div class="stat-box">
                <div style="font-weight: 600;">IVF_FLAT</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary);">倒排文件索引</div>
                ${bar(results.ivf.latency, maxLatency, '查询耗时', '#10b981')}
                <div style="font-size: 0.85rem; margin-top: 8px;">召回率：${(results.ivf.recall * 100).toFixed(1)}%</div>
                <div style="font-size: 0.85rem;">扫描向量：${results.ivf.scanned.toLocaleString()}</div>
            </div>
            <div class="stat-box">
                <div style="font-weight: 600;">HNSW</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary);">分层可导航小世界图</div>
                ${bar(results.hnsw.latency, maxLatency, '查询耗时', '#f59e0b')}
                <div style="font-size: 0.85rem; margin-top: 8px;">召回率：${(results.hnsw.recall * 100).toFixed(1)}%</div>
                <div style="font-size: 0.85rem;">扫描向量：${results.hnsw.scanned.toLocaleString()}</div>
            </div>
        `;

        output.innerHTML = `
            在 ${state.dataSize.toLocaleString()} 条 ${128} 维向量中：<br>
            <strong>FLAT</strong> 最慢但 100% 精确；<br>
            <strong>IVF_FLAT</strong> 只搜索 ${state.nprobe}/${state.nlist} 个桶，速度提升约 ${(results.flat.latency / results.ivf.latency).toFixed(1)} 倍；<br>
            <strong>HNSW</strong> 通过图索引只访问约 ${results.hnsw.scanned.toLocaleString()} 个节点，速度最快。
        `;
    }

    render();
})();
