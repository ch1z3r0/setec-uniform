import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getItems, createItem, updateItem, deleteItem } from '../services/api';
import PageMeta from '../components/common/PageMeta';
import PageBreadcrumb from '../components/common/PageBreadCrumb';
import { Modal } from '../components/ui/modal/index';
import Button from '../components/ui/button/Button';
import Badge from '../components/ui/badge/Badge';
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableCell,
} from '../components/ui/table/index';
import Input from '../components/form/input/InputField';
import Label from '../components/form/Label';

interface Item {
	id: number;
	name: string;
	quantity: number;
	available_quantity: number;
}

export default function Items() {
	const { t } = useTranslation();
	const [list, setList] = useState<Item[]>([]);
	const [loading, setLoading] = useState(true);
	const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null);
	const [selected, setSelected] = useState<Item | null>(null);
	const [form, setForm] = useState({
		name: '',
		quantity: 0,
		available_quantity: 0,
	});
	const [saving, setSaving] = useState(false);
	const [msg, setMsg] = useState<{
		type: 'success' | 'error';
		text: string;
	} | null>(null);

	const load = () => {
		setLoading(true);
		getItems()
			.then((r) => setList(r.data))
			.finally(() => setLoading(false));
	};
	useEffect(() => {
		load();
	}, []);

	const openAdd = () => {
		setForm({ name: '', quantity: 0, available_quantity: 0 });
		setModal('add');
	};
	const openEdit = (i: Item) => {
		setSelected(i);
		setForm({
			name: i.name,
			quantity: i.quantity,
			available_quantity: i.available_quantity,
		});
		setModal('edit');
	};
	const openDel = (i: Item) => {
		setSelected(i);
		setModal('delete');
	};
	const close = () => {
		setModal(null);
		setSelected(null);
		setMsg(null);
	};

	const save = async () => {
		setSaving(true);
		try {
			if (modal === 'add') await createItem(form);
			else if (modal === 'edit' && selected)
				await updateItem(selected.id, form);
			setMsg({ type: 'success', text: t('messages.saved') });
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

	const del = async () => {
		if (!selected) return;
		setSaving(true);
		try {
			await deleteItem(selected.id);
			setMsg({ type: 'success', text: t('messages.deleted') });
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
			<PageMeta title={`${t('items.title')} — Setec`} description='' />
			<PageBreadcrumb pageTitle={t('items.title')} />

			<div className='rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'>
				<div className='flex justify-end p-4 border-b border-gray-200 dark:border-gray-800'>
					<Button onClick={openAdd} size='sm'>
						+ {t('items.add')}
					</Button>
				</div>
				<div className='overflow-x-auto'>
					<Table>
						<TableHeader className='bg-gray-50 dark:bg-gray-800/50'>
							<TableRow>
								{[
									t('table.no'),
									t('items.name'),
									t('table.quantity'),
									t('table.available'),
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
							) : list.length === 0 ? (
								<tr>
									<td
										colSpan={7}
										className='px-4 py-8 text-center text-gray-400'
									>
										{t('messages.noData')}
									</td>
								</tr>
							) : (
								list.map((item, i) => (
									<TableRow
										key={item.id}
										className='hover:bg-gray-50 dark:hover:bg-gray-800/40'
									>
										<TableCell className='px-4 py-3 text-gray-500'>
											{i + 1}
										</TableCell>
										<TableCell className='px-4 py-3 font-medium text-gray-800 dark:text-white'>
											{item.name}
										</TableCell>
										<TableCell className='px-4 py-3 text-gray-600 dark:text-gray-400'>
											{item.quantity}
										</TableCell>
										<TableCell className='px-4 py-3'>
											<Badge
												color={
													item.available_quantity === 0 ? 'error' : 'success'
												}
												size='sm'
											>
												{item.available_quantity}
											</Badge>
										</TableCell>
										<TableCell className='px-4 py-3'>
											<div className='flex gap-2'>
												<button
													onClick={() => openEdit(item)}
													className='text-xs text-brand-500 hover:underline'
												>
													{t('actions.edit')}
												</button>
												<button
													onClick={() => openDel(item)}
													className='text-xs text-error-500 hover:underline'
												>
													{t('actions.delete')}
												</button>
											</div>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</div>

			<Modal
				isOpen={modal === 'add' || modal === 'edit'}
				onClose={close}
				className='max-w-sm p-6 m-4'
			>
				<h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
					{modal === 'add' ? t('items.add') : t('items.edit')}
				</h2>
				{msg && (
					<div
						className={`mb-4 rounded-lg px-3 py-2 text-sm ${msg.type === 'success' ? 'bg-success-50 text-success-600' : 'bg-error-50 text-error-600'}`}
					>
						{msg.text}
					</div>
				)}
				<div className='space-y-4'>
					<div>
						<Label htmlFor='name'>{t('items.name')}</Label>
						<Input
							id='name'
							value={form.name}
							onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
						/>
					</div>
					<div>
						<Label htmlFor='qty'>{t('items.quantity')}</Label>
						<Input
							id='qty'
							type='number'
							value={form.quantity}
							onChange={(e) =>
								setForm((p) => ({
									...p,
									quantity: Number(e.target.value),
									available_quantity: Number(e.target.value),
								}))
							}
						/>
					</div>
					{modal === 'edit' && (
						<div>
							<Label htmlFor='avail'>{t('items.available')}</Label>
							<Input
								id='avail'
								type='number'
								value={form.available_quantity}
								onChange={(e) =>
									setForm((p) => ({
										...p,
										available_quantity: Number(e.target.value),
									}))
								}
							/>
						</div>
					)}
				</div>
				<div className='mt-6 flex justify-end gap-3'>
					<Button variant='outline' onClick={close}>
						{t('actions.cancel')}
					</Button>
					<Button onClick={save} disabled={saving}>
						{saving ? t('messages.loading') : t('actions.save')}
					</Button>
				</div>
			</Modal>

			<Modal
				isOpen={modal === 'delete'}
				onClose={close}
				className='max-w-sm p-6 m-4'
			>
				<h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
					{t('items.delete')}
				</h2>
				<p className='text-sm text-gray-500 mb-4'>
					{t('messages.confirmDelete')}
				</p>
				{msg && (
					<div
						className={`mb-4 rounded-lg px-3 py-2 text-sm ${msg.type === 'success' ? 'bg-success-50 text-success-600' : 'bg-error-50 text-error-600'}`}
					>
						{msg.text}
					</div>
				)}
				<div className='flex justify-end gap-3'>
					<Button variant='outline' onClick={close}>
						{t('actions.cancel')}
					</Button>
					<Button
						onClick={del}
						disabled={saving}
						className='bg-error-500 hover:bg-error-600 text-white'
					>
						{saving ? t('messages.loading') : t('actions.delete')}
					</Button>
				</div>
			</Modal>
		</>
	);
}
