import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { mockExpenses } from "@/data/mockExpenses";
import {
  type Expense, type ExpenseStatus, type ExpenseCategory, type PaymentMethod,
  EXPENSE_CATEGORIES, PAYMENT_METHODS, STATUS_CONFIG,
} from "@/types/expenses";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Search, Download, Eye, Pencil, Trash2, CheckCircle2, XCircle,
  DollarSign, TrendingUp, Calendar, Receipt,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const PIE_COLORS = [
  "hsl(173, 80%, 50%)", "hsl(38, 92%, 50%)", "hsl(142, 70%, 45%)",
  "hsl(0, 72%, 55%)", "hsl(222, 30%, 50%)", "hsl(280, 60%, 55%)",
  "hsl(200, 70%, 50%)", "hsl(60, 70%, 50%)", "hsl(320, 60%, 50%)",
];

export default function Expenses() {
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const canCreate = hasPermission("expenses", "create");
  const canEdit = hasPermission("expenses", "update");
  const canDelete = hasPermission("expenses", "delete");
  const canApprove = hasPermission("expenses", "approve");
  const canExport = hasPermission("expenses", "export");

  // Treasury: only sees provider-related expenses
  const isTreasury = user?.role === "treasury";
  const providerCategories: ExpenseCategory[] = ["liquidity_provider_fees", "fx_provider_costs", "bank_charges"];

  const filtered = useMemo(() => {
    let list = expenses;
    if (isTreasury) list = list.filter(e => providerCategories.includes(e.category));
    if (statusFilter !== "all") list = list.filter(e => e.status === statusFilter);
    if (categoryFilter !== "all") list = list.filter(e => e.category === categoryFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        e.vendor.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q)
      );
    }
    return list;
  }, [expenses, search, statusFilter, categoryFilter, isTreasury]);

  // Dashboard stats
  const today = new Date().toISOString().slice(0, 10);
  const thisMonth = new Date().toISOString().slice(0, 7);
  const totalToday = expenses.filter(e => e.expenseDate === today).reduce((s, e) => s + e.amount, 0);
  const totalMonth = expenses.filter(e => e.expenseDate.startsWith(thisMonth)).reduce((s, e) => s + e.amount, 0);
  const pendingCount = expenses.filter(e => e.status === "pending_approval").length;
  const approvedMonth = expenses.filter(e => e.status === "approved" && e.expenseDate.startsWith(thisMonth)).reduce((s, e) => s + e.amount, 0);

  // Chart data
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(e => {
      const label = EXPENSE_CATEGORIES.find(c => c.value === e.category)?.label ?? e.category;
      map[label] = (map[label] || 0) + e.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const monthlyData = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(e => {
      const m = e.expenseDate.slice(0, 7);
      map[m] = (map[m] || 0) + e.amount;
    });
    return Object.entries(map).sort().map(([month, total]) => ({ month, total }));
  }, [expenses]);

  // --- Create form state ---
  const [form, setForm] = useState({
    category: "miscellaneous" as ExpenseCategory,
    amount: "",
    currency: "USD",
    expenseDate: new Date().toISOString().slice(0, 10),
    vendor: "",
    paymentMethod: "bank_transfer" as PaymentMethod,
    description: "",
  });

  const resetForm = () => setForm({
    category: "miscellaneous", amount: "", currency: "USD",
    expenseDate: new Date().toISOString().slice(0, 10), vendor: "",
    paymentMethod: "bank_transfer", description: "",
  });

  const handleCreate = () => {
    if (!form.vendor || !form.amount) {
      toast({ title: "Validation Error", description: "Vendor and amount are required.", variant: "destructive" });
      return;
    }
    const newExp: Expense = {
      id: `exp_${String(expenses.length + 1).padStart(3, "0")}`,
      category: form.category,
      amount: parseFloat(form.amount),
      currency: form.currency,
      expenseDate: form.expenseDate,
      vendor: form.vendor,
      paymentMethod: form.paymentMethod,
      description: form.description,
      status: "draft",
      createdBy: user?.name ?? "Unknown",
      createdById: user?.id ?? "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setExpenses(prev => [newExp, ...prev]);
    setShowCreate(false);
    resetForm();
    toast({ title: "Expense Created", description: `${newExp.id} saved as draft.` });
  };

  const submitForApproval = (exp: Expense) => {
    setExpenses(prev => prev.map(e => e.id === exp.id ? { ...e, status: "pending_approval" as ExpenseStatus, updatedAt: new Date().toISOString() } : e));
    toast({ title: "Submitted", description: `${exp.id} submitted for approval.` });
  };

  const approveExpense = (exp: Expense) => {
    setExpenses(prev => prev.map(e => e.id === exp.id ? {
      ...e, status: "approved" as ExpenseStatus,
      approvedBy: user?.name, approvedById: user?.id,
      updatedAt: new Date().toISOString(),
    } : e));
    toast({ title: "Approved", description: `${exp.id} approved.` });
  };

  const rejectExpense = (exp: Expense) => {
    setExpenses(prev => prev.map(e => e.id === exp.id ? { ...e, status: "rejected" as ExpenseStatus, updatedAt: new Date().toISOString() } : e));
    toast({ title: "Rejected", description: `${exp.id} rejected.` });
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    toast({ title: "Deleted", description: `${id} removed.` });
  };

  const handleExport = () => {
    const csv = ["ID,Category,Amount,Currency,Vendor,Date,Status,Description"]
      .concat(filtered.map(e => `${e.id},${e.category},${e.amount},${e.currency},${e.vendor},${e.expenseDate},${e.status},"${e.description}"`))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "expenses.csv"; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: "Expenses downloaded as CSV." });
  };

  const catLabel = (c: ExpenseCategory) => EXPENSE_CATEGORIES.find(x => x.value === c)?.label ?? c;
  const pmLabel = (p: PaymentMethod) => PAYMENT_METHODS.find(x => x.value === p)?.label ?? p;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Expenses</h1>
          <p className="text-sm text-muted-foreground">Manage company expenses, receipts, and reports</p>
        </div>
        <div className="flex gap-2">
          {canExport && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" /> Export
            </Button>
          )}
          {canCreate && (
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-1" /> New Expense
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Expense List</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* === LIST TAB === */}
        <TabsContent value="list" className="space-y-4">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search vendor, description, ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending_approval">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {EXPENSE_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No expenses found.</TableCell></TableRow>
                  ) : filtered.map(exp => (
                    <TableRow key={exp.id}>
                      <TableCell className="font-mono text-xs">{exp.id}</TableCell>
                      <TableCell className="text-sm">{exp.expenseDate}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{catLabel(exp.category)}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{exp.vendor}</TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {exp.currency} {exp.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_CONFIG[exp.status].className}`}>
                          {STATUS_CONFIG[exp.status].label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setSelectedExpense(exp); setShowDetail(true); }}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          {canEdit && exp.status !== "approved" && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingExpense(exp); }}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {canApprove && exp.status === "pending_approval" && (
                            <>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-success" onClick={() => approveExpense(exp)}>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => rejectExpense(exp)}>
                                <XCircle className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                          {canCreate && exp.status === "draft" && (
                            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => submitForApproval(exp)}>Submit</Button>
                          )}
                          {canDelete && exp.status !== "approved" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                                  <AlertDialogDescription>This will permanently remove {exp.id}. This action cannot be undone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteExpense(exp.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === DASHBOARD TAB === */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card><CardHeader className="pb-2"><CardDescription>Today</CardDescription><CardTitle className="text-xl font-mono">${totalToday.toLocaleString()}</CardTitle></CardHeader><CardContent><DollarSign className="h-4 w-4 text-muted-foreground" /></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardDescription>This Month</CardDescription><CardTitle className="text-xl font-mono">${totalMonth.toLocaleString()}</CardTitle></CardHeader><CardContent><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardDescription>Pending Approval</CardDescription><CardTitle className="text-xl font-mono">{pendingCount}</CardTitle></CardHeader><CardContent><Calendar className="h-4 w-4 text-warning" /></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardDescription>Approved (Month)</CardDescription><CardTitle className="text-xl font-mono">${approvedMonth.toLocaleString()}</CardTitle></CardHeader><CardContent><Receipt className="h-4 w-4 text-success" /></CardContent></Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Monthly Trend</CardTitle></CardHeader>
              <CardContent className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" />
                    <XAxis dataKey="month" tick={{ fill: "hsl(215, 15%, 50%)", fontSize: 12 }} />
                    <YAxis tick={{ fill: "hsl(215, 15%, 50%)", fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: "hsl(222, 44%, 8%)", border: "1px solid hsl(222, 30%, 16%)", color: "hsl(210, 20%, 90%)" }} />
                    <Bar dataKey="total" fill="hsl(173, 80%, 50%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">By Category</CardTitle></CardHeader>
              <CardContent className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name.slice(0, 12)} ${(percent * 100).toFixed(0)}%`}>
                      {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(222, 44%, 8%)", border: "1px solid hsl(222, 30%, 16%)", color: "hsl(210, 20%, 90%)" }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* === REPORTS TAB === */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Expense Reports</CardTitle>
              <CardDescription>Filter and export expense data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div><Label className="text-xs text-muted-foreground">Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {EXPENSE_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs text-muted-foreground">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending_approval">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  {canExport && <Button onClick={handleExport} className="w-full"><Download className="h-4 w-4 mr-1" /> Export CSV</Button>}
                </div>
              </div>
              <div className="rounded-md border border-border p-4">
                <p className="text-sm text-muted-foreground">Showing <span className="text-foreground font-medium">{filtered.length}</span> expenses totaling <span className="text-foreground font-mono font-medium">${filtered.reduce((s, e) => s + e.amount, 0).toLocaleString()}</span></p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* === CREATE DIALOG === */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Expense</DialogTitle>
            <DialogDescription>Add a new company expense record.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2 md:grid-cols-2">
              <div><Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as ExpenseCategory }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{EXPENSE_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Payment Method</Label>
                <Select value={form.paymentMethod} onValueChange={v => setForm(f => ({ ...f, paymentMethod: v as PaymentMethod }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PAYMENT_METHODS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2 md:grid-cols-3">
              <div><Label>Amount</Label><Input type="number" placeholder="0.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} /></div>
              <div><Label>Currency</Label><Input value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} /></div>
              <div><Label>Date</Label><Input type="date" value={form.expenseDate} onChange={e => setForm(f => ({ ...f, expenseDate: e.target.value }))} /></div>
            </div>
            <div><Label>Vendor / Provider</Label><Input placeholder="e.g. AWS, Circle, WeWork" value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))} /></div>
            <div><Label>Description</Label><Textarea placeholder="Expense details..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreate(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleCreate}>Save as Draft</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* === DETAIL DIALOG === */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Expense Detail</DialogTitle>
            <DialogDescription>{selectedExpense?.id}</DialogDescription>
          </DialogHeader>
          {selectedExpense && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[selectedExpense.status].className}`}>{STATUS_CONFIG[selectedExpense.status].label}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Category</span><span>{catLabel(selectedExpense.category)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-mono">{selectedExpense.currency} {selectedExpense.amount.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Vendor</span><span>{selectedExpense.vendor}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{selectedExpense.expenseDate}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Payment</span><span>{pmLabel(selectedExpense.paymentMethod)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Created By</span><span>{selectedExpense.createdBy}</span></div>
              {selectedExpense.approvedBy && <div className="flex justify-between"><span className="text-muted-foreground">Approved By</span><span>{selectedExpense.approvedBy}</span></div>}
              {selectedExpense.description && <div><span className="text-muted-foreground block mb-1">Description</span><p className="text-foreground">{selectedExpense.description}</p></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* === EDIT DIALOG === */}
      <Dialog open={!!editingExpense} onOpenChange={open => { if (!open) setEditingExpense(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>{editingExpense?.id}</DialogDescription>
          </DialogHeader>
          {editingExpense && (
            <div className="grid gap-4">
              <div className="grid gap-2 md:grid-cols-2">
                <div><Label>Category</Label>
                  <Select value={editingExpense.category} onValueChange={v => setEditingExpense(e => e ? { ...e, category: v as ExpenseCategory } : null)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{EXPENSE_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Payment Method</Label>
                  <Select value={editingExpense.paymentMethod} onValueChange={v => setEditingExpense(e => e ? { ...e, paymentMethod: v as PaymentMethod } : null)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{PAYMENT_METHODS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2 md:grid-cols-3">
                <div><Label>Amount</Label><Input type="number" value={editingExpense.amount} onChange={e => setEditingExpense(ex => ex ? { ...ex, amount: parseFloat(e.target.value) || 0 } : null)} /></div>
                <div><Label>Currency</Label><Input value={editingExpense.currency} onChange={e => setEditingExpense(ex => ex ? { ...ex, currency: e.target.value } : null)} /></div>
                <div><Label>Date</Label><Input type="date" value={editingExpense.expenseDate} onChange={e => setEditingExpense(ex => ex ? { ...ex, expenseDate: e.target.value } : null)} /></div>
              </div>
              <div><Label>Vendor</Label><Input value={editingExpense.vendor} onChange={e => setEditingExpense(ex => ex ? { ...ex, vendor: e.target.value } : null)} /></div>
              <div><Label>Description</Label><Textarea value={editingExpense.description} onChange={e => setEditingExpense(ex => ex ? { ...ex, description: e.target.value } : null)} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingExpense(null)}>Cancel</Button>
            <Button onClick={() => {
              if (!editingExpense) return;
              setExpenses(prev => prev.map(e => e.id === editingExpense.id ? { ...editingExpense, updatedAt: new Date().toISOString() } : e));
              toast({ title: "Updated", description: `${editingExpense.id} saved.` });
              setEditingExpense(null);
            }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
