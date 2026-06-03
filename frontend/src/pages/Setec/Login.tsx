import { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import LanguageToggle from "../../components/common/LanguageToggle";

export default function SetecLogin() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole]           = useState<"staff" | "student">("staff");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword]   = useState("");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(identifier, password, role);
      navigate("/setec");
    } catch {
      setError(t("auth.invalidCreds"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("app.title")}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t("app.subtitle")}</p>
        </div>

        {/* Role Toggle */}
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 p-1 mb-6">
          <button
            type="button"
            onClick={() => setRole("staff")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
              role === "staff"
                ? "bg-brand-500 text-white"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            {t("auth.loginAsStaff")}
          </button>
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
              role === "student"
                ? "bg-brand-500 text-white"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            {t("auth.loginAsStudent")}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {role === "staff" ? t("auth.identifier") : t("auth.identifierStudent")}
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:text-white focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:bg-gray-900"
              placeholder={role === "staff" ? "admin" : "S001"}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("auth.password")}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:text-white focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:bg-gray-900"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-500/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60 transition"
          >
            {loading ? t("messages.loading") : t("auth.loginBtn")}
          </button>
        </form>
      </div>
    </div>
  );
}
