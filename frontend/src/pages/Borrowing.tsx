import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getBorrows, getStudents, getActiveStaffs, getAvailableItems, createBorrow, markOverdue, deleteBorrow } from "../services/api";
import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import { Modal } from "../components/ui/modal/index";
import Button from "../components/ui/button/Button";
import Badge from "../components/ui/badge/Badge";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../components/ui/table/index";
import Label from "../components/form/Label";
import TextArea from "../components/form/input/TextArea";

interface Borrow { id:number; student_code:string; student_name_en:string; student_name_kh:string; staff_name:string; item_name:string; status:string; borrowed_date:string; }

const statusBadge = (status: string, label: string) => {
  const map: Record<string, "info"|"success"|"error"> = { borrowed:"info", returned:"success", overdue:"error" };
  return <Badge color={map[status] ?? "light"} size="sm">{label}</Badge>;
};

export default function Borrowing() {
  const { t, i18n } = useTranslation();
  const [borrows, setBorrows]           = useState<Borrow[]>([]);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading]           = useState(true);
  const [modal, setModal]               = useState<"issue"|"delete"|null>(null);
  const [selected, setSelected]         = useState<Borrow|null>(null);
  const [students, setStudents]         = useState<any[]>([]);
  const [staffs, setStaffs]             = useState<any[]>([]);
  const [items, setItems]               = useState<any[]>([]);
  const [form, setForm]                 = useState({ student_id:"", staff_id:"", item_id:"", notes:"" });
  const [saving, setSaving]             = useState(false);
  const [msg, setMsg]                   = useState<{type:"success"|"error",text:string}|null>(null);

  const load = () => {
    setLoading(true);
    getBorrows({ search, status: statusFilter || undefined }).then(r => setBorrows(r.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [search, statusFilter]);

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
      setMsg({ type:"success", text: t("messages.saved") });
      load(); setTimeout(close, 800);
    } catch (e: any) {
      setMsg({ type:"error", text: e.response?.data?.error || t("messages.error") });
    } finally { setSaving(false); }
  };

  const overdue = async (id: number) => {
    try { await markOverdue(id); load(); } catch {}
  };

  const del = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await deleteBorrow(selected.id);
      setMsg({ type:"success", text: t("messages.deleted") });
      load(); setTimeout(close, 800);
    } catch (e: any) {
      setMsg({ type:"error", text: e.response?.data?.error || t("messages.error") });
    } finally { setSaving(false); }
  };

  return (
    <>
      <PageMeta title={`${t("borrowing.title")} — Setec`} description="" />
      <PageBreadcrumb pageTitle={t("borrowing.title")} />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex flex-wrap gap-3">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("borrowing.search")}
              className="h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 w-52" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2.5 text-sm dark:text-white focus:outline-none dark:bg-gray-900">
              <option value="">All</option>
              <option value="borrowed">{t("status.borrowed")}</option>
              <option value="returned">{t("status.returned")}</option>
              <option value="overdue">{t("status.overdue")}</option>
            </select>
          </div>
          <Button onClick={openIssue} size="sm">+ {t("borrowing.issue")}</Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
              <TableRow>
                {[t("table.studentId"), t("table.studentName"), t("table.item"), t("table.staffName"), t("table.borrowedAt"), t("table.status"), t("table.actions")].map(h => (
                  <TableCell key={h} isHeader className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{h}</TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <TableRow><TableCell className="px-4 py-8 text-center text-gray-400">{t("messages.loading")}</TableCell></TableRow>
              ) : borrows.length === 0 ? (
                <TableRow><TableCell className="px-4 py-8 text-center text-gray-400">{t("messages.noData")}</TableCell></TableRow>
              ) : borrows.map(b => (
                <TableRow key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                  <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-400">{b.student_code}</TableCell>
                  <TableCell className="px-4 py-3 font-medium text-gray-800 dark:text-white">{i18n.language === "km" ? b.student_name_kh : b.student_name_en}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-400">{b.item_name}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-400">{b.staff_name}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500">{new Date(b.borrowed_date).toLocaleDateString()}</TableCell>
                  <TableCell className="px-4 py-3">{statusBadge(b.status, t(`status.${b.status}`))}</TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex gap-2">
                      {b.status === "borrowed" && (
                        <button onClick={() => overdue(b.id)} className="text-xs text-warning-600 hover:underline">{t("actions.markOverdue")}</button>
                      )}
                      <button onClick={() => { setSelected(b); setModal("delete"); }} className="text-xs text-error-500 hover:underline">{t("actions.delete")}</button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Issue Modal */}
      <Modal isOpen={modal === "issue"} onClose={close} className="max-w-md p-6 m-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("borrowing.issue")}</h2>
        {msg && <div className={`mb-4 rounded-lg px-3 py-2 text-sm ${msg.type === "success" ? "bg-success-50 text-success-600" : "bg-error-50 text-error-600"}`}>{msg.text}</div>}
        <div className="space-y-4">
          <div>
            <Label>{t("borrowing.selectStudent")}</Label>
            <select value={form.student_id} onChange={e => setForm(p => ({ ...p, student_id: e.target.value }))}
              className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20">
              <option value="">— {t("borrowing.selectStudent")} —</option>
              {students.map((s: any) => <option key={s.id} value={s.id}>{s.student_id} — {i18n.language === "km" ? s.name_kh : s.name_en}</option>)}
            </select>
          </div>
          <div>
            <Label>{t("borrowing.selectStaff")}</Label>
            <select value={form.staff_id} onChange={e => setForm(p => ({ ...p, staff_id: e.target.value }))}
              className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20">
              <option value="">— {t("borrowing.selectStaff")} —</option>
              {staffs.map((s: any) => <option key={s.id} value={s.id}>{s.display_name}</option>)}
            </select>
          </div>
          <div>
            <Label>{t("borrowing.selectItem")}</Label>
            <select value={form.item_id} onChange={e => setForm(p => ({ ...p, item_id: e.target.value }))}
              className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20">
              <option value="">— {t("borrowing.selectItem")} —</option>
              {items.map((i: any) => <option key={i.id} value={i.id}>{i.name} ({i.available_quantity} {t("table.available")})</option>)}
            </select>
          </div>
          <div>
            <Label>{t("borrowing.notes")}</Label>
            <TextArea value={form.notes} onChange={val => setForm(p => ({ ...p, notes: val }))} rows={2} />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={close}>{t("actions.cancel")}</Button>
          <Button onClick={issue} disabled={saving || !form.student_id || !form.staff_id || !form.item_id}>
            {saving ? t("messages.loading") : t("actions.confirm")}
          </Button>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={modal === "delete"} onClose={close} className="max-w-sm p-6 m-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t("actions.delete")}</h2>
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
