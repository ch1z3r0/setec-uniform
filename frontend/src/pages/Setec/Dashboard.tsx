import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getBorrowStats, getBorrows } from "../../services/api";

interface Stats {
  total_students: number;
  total_borrowed: number;
  total_returned: number;
  total_active: number;
  total_overdue: number;
  total_available: number;
}

interface Borrow {
  id: number;
  student_name_en: string;
  student_name_kh: string;
  student_code: string;
  item_name: string;
  staff_name: string;
  status: string;
  borrowed_date: string;
}

const StatusBadge = ({ status }: { status: string }) => {
  const { t } = useTranslation();
  const map: Record<string, string> = {
    borrowed: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    returned: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
    overdue:  "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] ?? ""}`}>
      {t(`status.${status}`)}
    </span>
  );
};

const StatCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className={`mt-2 text-3xl font-bold ${color}`}>{value ?? 0}</p>
  </div>
);

export default function SetecDashboard() {
  const { t, i18n } = useTranslation();
  const [stats, setStats]   = useState<Stats | null>(null);
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getBorrowStats(), getBorrows({ status: "borrowed" })])
      .then(([s, b]) => {
        setStats(s.data);
        setBorrows(b.data.slice(0, 8));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-gray-400">{t("messages.loading")}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("dashboard.title")}</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard label={t("dashboard.totalStudents")}  value={stats?.total_students ?? 0}  color="text-gray-800 dark:text-white" />
        <StatCard label={t("dashboard.totalBorrowed")}  value={stats?.total_borrowed ?? 0}  color="text-blue-600" />
        <StatCard label={t("dashboard.totalReturned")}  value={stats?.total_returned ?? 0}  color="text-green-600" />
        <StatCard label={t("dashboard.totalActive")}    value={stats?.total_active ?? 0}    color="text-blue-600" />
        <StatCard label={t("dashboard.totalOverdue")}   value={stats?.total_overdue ?? 0}   color="text-red-600" />
        <StatCard label={t("dashboard.totalAvailable")} value={stats?.total_available ?? 0} color="text-gray-600 dark:text-gray-300" />
      </div>

      {/* Recent Borrows Table */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="font-semibold text-gray-800 dark:text-white">{t("dashboard.recentBorrows")}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                {[t("table.studentId"), t("table.studentName"), t("table.item"), t("table.staffName"), t("table.borrowedAt"), t("table.status")].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {borrows.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">{t("messages.noData")}</td></tr>
              ) : borrows.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{b.student_code}</td>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">
                    {i18n.language === "km" ? b.student_name_kh : b.student_name_en}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{b.item_name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{b.staff_name}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(b.borrowed_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
