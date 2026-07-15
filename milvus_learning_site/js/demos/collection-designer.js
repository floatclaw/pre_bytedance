/**
 * Collection Designer Demo
 * 通过表单设计 Milvus Collection，实时生成 Schema 和 PyMilvus 代码
 */

(function() {
    'use strict';

    const container = document.getElementById('collection-designer-demo');
    if (!container) return;

    let state = {
        collectionName: 'doc_search',
        fields: [
            { name: 'id', type: 'INT64', isPrimary: true, autoId: true },
            { name: 'content', type: 'VARCHAR', maxLength: 65535 },
            { name: 'category', type: 'VARCHAR', maxLength: 64 },
            { name: 'embedding', type: 'FLOAT_VECTOR', dim: 1536 }
        ],
        metricType: 'COSINE',
        indexType: 'IVF_FLAT'
    };

    function render() {
        container.innerHTML = `
            <div class="demo-controls">
                <div class="demo-control-group">
                    <label>Collection 名称</label>
                    <input type="text" id="cd-name" value="${state.collectionName}">
                </div>
                <div class="demo-control-group">
                    <label>Metric Type</label>
                    <select id="cd-metric">
                        <option value="COSINE" ${state.metricType === 'COSINE' ? 'selected' : ''}>COSINE</option>
                        <option value="L2" ${state.metricType === 'L2' ? 'selected' : ''}>L2</option>
                        <option value="IP" ${state.metricType === 'IP' ? 'selected' : ''}>IP</option>
                    </select>
                </div>
                <div class="demo-control-group">
                    <label>Index Type</label>
                    <select id="cd-index">
                        <option value="IVF_FLAT" ${state.indexType === 'IVF_FLAT' ? 'selected' : ''}>IVF_FLAT</option>
                        <option value="HNSW" ${state.indexType === 'HNSW' ? 'selected' : ''}>HNSW</option>
                        <option value="FLAT" ${state.indexType === 'FLAT' ? 'selected' : ''}>FLAT</option>
                    </select>
                </div>
            </div>

            <h4>字段列表</h4>
            <div id="cd-fields"></div>

            <div style="margin: 16px 0;">
                <button class="btn btn-secondary" id="cd-add-field">+ 添加字段</button>
            </div>

            <div class="two-column-example">
                <div>
                    <h4>JSON Schema</h4>
                    <pre id="cd-json"><code></code></pre>
                </div>
                <div>
                    <h4>PyMilvus 代码</h4>
                    <pre id="cd-python"><code></code></pre>
                </div>
            </div>
        `;

        bindEvents();
        renderFields();
        updateOutput();
    }

    function bindEvents() {
        document.getElementById('cd-name').addEventListener('input', e => {
            state.collectionName = e.target.value;
            updateOutput();
        });

        document.getElementById('cd-metric').addEventListener('change', e => {
            state.metricType = e.target.value;
            updateOutput();
        });

        document.getElementById('cd-index').addEventListener('change', e => {
            state.indexType = e.target.value;
            updateOutput();
        });

        document.getElementById('cd-add-field').addEventListener('click', () => {
            state.fields.push({ name: 'new_field', type: 'VARCHAR', maxLength: 128 });
            renderFields();
            updateOutput();
        });
    }

    function renderFields() {
        const div = document.getElementById('cd-fields');
        div.innerHTML = state.fields.map((f, i) => `
            <div style="display: grid; grid-template-columns: 1.5fr 1fr 1fr auto auto; gap: 8px; margin-bottom: 8px; align-items: center;">
                <input type="text" value="${f.name}" placeholder="字段名" data-idx="${i}" data-key="name" class="cd-field-input">
                <select data-idx="${i}" data-key="type" class="cd-field-type">
                    <option value="INT64" ${f.type === 'INT64' ? 'selected' : ''}>INT64</option>
                    <option value="VARCHAR" ${f.type === 'VARCHAR' ? 'selected' : ''}>VARCHAR</option>
                    <option value="FLOAT_VECTOR" ${f.type === 'FLOAT_VECTOR' ? 'selected' : ''}>FLOAT_VECTOR</option>
                </select>
                ${f.type === 'FLOAT_VECTOR' ? `<input type="number" value="${f.dim || 128}" placeholder="dim" data-idx="${i}" data-key="dim" class="cd-field-input">` : ''}
                ${f.type === 'VARCHAR' ? `<input type="number" value="${f.maxLength || 128}" placeholder="max_length" data-idx="${i}" data-key="maxLength" class="cd-field-input">` : ''}
                ${f.type === 'INT64' ? `<label style="font-size: 0.85rem;"><input type="checkbox" ${f.isPrimary ? 'checked' : ''} data-idx="${i}" data-key="isPrimary" class="cd-field-check"> 主键</label>` : ''}
                <button class="btn btn-secondary" onclick="window.MVCollectionDesigner.removeField(${i})" style="padding: 6px 12px;">删除</button>
            </div>
        `).join('');

        div.querySelectorAll('.cd-field-input').forEach(input => {
            input.addEventListener('change', updateFieldFromDOM);
        });
        div.querySelectorAll('.cd-field-type').forEach(input => {
            input.addEventListener('change', updateFieldFromDOM);
        });
        div.querySelectorAll('.cd-field-check').forEach(input => {
            input.addEventListener('change', updateFieldFromDOM);
        });
    }

    function updateFieldFromDOM(e) {
        const input = e.target;
        const idx = parseInt(input.dataset.idx);
        const key = input.dataset.key;
        let value = input.value;
        if (key === 'dim' || key === 'maxLength') value = parseInt(value) || 0;
        if (key === 'isPrimary') value = input.checked;
        state.fields[idx][key] = value;
        renderFields();
        updateOutput();
    }

    function removeField(index) {
        state.fields.splice(index, 1);
        renderFields();
        updateOutput();
    }

    function buildJSON() {
        const fields = state.fields.map(f => {
            const base = { name: f.name, dtype: f.type };
            if (f.isPrimary) {
                base.is_primary = true;
                base.auto_id = f.autoId || false;
            }
            if (f.type === 'VARCHAR') base.max_length = f.maxLength;
            if (f.type === 'FLOAT_VECTOR') base.dim = f.dim;
            return base;
        });

        return JSON.stringify({
            collection_name: state.collectionName,
            fields: fields,
            metric_type: state.metricType,
            index_type: state.indexType
        }, null, 2);
    }

    function buildPython() {
        const fieldLines = state.fields.map(f => {
            let line = `    FieldSchema(name="${f.name}", dtype=DataType.${f.type}`;
            if (f.isPrimary) line += ', is_primary=True, auto_id=False';
            if (f.type === 'VARCHAR') line += `, max_length=${f.maxLength}`;
            if (f.type === 'FLOAT_VECTOR') line += `, dim=${f.dim}`;
            line += '),';
            return line;
        }).join('\n');

        return `from pymilvus import connections, FieldSchema, CollectionSchema, DataType, Collection

connections.connect("default", host="localhost", port="19530")

fields = [
${fieldLines}
]

schema = CollectionSchema(fields, description="${state.collectionName}")
collection = Collection(name="${state.collectionName}", schema=schema)

# 创建索引
index_params = {
    "metric_type": "${state.metricType}",
    "index_type": "${state.indexType}",
    "params": ${state.indexType === 'HNSW' ? '{"M": 16, "efConstruction": 200}' : '{"nlist": 128}'}
}
collection.create_index(field_name="embedding", index_params=index_params)
collection.load()`;
    }

    function updateOutput() {
        document.getElementById('cd-json').textContent = buildJSON();
        document.getElementById('cd-python').textContent = buildPython();
    }

    window.MVCollectionDesigner = { removeField };

    render();
})();
