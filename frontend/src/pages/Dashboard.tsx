import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getBorrowStats, getBorrows } from "../services/api";
import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import Badge from "../components/ui/badge/Badge";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../components/ui/table/index";

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

const statusBadge = (status: string, label: string) => {
  const map: Record<string, "success" | "error" | "warning" | "info" | "primary"> = {
    borrowed: "info",
    returned: "success",
    overdue:  "error",
  };
  return <Badge color={map[status] ?? "primary"} size="sm">{label}</Badge>;
};

const StatCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className={`mt-2 text-3xl font-bold ${color}`}>{value ?? 0}</p>
  </div>
);

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const [stats, setStats]     = useState<Stats | null>(null);
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getBorrowStats(), getBorrows({ status: "borrowed" })])
      .then(([s, b]) => { setStats(s.data); setBorrows(b.data.slice(0, 8)); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageMeta title="Dashboard — Setec" description="Setec uniform lending dashboard" />
      <PageBreadcrumb pageTitle={t("dashboard.title")} />

      {loading ? (
        <p className="text-gray-400">{t("messages.loading")}</p>
      ) : (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
            <StatCard label={t("dashboard.totalStudents")}  value={stats?.total_students ?? 0}  color="text-gray-800 dark:text-white" />
            <StatCard label={t("dashboard.totalBorrowed")}  value={stats?.total_borrowed ?? 0}  color="text-blue-light-500" />
            <StatCard label={t("dashboard.totalReturned")}  value={stats?.total_returned ?? 0}  color="text-success-500" />
            <StatCard label={t("dashboard.totalActive")}    value={stats?.total_active ?? 0}    color="text-blue-light-500" />
            <StatCard label={t("dashboard.totalOverdue")}   value={stats?.total_overdue ?? 0}   color="text-error-500" />
            <StatCard label={t("dashboard.totalAvailable")} value={stats?.total_available ?? 0} color="text-gray-600 dark:text-gray-300" />
          </div>

          {/* Recent Borrows */}
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="font-semibold text-gray-800 dark:text-white">{t("dashboard.recentBorrows")}</h2>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
                  <TableRow>
                    {[t("table.studentId"), t("table.studentName"), t("table.item"), t("table.staffName"), t("table.borrowedAt"), t("table.status")].map(h => (
                      <TableCell key={h} isHeader className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {borrows.length === 0 ? (
                    <TableRow>
                      <TableCell className="px-4 py-8 text-center text-gray-400" >{t("messages.noData")}</TableCell>
                    </TableRow>
                  ) : borrows.map(b => (
                    <TableRow key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                      <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-400">{b.student_code}</TableCell>
                      <TableCell className="px-4 py-3 font-medium text-gray-800 dark:text-white">{i18n.language === "km" ? b.student_name_kh : b.student_name_en}</TableCell>
                      <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-400">{b.item_name}</TableCell>
                      <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-400">{b.staff_name}</TableCell>
                      <TableCell className="px-4 py-3 text-gray-500">{new Date(b.borrowed_date).toLocaleDateString()}</TableCell>
                      <TableCell className="px-4 py-3">{statusBadge(b.status, t(`status.${b.status}`))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
