import { beforeEach, describe, expect, it } from 'vitest'
import { api } from './mockApi'

beforeEach(() => {
  api._reset()
})

describe('mockApi', () => {
  it('返回初始列表', async () => {
    const list = await api.list()
    expect(list).toHaveLength(3)
    expect(list[0]).toHaveProperty('id')
    expect(list[0]).toHaveProperty('name')
  })

  it('新增一条记录并出现在列表中', async () => {
    const created = await api.create({ name: '新任务', type: '基础', status: '启用', remark: 'r' })
    expect(created.id).toBeTruthy()
    const list = await api.list()
    expect(list).toHaveLength(4)
    expect(list.find((r) => r.id === created.id)?.name).toBe('新任务')
  })

  it('新增时缺少必填字段会抛错', async () => {
    await expect(api.create({ name: '', type: '基础' })).rejects.toThrow('名称不能为空')
    await expect(api.create({ name: 'x', type: '' })).rejects.toThrow('类型不能为空')
  })

  it('更新已存在记录', async () => {
    const list = await api.list()
    const target = list[0]
    const updated = await api.update(target.id, { ...target, name: '已改名' })
    expect(updated.name).toBe('已改名')
    const after = await api.list()
    expect(after.find((r) => r.id === target.id)?.name).toBe('已改名')
    expect(after).toHaveLength(3)
  })

  it('更新不存在记录会抛错', async () => {
    await expect(api.update('no-such-id', { name: 'a', type: 'b' })).rejects.toThrow('记录不存在')
  })

  it('删除记录', async () => {
    const list = await api.list()
    await api.remove(list[0].id)
    const after = await api.list()
    expect(after).toHaveLength(2)
    expect(after.find((r) => r.id === list[0].id)).toBeUndefined()
  })

  it('删除不存在记录会抛错', async () => {
    await expect(api.remove('no-such-id')).rejects.toThrow('记录不存在')
  })

  it('list 返回的是副本，外部修改不影响内存', async () => {
    const list = await api.list()
    list[0].name = '脏数据'
    const again = await api.list()
    expect(again[0].name).not.toBe('脏数据')
  })
})
