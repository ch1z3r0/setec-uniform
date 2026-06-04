import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getStaffs, createStaff, updateStaff, deleteStaff } from "../services/api";
import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import { Modal } from "../components/ui/modal/index";
import Button from "../components/ui/button/Button";
import Badge from "../components/ui/badge/Badge";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../components/ui/table/index";
import Input from "../components/form/input/InputField";
import Label from "../components/form/Label";
import Switch from "../components/form/switch/Switch";

interface Staff { id:number; username:string; display_name:string; email:string; phone:string; is_active:number; }
const empty = { username:"", display_name:"", email:"", phone:"", is_active:1, password:"" };

export default function StaffPage() {
  const { t } = useTranslation();
  const [list, setList]         = useState<Staff[]>([]);
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState<"add"|"edit"|"delete"|null>(null);
  const [selected, setSelected] = useState<Staff|null>(null);
  const [form, setForm]         = useState<any>({ ...empty });
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState<{type:"success"|"error",text:string}|null>(null);

  const load = () => { setLoading(true); getStaffs().then(r => setList(r.data)).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const filtered = list.filter(s =>
    s.display_name.toLowerCase().includes(search.toLowerCase()) ||
    s.username.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd  = () => { setForm({ ...empty }); setModal("add"); };
  const openEdit = (s: Staff) => { setSelected(s); setForm({ ...s, password:"" }); setModal("edit"); };
  const openDel  = (s: Staff) => { setSelected(s); setModal("delete"); };
  const close    = () => { setModal(null); setSelected(null); setMsg(null); };
  const f        = (key: string, val: any) => setForm((p: any) => ({ ...p, [key]: val }));

  const save = async () => {
    setSaving(true);
    try {
      if (modal === "add") await createStaff(form);
      else if (modal === "edit" && selected) await updateStaff(selected.id, form);
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
      await deleteStaff(selected.id);
      setMsg({ type:"success", text: t("messages.deleted") });
      load(); setTimeout(close, 800);
    } catch (e: any) {
      setMsg({ type:"error", text: e.response?.data?.error || t("messages.error") });
    } finally { setSaving(false); }
  };

  return (
    <>
      <PageMeta title={`${t("staff.title")} — Setec`} description="" />
      <PageBreadcrumb pageTitle={t("staff.title")} />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-200 dark:border-gray-800">
          <Input placeholder={t("staff.search")} value={search} onChange={e => setSearch(e.target.value)} className="w-60" />
          <Button onClick={openAdd} size="sm">+ {t("staff.add")}</Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
              <TableRow>
                {[t("staff.username"), t("staff.displayName"), t("staff.email"), t("staff.phone"), t("table.status"), t("table.actions")].map(h => (
                  <TableCell key={h} isHeader className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{h}</TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <TableRow><TableCell className="px-4 py-8 text-center text-gray-400">{t("messages.loading")}</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell className="px-4 py-8 text-center text-gray-400">{t("messages.noData")}</TableCell></TableRow>
              ) : filtered.map(s => (
                <TableRow key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                  <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.username}</TableCell>
                  <TableCell className="px-4 py-3 font-medium text-gray-800 dark:text-white">{s.display_name}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.email}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.phone}</TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge color={s.is_active ? "success" : "light"} size="sm">
                      {s.is_active ? t("status.active") : t("status.inactive")}
                    </Badge>
                  </TableCell>
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

      <Modal isOpen={modal === "add" || modal === "edit"} onClose={close} className="max-w-md p-6 m-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {modal === "add" ? t("staff.add") : t("staff.edit")}
        </h2>
        {msg && <div className={`mb-4 rounded-lg px-3 py-2 text-sm ${msg.type === "success" ? "bg-success-50 text-success-600" : "bg-error-50 text-error-600"}`}>{msg.text}</div>}
        <div className="space-y-4">
          {([["username", t("staff.username")], ["display_name", t("staff.displayName")], ["email", t("staff.email"), "email"], ["phone", t("staff.phone")], ["password", t("staff.password"), "password"]] as [string,string,string?][]).map(([key, label, type]) => (
            <div key={key}>
              <Label htmlFor={key}>{label}</Label>
              <Input id={key} type={type || "text"} value={form[key] ?? ""} onChange={e => f(key, e.target.value)} />
            </div>
          ))}
          <Switch label={t("staff.status")} defaultChecked={form.is_active === 1} onChange={checked => f("is_active", checked ? 1 : 0)} />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={close}>{t("actions.cancel")}</Button>
          <Button onClick={save} disabled={saving}>{saving ? t("messages.loading") : t("actions.save")}</Button>
        </div>
      </Modal>

      <Modal isOpen={modal === "delete"} onClose={close} className="max-w-sm p-6 m-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t("staff.delete")}</h2>
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
