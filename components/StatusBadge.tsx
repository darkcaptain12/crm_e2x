interface StatusBadgeProps {
  status: string
}

const statusColors: Record<string, string> = {
  Yeni: 'bg-blue-100 text-blue-800',
  Arandı: 'bg-yellow-100 text-yellow-800',
  Teklif: 'bg-purple-100 text-purple-800',
  Kazanıldı: 'bg-green-100 text-green-800',
  Beklemede: 'bg-gray-100 text-gray-800',
  Gönderildi: 'bg-orange-100 text-orange-800',
  'Kabul Edildi': 'bg-green-100 text-green-800',
  'Kabul edildi': 'bg-green-100 text-green-800',
  Reddedildi: 'bg-red-100 text-red-800',
  Ödendi: 'bg-green-100 text-green-800',
  'Ödeme Bekliyor': 'bg-yellow-100 text-yellow-800',
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800'
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  )
}
