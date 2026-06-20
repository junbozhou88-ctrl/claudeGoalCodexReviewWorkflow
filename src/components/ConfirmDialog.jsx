// 删除二次确认弹窗。
export default function ConfirmDialog({ open, title, message, loading, onCancel, onConfirm }) {
  if (!open) return null
  // 删除进行中时，点击遮罩不关闭弹窗。
  const handleMaskClick = () => {
    if (!loading) onCancel()
  }
  return (
    <div className="modal-mask" onClick={handleMaskClick}>
      <div className="modal modal--sm" role="alertdialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">{title}</div>
        <div className="modal__body">{message}</div>
        <div className="modal__footer">
          <button type="button" className="btn" onClick={onCancel} disabled={loading}>
            取消
          </button>
          <button type="button" className="btn btn--danger" onClick={onConfirm} disabled={loading}>
            {loading ? '删除中…' : '确认删除'}
          </button>
        </div>
      </div>
    </div>
  )
}
