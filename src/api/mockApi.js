// 模拟后端的内存数据层。
// 所有方法返回 Promise，并带有人为延迟，用于模拟真实网络请求，
// 方便在没有真实后端的情况下进行开发与测试。

const STATUS_OPTIONS = ['启用', '停用']
const TYPE_OPTIONS = ['基础', '高级', '临时']

let seq = 0
const nextId = () => `${Date.now()}-${++seq}`

// 初始 mock 数据
function seedData() {
  return [
    { id: nextId(), name: '订单同步任务', type: '基础', status: '启用', remark: '每日凌晨执行' },
    { id: nextId(), name: '库存校验', type: '高级', status: '停用', remark: '' },
    { id: nextId(), name: '临时数据导出', type: '临时', status: '启用', remark: '活动期间使用' },
  ]
}

// 内存存储（模块级，单例）
let records = seedData()

// 模拟网络延迟
const delay = (ms = 280) => new Promise((resolve) => setTimeout(resolve, ms))

// 字段校验：name、type 必填。返回错误信息字符串或 null。
function validate(payload) {
  if (!payload || typeof payload !== 'object') return '数据格式不正确'
  if (!payload.name || !payload.name.trim()) return '名称不能为空'
  if (!payload.type || !payload.type.trim()) return '类型不能为空'
  return null
}

function normalize(payload) {
  return {
    name: (payload.name || '').trim(),
    type: (payload.type || '').trim(),
    status: (payload.status || '').trim(),
    remark: (payload.remark || '').trim(),
  }
}

export const api = {
  // 查询列表
  async list() {
    await delay()
    // 返回副本，避免外部直接修改内存数据
    return records.map((r) => ({ ...r }))
  },

  // 新增
  async create(payload) {
    await delay()
    const error = validate(payload)
    if (error) throw new Error(error)
    const record = { id: nextId(), ...normalize(payload) }
    records = [record, ...records]
    return { ...record }
  },

  // 更新
  async update(id, payload) {
    await delay()
    const error = validate(payload)
    if (error) throw new Error(error)
    const index = records.findIndex((r) => r.id === id)
    if (index === -1) throw new Error('记录不存在，可能已被删除')
    const updated = { ...records[index], ...normalize(payload) }
    records = records.map((r) => (r.id === id ? updated : r))
    return { ...updated }
  },

  // 删除
  async remove(id) {
    await delay()
    const exists = records.some((r) => r.id === id)
    if (!exists) throw new Error('记录不存在，可能已被删除')
    records = records.filter((r) => r.id !== id)
    return { id }
  },

  // 仅供测试使用：重置内存数据到初始状态
  _reset() {
    seq = 0
    records = seedData()
  },
}

export { STATUS_OPTIONS, TYPE_OPTIONS }
