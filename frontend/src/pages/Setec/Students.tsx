import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getStudents, createStudent, updateStudent, deleteStudent } from "../../services/api";

interface Student {
  id: number; student_id: string; name_en: string; name_kh: string;
  phone: string; date_of_birth: string; group: string; promotion: string;
  is_active: number; email: string; borrow_status?: string;
}
const empty: Omit<Student,"id"|"borrow_status"> = {
  student_id:"", name_en:"", name_kh:"", phone:"", date_of_birth:"",
  group:"", promotion:"", is_active:1, email:""
};

export default function Students() {
  const { t, i18n } = useTranslation();
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState<"add"|"edit"|"delete"|null>(null);
  const [selected, setSelected] = useState<Student | null>(null);
  const [form, setForm]         = useState<any>({ ...empty, password: "" });
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState<{type:"success"|"error", text:string}|null>(null);

  const load = () => {
    setLoading(true);
    getStudents({ search }).then(r => setStudents(r.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [search]);

  const openAdd  = () => { setForm({ ...empty, password: "" }); setModal("add"); };
  const openEdit = (s: Student) => { setSelected(s); setForm({ ...s, password: "" }); setModal("edit"); };
  const openDel  = (s: Student) => { setSelected(s); setModal("delete"); };
  const close    = () => { setModal(null); setSelected(null); setMsg(null); };

  const save = async () => {
    setSaving(true);
    try {
      if (modal === "add") await createStudent(form);
      else if (modal === "edit" && selected) await updateStudent(selected.id, form);
      setMsg({ type: "success", text: t("messages.saved") });
      load(); setTimeout(close, 1000);
    } catch (e: any) {
      setMsg({ type: "error", text: e.response?.data?.error || t("messages.error") });
    } finally { setSaving(false); }
  };

  const del = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await deleteStudent(selected.id);
      setMsg({ type: "success", text: t("messages.deleted") });
      load(); setTimeout(close, 800);
    } catch (e: any) {
      setMsg({ type: "error", text: e.response?.data?.error || t("messages.error") });
    } finally { setSaving(false); }
  };

  const StatusBadge = ({ status }: { status?: string }) => {
    if (!status) return <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">—</span>;
    const map: Record<string,string> = {
      borrowed: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
      overdue:  "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
    };
    return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${map[status]??""}`}>{t(`status.${status}`)}</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("students.title")}</h1>
        <button onClick={openAdd} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
          + {t("students.add")}
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t("students.search")}
            className="w-full max-w-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-4 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>{[t("table.studentId"), t("table.studentName"), t("table.class"), t("students.promotion"), t("table.phone"), t("students.status"), t("table.status"), t("table.actions")].map(h =>
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{h}</th>
              )}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">{t("messages.loading")}</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">{t("messages.noData")}</td></tr>
              ) : students.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.student_id}</td>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">
                    <div>{i18n.language === "km" ? s.name_kh : s.name_en}</div>
                    <div className="text-xs text-gray-400">{i18n.language === "km" ? s.name_en : s.name_kh}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.group}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.promotion}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.phone}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${s.is_active ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"}`}>
                      {s.is_active ? t("status.active") : t("status.inactive")}
                    </span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={s.borrow_status} /></td>
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

      {/* Add/Edit Modal */}
      {(modal === "add" || modal === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {modal === "add" ? t("students.add") : t("students.edit")}
            </h2>
            {msg && <p className={`mb-3 text-sm rounded-lg px-3 py-2 ${msg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>{msg.text}</p>}
            <div className="grid grid-cols-2 gap-3">
              {([
                ["student_id", t("students.studentId")],
                ["name_en",    t("students.nameEn")],
                ["name_kh",    t("students.nameKh")],
                ["phone",      t("students.phone")],
                ["date_of_birth", t("students.dob"), "date"],
                ["group",      t("students.group")],
                ["promotion",  t("students.promotion")],
                ["email",      t("students.email"), "email"],
                ["password",   t("students.password"), "password"],
              ] as [string, string, string?][]).map(([key, label, type]) => (
                <div key={key} className={key === "name_kh" || key === "email" ? "col-span-2" : ""}>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
                  <input type={type || "text"} value={form[key] ?? ""} onChange={e => setForm((p: any) => ({ ...p, [key]: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t("students.status")}</label>
                <select value={form.is_active} onChange={e => setForm((p: any) => ({ ...p, is_active: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm dark:text-white focus:outline-none">
                  <option value={1}>{t("status.active")}</option>
                  <option value={0}>{t("status.inactive")}</option>
                </select>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={close} className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">{t("actions.cancel")}</button>
              <button onClick={save} disabled={saving} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60">
                {saving ? t("messages.loading") : t("actions.save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal === "delete" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t("students.delete")}</h2>
            <p className="text-sm text-gray-500 mb-4">{t("messages.confirmDelete")}</p>
            {msg && <p className={`mb-3 text-sm rounded-lg px-3 py-2 ${msg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>{msg.text}</p>}
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
