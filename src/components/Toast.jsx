// 全局轻提示，用于展示操作成功 / 失败信息。
export default function Toast({ toast }) {
  if (!toast) return null
  return (
    <div className={`toast toast--${toast.type}`} role="status">
      {toast.message}
    </div>
  )
}
