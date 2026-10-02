type Status = 'PAGATO' | 'CONTANTI DA INCASSARE' | 'CONTANTI RICEVUTI' | 'ANNULLATO';

export default function StatusBadge({ status }: { status: Status }) {
  const config = {
    'PAGATO': { bg: 'bg-green-100', text: 'text-green-800', icon: '💳' },
    'CONTANTI DA INCASSARE': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '💵' },
    'CONTANTI RICEVUTI': { bg: 'bg-blue-100', text: 'text-blue-800', icon: '✅' },
    'ANNULLATO': { bg: 'bg-red-100', text: 'text-red-800', icon: '❌' },
  };

  const current = config[status] || config['ANNULLATO'];

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${current.bg} ${current.text}`}>
      <span className="mr-1">{current.icon}</span>
      {status}
    </span>
  );
}
