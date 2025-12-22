import { useAppDispatch } from '../../app/hooks';
import { logout } from '../../features/auth/authThunks';
import { useNavigate } from 'react-router-dom';

export default function UserDashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-background">
      <div className="w-full max-w-md p-6 text-center border rounded-lg shadow-sm bg-card">
        {/* Header */}
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">User Dashboard</h1>
        <p className="mb-6 text-sm text-muted-foreground">Welcome! You are logged in as a user.</p>

        {/* Actions */}
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 text-sm font-medium transition rounded-md bg-primary text-primary-foreground hover:opacity-90"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
