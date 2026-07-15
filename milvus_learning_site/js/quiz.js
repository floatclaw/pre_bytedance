/**
 * Milvus 课程测验系统
 */

const MVQuizData = {
    "chapter1": {
        "title": "第 1 章测验",
        "questions": [
            {
                "id": "c1q1",
                "type": "mcq",
                "question": "什么是 embedding（嵌入向量）？",
                "options": [
                    "一种图片压缩格式",
                    "把文本、图像、音频等数据转成一串数字",
                    "一种数据库索引",
                    "一种编程语言"
                ],
                "answer": 1,
                "explanation": "Embedding 是把非结构化数据（文本、图像、音频等）映射成高维数字向量的过程。"
            },
            {
                "id": "c1q2",
                "type": "mcq",
                "question": "以下哪种数据不能被转换成向量？",
                "options": [
                    "文本",
                    "图像",
                    "音频",
                    "以上都可以"
                ],
                "answer": 3,
                "explanation": "文本、图像、音频都可以被模型转换成向量，只要训练了合适的 embedding 模型。"
            },
            {
                "id": "c1q3",
                "type": "tf",
                "question": "向量维度就是向量里数字的个数。",
                "answer": true,
                "explanation": "一个 128 维的向量包含 128 个数字。"
            },
            {
                "id": "c1q4",
                "type": "mcq",
                "question": "为什么可以用向量来计算「像不像」？",
                "options": [
                    "因为向量看起来比较直观",
                    "因为相似的东西在向量空间里距离更近，可以用数学方法计算",
                    "因为向量比原始数据占用更少的存储空间",
                    "因为所有机器学习模型都只接受向量输入"
                ],
                "answer": 1,
                "explanation": "核心思路是：把事物表示成空间中的点，相似的事物在向量空间里距离更近，从而把「像不像」转化为可计算的距离问题。"
            }
        ]
    },
    "chapter2": {
        "title": "第 2 章测验",
        "questions": [
            {
                "id": "c2q1",
                "type": "mcq",
                "question": "余弦相似度主要衡量两个向量的什么？",
                "options": [
                    "长度差异",
                    "方向夹角",
                    "元素个数",
                    "平均值"
                ],
                "answer": 1,
                "explanation": "余弦相似度看两个向量夹角的余弦，方向越接近越相似。"
            },
            {
                "id": "c2q2",
                "type": "mcq",
                "question": "欧氏距离衡量的是？",
                "options": [
                    "两个向量终点之间的直线距离",
                    "两个向量的夹角",
                    "两个向量的点积",
                    "两个向量的维度差"
                ],
                "answer": 0,
                "explanation": "欧氏距离是两点之间直线距离，对绝对大小更敏感。"
            },
            {
                "id": "c2q3",
                "type": "tf",
                "question": "归一化后的向量，余弦相似度和内积结果相同。",
                "answer": true,
                "explanation": "向量归一化后长度为 1，cosine = dot/(1*1) = dot = IP。"
            },
            {
                "id": "c2q4",
                "type": "mcq",
                "question": "电影推荐系统中，如果想让「兴趣强的用户」和「热门电影」更容易被匹配，更适合用哪种度量？",
                "options": [
                    "Cosine",
                    "Euclidean",
                    "Inner Product（IP）",
                    "Jaccard"
                ],
                "answer": 2,
                "explanation": "IP = ||A|| × ||B|| × cos(θ)，同时受方向和长度影响。用户兴趣强、电影热度高，都会表现为向量长度大，IP 能自然放大这种匹配。"
            }
        ]
    },
    "chapter3": {
        "title": "第 3 章测验",
        "questions": [
            {
                "id": "c3q1",
                "type": "mcq",
                "question": "为什么要用 ANN（近似最近邻）而不是暴力搜索？",
                "options": [
                    "ANN 结果一定更准确",
                    "数据量太大时，暴力搜索太慢",
                    "ANN 不需要索引",
                    "暴力搜索只支持小向量"
                ],
                "answer": 1,
                "explanation": "当向量数量达到百万/亿级时，暴力搜索每次查询都要扫描全部数据，太慢。"
            },
            {
                "id": "c3q2",
                "type": "mcq",
                "question": "以下哪种索引是精确索引？",
                "options": [
                    "IVF_FLAT",
                    "HNSW",
                    "FLAT",
                    "ANNOY"
                ],
                "answer": 2,
                "explanation": "FLAT（也叫 IVF_FLAT 中的 FLAT 部分在最终比较时）是暴力精确比较；注意 IVF_FLAT 整体是近似的，因为只搜索部分桶。严格来说 FLAT/BruteForce 是精确索引。"
            },
            {
                "id": "c3q3",
                "type": "tf",
                "question": "HNSW 是一种基于图的近似最近邻索引。",
                "answer": true,
                "explanation": "HNSW = Hierarchical Navigable Small World，是一种图索引。"
            }
        ]
    },
    "chapter4": {
        "title": "第 4 章测验",
        "questions": [
            {
                "id": "c4q1",
                "type": "mcq",
                "question": "Milvus 中的 Collection 最像关系数据库里的什么？",
                "options": [
                    "一行记录",
                    "一个表",
                    "一个字段",
                    "一个索引"
                ],
                "answer": 1,
                "explanation": "Collection 是 Milvus 的数据组织单元，类似关系数据库中的表。"
            },
            {
                "id": "c4q2",
                "type": "mcq",
                "question": "以下哪个字段类型用于存储向量？",
                "options": [
                    "VARCHAR",
                    "INT64",
                    "FLOAT_VECTOR",
                    "BOOL"
                ],
                "answer": 2,
                "explanation": "FLOAT_VECTOR 是 Milvus 中存储浮点型向量的字段类型。"
            },
            {
                "id": "c4q3",
                "type": "tf",
                "question": "Partition 是对 Collection 的逻辑划分，便于数据管理和查询隔离。",
                "answer": true,
                "explanation": "Partition 可以把 Collection 按业务维度拆分，提高查询效率。"
            }
        ]
    },
    "chapter5": {
        "title": "第 5 章测验",
        "questions": [
            {
                "id": "c5q1",
                "type": "mcq",
                "question": "向量字段的维度由什么决定？",
                "options": [
                    "随机选择",
                    "使用的 embedding 模型输出维度",
                    "Milvus 自动推断",
                    "数据量大小"
                ],
                "answer": 1,
                "explanation": "向量维度由生成 embedding 的模型决定，比如 OpenAI text-embedding-3-small 是 1536 维。"
            },
            {
                "id": "c5q2",
                "type": "mcq",
                "question": "Collection 创建后，以下哪项通常不能修改？",
                "options": [
                    "Collection 名称",
                    "向量字段的维度",
                    "标量字段",
                    "Partition 数量"
                ],
                "answer": 1,
                "explanation": "向量维度是 Schema 的一部分，创建后通常不能修改。"
            },
            {
                "id": "c5q3",
                "type": "tf",
                "question": "Primary key 用于唯一标识 Collection 中的每个 entity。",
                "answer": true,
                "explanation": "主键是 entity 的唯一标识，类似关系数据库的主键。"
            }
        ]
    },
    "chapter6": {
        "title": "第 6 章测验",
        "questions": [
            {
                "id": "c6q1",
                "type": "mcq",
                "question": "search() 和 query() 的主要区别是？",
                "options": [
                    "search 用向量，query 用标量表达式",
                    "search 更快",
                    "query 只能返回一个结果",
                    "没有区别"
                ],
                "answer": 0,
                "explanation": "search 是基于向量的相似度搜索，query 是基于标量条件的过滤查询。"
            },
            {
                "id": "c6q2",
                "type": "mcq",
                "question": "top-k 参数控制什么？",
                "options": [
                    "索引数量",
                    "返回的最相似结果数量",
                    "向量维度",
                    "分区数量"
                ],
                "answer": 1,
                "explanation": "top-k 表示返回最相似的 k 个结果。"
            },
            {
                "id": "c6q3",
                "type": "tf",
                "question": "混合搜索（hybrid search）可以同时使用向量相似度和标量过滤。",
                "answer": true,
                "explanation": "Milvus 支持在向量搜索时加上 expr 标量过滤条件。"
            }
        ]
    },
    "chapter7": {
        "title": "第 7 章测验",
        "questions": [
            {
                "id": "c7q1",
                "type": "mcq",
                "question": "Milvus Standalone 和 Cluster 的主要区别是？",
                "options": [
                    "Standalone 是单节点，Cluster 是分布式多节点",
                    "Standalone 免费，Cluster 收费",
                    "Standalone 不支持向量搜索",
                    "Cluster 只能运行在云上"
                ],
                "answer": 0,
                "explanation": "Standalone 是单节点部署，Cluster 是分布式部署，适合大规模生产。"
            },
            {
                "id": "c7q2",
                "type": "tf",
                "question": "Attu 是 Milvus 的图形化管理界面。",
                "answer": true,
                "explanation": "Attu 是 Milvus 的 GUI 工具，可以管理 collection、查询数据等。"
            }
        ]
    },
    "chapter8": {
        "title": "第 8 章测验",
        "questions": [
            {
                "id": "c8q1",
                "type": "mcq",
                "question": "以下哪个不是 Milvus 的典型应用场景？",
                "options": [
                    "RAG 知识库检索",
                    "以图搜图",
                    "天气预报预测",
                    "商品推荐"
                ],
                "answer": 2,
                "explanation": "Milvus 用于向量相似度检索，天气预报预测不是典型场景。"
            },
            {
                "id": "c8q2",
                "type": "mcq",
                "question": "在 RAG 中，Milvus 通常承担什么角色？",
                "options": [
                    "生成回答",
                    "检索相关上下文",
                    "训练大模型",
                    "绘制图表"
                ],
                "answer": 1,
                "explanation": "RAG 中 Milvus 负责根据用户问题检索最相关的文档片段，作为上下文交给大模型。"
            }
        ]
    },
    "summary": {
        "title": "总测验",
        "questions": [
            {
                "id": "sq1",
                "type": "mcq",
                "question": "Milvus 是什么类型的数据库？",
                "options": [
                    "关系型数据库",
                    "向量数据库",
                    "时序数据库",
                    "图数据库"
                ],
                "answer": 1,
                "explanation": "Milvus 是专门存储和检索高维向量的数据库。"
            },
            {
                "id": "sq2",
                "type": "mcq",
                "question": "ANN 的全称和含义是？",
                "options": [
                    "Artificial Neural Network（人工神经网络）",
                    "Approximate Nearest Neighbor（近似最近邻）",
                    "Advanced Network Node（高级网络节点）",
                    "Automatic Number Normalization（自动数字归一化）"
                ],
                "answer": 1,
                "explanation": "ANN 在向量检索中指 Approximate Nearest Neighbor，用少量精度损失换取大幅提升速度。"
            },
            {
                "id": "sq3",
                "type": "mcq",
                "question": "以下哪项不是 Milvus 支持的相似度度量？",
                "options": [
                    "Cosine",
                    "Euclidean（L2）",
                    "Inner Product（IP）",
                    "Jaccard 编辑距离"
                ],
                "answer": 3,
                "explanation": "Milvus 常见度量包括 Cosine、L2、IP，Jaccard 编辑距离不是标准说法。"
            },
            {
                "id": "sq4",
                "type": "tf",
                "question": "在 Milvus 中，FLAT 索引比 HNSW 索引搜索速度慢，但结果更精确。",
                "answer": true,
                "explanation": "FLAT 是暴力精确搜索；HNSW 是近似搜索，更快但可能牺牲少量精度。"
            }
        ]
    }
};

