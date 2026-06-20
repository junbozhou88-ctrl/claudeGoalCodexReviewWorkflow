import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { api } from './api/mockApi'

beforeEach(() => {
  api._reset()
})

async function waitForList() {
  // 等待初始加载完成（"加载中…" 消失，首行数据出现）
  await screen.findByText('订单同步任务')
}

describe('App CRUD 流程', () => {
  it('渲染初始数据列表', async () => {
    render(<App />)
    await waitForList()
    expect(screen.getByText('订单同步任务')).toBeInTheDocument()
    expect(screen.getByText('库存校验')).toBeInTheDocument()
  })

  it('通过弹窗新增一条记录', async () => {
    const user = userEvent.setup()
    render(<App />)
    await waitForList()

    await user.click(screen.getByRole('button', { name: '+ 新增' }))
    expect(screen.getByText('新增记录')).toBeInTheDocument()

    await user.type(screen.getByPlaceholderText('请输入名称'), '自动化测试记录')
    // 类型为 select
    const dialog = screen.getByText('新增记录').closest('.modal')
    await user.selectOptions(within(dialog).getByDisplayValue('请选择类型'), '高级')
    await user.click(within(dialog).getByRole('button', { name: '确认' }))

    await screen.findByText('新增成功')
    await waitFor(() => expect(screen.getByText('自动化测试记录')).toBeInTheDocument())
  })

  it('校验：必填项为空时不提交', async () => {
    const user = userEvent.setup()
    render(<App />)
    await waitForList()

    await user.click(screen.getByRole('button', { name: '+ 新增' }))
    const dialog = screen.getByText('新增记录').closest('.modal')
    await user.click(within(dialog).getByRole('button', { name: '确认' }))

    expect(screen.getByText('请输入名称')).toBeInTheDocument()
    // "请选择类型" 也是下拉占位项的文案，这里限定到错误提示 span
    expect(screen.getByText('请选择类型', { selector: '.field__error' })).toBeInTheDocument()
    // 弹窗仍然打开
    expect(screen.getByText('新增记录')).toBeInTheDocument()
  })

  it('保存进行中时点击遮罩不会关闭弹窗', async () => {
    const user = userEvent.setup()
    render(<App />)
    await waitForList()

    await user.click(screen.getByRole('button', { name: '+ 新增' }))
    await user.type(screen.getByPlaceholderText('请输入名称'), '进行中记录')
    const dialog = screen.getByText('新增记录').closest('.modal')
    await user.selectOptions(within(dialog).getByDisplayValue('请选择类型'), '基础')
    await user.click(within(dialog).getByRole('button', { name: '确认' }))

    // 此时请求在途，按钮显示“保存中…”，点击遮罩不应关闭弹窗
    expect(screen.getByRole('button', { name: '保存中…' })).toBeInTheDocument()
    await user.click(document.querySelector('.modal-mask'))
    expect(screen.getByText('新增记录')).toBeInTheDocument()

    // 请求完成后正常关闭
    await screen.findByText('新增成功')
    await waitFor(() => expect(screen.queryByText('新增记录')).not.toBeInTheDocument())
  })

  it('通过弹窗编辑已有记录', async () => {
    const user = userEvent.setup()
    render(<App />)
    await waitForList()

    // 找到第一行的“编辑”按钮
    const row = screen.getByText('订单同步任务').closest('tr')
    await user.click(within(row).getByRole('button', { name: '编辑' }))

    expect(screen.getByText('编辑记录')).toBeInTheDocument()
    const nameInput = screen.getByDisplayValue('订单同步任务')
    await user.clear(nameInput)
    await user.type(nameInput, '订单同步任务V2')

    const dialog = screen.getByText('编辑记录').closest('.modal')
    await user.click(within(dialog).getByRole('button', { name: '确认' }))

    await screen.findByText('更新成功')
    await waitFor(() => expect(screen.getByText('订单同步任务V2')).toBeInTheDocument())
    expect(screen.queryByText('订单同步任务')).not.toBeInTheDocument()
  })

  it('删除需二次确认后才移除记录', async () => {
    const user = userEvent.setup()
    render(<App />)
    await waitForList()

    const row = screen.getByText('库存校验').closest('tr')
    await user.click(within(row).getByRole('button', { name: '删除' }))

    // 出现确认弹窗
    const confirm = await screen.findByRole('alertdialog')
    expect(within(confirm).getByText(/确定要删除/)).toBeInTheDocument()

    await user.click(within(confirm).getByRole('button', { name: '确认删除' }))

    await screen.findByText('删除成功')
    await waitFor(() => expect(screen.queryByText('库存校验')).not.toBeInTheDocument())
  })

  it('取消删除不会移除记录', async () => {
    const user = userEvent.setup()
    render(<App />)
    await waitForList()

    const row = screen.getByText('库存校验').closest('tr')
    await user.click(within(row).getByRole('button', { name: '删除' }))

    const confirm = await screen.findByRole('alertdialog')
    await user.click(within(confirm).getByRole('button', { name: '取消' }))

    expect(screen.getByText('库存校验')).toBeInTheDocument()
  })
})
