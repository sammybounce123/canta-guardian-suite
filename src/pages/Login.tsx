import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff, ShieldCheck, Activity, Globe2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (login(email, password, remember)) {
        navigate("/");
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen w-full flex bg-background text-foreground overflow-hidden">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 relative p-12 border-r border-border overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.15),transparent_55%),radial-gradient(circle_at_80%_90%,hsl(var(--accent)/0.18),transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(hsl(var(--primary))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary))_1px,transparent_1px)] [background-size:48px_48px]" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-primary/15 border border-primary/30 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <span className="font-mono font-bold text-lg tracking-[0.2em] text-primary">CANTA OPS</span>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <h2 className="text-4xl font-semibold leading-tight tracking-tight">
            Operations control plane for cross-border payments.
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Monitor liquidity, approve transactions, manage merchants and stay compliant — all from one secure portal.
          </p>

          <div className="grid grid-cols-1 gap-3 pt-4">
            {[
              { icon: Activity, label: "Real-time transaction monitoring" },
              { icon: Globe2, label: "Multi-currency treasury controls" },
              { icon: ShieldCheck, label: "Role-based access & audit trail" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 text-sm text-foreground/80">
                <div className="h-8 w-8 rounded-md bg-card border border-border flex items-center justify-center">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-muted-foreground font-mono">
          © {new Date().getFullYear()} Canta Ops · Secure Internal Portal
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative">
        <div className="absolute inset-0 lg:hidden bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.12),transparent_60%)]" />

        <div className="w-full max-w-sm relative z-10">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-md bg-primary/15 border border-primary/30 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-primary" />
            </div>
            <span className="font-mono font-bold tracking-[0.2em] text-primary">CANTA OPS</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              Sign in to your operations account to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Work email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@cantaops.com"
                  className="pl-9 h-11 bg-card border-border focus-visible:ring-primary/40"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Password
                </Label>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 pr-9 h-11 bg-card border-border focus-visible:ring-primary/40"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(v) => setRemember(Boolean(v))}
              />
              <Label htmlFor="remember" className="text-sm text-muted-foreground font-normal cursor-pointer">
                Keep me signed in for 7 days
              </Label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 font-medium tracking-wide"
            >
              {loading ? "Signing in…" : "Sign in"}
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-3 text-[11px] uppercase tracking-wider text-muted-foreground font-mono">
                  Secured access
                </span>
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground leading-relaxed">
              Access is restricted to authorized Canta personnel.
              <br />
              All sessions are monitored and logged.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