const MVQuiz = {
    data: MVQuizData,
    state: {},

    init() {
        this.loadState();
        this.renderAll();
    },

    loadState() {
        try {
            const saved = localStorage.getItem('milvus_quiz_state');
            if (saved) {
                this.state = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to load quiz state:', e);
            this.state = {};
        }
    },

    saveState() {
        try {
            localStorage.setItem('milvus_quiz_state', JSON.stringify(this.state));
        } catch (e) {
            console.warn('Failed to save quiz state:', e);
        }
    },

    renderAll() {
        document.querySelectorAll('.quiz-container').forEach(container => {
            const chapterId = container.dataset.chapter;
            if (chapterId && this.data[chapterId]) {
                this.render(container, chapterId);
            }
        });

        if (typeof window.updateCourseProgress === 'function') {
            window.updateCourseProgress();
        }
    },

    render(container, chapterId) {
        const chapter = this.data[chapterId];
        const state = this.state[chapterId] || { current: 0, answers: {}, completed: false };

        let html = `
            <div class="quiz-card" style="background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 12px; padding: 24px; margin: 32px 0; box-shadow: var(--shadow);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h4 style="margin: 0; color: var(--accent);">📝 ${chapter.title}</h4>
                    <span style="font-size: 0.85rem; color: var(--text-secondary);">${state.completed ? '已完成' : `第 ${state.current + 1} / ${chapter.questions.length} 题`}</span>
                </div>
        `;

        if (state.completed) {
            const correct = this.countCorrect(chapterId);
            html += this.renderResult(chapterId, correct, chapter.questions.length);
        } else {
            html += this.renderQuestion(chapterId, state.current);
        }

        html += '</div>';
        container.innerHTML = html;
    },

    renderQuestion(chapterId, questionIndex) {
        const chapter = this.data[chapterId];
        const question = chapter.questions[questionIndex];
        const state = this.state[chapterId] || { current: 0, answers: {}, completed: false };

        let html = `
            <div class="quiz-question" style="margin-bottom: 16px;">
                <p style="font-size: 1.05rem; font-weight: 600; margin-bottom: 16px;">${questionIndex + 1}. ${question.question}</p>
        `;

        if (question.type === 'mcq') {
            html += '<div style="display: flex; flex-direction: column; gap: 8px;">';
            question.options.forEach((option, idx) => {
                html += `
                    <label class="quiz-option" style="display: flex; align-items: center; gap: 10px; padding: 12px; background: var(--bg-primary); border: 1px solid var(--border); border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                        <input type="radio" name="q_${chapterId}_${questionIndex}" value="${idx}" style="cursor: pointer;">
                        <span>${option}</span>
                    </label>
                `;
            });
            html += '</div>';
        } else if (question.type === 'tf') {
            html += `
                <div style="display: flex; gap: 12px;">
                    <label class="quiz-option" style="flex: 1; display: flex; align-items: center; gap: 10px; padding: 12px; background: var(--bg-primary); border: 1px solid var(--border); border-radius: 8px; cursor: pointer;">
                        <input type="radio" name="q_${chapterId}_${questionIndex}" value="true" style="cursor: pointer;">
                        <span>正确</span>
                    </label>
                    <label class="quiz-option" style="flex: 1; display: flex; align-items: center; gap: 10px; padding: 12px; background: var(--bg-primary); border: 1px solid var(--border); border-radius: 8px; cursor: pointer;">
                        <input type="radio" name="q_${chapterId}_${questionIndex}" value="false" style="cursor: pointer;">
                        <span>错误</span>
                    </label>
                </div>
            `;
        }

        html += `
                <div class="quiz-feedback" style="display: none; margin-top: 16px; padding: 16px; border-radius: 8px;"></div>
            </div>
            <div style="display: flex; gap: 12px;">
                <button class="btn btn-primary" onclick="MVQuiz.checkAnswer('${chapterId}', ${questionIndex})">提交答案</button>
                ${questionIndex > 0 ? `<button class="btn btn-secondary" onclick="MVQuiz.prevQuestion('${chapterId}')">上一题</button>` : ''}
            </div>
        `;

        return html;
    },

    renderResult(chapterId, correct, total) {
        const percent = Math.round((correct / total) * 100);
        let message, color;

        if (percent === 100) {
            message = '太棒了！全部答对 🎉';
            color = 'var(--success)';
        } else if (percent >= 70) {
            message = '掌握得不错，继续加油！';
            color = 'var(--warning)';
        } else {
            message = '建议再复习一下本章内容。';
            color = 'var(--coral)';
        }

        return `
            <div style="text-align: center; padding: 20px 0;">
                <div style="font-size: 3rem; font-weight: 800; color: ${color}; margin-bottom: 8px;">${correct}/${total}</div>
                <p style="font-size: 1.1rem; color: var(--text-primary); margin-bottom: 16px;">${message}</p>
                <button class="btn btn-secondary" onclick="MVQuiz.restart('${chapterId}')">重新测验</button>
            </div>
        `;
    },

    checkAnswer(chapterId, questionIndex) {
        const chapter = this.data[chapterId];
        const question = chapter.questions[questionIndex];
        const state = this.state[chapterId] || { current: 0, answers: {}, completed: false };

        const inputs = document.querySelectorAll(`input[name="q_${chapterId}_${questionIndex}"]`);
        let selected = null;
        inputs.forEach(input => {
            if (input.checked) {
                selected = input.value;
            }
        });

        if (selected === null) {
            alert('请先选择一个答案');
            return;
        }

        let isCorrect = false;
        if (question.type === 'mcq') {
            isCorrect = parseInt(selected) === question.answer;
        } else if (question.type === 'tf') {
            isCorrect = (selected === 'true') === question.answer;
        }

        state.answers[questionIndex] = { selected, isCorrect };

        const feedback = document.querySelector(`#chapter${chapterId.replace('chapter', '')} .quiz-feedback, [data-chapter="${chapterId}"] .quiz-feedback`);
        if (feedback) {
            feedback.style.display = 'block';
            feedback.style.background = isCorrect ? 'var(--success)' : 'var(--coral)';
            feedback.style.color = '#fff';
            feedback.innerHTML = `
                <strong>${isCorrect ? '回答正确！' : '回答错误'}</strong><br>
                ${question.explanation}
            `;
        }

        inputs.forEach(input => input.disabled = true);

        this.state[chapterId] = state;
        this.saveState();

        setTimeout(() => {
            if (questionIndex < chapter.questions.length - 1) {
                state.current = questionIndex + 1;
                this.state[chapterId] = state;
                this.saveState();
                this.renderAll();
            } else {
                state.completed = true;
                this.state[chapterId] = state;
                this.saveState();
                this.renderAll();
            }
        }, 1800);
    },

    prevQuestion(chapterId) {
        const state = this.state[chapterId];
        if (state && state.current > 0) {
            state.current--;
            this.saveState();
            this.renderAll();
        }
    },

    restart(chapterId) {
        this.state[chapterId] = { current: 0, answers: {}, completed: false };
        this.saveState();
        this.renderAll();
    },

    countCorrect(chapterId) {
        const state = this.state[chapterId];
        if (!state || !state.answers) return 0;

        let correct = 0;
        Object.values(state.answers).forEach(ans => {
            if (ans.isCorrect) correct++;
        });
        return correct;
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MVQuiz.init());
} else {
    MVQuiz.init();
}
