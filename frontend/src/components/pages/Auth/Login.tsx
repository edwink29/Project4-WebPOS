import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Store, UserRound } from "lucide-react";
import { authService } from "@/services/AuthServices";
import Button from "@/components/ui/Button";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      const response = await authService.login({
        username: username.trim(),
        password,
      });
      const role = response.user.role.toUpperCase();
      localStorage.setItem("token", response.token);
      localStorage.setItem("user_role", role);
      localStorage.setItem("user_name", response.user.name);
      window.location.href =
        role === "ADMIN" ? "/dashboard" : "/transactions/sales";
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Login gagal. Periksa username dan password Anda.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 p-4 sm:p-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-300/40 sm:p-8">
        <header className="mb-8 text-center">
          <span className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200">
            <Store size={23} />
          </span>
          <p className="mb-2 text-sm font-semibold text-blue-600">
            ROSSYWIN STORE
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Masuk ke akun Anda
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Gunakan username dan password yang terdaftar.
          </p>
        </header>
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Username
            </span>
            <span className="relative block">
              <UserRound
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Masukkan username"
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </span>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Password
            </span>
            <span className="relative block">
              <LockKeyhole
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Masukkan password"
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((shown) => !shown)}
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>
          <Button
            type="submit"
            variant="primary"
            className="mt-2 w-full rounded-xl py-3 text-sm font-bold shadow-lg shadow-blue-200"
            disabled={isLoading}
          >
            {isLoading ? "Memverifikasi akun..." : "Masuk"}
          </Button>
        </form>
        <p className="mt-8 text-center text-xs text-slate-400">
          Akses akan disesuaikan dengan peran akun Anda.
        </p>
      </section>
    </main>
  );
};

export default LoginPage;
