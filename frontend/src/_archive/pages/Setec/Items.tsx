import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getItems, createItem, updateItem, deleteItem } from "../../services/api";

interface Item { id:number; name:string; quantity:number; available_quantity:number; }

export default function Items() {
  const { t } = useTranslation();
  const [list, setList]       = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState<"add"|"edit"|"delete"|null>(null);
  const [selected, setSelected] = useState<Item|null>(null);
  const [form, setForm]       = useState({ name:"", quantity:0, available_quantity:0 });
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState<{type:"success"|"error",text:string}|null>(null);

  const load = () => { setLoading(true); getItems().then(r => setList(r.data)).finally(()=>setLoading(false)); };
  useEffect(()=>{ load(); },[]);

  const openAdd  = () => { setForm({ name:"", quantity:0, available_quantity:0 }); setModal("add"); };
  const openEdit = (i: Item) => { setSelected(i); setForm({ name:i.name, quantity:i.quantity, available_quantity:i.available_quantity }); setModal("edit"); };
  const openDel  = (i: Item) => { setSelected(i); setModal("delete"); };
  const close    = () => { setModal(null); setSelected(null); setMsg(null); };

  const save = async () => {
    setSaving(true);
    try {
      if (modal === "add") await createItem(form);
      else if (modal === "edit" && selected) await updateItem(selected.id, form);
      setMsg({ type:"success", text:t("messages.saved") });
      load(); setTimeout(close,800);
    } catch(e:any) { setMsg({ type:"error", text:e.response?.data?.error||t("messages.error") }); }
    finally { setSaving(false); }
  };

  const del = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await deleteItem(selected.id);
      setMsg({ type:"success", text:t("messages.deleted") });
      load(); setTimeout(close,800);
    } catch(e:any) { setMsg({ type:"error", text:e.response?.data?.error||t("messages.error") }); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("items.title")}</h1>
        <button onClick={openAdd} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">+ {t("items.add")}</button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>{[t("table.no"), t("items.name"), t("table.quantity"), t("table.available"), t("table.actions")].map(h =>
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{h}</th>
              )}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">{t("messages.loading")}</td></tr>
              : list.length === 0 ? <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">{t("messages.noData")}</td></tr>
              : list.map((item, i) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                  <td className="px-4 py-3 text-gray-500">{i+1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">{item.name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.quantity}</td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${item.available_quantity === 0 ? "text-red-500" : "text-green-600"}`}>
                      {item.available_quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(item)} className="text-xs text-brand-500 hover:underline">{t("actions.edit")}</button>
                      <button onClick={() => openDel(item)}  className="text-xs text-red-500 hover:underline">{t("actions.delete")}</button>
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
          <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{modal==="add"?t("items.add"):t("items.edit")}</h2>
            {msg && <p className={`mb-3 text-sm rounded-lg px-3 py-2 ${msg.type==="success"?"bg-green-50 text-green-700":"bg-red-50 text-red-600"}`}>{msg.text}</p>}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t("items.name")}</label>
                <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t("items.quantity")}</label>
                <input type="number" min={0} value={form.quantity} onChange={e=>setForm(p=>({...p,quantity:Number(e.target.value),available_quantity:Number(e.target.value)}))}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
              </div>
              {modal === "edit" && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t("items.available")}</label>
                  <input type="number" min={0} max={form.quantity} value={form.available_quantity} onChange={e=>setForm(p=>({...p,available_quantity:Number(e.target.value)}))}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                </div>
              )}
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
            <h2 className="text-lg font-semibold mb-2 dark:text-white">{t("items.delete")}</h2>
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
