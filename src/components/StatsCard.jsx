function StatsCard({ title, value, color = 'primary', subtitle }) {
  const getBorderColor = (colorName) => {
    switch(colorName) {
      case 'success': return 'var(--success-color)'
      case 'primary': return 'var(--primary-color)'
      case 'warning': return 'var(--warning-color)'
      case 'danger': return 'var(--danger-color)'
      case 'info': return '#0dcaf0'
      default: return 'var(--primary-color)'
    }
  }

  return (
    <div 
      className="stat-card"
      style={{ borderLeft: `8px solid ${getBorderColor(color)}` }}
    >
      <h6 className="text-muted mb-2">{title}</h6>
      <div className={`stat-value text-${color}`}>{value}</div>
      {subtitle && (
        <p className="text-muted small mb-0 mt-2">{subtitle}</p>
      )}
    </div>
  )
}

export default StatsCard
