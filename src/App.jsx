import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from './api/mockApi'
import DataTable from './components/DataTable'
import FormModal from './components/FormModal'
import ConfirmDialog from './components/ConfirmDialog'
import Toast from './components/Toast'

export default function App() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  // 表单弹窗状态
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState('create')
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // 删除确认状态
  const [deleting, setDeleting] = useState(null)
  const [removing, setRemoving] = useState(false)

  // 轻提示
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  const showToast = useCallback((type, message) => {
    setToast({ type, message })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2600)
  }, [])

  // 拉取列表
  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.list()
      setRecords(data)
    } catch (err) {
      showToast('error', `加载失败：${err.message}`)
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchList()
    return () => clearTimeout(toastTimer.current)
  }, [fetchList])

  // 打开新增
  const openCreate = () => {
    setFormMode('create')
    setEditing(null)
    setFormOpen(true)
  }

  // 打开编辑
  const openEdit = (row) => {
    setFormMode('edit')
    setEditing(row)
    setFormOpen(true)
  }

  // 提交新增 / 编辑
  const handleSubmit = async (payload) => {
    const isEdit = formMode === 'edit' && editing
    setSubmitting(true)
    try {
      if (isEdit) {
        await api.update(editing.id, payload)
      } else {
        await api.create(payload)
      }
    } catch (err) {
      showToast('error', `保存失败：${err.message}`)
      setSubmitting(false)
      return
    }
    // 保存成功：先结束提交态并关闭弹窗，后续列表刷新的延迟不应阻塞下一次操作
    setSubmitting(false)
    setFormOpen(false)
    showToast('success', isEdit ? '更新成功' : '新增成功')
    await fetchList()
  }

  // 确认删除
  const handleDelete = async () => {
    if (!deleting) return
    setRemoving(true)
    try {
      await api.remove(deleting.id)
    } catch (err) {
      showToast('error', `删除失败：${err.message}`)
      setRemoving(false)
      return
    }
    // 删除成功：先结束删除态并关闭确认弹窗，后续列表刷新的延迟不应阻塞下一次操作
    setRemoving(false)
    setDeleting(null)
    showToast('success', '删除成功')
    await fetchList()
  }

  return (
    <div className="app">
      <header className="page-header">
        <div>
          <h1 className="page-title">Table 增删改查</h1>
          <p className="page-desc">查看、新增、编辑与删除数据记录</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={openCreate}>
          + 新增
        </button>
      </header>

      <main className="card">
        <DataTable records={records} loading={loading} onEdit={openEdit} onDelete={setDeleting} />
      </main>

      <FormModal
        open={formOpen}
        mode={formMode}
        record={editing}
        loading={submitting}
        onCancel={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deleting}
        title="删除确认"
        message={deleting ? `确定要删除“${deleting.name}”吗？该操作不可撤销。` : ''}
        loading={removing}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />

      <Toast toast={toast} />
    </div>
  )
}
