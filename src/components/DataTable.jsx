// 数据列表表格，含操作列与空状态 / 加载状态。
export default function DataTable({ records, loading, onEdit, onDelete }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>名称</th>
            <th>类型</th>
            <th>状态</th>
            <th>备注</th>
            <th className="table__ops-head">操作</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td className="table__placeholder" colSpan={5}>
                加载中…
              </td>
            </tr>
          )}

          {!loading && records.length === 0 && (
            <tr>
              <td className="table__placeholder" colSpan={5}>
                <div className="empty">
                  <div className="empty__icon">📭</div>
                  <div>暂无数据，点击右上角“新增”创建第一条记录</div>
                </div>
              </td>
            </tr>
          )}

          {!loading &&
            records.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.type}</td>
                <td>
                  {row.status ? (
                    <span className={`tag ${row.status === '启用' ? 'tag--on' : 'tag--off'}`}>
                      {row.status}
                    </span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td>{row.remark || <span className="text-muted">—</span>}</td>
                <td className="table__ops">
                  <button type="button" className="btn btn--link" onClick={() => onEdit(row)}>
                    编辑
                  </button>
                  <button
                    type="button"
                    className="btn btn--link btn--link-danger"
                    onClick={() => onDelete(row)}
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
