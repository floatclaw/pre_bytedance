/**
 * HNSW 多层搜索动画
 */

(function() {
    'use strict';

    const HNSWAnimation = {
        isPlaying: false,
        currentLayer: 0,
        path: [],
        animationId: null,

        init() {
            const container = document.getElementById('hnsw-animation-demo');
            if (!container) return;

            this.container = container;
            this.render();
            this.generateData();
            this.draw();
        },

        render() {
            this.container.innerHTML = `
                <div class="hnsw-container">
                    <canvas id="hnsw-canvas" class="hnsw-canvas"></canvas>
                    <div class="animation-controls">
                        <button class="btn btn-primary" id="hnsw-play-btn">▶ 播放搜索</button>
                        <button class="btn btn-secondary" id="hnsw-reset-btn">↺ 重置</button>
                    </div>
                    <div class="hnsw-legend">
                        <div class="hnsw-legend-item">
                            <div class="hnsw-legend-dot" style="background: #94a3b8;"></div>
                            <span>普通节点</span>
                        </div>
                        <div class="hnsw-legend-item">
                            <div class="hnsw-legend-dot" style="background: #F96167;"></div>
                            <span>查询点</span>
                        </div>
                        <div class="hnsw-legend-item">
                            <div class="hnsw-legend-dot" style="background: #3b82f6;"></div>
                            <span>搜索路径</span>
                        </div>
                        <div class="hnsw-legend-item">
                            <div class="hnsw-legend-dot" style="background: #10b981;"></div>
                            <span>最近邻</span>
                        </div>
                    </div>
                </div>
            `;

            this.canvas = document.getElementById('hnsw-canvas');
            this.resizeCanvas();
            window.addEventListener('resize', () => {
                this.resizeCanvas();
                this.draw();
            });

            document.getElementById('hnsw-play-btn').addEventListener('click', () => this.play());
            document.getElementById('hnsw-reset-btn').addEventListener('click', () => this.reset());
        },

        resizeCanvas() {
            if (!this.canvas) return;
            const rect = this.canvas.getBoundingClientRect();
            this.canvas.width = rect.width * 2;
            this.canvas.height = rect.height * 2;
            const ctx = this.canvas.getContext('2d');
            ctx.scale(2, 2);
        },

        generateData() {
            // 3 layers, fewer nodes at higher layers
            this.layers = [
                { nodes: this.generateNodes(8, 0), edges: [] },
                { nodes: this.generateNodes(20, 1), edges: [] },
                { nodes: this.generateNodes(50, 2), edges: [] }
            ];

            // Create edges: each node connected to nearby nodes in same layer
            this.layers.forEach((layer, layerIdx) => {
                layer.nodes.forEach((node, i) => {
                    // Connect to 2 nearest neighbors
                    const others = layer.nodes
                        .map((n, idx) => ({ idx, dist: this.distance(node, n) }))
                        .filter(o => o.idx !== i)
                        .sort((a, b) => a.dist - b.dist)
                        .slice(0, 2);

                    others.forEach(o => {
                        layer.edges.push([i, o.idx]);
                    });
                });
            });

            // Map nodes between layers: higher layer nodes are also in lower layers
            // Simplified: top layer nodes are a subset of middle, middle subset of bottom
            this.query = { x: 0.7, y: 0.6 };
            this.path = [];
            this.nearest = null;
        },

        generateNodes(count, layerIdx) {
            const nodes = [];
            for (let i = 0; i < count; i++) {
                nodes.push({
                    x: 0.1 + Math.random() * 0.8,
                    y: 0.1 + Math.random() * 0.8,
                    layer: layerIdx
                });
            }
            return nodes;
        },

        distance(a, b) {
            return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
        },

        draw() {
            if (!this.canvas) return;
            const ctx = this.canvas.getContext('2d');
            const width = this.canvas.width / 2;
            const height = this.canvas.height / 2;

            ctx.clearRect(0, 0, width, height);

            const layerHeight = height / 3;

            // Draw each layer
            this.layers.forEach((layer, layerIdx) => {
                const y = layerIdx * layerHeight + layerHeight / 2;
                const panelY = layerIdx * layerHeight;

                // Panel background
                ctx.fillStyle = layerIdx % 2 === 0
                    ? 'rgba(59, 130, 246, 0.05)'
                    : 'rgba(16, 185, 129, 0.05)';
                ctx.fillRect(0, panelY, width, layerHeight);

                // Layer label
                ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-secondary').trim() || '#64748b';
                ctx.font = 'bold 12px sans-serif';
                ctx.textAlign = 'left';
                ctx.fillText(`Layer ${layerIdx + 1} (${layer.nodes.length} nodes)`, 10, panelY + 20);

                // Edges
                ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--border').trim() || '#e2e8f0';
                ctx.lineWidth = 1;
                layer.edges.forEach(edge => {
                    const a = layer.nodes[edge[0]];
                    const b = layer.nodes[edge[1]];
                    ctx.beginPath();
                    ctx.moveTo(a.x * width, panelY + a.y * layerHeight);
                    ctx.lineTo(b.x * width, panelY + b.y * layerHeight);
                    ctx.stroke();
                });

                // Path edges
                if (this.path.length > 1) {
                    ctx.strokeStyle = '#3b82f6';
                    ctx.lineWidth = 3;
                    for (let i = 0; i < this.path.length - 1; i++) {
                        const p1 = this.path[i];
                        const p2 = this.path[i + 1];
                        if (p1.layer === p2.layer) {
                            const layer = this.layers[p1.layer];
                            const a = layer.nodes[p1.idx];
                            const b = layer.nodes[p2.idx];
                            ctx.beginPath();
                            ctx.moveTo(a.x * width, panelY + a.y * layerHeight);
                            ctx.lineTo(b.x * width, panelY + b.y * layerHeight);
                            ctx.stroke();
                        }
                    }
                }

                // Nodes
                layer.nodes.forEach((node, idx) => {
                    const nx = node.x * width;
                    const ny = panelY + node.y * layerHeight;

                    let color = '#94a3b8';
                    let radius = layerIdx === 0 ? 5 : (layerIdx === 1 ? 4 : 3);

                    // Highlight path nodes
                    const pathNode = this.path.find(p => p.layer === layerIdx && p.idx === idx);
                    if (pathNode) {
                        color = '#3b82f6';
                        radius += 2;
                    }

                    // Highlight nearest
                    if (this.nearest && this.nearest.layer === layerIdx && this.nearest.idx === idx) {
                        color = '#10b981';
                        radius += 3;
                    }

                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.arc(nx, ny, radius, 0, Math.PI * 2);
                    ctx.fill();
                });

                // Query point on current/searching layer
                if (this.isPlaying || this.path.length > 0) {
                    const qx = this.query.x * width;
                    const qy = panelY + this.query.y * layerHeight;
                    ctx.fillStyle = '#F96167';
                    ctx.beginPath();
                    ctx.arc(qx, qy, 6, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        },

        async play() {
            if (this.isPlaying) return;
            this.isPlaying = true;
            this.reset();

            // Stage 1: Top layer greedy search
            let currentLayer = 0;
            let currentIdx = this.findEntryPoint(0);
            this.path.push({ layer: 0, idx: currentIdx });
            this.draw();
            await this.wait(800);

            while (currentLayer < this.layers.length - 1) {
                // Greedy routing within current layer
                let improved = true;
                while (improved && this.path.filter(p => p.layer === currentLayer).length < 5) {
                    const nearest = this.findNearestNeighbor(currentLayer, currentIdx);
                    if (nearest.idx !== currentIdx) {
                        currentIdx = nearest.idx;
                        this.path.push({ layer: currentLayer, idx: currentIdx });
                        this.draw();
                        await this.wait(600);
                    } else {
                        improved = false;
                    }
                }

                // Drop to next layer near current point
                currentLayer++;
                currentIdx = this.findNearestInLayer(currentLayer, this.layers[currentLayer - 1].nodes[currentIdx]);
                this.path.push({ layer: currentLayer, idx: currentIdx });
                this.draw();
                await this.wait(800);
            }

            // Final greedy search in bottom layer
            let improved = true;
            while (improved && this.path.filter(p => p.layer === currentLayer).length < 6) {
                const nearest = this.findNearestNeighbor(currentLayer, currentIdx);
                if (nearest.idx !== currentIdx) {
                    currentIdx = nearest.idx;
                    this.path.push({ layer: currentLayer, idx: currentIdx });
                    this.draw();
                    await this.wait(500);
                } else {
                    improved = false;
                }
            }

            this.nearest = { layer: currentLayer, idx: currentIdx };
            this.draw();
            this.isPlaying = false;
        },

        findEntryPoint(layerIdx) {
            // Find node closest to query
            let bestIdx = 0;
            let bestDist = Infinity;
            this.layers[layerIdx].nodes.forEach((node, idx) => {
                const dist = this.distance(node, this.query);
                if (dist < bestDist) {
                    bestDist = dist;
                    bestIdx = idx;
                }
            });
            return bestIdx;
        },

        findNearestNeighbor(layerIdx, idx) {
            const layer = this.layers[layerIdx];
            const current = layer.nodes[idx];
            let bestIdx = idx;
            let bestDist = this.distance(current, this.query);

            layer.nodes.forEach((node, i) => {
                if (i === idx) return;
                const dist = this.distance(node, this.query);
                if (dist < bestDist) {
                    bestDist = dist;
                    bestIdx = i;
                }
            });

            return { idx: bestIdx, dist: bestDist };
        },

        findNearestInLayer(layerIdx, point) {
            let bestIdx = 0;
            let bestDist = Infinity;
            this.layers[layerIdx].nodes.forEach((node, idx) => {
                const dist = this.distance(node, point);
                if (dist < bestDist) {
                    bestDist = dist;
                    bestIdx = idx;
                }
            });
            return bestIdx;
        },

        wait(ms) {
            return new Promise(resolve => {
                this.animationId = setTimeout(resolve, ms);
            });
        },

        reset() {
            if (this.animationId) {
                clearTimeout(this.animationId);
                this.animationId = null;
            }
            this.isPlaying = false;
            this.path = [];
            this.nearest = null;
            this.draw();
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => HNSWAnimation.init());
    } else {
        HNSWAnimation.init();
    }
})();
