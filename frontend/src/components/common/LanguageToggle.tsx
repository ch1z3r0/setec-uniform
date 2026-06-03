import { useTranslation } from 'react-i18next';

const LanguageToggle: React.FC = () => {
	const { i18n, t } = useTranslation();
	const isKhmer = i18n.language === 'km';

	return (
		<button
			onClick={() => i18n.changeLanguage(isKhmer ? 'en' : 'km')}
			className='flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
			title='Switch language'
		>
			<span>{isKhmer ? '🇺🇸' : '🇰🇭'}</span>
			<span>{t('lang.toggle')}</span>
		</button>
	);
};

export default LanguageToggle;
