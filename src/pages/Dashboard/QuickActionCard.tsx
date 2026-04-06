interface QuickActionCardProps {
  readonly label: string;
  readonly onClick?: () => void;
}

export default function QuickActionCard({ label, onClick }: QuickActionCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-6 py-5 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-2xl text-blue-500 font-medium text-sm transition-colors text-left w-full"
    >
      <span className="text-lg font-light">+</span>
      {label}
    </button>
  );
}
