import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(email, password, name);
      navigate("/");
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Could not register.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <form onSubmit={handleSubmit} className="glass-card w-full max-w-sm rounded-3xl p-8">
        <h1 className="mb-6 text-2xl font-semibold">Create account</h1>

        <label className="mb-1 block text-sm opacity-80">Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-4 w-full rounded-xl bg-white/10 px-3 py-2 outline-none placeholder:opacity-50"
          placeholder="Jane Doe"
        />

        <label className="mb-1 block text-sm opacity-80">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-xl bg-white/10 px-3 py-2 outline-none placeholder:opacity-50"
          placeholder="you@example.com"
        />

        <label className="mb-1 block text-sm opacity-80">Password</label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-xl bg-white/10 px-3 py-2 outline-none placeholder:opacity-50"
          placeholder="At least 8 characters"
        />

        {error && <p className="mb-4 text-sm text-red-300">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-sky-400/80 py-2 font-medium text-slate-900 transition hover:bg-sky-400 disabled:opacity-60"
        >
          {submitting ? "Creating account..." : "Create account"}
        </button>

        <p className="mt-4 text-center text-sm opacity-70">
          Already have an account?{" "}
          <Link to="/login" className="underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
