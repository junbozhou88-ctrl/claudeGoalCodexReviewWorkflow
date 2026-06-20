import { useEffect, useState } from 'react'
import { STATUS_OPTIONS, TYPE_OPTIONS } from '../api/mockApi'

const EMPTY = { name: '', type: '', status: '', remark: '' }

// 新增 / 编辑共用的表单弹窗。
// mode: 'create' | 'edit'；record: 编辑时回填的数据。
export default function FormModal({ open, mode, record, loading, onCancel, onSubmit }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})

  // 打开弹窗时初始化表单：编辑回填，新增清空。
  useEffect(() => {
    if (open) {
      setForm(record ? { ...EMPTY, ...record } : EMPTY)
      setErrors({})
    }
  }, [open, record])

  if (!open) return null

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = '请输入名称'
    if (!form.type.trim()) next.type = '请选择类型'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      name: form.name.trim(),
      type: form.type.trim(),
      status: form.status.trim(),
      remark: form.remark.trim(),
    })
  }

  // 保存进行中时，点击遮罩不关闭弹窗，避免丢失已填写内容。
  const handleMaskClick = () => {
    if (!loading) onCancel()
  }

  return (
    <div className="modal-mask" onClick={handleMaskClick}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="modal__header">{mode === 'edit' ? '编辑记录' : '新增记录'}</div>
        <div className="modal__body">
          <label className="field">
            <span className="field__label">
              名称<em>*</em>
            </span>
            <input
              className={`input ${errors.name ? 'input--error' : ''}`}
              value={form.name}
              placeholder="请输入名称"
              onChange={(e) => setField('name', e.target.value)}
            />
            {errors.name && <span className="field__error">{errors.name}</span>}
          </label>

          <label className="field">
            <span className="field__label">
              类型<em>*</em>
            </span>
            <select
              className={`input ${errors.type ? 'input--error' : ''}`}
              value={form.type}
              onChange={(e) => setField('type', e.target.value)}
            >
              <option value="">请选择类型</option>
              {TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {errors.type && <span className="field__error">{errors.type}</span>}
          </label>

          <label className="field">
            <span className="field__label">状态</span>
            <select
              className="input"
              value={form.status}
              onChange={(e) => setField('status', e.target.value)}
            >
              <option value="">未设置</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field__label">备注</span>
            <textarea
              className="input input--textarea"
              value={form.remark}
              placeholder="选填"
              rows={3}
              onChange={(e) => setField('remark', e.target.value)}
            />
          </label>
        </div>
        <div className="modal__footer">
          <button type="button" className="btn" onClick={onCancel} disabled={loading}>
            取消
          </button>
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? '保存中…' : '确认'}
          </button>
        </div>
      </form>
    </div>
  )
}
