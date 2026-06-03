import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getBorrows, getStudents, getActiveStaffs, getAvailableItems, createBorrow, markOverdue, deleteBorrow } from "../../services/api";

interface Borrow { id:number; student_code:string; student_name_en:string; student_name_kh:string; staff_name:string; item_name:string; status:string; borrowed_date:string; notes:string; }

const StatusBadge = ({ status }: { status:string }) => {
  const { t } = useTranslation();
  const map: Record<string,string> = {
    borrowed:"bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    returned:"bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
    overdue: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  };
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${map[status]??""}`}>{t(`status.${status}`)}</span>;
};

export default function Borrowing() {
  const { t, i18n } = useTranslation();
  const [borrows, setBorrows]   = useState<Borrow[]>([]);
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState<"issue"|"delete"|null>(null);
  const [selected, setSelected] = useState<Borrow|null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [staffs, setStaffs]     = useState<any[]>([]);
  const [items, setItems]       = useState<any[]>([]);
  const [form, setForm]         = useState({ student_id:"", staff_id:"", item_id:"", notes:"" });
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState<{type:"success"|"error",text:string}|null>(null);

  const load = () => {
    setLoading(true);
    getBorrows({ search, status: statusFilter || undefined }).then(r => setBorrows(r.data)).finally(()=>setLoading(false));
  };
  useEffect(()=>{ load(); },[search, statusFilter]);

  const openIssue = async () => {
    const [s, st, i] = await Promise.all([getStudents(), getActiveStaffs(), getAvailableItems()]);
    setStudents(s.data); setStaffs(st.data); setItems(i.data);
    setForm({ student_id:"", staff_id:"", item_id:"", notes:"" });
    setModal("issue");
  };

  const close = () => { setModal(null); setSelected(null); setMsg(null); };

  const issue = async () => {
    setSaving(true);
    try {
      await createBorrow(form);
      setMsg({ type:"success", text:t("messages.saved") });
      load(); setTimeout(close,800);
    } catch(e:any) { setMsg({ type:"error", text:e.response?.data?.error||t("messages.error") }); }
    finally { setSaving(false); }
  };

  const overdue = async (id: number) => {
    try { await markOverdue(id); load(); } catch {}
  };

  const del = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await deleteBorrow(selected.id);
      setMsg({ type:"success", text:t("messages.deleted") });
      load(); setTimeout(close,800);
    } catch(e:any) { setMsg({ type:"error", text:e.response?.data?.error||t("messages.error") }); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("borrowing.title")}</h1>
        <button onClick={openIssue} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">+ {t("borrowing.issue")}</button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-wrap gap-3">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t("borrowing.search")}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-4 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 w-60" />
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm dark:text-white focus:outline-none">
            <option value="">{t("history.title")}</option>
            <option value="borrowed">{t("status.borrowed")}</option>
            <option value="returned">{t("status.returned")}</option>
            <option value="overdue">{t("status.overdue")}</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>{[t("table.studentId"), t("table.studentName"), t("table.item"), t("table.staffName"), t("table.borrowedAt"), t("table.status"), t("table.actions")].map(h =>
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{h}</th>
              )}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">{t("messages.loading")}</td></tr>
              : borrows.length === 0 ? <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">{t("messages.noData")}</td></tr>
              : borrows.map(b => (
                <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{b.student_code}</td>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">{i18n.language==="km"?b.student_name_kh:b.student_name_en}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{b.item_name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{b.staff_name}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(b.borrowed_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {b.status === "borrowed" && (
                        <button onClick={()=>overdue(b.id)} className="text-xs text-orange-500 hover:underline">{t("actions.markOverdue")}</button>
                      )}
                      <button onClick={()=>{ setSelected(b); setModal("delete"); }} className="text-xs text-red-500 hover:underline">{t("actions.delete")}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue Modal */}
      {modal === "issue" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("borrowing.issue")}</h2>
            {msg && <p className={`mb-3 text-sm rounded-lg px-3 py-2 ${msg.type==="success"?"bg-green-50 text-green-700":"bg-red-50 text-red-600"}`}>{msg.text}</p>}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t("borrowing.selectStudent")}</label>
                <select value={form.student_id} onChange={e=>setForm(p=>({...p,student_id:e.target.value}))}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm dark:text-white focus:outline-none">
                  <option value="">— {t("borrowing.selectStudent")} —</option>
                  {students.map((s:any)=><option key={s.id} value={s.id}>{s.student_id} — {i18n.language==="km"?s.name_kh:s.name_en}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t("borrowing.selectStaff")}</label>
                <select value={form.staff_id} onChange={e=>setForm(p=>({...p,staff_id:e.target.value}))}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm dark:text-white focus:outline-none">
                  <option value="">— {t("borrowing.selectStaff")} —</option>
                  {staffs.map((s:any)=><option key={s.id} value={s.id}>{s.display_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t("borrowing.selectItem")}</label>
                <select value={form.item_id} onChange={e=>setForm(p=>({...p,item_id:e.target.value}))}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm dark:text-white focus:outline-none">
                  <option value="">— {t("borrowing.selectItem")} —</option>
                  {items.map((i:any)=><option key={i.id} value={i.id}>{i.name} ({i.available_quantity} {t("table.available")})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t("borrowing.notes")}</label>
                <textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} rows={2}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none" />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={close} className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{t("actions.cancel")}</button>
              <button onClick={issue} disabled={saving||!form.student_id||!form.staff_id||!form.item_id}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60">
                {saving ? t("messages.loading") : t("actions.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal === "delete" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-semibold mb-2 dark:text-white">{t("actions.delete")}</h2>
            <p className="text-sm text-gray-500 mb-4">{t("messages.confirmDelete")}</p>
            {msg && <p className={`mb-3 text-sm rounded-lg px-3 py-2 ${msg.type==="success"?"bg-green-50 text-green-700":"bg-red-50 text-red-600"}`}>{msg.text}</p>}
            <div className="flex justify-end gap-3">
              <button onClick={close} className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{t("actions.cancel")}</button>
              <button onClick={del} disabled={saving} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-60">
                {saving ? t("messages.loading") : t("actions.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
