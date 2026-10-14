import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, User } from '../types';
import { Shield, UserCheck, ShieldAlert } from 'lucide-react';

interface AuthContextType {
  role: UserRole;
  user: User;
  switchRole: (newRole: UserRole) => void;
  isModerator: boolean;
  isAdmin: boolean;
}

const DEMO_USERS: Record<UserRole, User> = {
  citizen: {
    id: 1,
    name: "Maya Lin (Citizen)",
    email: "citizen@civicshield.org",
    role: "citizen"
  },
  moderator: {
    id: 2,
    name: "Sarah Jenkins (Ward Safety Moderator)",
    email: "moderator@civicshield.org",
    role: "moderator"
  },
  admin: {
    id: 3,
    name: "Chief Administrator",
    email: "admin@civicshield.org",
    role: "admin"
  }
};

const AuthContext = createContext<AuthContextType>({
  role: 'citizen',
  user: DEMO_USERS.citizen,
  switchRole: () => {},
  isModerator: false,
  isAdmin: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(() => {
    return (localStorage.getItem('civicshield_role') as UserRole) || 'citizen';
  });

  useEffect(() => {
    localStorage.setItem('civicshield_role', role);
  }, [role]);

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
  };

  const user = DEMO_USERS[role] || DEMO_USERS.citizen;
  const isModerator = role === 'moderator' || role === 'admin';
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider value={{ role, user, switchRole, isModerator, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const RoleSwitcher: React.FC = () => {
  const { role, switchRole } = useAuth();

  return (
    <div className="flex items-center gap-1.5 p-1 rounded-full bg-navy-900/90 border border-slate-700/60 shadow-inner">
      <button
        type="button"
        onClick={() => switchRole('citizen')}
        className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition-all ${
          role === 'citizen'
            ? 'bg-civic-teal text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
        }`}
        title="View as Citizen: Report hazards and track community safety"
      >
        <UserCheck className="w-3.5 h-3.5" />
        <span>Citizen</span>
      </button>

      <button
        type="button"
        onClick={() => switchRole('moderator')}
        className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition-all ${
          role === 'moderator'
            ? 'bg-amber-600 text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
        }`}
        title="View as City Moderator: Verify reports, manage triage and resolve issues"
      >
        <Shield className="w-3.5 h-3.5" />
        <span className="flex items-center gap-1">
          Moderator
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
        </span>
      </button>

      <button
        type="button"
        onClick={() => switchRole('admin')}
        className={`hidden sm:flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition-all ${
          role === 'admin'
            ? 'bg-purple-600 text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
        }`}
        title="View as Administrator"
      >
        <ShieldAlert className="w-3.5 h-3.5" />
        <span>Admin</span>
      </button>
    </div>
  );
};
