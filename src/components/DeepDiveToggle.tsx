import { ArrowLeft, BarChart3 } from "lucide-react";

interface DeepDiveToggleProps {
  isDeepDive: boolean;
  onToggle: () => void;
}

const DeepDiveToggle = ({ isDeepDive, onToggle }: DeepDiveToggleProps) => (
  <button
    onClick={onToggle}
    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium transition-all hover:shadow-card hover:border-primary/30"
  >
    {isDeepDive ? (
      <>
        <ArrowLeft className="h-4 w-4 text-primary" />
        <span className="text-foreground">Back to Actions</span>
      </>
    ) : (
      <>
        <BarChart3 className="h-4 w-4 text-primary" />
        <span className="text-foreground">Deep Dive Analysis</span>
      </>
    )}
  </button>
);

export default DeepDiveToggle;
