import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export interface DiffRow {
  field: string;
  approved: string;
  live: string;
}

interface DiffDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  rows: DiffRow[];
}

const DiffDrawer = ({ open, onOpenChange, title, subtitle, rows }: DiffDrawerProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[560px] sm:max-w-[640px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-heading">{title}</SheetTitle>
          {subtitle && <SheetDescription>{subtitle}</SheetDescription>}
        </SheetHeader>
        <div className="mt-6 rounded-xl border overflow-hidden">
          <div className="grid grid-cols-3 bg-muted/60 text-[11px] font-mono uppercase tracking-wider text-muted-foreground px-3 py-2">
            <div>Field</div>
            <div>Approved</div>
            <div>Live</div>
          </div>
          {rows.map((r, i) => {
            const mismatch = r.approved !== r.live;
            return (
              <div
                key={i}
                className={cn(
                  "grid grid-cols-3 px-3 py-2.5 text-xs border-t items-start gap-2",
                  mismatch ? "bg-destructive/5" : "bg-card"
                )}
              >
                <div className="font-medium text-foreground">{r.field}</div>
                <div className="font-mono text-foreground/80 break-words">{r.approved}</div>
                <div className={cn("font-mono break-words", mismatch ? "text-destructive font-semibold" : "text-foreground/80")}>
                  {r.live}
                </div>
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DiffDrawer;
