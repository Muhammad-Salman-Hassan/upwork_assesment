interface NavCardProps {
  readonly label: string;
  readonly icon: React.ReactNode;
  readonly onClick?: () => void;
}

export default function NavCard({ label, icon, onClick }: NavCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 px-6 py-5 bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 font-semibold text-sm transition-colors text-left w-full"
    >
      <span className="text-blue-400">{icon}</span>
      {label}
    </button>
  );
}
