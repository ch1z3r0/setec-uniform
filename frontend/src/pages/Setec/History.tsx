import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getBorrows } from "../../services/api";

interface Borrow { id:number; student_code:string; student_name_en:string; student_name_kh:string; item_name:string; staff_name:string; status:string; borrowed_date:string; returned_date:string; notes:string; }

const StatusBadge = ({ status }: { status:string }) => {
  const { t } = useTranslation();
  const map: Record<string,string> = {
    borrowed:"bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    returned:"bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
    overdue: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  };
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${map[status]??""}`}>{t(`status.${status}`)}</span>;
};

export default function History() {
  const { t, i18n } = useTranslation();
  const [borrows, setBorrows]   = useState<Borrow[]>([]);
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading]   = useState(true);

  useEffect(()=>{
    setLoading(true);
    getBorrows({ search, status: statusFilter || undefined }).then(r=>setBorrows(r.data)).finally(()=>setLoading(false));
  },[search, statusFilter]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("history.title")}</h1>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-wrap gap-3">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t("history.search")}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-4 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 w-60" />
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm dark:text-white focus:outline-none">
            <option value="">{t("history.title")} — All</option>
            <option value="borrowed">{t("status.borrowed")}</option>
            <option value="returned">{t("status.returned")}</option>
            <option value="overdue">{t("status.overdue")}</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>{[t("table.no"), t("table.studentId"), t("table.studentName"), t("table.item"), t("table.staffName"), t("table.borrowedAt"), t("table.returnedAt"), t("table.status"), t("table.notes")].map(h=>
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{h}</th>
              )}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">{t("messages.loading")}</td></tr>
              : borrows.length === 0 ? <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">{t("messages.noData")}</td></tr>
              : borrows.map((b,i)=>(
                <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                  <td className="px-4 py-3 text-gray-500">{i+1}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{b.student_code}</td>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">{i18n.language==="km"?b.student_name_kh:b.student_name_en}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{b.item_name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{b.staff_name}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(b.borrowed_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-gray-500">{b.returned_date ? new Date(b.returned_date).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                  <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate">{b.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">
          {borrows.length} {t("history.title").toLowerCase()}
        </div>
      </div>
    </div>
  );
}
