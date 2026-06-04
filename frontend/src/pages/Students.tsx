import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getStudents, createStudent, updateStudent, deleteStudent } from "../services/api";
import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import { Modal } from "../components/ui/modal/index";
import Button from "../components/ui/button/Button";
import Badge from "../components/ui/badge/Badge";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../components/ui/table/index";
import Input from "../components/form/input/InputField";
import Label from "../components/form/Label";
import Switch from "../components/form/switch/Switch";

interface Student {
  id: number; student_id: string; name_en: string; name_kh: string;
  phone: string; date_of_birth: string; group: string; promotion: string;
  is_active: number; email: string; borrow_status?: string;
}
const empty = { student_id:"", name_en:"", name_kh:"", phone:"", date_of_birth:"", group:"", promotion:"", is_active:1, email:"", password:"" };

export default function Students() {
  const { t, i18n } = useTranslation();
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState<"add"|"edit"|"delete"|null>(null);
  const [selected, setSelected] = useState<Student|null>(null);
  const [form, setForm]         = useState<any>({ ...empty });
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState<{type:"success"|"error", text:string}|null>(null);

  const load = () => {
    setLoading(true);
    getStudents({ search }).then(r => setStudents(r.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [search]);

  const openAdd  = () => { setForm({ ...empty }); setModal("add"); };
  const openEdit = (s: Student) => { setSelected(s); setForm({ ...s, password: "" }); setModal("edit"); };
  const openDel  = (s: Student) => { setSelected(s); setModal("delete"); };
  const close    = () => { setModal(null); setSelected(null); setMsg(null); };
  const f        = (key: string, val: any) => setForm((p: any) => ({ ...p, [key]: val }));

  const save = async () => {
    setSaving(true);
    try {
      if (modal === "add") await createStudent(form);
      else if (modal === "edit" && selected) await updateStudent(selected.id, form);
      setMsg({ type:"success", text: t("messages.saved") });
      load(); setTimeout(close, 800);
    } catch (e: any) {
      setMsg({ type:"error", text: e.response?.data?.error || t("messages.error") });
    } finally { setSaving(false); }
  };

  const del = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await deleteStudent(selected.id);
      setMsg({ type:"success", text: t("messages.deleted") });
      load(); setTimeout(close, 800);
    } catch (e: any) {
      setMsg({ type:"error", text: e.response?.data?.error || t("messages.error") });
    } finally { setSaving(false); }
  };

  const borrowBadge = (status?: string) => {
    if (!status) return <Badge color="light" size="sm">—</Badge>;
    const map: Record<string, "info"|"error"> = { borrowed:"info", overdue:"error" };
    return <Badge color={map[status] ?? "light"} size="sm">{t(`status.${status}`)}</Badge>;
  };

  return (
    <>
      <PageMeta title={`${t("students.title")} — Setec`} description="" />
      <PageBreadcrumb pageTitle={t("students.title")} />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-200 dark:border-gray-800">
          <Input placeholder={t("students.search")} value={search} onChange={e => setSearch(e.target.value)} className="w-60" />
          <Button onClick={openAdd} size="sm">+ {t("students.add")}</Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
              <TableRow>
                {[t("table.studentId"), t("table.studentName"), t("table.class"), t("students.promotion"), t("table.phone"), t("table.status"), t("students.status"), t("table.actions")].map(h => (
                  <TableCell key={h} isHeader className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">{h}</TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <TableRow><TableCell className="px-4 py-8 text-center text-gray-400">{t("messages.loading")}</TableCell></TableRow>
              ) : students.length === 0 ? (
                <TableRow><TableCell className="px-4 py-8 text-center text-gray-400">{t("messages.noData")}</TableCell></TableRow>
              ) : students.map(s => (
                <TableRow key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                  <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.student_id}</TableCell>
                  <TableCell className="px-4 py-3 font-medium text-gray-800 dark:text-white">
                    <div>{i18n.language === "km" ? s.name_kh : s.name_en}</div>
                    <div className="text-xs text-gray-400">{i18n.language === "km" ? s.name_en : s.name_kh}</div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.group}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.promotion}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.phone}</TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge color={s.is_active ? "success" : "light"} size="sm">
                      {s.is_active ? t("status.active") : t("status.inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3">{borrowBadge(s.borrow_status)}</TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(s)} className="text-xs text-brand-500 hover:underline">{t("actions.edit")}</button>
                      <button onClick={() => openDel(s)}  className="text-xs text-error-500 hover:underline">{t("actions.delete")}</button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal isOpen={modal === "add" || modal === "edit"} onClose={close} className="max-w-lg p-6 m-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {modal === "add" ? t("students.add") : t("students.edit")}
        </h2>
        {msg && (
          <div className={`mb-4 rounded-lg px-3 py-2 text-sm ${msg.type === "success" ? "bg-success-50 text-success-600" : "bg-error-50 text-error-600"}`}>
            {msg.text}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor={key}>{label}</Label>
              <Input id={key} type={type || "text"} value={form[key] ?? ""} onChange={e => f(key, e.target.value)} />
            </div>
          ))}
          <div className="col-span-2">
            <Switch
              label={t("students.status")}
              defaultChecked={form.is_active === 1}
              onChange={checked => f("is_active", checked ? 1 : 0)}
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={close}>{t("actions.cancel")}</Button>
          <Button onClick={save} disabled={saving}>{saving ? t("messages.loading") : t("actions.save")}</Button>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={modal === "delete"} onClose={close} className="max-w-sm p-6 m-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t("students.delete")}</h2>
        <p className="text-sm text-gray-500 mb-4">{t("messages.confirmDelete")}</p>
        {msg && <div className={`mb-4 rounded-lg px-3 py-2 text-sm ${msg.type === "success" ? "bg-success-50 text-success-600" : "bg-error-50 text-error-600"}`}>{msg.text}</div>}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={close}>{t("actions.cancel")}</Button>
          <Button onClick={del} disabled={saving} className="bg-error-500 hover:bg-error-600 text-white">
            {saving ? t("messages.loading") : t("actions.delete")}
          </Button>
        </div>
      </Modal>
    </>
  );
}
