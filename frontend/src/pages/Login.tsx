import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageToggle from '../components/common/LanguageToggle';

export default function SetecLogin() {
	const { t } = useTranslation();
	const { login } = useAuth();
	const navigate = useNavigate();

	const [role, setRole] = useState<'staff' | 'student'>('staff');
	const [identifier, setIdentifier] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setLoading(true);
		try {
			await login(identifier, password, role);
			navigate('/dashboard');
		} catch {
			setError(t('auth.invalidCreds'));
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='min-h-screen flex bg-gray-50 dark:bg-gray-950'>
			{/* ── Left panel — branding ── */}
			<div
				className='hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative overflow-hidden'
				style={{
					background:
						'linear-gradient(145deg, #0d5c2e 0%, #1a7a3c 50%, #22a050 100%)',
				}}
			>
				{/* Decorative circles */}
				<div
					className='absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10'
					style={{ background: 'rgba(255,255,255,0.3)' }}
				/>
				<div
					className='absolute -bottom-32 -right-16 w-[500px] h-[500px] rounded-full opacity-10'
					style={{ background: 'rgba(255,255,255,0.2)' }}
				/>
				<div
					className='absolute top-1/3 right-0 w-64 h-64 rounded-full opacity-5'
					style={{ background: 'rgba(255,255,255,0.4)' }}
				/>

				{/* Shield watermark */}
				<div className='absolute bottom-12 left-12 opacity-5'>
					<svg width='200' height='200' viewBox='0 0 24 24' fill='white'>
						<path d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z' />
					</svg>
				</div>

				<div className='relative z-10 text-center px-12'>
					{/* Logo */}
					<div className='mb-10'>
						<img
							src='/images/logo/logo.png'
							alt='SETEC Institute'
							className='mx-auto h-25 w-auto'
						/>
					</div>

					{/* Tagline */}
					<h1 className='text-4xl font-bold text-white mb-4 leading-tight'>
						Uniform Lending
						<br />
						<span className='text-green-200'>Management System</span>
					</h1>
					<p className='text-green-100 text-base leading-relaxed max-w-xs mx-auto opacity-80'>
						Streamlining graduation uniform borrowing for students and staff.
					</p>

					{/* Stats row */}
					<div className='mt-12 grid grid-cols-3 gap-6'>
						{[
							{ label: 'Students', value: '2000+' },
							{ label: 'Items', value: '300+' },
							{ label: 'Graduation', value: '2025' },
						].map(({ label, value }) => (
							<div key={label} className='text-center'>
								<p className='text-2xl font-bold text-white'>{value}</p>
								<p className='text-xs text-green-200 mt-1 uppercase tracking-wider'>
									{label}
								</p>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* ── Right panel — form ── */}
			<div className='flex-1 flex flex-col items-center justify-center px-6 py-12 relative'>
				{/* Language toggle top right */}
				<div className='absolute top-5 right-5'>
					<LanguageToggle />
				</div>

				<div className='w-full max-w-md'>
					{/* Mobile logo */}
					<div className='lg:hidden text-center mb-8'>
						<img
							src='/images/logo/logo.png'
							alt='SETEC'
							className='mx-auto h-10 w-auto'
						/>
					</div>

					{/* Header */}
					<div className='mb-8'>
						<h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
							{t('auth.login')}
						</h2>
						<p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
							{t('app.subtitle')}
						</p>
					</div>

					{/* Role tabs */}
					<div className='flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1 mb-6 gap-1'>
						{(['staff', 'student'] as const).map((r) => (
							<button
								key={r}
								type='button'
								onClick={() => {
									setRole(r);
									setError('');
								}}
								className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
									role === r
										? 'bg-white dark:bg-gray-900 text-brand-600 shadow-sm'
										: 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
								}`}
							>
								{r === 'staff' ? (
									<svg
										width='16'
										height='16'
										viewBox='0 0 24 24'
										fill='none'
										stroke='currentColor'
										strokeWidth='2'
										strokeLinecap='round'
										strokeLinejoin='round'
									>
										<path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
										<circle cx='12' cy='7' r='4' />
									</svg>
								) : (
									<svg
										width='16'
										height='16'
										viewBox='0 0 24 24'
										fill='none'
										stroke='currentColor'
										strokeWidth='2'
										strokeLinecap='round'
										strokeLinejoin='round'
									>
										<path d='M22 10v6M2 10l10-5 10 5-10 5z' />
										<path d='M6 12v5c3 3 9 3 12 0v-5' />
									</svg>
								)}
								{r === 'staff'
									? t('auth.loginAsStaff')
									: t('auth.loginAsStudent')}
							</button>
						))}
					</div>

					{/* Form */}
					<form onSubmit={handleSubmit} className='space-y-5'>
						{/* Identifier */}
						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'>
								{role === 'staff'
									? t('auth.identifier')
									: t('auth.identifierStudent')}
							</label>
							<div className='relative'>
								<span className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400'>
									<svg
										width='16'
										height='16'
										viewBox='0 0 24 24'
										fill='none'
										stroke='currentColor'
										strokeWidth='2'
										strokeLinecap='round'
										strokeLinejoin='round'
									>
										<path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
										<circle cx='12' cy='7' r='4' />
									</svg>
								</span>
								<input
									type='text'
									value={identifier}
									onChange={(e) => setIdentifier(e.target.value)}
									required
									placeholder={
										role === 'staff'
											? 'admin or admin@setec.edu.kh'
											: 'S001 or email'
									}
									className='w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-10 pr-4 py-3 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/15 transition'
								/>
							</div>
						</div>

						{/* Password */}
						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'>
								{t('auth.password')}
							</label>
							<div className='relative'>
								<span className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400'>
									<svg
										width='16'
										height='16'
										viewBox='0 0 24 24'
										fill='none'
										stroke='currentColor'
										strokeWidth='2'
										strokeLinecap='round'
										strokeLinejoin='round'
									>
										<rect x='3' y='11' width='18' height='11' rx='2' ry='2' />
										<path d='M7 11V7a5 5 0 0 1 10 0v4' />
									</svg>
								</span>
								<input
									type={showPassword ? 'text' : 'password'}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									placeholder='••••••••'
									className='w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-10 pr-11 py-3 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/15 transition'
								/>
								<button
									type='button'
									onClick={() => setShowPassword(!showPassword)}
									className='absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
								>
									{showPassword ? (
										<svg
											width='16'
											height='16'
											viewBox='0 0 24 24'
											fill='none'
											stroke='currentColor'
											strokeWidth='2'
											strokeLinecap='round'
											strokeLinejoin='round'
										>
											<path d='M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24' />
											<line x1='1' y1='1' x2='23' y2='23' />
										</svg>
									) : (
										<svg
											width='16'
											height='16'
											viewBox='0 0 24 24'
											fill='none'
											stroke='currentColor'
											strokeWidth='2'
											strokeLinecap='round'
											strokeLinejoin='round'
										>
											<path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' />
											<circle cx='12' cy='12' r='3' />
										</svg>
									)}
								</button>
							</div>
						</div>

						{/* Error */}
						{error && (
							<div className='flex items-center gap-2 rounded-xl bg-error-50 dark:bg-error-500/10 border border-error-200 dark:border-error-500/20 px-4 py-3'>
								<svg
									width='16'
									height='16'
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth='2'
									className='text-error-500 shrink-0'
								>
									<circle cx='12' cy='12' r='10' />
									<line x1='12' y1='8' x2='12' y2='12' />
									<line x1='12' y1='16' x2='12.01' y2='16' />
								</svg>
								<p className='text-sm text-error-600 dark:text-error-400'>
									{error}
								</p>
							</div>
						)}

						{/* Submit */}
						<button
							type='submit'
							disabled={loading}
							className='w-full rounded-xl py-3 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2'
							style={{
								background: loading
									? '#6b8f72'
									: 'linear-gradient(135deg, #1a7a3c 0%, #22a050 100%)',
							}}
						>
							{loading ? (
								<>
									<svg
										className='animate-spin'
										width='16'
										height='16'
										viewBox='0 0 24 24'
										fill='none'
										stroke='currentColor'
										strokeWidth='2'
									>
										<path d='M21 12a9 9 0 1 1-6.219-8.56' />
									</svg>
									{t('messages.loading')}
								</>
							) : (
								<>
									{t('auth.loginBtn')}
									<svg
										width='16'
										height='16'
										viewBox='0 0 24 24'
										fill='none'
										stroke='currentColor'
										strokeWidth='2'
										strokeLinecap='round'
										strokeLinejoin='round'
									>
										<line x1='5' y1='12' x2='19' y2='12' />
										<polyline points='12 5 19 12 12 19' />
									</svg>
								</>
							)}
						</button>
					</form>

					{/* Footer */}
					<p className='mt-8 text-center text-xs text-gray-400 dark:text-gray-600'>
						© {new Date().getFullYear()} SETEC Institute. All rights reserved.
					</p>
				</div>
			</div>
		</div>
	);
}
