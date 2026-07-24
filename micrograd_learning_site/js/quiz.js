/**
 * micrograd 课程测验系统
 */

const MGQuizData = {
    "chapter1": {
        "title": "第 1 章测验",
        "questions": [
            {
                "id": "c1q1",
                "type": "mcq",
                "question": "micrograd 是什么类型的项目？",
                "options": [
                    "一个生产级深度学习框架",
                    "一个极简标量自动微分引擎 + 神经网络库",
                    "一个图像识别模型",
                    "一个 Python 包管理工具"
                ],
                "answer": 1,
                "explanation": "micrograd 是 Andrej Karpathy 写的一个教学项目，核心是一个标量级别的自动微分引擎和在其上构建的小型神经网络库。"
            },
            {
                "id": "c1q2",
                "type": "mcq",
                "question": "自动微分（autograd）的主要作用是什么？",
                "options": [
                    "自动选择神经网络架构",
                    "自动计算函数对各个参数的梯度",
                    "自动生成训练数据",
                    "自动部署模型"
                ],
                "answer": 1,
                "explanation": "autograd 的核心作用是在前向计算后，自动沿着计算图反向传播，求出损失函数对每个参数的梯度。"
            },
            {
                "id": "c1q3",
                "type": "tf",
                "question": "micrograd 只支持标量（单个数字）运算，不支持张量。",
                "answer": true,
                "explanation": "micrograd 故意只操作标量，把每个神经元拆成一个个 tiny add/mul，从而清晰展示自动微分的原理。"
            },
            {
                "id": "c1q4",
                "type": "mcq",
                "question": "为什么要从零实现 micrograd？",
                "options": [
                    "为了替代 PyTorch",
                    "为了理解反向传播和计算图的本质",
                    "因为标量运算比张量快",
                    "为了处理大规模数据"
                ],
                "answer": 1,
                "explanation": "手写 micrograd 的教育价值在于：通过最小实现理解 PyTorch autograd 背后的机制。"
            }
        ]
    },
    "chapter2": {
        "title": "第 2 章测验",
        "questions": [
            {
                "id": "c2q1",
                "type": "mcq",
                "question": "在 micrograd 的 Value 对象中，`_prev` 存储的是什么？",
                "options": [
                    "上一次训练的损失",
                    "当前节点的父节点（子节点集合）",
                    "上一次反向传播的梯度",
                    "优化器状态"
                ],
                "answer": 1,
                "explanation": "`_prev` 是一个 Set，存储产生当前 Value 的子节点，用于构建计算图。"
            },
            {
                "id": "c2q2",
                "type": "mcq",
                "question": "计算图（DAG）中的边代表什么？",
                "options": [
                    "神经元之间的物理连接",
                    "数据依赖关系：一个 Value 如何由其他 Value 计算得到",
                    "训练样本之间的相似度",
                    "模型参数的初始值"
                ],
                "answer": 1,
                "explanation": "计算图的边表示运算关系，比如 c = a + b 就有一条从 a、b 指向 c 的边。"
            },
            {
                "id": "c2q3",
                "type": "tf",
                "question": "Value 对象的 `grad` 字段在创建时默认为 1。",
                "answer": false,
                "explanation": "`grad` 默认是 0，只有在调用 backward() 后，根节点 grad 被设为 1，其他节点才会被逐步填充。"
            },
            {
                "id": "c2q4",
                "type": "mcq",
                "question": "下面哪个表达式会构建出计算图？",
                "options": [
                    "a = 2; b = 3; c = a + b",
                    "a = Value(2); b = Value(3); c = a + b",
                    "print('hello')",
                    "import micrograd"
                ],
                "answer": 1,
                "explanation": "只有用 Value 对象进行运算时，才会记录 _prev 和 _op，从而构建出可反向传播的计算图。"
            }
        ]
    },
    "chapter3": {
        "title": "第 3 章测验",
        "questions": [
            {
                "id": "c3q1",
                "type": "mcq",
                "question": "前向传播（forward pass）主要做什么？",
                "options": [
                    "更新模型参数",
                    "计算输出值并构建计算图",
                    "清空之前的梯度",
                    "随机初始化权重"
                ],
                "answer": 1,
                "explanation": "前向传播从输入开始，沿着计算图逐层计算出最终输出，同时记录每个节点的子节点。"
            },
            {
                "id": "c3q2",
                "type": "mcq",
                "question": "对于 c = a * b，反向传播时 a 的梯度怎么计算？",
                "options": [
                    "a.grad += c.grad",
                    "a.grad += b.data * c.grad",
                    "a.grad += a.data * c.grad",
                    "a.grad = b.data"
                ],
                "answer": 1,
                "explanation": "dc/da = b，所以 a.grad += b.data * c.grad，这是链式法则的应用。"
            },
            {
                "id": "c3q3",
                "type": "tf",
                "question": "反向传播前必须先把根节点的 grad 设为 1。",
                "answer": true,
                "explanation": "backward() 方法内部会把 this.grad 设为 1.0，表示「我对自己的梯度是 1」，然后向子节点传播。"
            }
        ]
    },
    "chapter4": {
        "title": "第 4 章测验",
        "questions": [
            {
                "id": "c4q1",
                "type": "mcq",
                "question": "链式法则在反向传播中的作用是什么？",
                "options": [
                    "加速前向计算",
                    "把上游梯度乘以局部导数，传递给下游节点",
                    "减少模型参数量",
                    "选择学习率"
                ],
                "answer": 1,
                "explanation": "链式法则让我们可以把最终损失对某个节点的梯度，分解为「损失对该节点输出的梯度 × 该节点输出对其输入的局部导数」。"
            },
            {
                "id": "c4q2",
                "type": "mcq",
                "question": "为什么要用拓扑排序（topological sort）？",
                "options": [
                    "为了美观地绘制计算图",
                    "为了保证在反向传播时，每个节点都在其子节点之后被处理",
                    "为了加速前向传播",
                    "为了随机打乱节点顺序"
                ],
                "answer": 1,
                "explanation": "拓扑排序确保反向传播从根节点开始，按依赖顺序逐层向下游传播梯度。"
            },
            {
                "id": "c4q3",
                "type": "tf",
                "question": "如果一个 Value 被多个运算使用，它的梯度应该累加而不是覆盖。",
                "answer": true,
                "explanation": "多路径贡献梯度时，使用 += 累加。例如 a 同时参与 b=a+1 和 c=a+2，则 a.grad += b.grad + c.grad。"
            },
            {
                "id": "c4q4",
                "type": "mcq",
                "question": "对于 y = x^3，当 x=2 时 dy/dx 等于多少？",
                "options": [
                    "6",
                    "8",
                    "12",
                    "4"
                ],
                "answer": 2,
                "explanation": "d(x^3)/dx = 3x^2，当 x=2 时，3*4=12。"
            }
        ]
    },
    "chapter5": {
        "title": "第 5 章测验",
        "questions": [
            {
                "id": "c5q1",
                "type": "mcq",
                "question": "为什么神经网络需要非线性激活函数？",
                "options": [
                    "为了加快训练速度",
                    "为了引入非线性，使网络能拟合复杂决策边界",
                    "为了减少参数量",
                    "为了让梯度更大"
                ],
                "answer": 1,
                "explanation": "没有激活函数，多层线性变换仍然等价于一层线性变换，无法拟合非线性关系。"
            },
            {
                "id": "c5q2",
                "type": "mcq",
                "question": "ReLU 的导数在 x < 0 时是多少？",
                "options": [
                    "1",
                    "0",
                    "x",
                    "未定义"
                ],
                "answer": 1,
                "explanation": "ReLU(x) = max(0, x)，所以 x<0 时输出恒为 0，导数为 0；x>0 时导数为 1。"
            },
            {
                "id": "c5q3",
                "type": "tf",
                "question": "Tanh 函数会把输入压缩到 (-1, 1) 区间。",
                "answer": true,
                "explanation": "tanh(x) = (e^x - e^{-x}) / (e^x + e^{-x})，输出范围是 (-1, 1)。"
            },
            {
                "id": "c5q4",
                "type": "mcq",
                "question": "「死神经元」通常与哪个激活函数有关？",
                "options": [
                    "Sigmoid",
                    "Tanh",
                    "ReLU",
                    "Linear"
                ],
                "answer": 2,
                "explanation": "ReLU 在负输入区间梯度为 0，如果神经元一直不被激活，就无法更新权重，形成死神经元。"
            }
        ]
    },
    "chapter6": {
        "title": "第 6 章测验",
        "questions": [
            {
                "id": "c6q1",
                "type": "mcq",
                "question": "MLP 中的 `parameters()` 方法返回什么？",
                "options": [
                    "所有的输入特征",
                    "所有的权重和偏置",
                    "所有的激活函数",
                    "所有的训练样本"
                ],
                "answer": 1,
                "explanation": "parameters() 收集每一层的所有神经元权重 w 和偏置 b，供优化器更新。"
            },
            {
                "id": "c6q2",
                "type": "mcq",
                "question": "SGD（随机梯度下降）更新参数的公式是？",
                "options": [
                    "param = param + learning_rate * grad",
                    "param = param - learning_rate * grad",
                    "param = param * learning_rate",
                    "param = grad / learning_rate"
                ],
                "answer": 1,
                "explanation": "梯度指向损失增长最快的方向，所以沿着负梯度方向更新参数：param = param - lr * grad。"
            },
            {
                "id": "c6q3",
                "type": "tf",
                "question": "在训练之前，通常需要先把所有参数的 grad 清零。",
                "answer": true,
                "explanation": "因为 micrograd 的梯度是累加的，每次反向传播前需要清零，否则会把上一轮梯度也算进来。"
            },
            {
                "id": "c6q4",
                "type": "mcq",
                "question": "二分类问题中，常用什么作为单个样本的损失？",
                "options": [
                    "均方误差 (MSE)",
                    "二元交叉熵 / max-margin 损失",
                    "绝对值误差",
                    "准确率"
                ],
                "answer": 1,
                "explanation": "二分类常用 max-margin（hinge）损失或二元交叉熵。micrograd demo 里用的是简单的 max-margin 损失。"
            }
        ]
    },
    "chapter7": {
        "title": "第 7 章测验",
        "questions": [
            {
                "id": "c7q1",
                "type": "mcq",
                "question": "micrograd 和 PyTorch 的 autograd 在核心思想上有什么相同点？",
                "options": [
                    "都使用标量运算",
                    "都通过动态计算图和反向传播求梯度",
                    "都只能做二分类",
                    "都不需要手动写反向传播"
                ],
                "answer": 1,
                "explanation": "PyTorch 的 autograd 也是构建动态计算图，并通过反向传播自动求梯度，只是它操作的是张量而非标量。"
            },
            {
                "id": "c7q2",
                "type": "tf",
                "question": "micrograd 适合用于生产环境训练大模型。",
                "answer": false,
                "explanation": "micrograd 是教学项目，标量运算效率极低，无法处理大规模模型和生产数据。"
            },
            {
                "id": "c7q3",
                "type": "mcq",
                "question": "调试神经网络时，如果 loss 不下降，最先应该检查什么？",
                "options": [
                    "换更贵的显卡",
                    "检查学习率、梯度是否回传、数据标签",
                    "增加更多层",
                    "减少训练轮数"
                ],
                "answer": 1,
                "explanation": "loss 不下降的常见原因包括学习率不当、梯度未正确传播、数据或标签有问题等，应先做基础排查。"
            }
        ]
    },
    "chapter8": {
        "title": "第 8 章测验",
        "questions": [
            {
                "id": "c8q1",
                "type": "mcq",
                "question": "以下哪个是理解 micrograd 后的最大收获？",
                "options": [
                    "学会了一个更快的深度学习框架",
                    "理解了自动微分和反向传播的底层机制",
                    "学会了如何写 Python 包",
                    "获得了一个预训练模型"
                ],
                "answer": 1,
                "explanation": "micrograd 的核心教育价值在于让人理解自动微分和神经网络训练的本质。"
            },
            {
                "id": "c8q2",
                "type": "mcq",
                "question": "从 micrograd 毕业后，下一步可以学什么？",
                "options": [
                    "继续只用标量训练大模型",
                    "学习 PyTorch/TensorFlow 的张量运算和自动微分",
                    "停止学习深度学习",
                    "只写激活函数"
                ],
                "answer": 1,
                "explanation": "理解了 micrograd 后，再学 PyTorch 的 autograd、nn.Module、optimizer 会水到渠成。"
            },
            {
                "id": "c8q3",
                "type": "tf",
                "question": "神经网络的训练本质上是不断调整参数，使损失函数越来越小。",
                "answer": true,
                "explanation": "训练循环就是前向计算损失、反向求梯度、用优化器更新参数，反复迭代。"
            },
            {
                "id": "c8q4",
                "type": "mcq",
                "question": "以下哪个不是自动微分的应用场景？",
                "options": [
                    "神经网络训练",
                    "物理仿真中的参数优化",
                    "天气预报中的数值积分",
                    "数据库查询优化"
                ],
                "answer": 3,
                "explanation": "自动微分主要用于需要求导的优化场景，数据库查询优化通常不依赖自动微分。"
            }
        ]
    },
    "summary": {
        "title": "总测验",
        "questions": [
            {
                "id": "sq1",
                "type": "mcq",
                "question": "micrograd 的 Value 对象最核心的三个字段是什么？",
                "options": [
                    "name, type, shape",
                    "data, grad, _prev",
                    "input, output, weight",
                    "batch, epoch, loss"
                ],
                "answer": 1,
                "explanation": "data 存储数值，grad 存储梯度，_prev 存储子节点以构建计算图。"
            },
            {
                "id": "sq2",
                "type": "mcq",
                "question": "反向传播的第一步通常做什么？",
                "options": [
                    "随机初始化权重",
                    "把根节点（损失）的 grad 设为 1",
                    "清空所有训练数据",
                    "增加网络层数"
                ],
                "answer": 1,
                "explanation": "根节点 grad=1 表示「损失对自己的导数是 1」，然后沿拓扑反序传播。"
            },
            {
                "id": "sq3",
                "type": "mcq",
                "question": "没有激活函数的多层神经网络等价于什么？",
                "options": [
                    "一个更深的网络",
                    "单层线性变换",
                    "决策树",
                    "支持向量机"
                ],
                "answer": 1,
                "explanation": "多层线性变换的复合仍然是线性变换，所以必须引入非线性激活函数。"
            },
            {
                "id": "sq4",
                "type": "tf",
                "question": "在 SGD 中，学习率越大，参数更新步长越大。",
                "answer": true,
                "explanation": "学习率控制每次沿负梯度方向走的步长，lr 越大步长越大，但过大可能导致震荡。"
            }
        ]
    }
};

const MGQuiz = {
    data: MGQuizData,
    state: {},

    init() {
        this.loadState();
        this.renderAll();
    },

    loadState() {
        try {
            const saved = localStorage.getItem('micrograd_quiz_state');
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
            localStorage.setItem('micrograd_quiz_state', JSON.stringify(this.state));
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
                <button class="btn btn-primary" onclick="MGQuiz.checkAnswer('${chapterId}', ${questionIndex})">提交答案</button>
                ${questionIndex > 0 ? `<button class="btn btn-secondary" onclick="MGQuiz.prevQuestion('${chapterId}')">上一题</button>` : ''}
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
                <button class="btn btn-secondary" onclick="MGQuiz.restart('${chapterId}')">重新测验</button>
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
    document.addEventListener('DOMContentLoaded', () => MGQuiz.init());
} else {
    MGQuiz.init();
}
