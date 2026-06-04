import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getBorrows } from "../services/api";
import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import Badge from "../components/ui/badge/Badge";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../components/ui/table/index";

interface Borrow { id:number; student_code:string; student_name_en:string; student_name_kh:string; item_name:string; staff_name:string; status:string; borrowed_date:string; returned_date:string; notes:string; }

const statusBadge = (status: string, label: string) => {
  const map: Record<string, "info"|"success"|"error"> = { borrowed:"info", returned:"success", overdue:"error" };
  return <Badge color={map[status] ?? "light"} size="sm">{label}</Badge>;
};

export default function History() {
  const { t, i18n } = useTranslation();
  const [borrows, setBorrows]           = useState<Borrow[]>([]);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    setLoading(true);
    getBorrows({ search, status: statusFilter || undefined })
      .then(r => setBorrows(r.data))
      .finally(() => setLoading(false));
  }, [search, statusFilter]);

  return (
    <>
      <PageMeta title={`${t("history.title")} — Setec`} description="" />
      <PageBreadcrumb pageTitle={t("history.title")} />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-wrap gap-3 p-4 border-b border-gray-200 dark:border-gray-800">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("history.search")}
            className="h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 w-52" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2.5 text-sm dark:text-white focus:outline-none dark:bg-gray-900">
            <option value="">All</option>
            <option value="borrowed">{t("status.borrowed")}</option>
            <option value="returned">{t("status.returned")}</option>
            <option value="overdue">{t("status.overdue")}</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
              <TableRow>
                {[t("table.no"), t("table.studentId"), t("table.studentName"), t("table.item"), t("table.staffName"), t("table.borrowedAt"), t("table.returnedAt"), t("table.status"), t("table.notes")].map(h => (
                  <TableCell key={h} isHeader className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">{h}</TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <TableRow><TableCell className="px-4 py-8 text-center text-gray-400">{t("messages.loading")}</TableCell></TableRow>
              ) : borrows.length === 0 ? (
                <TableRow><TableCell className="px-4 py-8 text-center text-gray-400">{t("messages.noData")}</TableCell></TableRow>
              ) : borrows.map((b, i) => (
                <TableRow key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                  <TableCell className="px-4 py-3 text-gray-500">{i + 1}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-400">{b.student_code}</TableCell>
                  <TableCell className="px-4 py-3 font-medium text-gray-800 dark:text-white">{i18n.language === "km" ? b.student_name_kh : b.student_name_en}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-400">{b.item_name}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-400">{b.staff_name}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(b.borrowed_date).toLocaleDateString()}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 whitespace-nowrap">{b.returned_date ? new Date(b.returned_date).toLocaleDateString() : "—"}</TableCell>
                  <TableCell className="px-4 py-3">{statusBadge(b.status, t(`status.${b.status}`))}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 max-w-[160px] truncate">{b.notes || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">
          {borrows.length} records
        </div>
      </div>
    </>
  );
}
