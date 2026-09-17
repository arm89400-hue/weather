import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../i18n/useTranslation";

export function RegisterPage() {
  const { register } = useAuth();
  const { t } = useTranslation();
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
      setError(err?.response?.data?.error ?? t("register.errorFallback"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <form onSubmit={handleSubmit} className="glass-card w-full max-w-sm rounded-3xl p-8">
        <h1 className="mb-6 text-2xl font-semibold">{t("register.title")}</h1>

        <label className="mb-1 block text-sm opacity-80">{t("register.name")}</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-4 w-full rounded-xl bg-white/10 px-3 py-2 outline-none placeholder:opacity-50"
          placeholder={t("register.namePlaceholder")}
        />

        <label className="mb-1 block text-sm opacity-80">{t("register.email")}</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-xl bg-white/10 px-3 py-2 outline-none placeholder:opacity-50"
          placeholder="you@example.com"
        />

        <label className="mb-1 block text-sm opacity-80">{t("register.password")}</label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-xl bg-white/10 px-3 py-2 outline-none placeholder:opacity-50"
          placeholder={t("register.passwordPlaceholder")}
        />

        {error && <p className="mb-4 text-sm text-red-300">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-sky-400/80 py-2 font-medium text-slate-900 transition hover:bg-sky-400 disabled:opacity-60"
        >
          {submitting ? t("register.submitting") : t("register.submit")}
        </button>

        <p className="mt-4 text-center text-sm opacity-70">
          {t("register.haveAccount")}{" "}
          <Link to="/login" className="underline">
            {t("register.signIn")}
          </Link>
        </p>
      </form>
    </div>
  );
}
