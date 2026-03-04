import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Edit2, RefreshCw, ArrowRightLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface RateRow {
  pair: string;
  buy: string;
  sell: string;
  mid: string;
  source: string;
  updatedBy: string;
  updatedAt: string;
}

const initialRates: RateRow[] = [
  { pair: "USD/NGN", buy: "1,580.00", sell: "1,595.00", mid: "1,587.50", source: "Manual", updatedBy: "Treasury Ops", updatedAt: "5 min ago" },
  { pair: "USD/GHS", buy: "14.85", sell: "15.10", mid: "14.97", source: "Provider", updatedBy: "System", updatedAt: "1 min ago" },
  { pair: "USD/KES", buy: "128.50", sell: "130.20", mid: "129.35", source: "Manual", updatedBy: "Treasury Ops", updatedAt: "12 min ago" },
  { pair: "GBP/NGN", buy: "2,010.00", sell: "2,035.00", mid: "2,022.50", source: "Provider", updatedBy: "System", updatedAt: "1 min ago" },
  { pair: "EUR/NGN", buy: "1,720.00", sell: "1,745.00", mid: "1,732.50", source: "Manual", updatedBy: "Treasury Ops", updatedAt: "30 min ago" },
];

const formatNum = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const parseNum = (s: string) => parseFloat(s.replace(/,/g, "")) || 0;

