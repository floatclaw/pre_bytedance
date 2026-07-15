/**
 * Milvus 真实案例与面试题渲染
 */

const MVCasesData = {
    "cases": [
        {
            "id": "rag",
            "icon": "🤖",
            "title": "RAG 知识库问答",
            "scenario": "公司有一份内部文档库，员工通过问答机器人查询政策、流程、技术文档。用户提问后，系统需要从文档库中找到最相关的几段内容，交给大模型生成回答。",
            "why": "Milvus 可以把文档片段变成向量，根据用户问题的向量快速召回语义相关的段落，解决大模型幻觉和知识滞后问题。",
            "question": "思考：如果用户问题表述和文档原文用词不同，Milvus 为什么还能找到相关文档？"
        },
        {
            "id": "image",
            "icon": "🖼️",
            "title": "以图搜图 / 商品搜同款",
            "scenario": "电商平台允许用户上传一张商品图片，系统自动找到同款或相似商品。",
            "why": "用视觉模型把图片转成向量后，Milvus 可以在海量图片向量中快速找到视觉特征最接近的商品。",
            "question": "思考：文字搜索和以图搜图在底层索引上有什么区别？"
        },
        {
            "id": "recommend",
            "icon": "🛒",
            "title": "个性化推荐",
            "scenario": "音乐/视频/电商推荐系统中，需要把用户可能感兴趣的内容快速召回。",
            "why": "用户画像和内容都可以 embedding 成向量，Milvus 做最近邻搜索就是把和用户兴趣向量最接近的内容找出来。",
            "question": "思考：推荐场景为什么通常要用 ANN 而不是暴力搜索？"
        },
        {
            "id": "copyright",
            "icon": "©️",
            "title": "图片/视频版权监测",
            "scenario": "平台需要监测用户上传的图片或视频是否侵犯了版权库中的作品。",
            "why": "把版权素材和待检测内容都提取为特征向量，Milvus 可以快速比对相似度，发现盗版或二次创作内容。",
            "question": "思考：版权监测中，相似度阈值设得太高或太低分别会有什么问题？"
        }
    ],
    "interview": [
        {
            "question": "向量数据库和传统关系型数据库最大的区别是什么？",
            "answer": "传统数据库擅长精确匹配和结构化查询；向量数据库擅长语义相似度检索，通过向量距离找到最像的数据，而不是精确相等。"
        },
        {
            "question": "Cosine 和 Euclidean 度量分别适合什么场景？",
            "answer": "Cosine 关注向量方向，适合比较语义相似度（如文本 embedding）；Euclidean 关注绝对距离，适合对数值大小敏感的场景。归一化后两者等价。"
        },
        {
            "question": "FLAT、IVF、HNSW 三种索引怎么选？",
            "answer": "FLAT 精确但慢，适合小数据量；IVF 通过聚类桶加速，是常见折中；HNSW 基于图，搜索快、内存占用大，适合高并发在线服务。"
        },
        {
            "question": "Milvus 中 Collection 和 Partition 有什么区别？",
            "answer": "Collection 是顶层数据集合，类似表；Partition 是 Collection 内的逻辑分片，可以按业务维度划分数据，提升查询和管理效率。"
        },
        {
            "question": "向量维度是怎么确定的？创建后还能改吗？",
            "answer": "向量维度由生成 embedding 的模型决定。创建 Collection 时指定后通常不能修改，因为会影响索引结构和存储布局。"
        },
        {
            "question": "Milvus 的 search 和 query 有什么区别？",
            "answer": "search 是基于向量的近似最近邻搜索；query 是基于标量条件的精确过滤查询。两者可以结合做混合搜索。"
        },
        {
            "question": "RAG 中为什么需要向量数据库？",
            "answer": "RAG 需要把用户问题和文档片段做语义匹配，召回最相关的上下文。向量数据库能高效存储和检索海量文本向量，是实现这一步骤的关键基础设施。"
        },
        {
            "question": "生产环境使用 Milvus 需要注意什么？",
            "answer": "关注索引选择、参数调优（如 nprobe、ef）、内存/磁盘使用、监控告警、备份恢复，以及根据数据规模选择 Standalone 或 Cluster 部署。"
        }
    ]
};

const MVCases = {
    data: MVCasesData,

    init() {
        this.renderCases();
        this.renderInterview();
    },

    renderCases() {
        const container = document.getElementById('cases-container');
        if (!container) return;

        let html = '';
        this.data.cases.forEach((caseItem, index) => {
            html += `
                <div class="case-card reveal">
                    <div class="case-header">
                        <div class="case-icon">${caseItem.icon}</div>
                        <div>
                            <div class="case-title">${caseItem.title}</div>
                        </div>
                    </div>
                    <h4>场景</h4>
                    <p>${caseItem.scenario}</p>
                    <h4>为什么适合用 Milvus？</h4>
                    <p>${caseItem.why}</p>
                    <div class="case-question">
                        <strong>思考题：</strong>${caseItem.question}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    renderInterview() {
        const container = document.getElementById('interview-container');
        if (!container) return;

        let html = '<div class="accordion-group">';
        this.data.interview.forEach((item, index) => {
            html += `
                <div class="accordion">
                    <button class="accordion-header">
                        <span>${index + 1}. ${item.question}</span>
                        <span class="accordion-icon">▼</span>
                    </button>
                    <div class="accordion-body">
                        <div class="accordion-content">
                            <p>${item.answer}</p>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        container.innerHTML = html;

        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', () => {
                const body = header.nextElementSibling;
                const isOpen = body.classList.contains('open');

                const parent = header.closest('.accordion-group');
                if (parent) {
                    parent.querySelectorAll('.accordion-body').forEach(b => b.classList.remove('open'));
                    parent.querySelectorAll('.accordion-header').forEach(h => h.classList.remove('active'));
                }

                if (!isOpen) {
                    body.classList.add('open');
                    header.classList.add('active');
                }
            });
        });
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MVCases.init());
} else {
    MVCases.init();
}
