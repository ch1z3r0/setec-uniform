import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getBorrows, processReturn } from "../../services/api";

interface Borrow { id:number; student_code:string; student_name_en:string; student_name_kh:string; item_name:string; staff_name:string; borrowed_date:string; status:string; }

export default function Returns() {
  const { t, i18n } = useTranslation();
  const [borrows, setBorrows]   = useState<Borrow[]>([]);
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [selected, setSelected] = useState<Borrow|null>(null);
  const [notes, setNotes]       = useState("");
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState<{type:"success"|"error",text:string}|null>(null);

  const load = () => {
    setLoading(true);
    getBorrows({ status:"borrowed", search }).then(r => setBorrows(r.data)).finally(()=>setLoading(false));
  };
  useEffect(()=>{ load(); },[search]);

  const open  = (b: Borrow) => { setSelected(b); setNotes(""); setModal(true); };
  const close = () => { setModal(false); setSelected(null); setMsg(null); };

  const submit = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await processReturn(selected.id, { notes });
      setMsg({ type:"success", text:t("messages.returned") });
      load(); setTimeout(close,800);
    } catch(e:any) { setMsg({ type:"error", text:e.response?.data?.error||t("messages.error") }); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("returns.title")}</h1>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t("returns.search")}
            className="w-full max-w-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-4 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>{[t("table.studentId"), t("table.studentName"), t("table.item"), t("table.staffName"), t("table.borrowedAt"), t("table.actions")].map(h=>
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{h}</th>
              )}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">{t("messages.loading")}</td></tr>
              : borrows.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">{t("returns.title")} — {t("messages.noData")}</td></tr>
              : borrows.map(b => (
                <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{b.student_code}</td>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">{i18n.language==="km"?b.student_name_kh:b.student_name_en}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{b.item_name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{b.staff_name}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(b.borrowed_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={()=>open(b)} className="rounded-lg bg-green-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-600">
                      {t("returns.process")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t("returns.process")}</h2>
            <p className="text-sm text-gray-500 mb-4">{t("messages.confirmReturn")}</p>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">{t("table.studentId")}</span><span className="font-medium dark:text-white">{selected.student_code}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">{t("table.studentName")}</span><span className="font-medium dark:text-white">{i18n.language==="km"?selected.student_name_kh:selected.student_name_en}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">{t("table.item")}</span><span className="font-medium dark:text-white">{selected.item_name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">{t("table.borrowedAt")}</span><span className="dark:text-white">{new Date(selected.borrowed_date).toLocaleDateString()}</span></div>
            </div>

            {msg && <p className={`mb-3 text-sm rounded-lg px-3 py-2 ${msg.type==="success"?"bg-green-50 text-green-700":"bg-red-50 text-red-600"}`}>{msg.text}</p>}

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t("returns.notes")}</label>
              <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none" />
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button onClick={close} className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{t("actions.cancel")}</button>
              <button onClick={submit} disabled={saving} className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-60">
                {saving ? t("messages.loading") : t("actions.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
