export type UserRole = 'player' | 'coach' | 'supporter' | null;

export const getCurrentUser = () => {
  try {
    const token = localStorage.getItem('authToken');
    const role = (localStorage.getItem('userRole') as UserRole) || null;
    const userId = localStorage.getItem('userId') || undefined;
    if (!token || !role) return null;
    return { id: userId, role, token } as { id?: string; role: Exclude<UserRole, null>; token: string };
  } catch {
    return null;
  }
};


