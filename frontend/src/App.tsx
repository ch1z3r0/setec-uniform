import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './layout/AppLayout';
import { ScrollToTop } from './components/common/ScrollToTop';

// Setec pages (moved from pages/Setec/ to pages/)
import Login from './pages/Login.tsx';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StaffPage from './pages/Staff';
import Items from './pages/Items';
import Borrowing from './pages/Borrowing';
import Returns from './pages/Returns';
import History from './pages/History';

// Protected route
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
	const { user, isLoading } = useAuth();
	if (isLoading)
		return (
			<div className='flex h-screen items-center justify-center text-gray-400'>
				Loading...
			</div>
		);
	if (!user) return <Navigate to='/login' replace />;
	return <>{children}</>;
};

export default function App() {
	return (
		<AuthProvider>
			<Router>
				<ScrollToTop />
				<Routes>
					{/* Public */}
					<Route path='/login' element={<Login />} />

					{/* Redirect root to dashboard or login */}
					<Route path='/' element={<Navigate to='/dashboard' replace />} />

					{/* Protected pages inside AppLayout */}
					<Route element={<AppLayout />}>
						<Route
							path='/dashboard'
							element={
								<ProtectedRoute>
									<Dashboard />
								</ProtectedRoute>
							}
						/>
						<Route
							path='/students'
							element={
								<ProtectedRoute>
									<Students />
								</ProtectedRoute>
							}
						/>
						<Route
							path='/staff'
							element={
								<ProtectedRoute>
									<StaffPage />
								</ProtectedRoute>
							}
						/>
						<Route
							path='/items'
							element={
								<ProtectedRoute>
									<Items />
								</ProtectedRoute>
							}
						/>
						<Route
							path='/borrowing'
							element={
								<ProtectedRoute>
									<Borrowing />
								</ProtectedRoute>
							}
						/>
						<Route
							path='/returns'
							element={
								<ProtectedRoute>
									<Returns />
								</ProtectedRoute>
							}
						/>
						<Route
							path='/history'
							element={
								<ProtectedRoute>
									<History />
								</ProtectedRoute>
							}
						/>
					</Route>

					{/* Catch all */}
					<Route path='*' element={<Navigate to='/dashboard' replace />} />
				</Routes>
			</Router>
		</AuthProvider>
	);
}
