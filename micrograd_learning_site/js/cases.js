/**
 * micrograd 真实案例与面试题渲染
 */

const MGCasesData = {
    "cases": [
        {
            "id": "pytorch-understanding",
            "icon": "🔥",
            "title": "理解 PyTorch autograd",
            "scenario": "使用 PyTorch 训练模型时，经常遇到「loss 不下降」「梯度消失/爆炸」「requires_grad 忘记设置」等问题。",
            "why": "学透 micrograd 后，你能清楚知道 PyTorch 的 Tensor、autograd、backward()、zero_grad() 底层在做什么，排查问题更有方向。",
            "question": "思考：PyTorch 中调用 loss.backward() 之前为什么要先 optimizer.zero_grad()？"
        },
        {
            "id": "custom-loss",
            "icon": "📐",
            "title": "自定义损失函数",
            "scenario": "研究或工作中需要设计一个领域特定的损失函数，并且希望它能端到端可微。",
            "why": "理解自动微分后，你知道只要损失函数由可微基本运算组成，就能自动求导；不需要手动推导和实现反向传播。",
            "question": "思考：如果一个操作不可微（如 argmax），通常会用什么技巧替代？"
        },
        {
            "id": "education",
            "icon": "🎓",
            "title": "教学与面试",
            "scenario": "面试中被问到「解释反向传播」「手写一个简单的神经网络」「链式法则怎么应用」。",
            "why": "micrograd 是最小可运行的反向传播实现，能直接对应到面试题中的每一个环节：前向、计算图、局部导数、梯度累加、参数更新。",
            "question": "思考：为什么面试常考「手写反向传播」而不是直接考调用 PyTorch？"
        },
        {
            "id": "research",
            "icon": "🔬",
            "title": "研究新型优化与架构",
            "scenario": "做深度学习研究时，需要尝试新的激活函数、新的连接方式或新的正则化方法。",
            "why": "理解自动微分引擎后，你能判断一个新操作是否可微、如何实现其 backward、如何在现有框架里扩展自定义 autograd Function。",
            "question": "思考：如果新激活函数的导数特别复杂，实现自定义 autograd Function 需要哪两个方法？"
        }
    ],
    "interview": [
        {
            "question": "什么是计算图？动态图和静态图有什么区别？",
            "answer": "计算图是有向无环图，节点是运算/变量，边是数据依赖。动态图在每次前向时重新构建，灵活易调试（PyTorch）；静态图先定义再执行，便于优化和部署（TensorFlow 1.x）。micrograd 使用动态图。"
        },
        {
            "question": "解释链式法则在反向传播中的作用。",
            "answer": "链式法则让我们能把最终损失对某参数的梯度，拆解成「损失对中间变量的梯度 × 中间变量对该参数的局部导数」。反向传播按拓扑反序应用链式法则，把梯度从输出传回输入。"
        },
        {
            "question": "为什么反向传播前要把梯度清零？",
            "answer": "因为自动微分通常使用梯度累加（+=），不清零的话新梯度会叠加旧梯度，导致更新错误。PyTorch 中就是 optimizer.zero_grad() 的作用。"
        },
        {
            "question": "ReLU 的优缺点是什么？",
            "answer": "优点：计算简单、缓解梯度消失、收敛快。缺点：负输入区梯度为 0，可能导致死神经元；输出不是零中心化。"
        },
        {
            "question": "没有激活函数，多层神经网络会变成什么？",
            "answer": "多层线性变换的复合仍然是线性变换，无论多少层都等价于一个线性模型，无法拟合非线性决策边界。"
        },
        {
            "question": "SGD 和梯度下降有什么区别？",
            "answer": "梯度下降每次用全部数据算梯度；SGD（随机梯度下降）每次用一个或一小批样本算梯度，计算更快、噪声有助于逃离局部最优。"
        },
        {
            "question": "学习率太大或太小分别会怎样？",
            "answer": "太大：loss 震荡甚至发散，无法收敛。太小：收敛极慢，容易卡在局部最优或平台区。"
        },
        {
            "question": "micrograd 和 PyTorch 有什么本质区别？",
            "answer": "核心思想相同：动态计算图 + 反向传播。区别是 micrograd 操作标量、代码极简、用于教学；PyTorch 操作张量、高度优化、用于生产。"
        }
    ]
};

const MGCases = {
    data: MGCasesData,

    init() {
        this.renderCases();
        this.renderInterview();
    },

    renderCases() {
        const container = document.getElementById('cases-container');
        if (!container) return;

        let html = '';
        this.data.cases.forEach((caseItem) => {
            html += `
                <div class="case-card">
                    <div class="case-header">
                        <div class="case-icon">${caseItem.icon}</div>
                        <div>
                            <div class="case-title">${caseItem.title}</div>
                        </div>
                    </div>
                    <h4>场景</h4>
                    <p>${caseItem.scenario}</p>
                    <h4>为什么适合用 micrograd 的思路？</h4>
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
    document.addEventListener('DOMContentLoaded', () => MGCases.init());
} else {
    MGCases.init();
}