export default function Rates() {
  const { hasPermission, user } = useAuth();
  const canEdit = hasPermission("rates", "update");

  const [rates, setRates] = useState<RateRow[]>(initialRates);
  const [editingRate, setEditingRate] = useState<RateRow | null>(null);
  const [editForm, setEditForm] = useState({ buy: "", sell: "", source: "Manual" });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewAmount, setPreviewAmount] = useState("1000");

  const openEdit = (rate: RateRow) => {
    setEditingRate(rate);
    setEditForm({
      buy: rate.buy.replace(/,/g, ""),
      sell: rate.sell.replace(/,/g, ""),
      source: rate.source,
    });
  };

  const computeMid = () => {
    const b = parseFloat(editForm.buy) || 0;
    const s = parseFloat(editForm.sell) || 0;
    return b && s ? formatNum((b + s) / 2) : "—";
  };

  const spread = () => {
    const b = parseFloat(editForm.buy) || 0;
    const s = parseFloat(editForm.sell) || 0;
    if (!b || !s) return "—";
    return ((((s - b) / b) * 100).toFixed(3)) + "%";
  };

  const saveRate = () => {
    if (!editingRate) return;
    const b = parseFloat(editForm.buy);
    const s = parseFloat(editForm.sell);
    if (!b || !s || s < b) {
      toast.error("Sell rate must be greater than or equal to buy rate");
      return;
    }
    setRates(prev =>
      prev.map(r =>
        r.pair === editingRate.pair
          ? {
              ...r,
              buy: formatNum(b),
              sell: formatNum(s),
              mid: formatNum((b + s) / 2),
              source: editForm.source,
              updatedBy: user?.name || "Unknown",
              updatedAt: "Just now",
            }
          : r
      )
    );
    toast.success(`${editingRate.pair} rate updated successfully`);
    setEditingRate(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Rates & Treasury</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage exchange rates and spreads</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh Rates
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Active Pairs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{rates.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Manual Overrides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{rates.filter(r => r.source === "Manual").length}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Provider Feeds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{rates.filter(r => r.source === "Provider").length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Currency Pairs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="data-table-header text-left py-3 px-2">Pair</th>
                  <th className="data-table-header text-right py-3 px-2">Buy Rate</th>
                  <th className="data-table-header text-right py-3 px-2">Sell Rate</th>
                  <th className="data-table-header text-right py-3 px-2">Mid Rate</th>
                  <th className="data-table-header text-center py-3 px-2">Source</th>
                  <th className="data-table-header text-left py-3 px-2">Updated By</th>
                  <th className="data-table-header text-right py-3 px-2">Updated</th>
                  <th className="data-table-header text-right py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rates.map((r) => (
                  <tr key={r.pair} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-2 font-mono text-sm font-medium text-primary">{r.pair}</td>
                    <td className="py-3 px-2 font-mono text-sm text-right">{r.buy}</td>
                    <td className="py-3 px-2 font-mono text-sm text-right">{r.sell}</td>
                    <td className="py-3 px-2 font-mono text-sm text-right text-muted-foreground">{r.mid}</td>
                    <td className="py-3 px-2 text-center">
                      <Badge variant={r.source === "Manual" ? "default" : "secondary"} className="text-xs">
                        {r.source}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-sm text-muted-foreground">{r.updatedBy}</td>
                    <td className="py-3 px-2 text-sm text-muted-foreground text-right">{r.updatedAt}</td>
                    <td className="py-3 px-2 text-right">
                      {canEdit && (
                        <button
                          onClick={() => openEdit(r)}
                          className="p-1.5 rounded-md hover:bg-muted transition-colors"
                        >
                          <Edit2 className="h-4 w-4 text-muted-foreground" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Rate Dialog */}
      <Dialog open={!!editingRate} onOpenChange={(open) => !open && setEditingRate(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-mono">
              <ArrowRightLeft className="h-5 w-5 text-primary" />
              Edit {editingRate?.pair}
            </DialogTitle>
            <DialogDescription>
              Update buy/sell rates. Mid rate is calculated automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="buy-rate">Buy Rate</Label>
                <Input
                  id="buy-rate"
                  type="number"
                  step="0.01"
                  value={editForm.buy}
                  onChange={(e) => setEditForm(f => ({ ...f, buy: e.target.value }))}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sell-rate">Sell Rate</Label>
                <Input
                  id="sell-rate"
                  type="number"
                  step="0.01"
                  value={editForm.sell}
                  onChange={(e) => setEditForm(f => ({ ...f, sell: e.target.value }))}
                  className="font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Source</Label>
              <Select value={editForm.source} onValueChange={(v) => setEditForm(f => ({ ...f, source: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manual">Manual</SelectItem>
                  <SelectItem value="Provider">Provider</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Live preview */}
            <Card className="bg-muted/50 border-border">
              <CardContent className="pt-4 pb-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mid Rate</span>
                  <span className="font-mono font-medium">{computeMid()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Spread</span>
                  <span className="font-mono font-medium">{spread()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Preview Impact */}
            <div className="space-y-2">
              <button
                onClick={() => setPreviewOpen(!previewOpen)}
                className="text-xs text-primary hover:underline"
              >
                {previewOpen ? "Hide" : "Preview"} conversion impact
              </button>
              {previewOpen && (
                <Card className="bg-muted/30 border-border">
                  <CardContent className="pt-3 pb-3 space-y-3">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={previewAmount}
                        onChange={(e) => setPreviewAmount(e.target.value)}
                        className="font-mono w-32 h-8 text-sm"
                        placeholder="Amount"
                      />
                      <span className="text-xs text-muted-foreground">{editingRate?.pair.split("/")[0]}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Customer buys at</p>
                        <p className="font-mono font-medium">
                          {formatNum(parseFloat(previewAmount || "0") * (parseFloat(editForm.sell) || 0))}
                          <span className="text-xs text-muted-foreground ml-1">{editingRate?.pair.split("/")[1]}</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Customer sells at</p>
                        <p className="font-mono font-medium">
                          {formatNum(parseFloat(previewAmount || "0") * (parseFloat(editForm.buy) || 0))}
                          <span className="text-xs text-muted-foreground ml-1">{editingRate?.pair.split("/")[1]}</span>
                        </p>
                      </div>
                    </div>
                    {editingRate && (
                      <div className="pt-1 border-t border-border text-xs text-muted-foreground">
                        Previous: Buy {editingRate.buy} / Sell {editingRate.sell}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditingRate(null)}>Cancel</Button>
            <Button onClick={saveRate}>Save Rate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
