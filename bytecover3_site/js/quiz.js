/**
 * ByteCover3 课程测验系统
 */

const BCQuizData = {
    "chapter1": {
        "title": "第 1 章测验",
        "questions": [
            {
                "id": "c1q1",
                "type": "mcq",
                "question": "翻唱识别的主要难点是什么？",
                "options": [
                    "音频文件太大",
                    "翻唱版本可能在歌手、乐器、调、速度上与原版不同",
                    "电脑无法播放音频",
                    "歌曲名字太长"
                ],
                "answer": 1,
                "explanation": "翻唱版本可能换了歌手、乐器、调、速度，甚至只唱片段，这些都给识别带来挑战。"
            },
            {
                "id": "c1q2",
                "type": "mcq",
                "question": "ByteCover3 相比传统方法的核心区别是？",
                "options": [
                    "使用更大的神经网络",
                    "把一首歌切成多个局部特征来匹配",
                    "直接比较音频波形",
                    "只识别完整长度的歌曲"
                ],
                "answer": 1,
                "explanation": "传统方法用全局特征，ByteCover3 用局部特征，更适合短查询匹配。"
            },
            {
                "id": "c1q3",
                "type": "tf",
                "question": "局部特征是指用很多串数字代表歌的不同片段。",
                "answer": true,
                "explanation": "局部特征把歌曲分成多个片段，每个片段有自己的特征向量。"
            }
        ]
    },
    "chapter2": {
        "title": "第 2 章测验",
        "questions": [
            {
                "id": "c2q1",
                "type": "mcq",
                "question": "CQT 的纵轴为什么适合音乐？",
                "options": [
                    "频率线性分布",
                    "每 bin 对应一个半音",
                    "只显示最大音量",
                    "时间分辨率最高"
                ],
                "answer": 1,
                "explanation": "CQT 使用对数频率轴，每八度固定 12 个 bins，每个 bin 对应一个半音。"
            },
            {
                "id": "c2q2",
                "type": "tf",
                "question": "同一旋律升调后，CQT 上的图案会整体上下平移。",
                "answer": true,
                "explanation": "升调只改变基频，不改变相对音程，所以 CQT 上的亮线整体平移。"
            },
            {
                "id": "c2q3",
                "type": "mcq",
                "question": "ByteCover3 中 CQT 的时间轴为什么要下采样 100 倍？",
                "options": [
                    "为了提高频率分辨率",
                    "为了减少计算量，保留主要时频结构",
                    "为了让图更好看",
                    "为了改变音高"
                ],
                "answer": 1,
                "explanation": "时间下采样可以减少数据量，同时保留主要的时频结构。"
            }
        ]
    },
    "chapter3": {
        "title": "第 3 章测验",
        "questions": [
            {
                "id": "c3q1",
                "type": "mcq",
                "question": "CNN 的核心思想是什么？",
                "options": [
                    "把图片拉平成一列数字",
                    "用小窗口在图上滑动，局部地看图",
                    "直接比较整张图片",
                    "只学习颜色信息"
                ],
                "answer": 1,
                "explanation": "CNN 用卷积核在图上滑动，学习局部特征。"
            },
            {
                "id": "c3q2",
                "type": "mcq",
                "question": "ResNet 解决的是什么问题？",
                "options": [
                    "网络太浅",
                    "深层网络训练退化",
                    "数据不够",
                    "学习率太大"
                ],
                "answer": 1,
                "explanation": "ResNet 通过 shortcut 连接解决深层网络中的梯度消失/退化问题。"
            },
            {
                "id": "c3q3",
                "type": "tf",
                "question": "IBN 中的 Instance Normalization 有助于忽略歌手、乐器等风格变化。",
                "answer": true,
                "explanation": "IN 对单个样本做归一化，有助于去除风格信息，保留内容信息。"
            }
        ]
    },
    "chapter4": {
        "title": "第 4 章测验",
        "questions": [
            {
                "id": "c4q1",
                "type": "mcq",
                "question": "MaxMean 相似度的计算顺序是？",
                "options": [
                    "先对所有相似度取平均，再取最大",
                    "对每个查询 chunk 取最大相似度，再对这些最大值取平均",
                    "直接对所有 chunk 取平均",
                    "随机取几个相似度平均"
                ],
                "answer": 1,
                "explanation": "MaxMean = 对每个 query chunk 找 candidate 中最像的（max），再对这些最大值取平均（mean）。"
            },
            {
                "id": "c4q2",
                "type": "tf",
                "question": "MaxMean 是对称的，MaxMean(A,B) 总是等于 MaxMean(B,A)。",
                "answer": false,
                "explanation": "MaxMean 是非对称的，总是以较短的一方为基准。"
            },
            {
                "id": "c4q3",
                "type": "mcq",
                "question": "余弦相似度比较的是两个向量的什么？",
                "options": [
                    "长度",
                    "方向",
                    "元素个数",
                    "平均值"
                ],
                "answer": 1,
                "explanation": "余弦相似度计算两个向量夹角的余弦，只看方向不看长度。"
            }
        ]
    },
    "chapter5": {
        "title": "第 5 章测验",
        "questions": [
            {
                "id": "c5q1",
                "type": "mcq",
                "question": "Local Alignment Loss 由哪两部分组成？",
                "options": [
                    "分类损失 + Triplet 损失",
                    "均方误差 + 交叉熵",
                    "L1 损失 + L2 损失",
                    "召回率 + 准确率"
                ],
                "answer": 0,
                "explanation": "LAL = 局部分类损失 + 局部 Triplet 损失。"
            },
            {
                "id": "c5q2",
                "type": "mcq",
                "question": "Triplet Loss 中的 Positive 是指？",
                "options": [
                    "不同歌的样本",
                    "同一首歌的另一个版本",
                    "随机噪声",
                    "模型预测结果"
                ],
                "answer": 1,
                "explanation": "Triplet 包含 Anchor、Positive（同歌）、Negative（异歌）。"
            },
            {
                "id": "c5q3",
                "type": "tf",
                "question": "ByteCover3 训练时会混合短片段和完整曲目，以适应短视频查询。",
                "answer": true,
                "explanation": "训练数据包含 6-60 秒短片段和完整曲目，让模型学会短查询匹配。"
            }
        ]
    },
    "chapter6": {
        "title": "第 6 章测验",
        "questions": [
            {
                "id": "c6q1",
                "type": "mcq",
                "question": "两阶段检索中，第一阶段主要做什么？",
                "options": [
                    "对所有歌曲计算 MaxMean",
                    "用 ANN 快速筛选候选 chunks",
                    "直接返回最终结果",
                    "训练神经网络"
                ],
                "answer": 1,
                "explanation": "第一阶段用 ANN 粗排，快速找到候选 chunks，缩小搜索范围。"
            },
            {
                "id": "c6q2",
                "type": "mcq",
                "question": "HNSW 是什么类型的索引？",
                "options": [
                    "精确最近邻索引",
                    "近似最近邻图索引",
                    "数据库索引",
                    "文本倒排索引"
                ],
                "answer": 1,
                "explanation": "HNSW = Hierarchical Navigable Small World，是一种近似最近邻图索引。"
            },
            {
                "id": "c6q3",
                "type": "tf",
                "question": "第二阶段会对第一阶段筛选出的所有候选歌曲计算 MaxMean 并排序。",
                "answer": true,
                "explanation": "第二阶段对候选歌曲做精确的 MaxMean 计算和排序。"
            }
        ]
    },
    "chapter7": {
        "title": "第 7 章测验",
        "questions": [
            {
                "id": "c7q1",
                "type": "mcq",
                "question": "简化版 Demo 和论文的主要差距是什么？",
                "options": [
                    "Demo 使用真实歌曲",
                    "Demo 用于理解原理，论文精度需要大数据和预训练模型",
                    "Demo 比论文更准确",
                    "没有差距"
                ],
                "answer": 1,
                "explanation": "简化 Demo 重在理解流程，论文精度需要真实数据、预训练 ResNet-IBN、LAL 训练等。"
            },
            {
                "id": "c7q2",
                "type": "tf",
                "question": "简化版 Demo 使用 512 维 embedding。",
                "answer": false,
                "explanation": "简化版 Demo 使用 64 维 embedding。"
            }
        ]
    },
    "chapter8": {
        "title": "第 8 章测验",
        "questions": [
            {
                "id": "c8q1",
                "type": "mcq",
                "question": "以下哪个不是 ByteCover3 的典型应用场景？",
                "options": [
                    "短视频版权监测",
                    "用户哼唱识别",
                    "天气预报",
                    "直播背景音乐监测"
                ],
                "answer": 2,
                "explanation": "ByteCover3 用于音频/音乐识别，与天气预报无关。"
            },
            {
                "id": "c8q2",
                "type": "mcq",
                "question": "面试题：为什么全局 embedding 对短查询失效？核心答案是？",
                "options": [
                    "短查询的 embedding 太大",
                    "完整歌曲的全局 embedding 会被无关片段稀释",
                    "短查询没有旋律",
                    "全局 embedding 只能识别英文歌"
                ],
                "answer": 1,
                "explanation": "全局 embedding 包含整首歌信息，短查询只对应其中一小段，导致匹配被稀释。"
            }
        ]
    },
    "summary": {
        "title": "总测验",
        "questions": [
            {
                "id": "sq1",
                "type": "mcq",
                "question": "ByteCover3 的三大核心创新不包括？",
                "options": [
                    "局部特征表示",
                    "MaxMean + LAL",
                    "两阶段检索",
                    "全局平均池化"
                ],
                "answer": 3,
                "explanation": "ByteCover3 的三大核心创新是：1) 局部特征表示；2) MaxMean + LAL；3) 两阶段检索。全局平均池化是 CNN 中常见的通用技术，会把输入压成一个全局向量，而 ByteCover3 的核心正是反对全局特征、改用局部特征序列。"
            },
            {
                "id": "sq2",
                "type": "mcq",
                "question": "CQT 为什么比普通频谱图更适合音乐？",
                "options": [
                    "它的纵轴按对数频率分布，每 bin 对应半音",
                    "它的时间分辨率更高",
                    "它只显示高频",
                    "它不需要 FFT"
                ],
                "answer": 0,
                "explanation": "CQT 的对数频率轴与音乐音阶对齐。"
            },
            {
                "id": "sq3",
                "type": "mcq",
                "question": "两阶段检索的优势是？",
                "options": [
                    "准确率更高但速度很慢",
                    "速度快且召回率高",
                    "不需要索引",
                    "只适用于小数据库"
                ],
                "answer": 1,
                "explanation": "两阶段检索先用 ANN 快速粗排，再用 MaxMean 精排，兼顾速度和准确率。"
            },
            {
                "id": "sq4",
                "type": "tf",
                "question": "ByteCover3 可以处理只有十几秒的短视频音乐查询。",
                "answer": true,
                "explanation": "这正是 ByteCover3 的设计目标。"
            }
        ]
    }
};

const BCQuiz = {
    data: BCQuizData,
    state: {},

    init() {
        this.loadState();
        this.renderAll();
    },

    loadState() {
        try {
            const saved = localStorage.getItem('bytecover3_quiz_state');
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
            localStorage.setItem('bytecover3_quiz_state', JSON.stringify(this.state));
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

        // Update global progress
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
                <button class="btn btn-primary" onclick="BCQuiz.checkAnswer('${chapterId}', ${questionIndex})">提交答案</button>
                ${questionIndex > 0 ? `<button class="btn btn-secondary" onclick="BCQuiz.prevQuestion('${chapterId}')">上一题</button>` : ''}
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
                <button class="btn btn-secondary" onclick="BCQuiz.restart('${chapterId}')">重新测验</button>
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

        // Show feedback
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

        // Disable inputs
        inputs.forEach(input => input.disabled = true);

        // Save state
        this.state[chapterId] = state;
        this.saveState();

        // Auto advance after delay
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

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => BCQuiz.init());
} else {
    BCQuiz.init();
}
