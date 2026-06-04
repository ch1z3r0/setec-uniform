import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getStaffs, createStaff, updateStaff, deleteStaff } from "../../services/api";

interface Staff { id:number; username:string; display_name:string; email:string; phone:string; is_active:number; }
const empty = { username:"", display_name:"", email:"", phone:"", is_active:1, password:"" };

export default function StaffPage() {
  const { t } = useTranslation();
  const [list, setList]       = useState<Staff[]>([]);
  const [search, setSearch]   = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState<"add"|"edit"|"delete"|null>(null);
  const [selected, setSelected] = useState<Staff|null>(null);
  const [form, setForm]       = useState<any>({ ...empty });
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState<{type:"success"|"error",text:string}|null>(null);

  const load = () => { setLoading(true); getStaffs().then(r => setList(r.data)).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const filtered = list.filter(s =>
    s.display_name.toLowerCase().includes(search.toLowerCase()) ||
    s.username.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd  = () => { setForm({ ...empty }); setModal("add"); };
  const openEdit = (s: Staff) => { setSelected(s); setForm({ ...s, password: "" }); setModal("edit"); };
  const openDel  = (s: Staff) => { setSelected(s); setModal("delete"); };
  const close    = () => { setModal(null); setSelected(null); setMsg(null); };

  const save = async () => {
    setSaving(true);
    try {
      if (modal === "add") await createStaff(form);
      else if (modal === "edit" && selected) await updateStaff(selected.id, form);
      setMsg({ type:"success", text: t("messages.saved") });
      load(); setTimeout(close, 800);
    } catch (e:any) {
      setMsg({ type:"error", text: e.response?.data?.error || t("messages.error") });
    } finally { setSaving(false); }
  };

  const del = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await deleteStaff(selected.id);
      setMsg({ type:"success", text: t("messages.deleted") });
      load(); setTimeout(close, 800);
    } catch (e:any) {
      setMsg({ type:"error", text: e.response?.data?.error || t("messages.error") });
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("staff.title")}</h1>
        <button onClick={openAdd} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">+ {t("staff.add")}</button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("staff.search")}
            className="w-full max-w-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-4 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>{[t("staff.username"), t("staff.displayName"), t("staff.email"), t("staff.phone"), t("table.status"), t("table.actions")].map(h =>
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{h}</th>
              )}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">{t("messages.loading")}</td></tr>
              : filtered.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">{t("messages.noData")}</td></tr>
              : filtered.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.username}</td>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">{s.display_name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.email}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.phone}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${s.is_active ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"}`}>
                      {s.is_active ? t("status.active") : t("status.inactive")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(s)} className="text-xs text-brand-500 hover:underline">{t("actions.edit")}</button>
                      <button onClick={() => openDel(s)}  className="text-xs text-red-500 hover:underline">{t("actions.delete")}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(modal === "add" || modal === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{modal === "add" ? t("staff.add") : t("staff.edit")}</h2>
            {msg && <p className={`mb-3 text-sm rounded-lg px-3 py-2 ${msg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>{msg.text}</p>}
            <div className="space-y-3">
              {([["username", t("staff.username")], ["display_name", t("staff.displayName")], ["email", t("staff.email"), "email"], ["phone", t("staff.phone")], ["password", t("staff.password"), "password"]] as [string,string,string?][]).map(([key, label, type]) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
                  <input type={type||"text"} value={form[key]??""} onChange={e => setForm((p:any) => ({...p,[key]:e.target.value}))}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t("staff.status")}</label>
                <select value={form.is_active} onChange={e => setForm((p:any)=>({...p,is_active:Number(e.target.value)}))}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm dark:text-white focus:outline-none">
                  <option value={1}>{t("status.active")}</option>
                  <option value={0}>{t("status.inactive")}</option>
                </select>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={close} className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{t("actions.cancel")}</button>
              <button onClick={save} disabled={saving} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60">
                {saving ? t("messages.loading") : t("actions.save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal === "delete" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-semibold mb-2 dark:text-white">{t("staff.delete")}</h2>
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
