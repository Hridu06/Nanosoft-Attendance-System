import { Hourglass } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description: string;
}

const ComingSoon = ({ title, description }: ComingSoonProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-24 text-center">
        <div className="rounded-full bg-slate-50 p-3 text-slate-400">
          <Hourglass size={24} />
        </div>

        <p className="mt-4 text-sm font-medium text-slate-600">
          This module is under development
        </p>
        <p className="mt-1 text-xs text-slate-400">Coming soon</p>
      </div>
    </div>
  );
};

export default ComingSoon;
