import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getBorrows, processReturn } from '../services/api';
import PageMeta from '../components/common/PageMeta';
import PageBreadcrumb from '../components/common/PageBreadCrumb';
import { Modal } from '../components/ui/modal/index';
import Button from '../components/ui/button/Button';
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableCell,
} from '../components/ui/table/index';
import Label from '../components/form/Label';
import TextArea from '../components/form/input/TextArea';

interface Borrow {
	id: number;
	student_code: string;
	student_name_en: string;
	student_name_kh: string;
	item_name: string;
	staff_name: string;
	borrowed_date: string;
	status: string;
}

export default function Returns() {
	const { t, i18n } = useTranslation();
	const [borrows, setBorrows] = useState<Borrow[]>([]);
	const [search, setSearch] = useState('');
	const [loading, setLoading] = useState(true);
	const [modal, setModal] = useState(false);
	const [selected, setSelected] = useState<Borrow | null>(null);
	const [notes, setNotes] = useState('');
	const [saving, setSaving] = useState(false);
	const [msg, setMsg] = useState<{
		type: 'success' | 'error';
		text: string;
	} | null>(null);

	const load = () => {
		setLoading(true);
		getBorrows({ status: 'borrowed', search })
			.then((r) => setBorrows(r.data))
			.finally(() => setLoading(false));
	};
	useEffect(() => {
		load();
	}, [search]);

	const open = (b: Borrow) => {
		setSelected(b);
		setNotes('');
		setModal(true);
	};
	const close = () => {
		setModal(false);
		setSelected(null);
		setMsg(null);
	};

	const submit = async () => {
		if (!selected) return;
		setSaving(true);
		try {
			await processReturn(selected.id, { notes });
			setMsg({ type: 'success', text: t('messages.returned') });
			load();
			setTimeout(close, 800);
		} catch (e: any) {
			setMsg({
				type: 'error',
				text: e.response?.data?.error || t('messages.error'),
			});
		} finally {
			setSaving(false);
		}
	};

	return (
		<>
			<PageMeta title={`${t('returns.title')} — Setec`} description='' />
			<PageBreadcrumb pageTitle={t('returns.title')} />

			<div className='rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'>
				<div className='p-4 border-b border-gray-200 dark:border-gray-800'>
					<input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder={t('returns.search')}
						className='h-11 w-full max-w-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20'
					/>
				</div>
				<div className='overflow-x-auto'>
					<Table>
						<TableHeader className='bg-gray-50 dark:bg-gray-800/50'>
							<TableRow>
								{[
									t('table.studentId'),
									t('table.studentName'),
									t('table.item'),
									t('table.staffName'),
									t('table.borrowedAt'),
									t('table.actions'),
								].map((h) => (
									<TableCell
										key={h}
										isHeader
										className='px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400'
									>
										{h}
									</TableCell>
								))}
							</TableRow>
						</TableHeader>
						<TableBody className='divide-y divide-gray-100 dark:divide-gray-800'>
							{loading ? (
								<tr>
									<td
										colSpan={7}
										className='px-4 py-8 text-center text-gray-400'
									>
										{t('messages.loading')}
									</td>
								</tr>
							) : borrows.length === 0 ? (
								<tr>
									<td
										colSpan={7}
										className='px-4 py-8 text-center text-gray-400'
									>
										{t('messages.noData')}
									</td>
								</tr>
							) : (
								borrows.map((b) => (
									<TableRow
										key={b.id}
										className='hover:bg-gray-50 dark:hover:bg-gray-800/40'
									>
										<TableCell className='px-4 py-3 text-gray-600 dark:text-gray-400'>
											{b.student_code}
										</TableCell>
										<TableCell className='px-4 py-3 font-medium text-gray-800 dark:text-white'>
											{i18n.language === 'km'
												? b.student_name_kh
												: b.student_name_en}
										</TableCell>
										<TableCell className='px-4 py-3 text-gray-600 dark:text-gray-400'>
											{b.item_name}
										</TableCell>
										<TableCell className='px-4 py-3 text-gray-600 dark:text-gray-400'>
											{b.staff_name}
										</TableCell>
										<TableCell className='px-4 py-3 text-gray-500'>
											{new Date(b.borrowed_date).toLocaleDateString()}
										</TableCell>
										<TableCell className='px-4 py-3'>
											<Button
												onClick={() => open(b)}
												size='sm'
												className='bg-success-500 hover:bg-success-600 text-white'
											>
												{t('returns.process')}
											</Button>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</div>

			<Modal
				isOpen={modal && !!selected}
				onClose={close}
				className='max-w-md p-6 m-4'
			>
				{selected && (
					<>
						<h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-1'>
							{t('returns.process')}
						</h2>
						<p className='text-sm text-gray-500 mb-4'>
							{t('messages.confirmReturn')}
						</p>
						<div className='bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4 space-y-2 text-sm'>
							{[
								[t('table.studentId'), selected.student_code],
								[
									t('table.studentName'),
									i18n.language === 'km'
										? selected.student_name_kh
										: selected.student_name_en,
								],
								[t('table.item'), selected.item_name],
								[
									t('table.borrowedAt'),
									new Date(selected.borrowed_date).toLocaleDateString(),
								],
							].map(([label, value]) => (
								<div key={label} className='flex justify-between'>
									<span className='text-gray-500'>{label}</span>
									<span className='font-medium text-gray-800 dark:text-white'>
										{value}
									</span>
								</div>
							))}
						</div>
						{msg && (
							<div
								className={`mb-4 rounded-lg px-3 py-2 text-sm ${msg.type === 'success' ? 'bg-success-50 text-success-600' : 'bg-error-50 text-error-600'}`}
							>
								{msg.text}
							</div>
						)}
						<div>
							<Label>{t('returns.notes')}</Label>
							<TextArea value={notes} onChange={setNotes} rows={3} />
						</div>
						<div className='mt-6 flex justify-end gap-3'>
							<Button variant='outline' onClick={close}>
								{t('actions.cancel')}
							</Button>
							<Button
								onClick={submit}
								disabled={saving}
								className='bg-success-500 hover:bg-success-600 text-white'
							>
								{saving ? t('messages.loading') : t('actions.confirm')}
							</Button>
						</div>
					</>
				)}
			</Modal>
		</>
	);
}
