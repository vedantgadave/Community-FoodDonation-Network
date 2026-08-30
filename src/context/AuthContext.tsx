import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  type User as FirebaseUser 
} from 'firebase/auth';
import { auth, isDemoMode } from '../services/firebase';
import { getUserProfile, createUserProfile } from '../services/userService';
import { UserProfile, UserRole } from '../types';

const DEMO_CURRENT_USER_KEY = 'cfdn_demo_current_uid';

interface AuthContextValue {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (
    email: string, 
    password: string, 
    name: string, 
    phone: string, 
    role: UserRole, 
    organizationName: string, 
    location: string
  ) => Promise<UserProfile>;
  logout: () => Promise<void>;
  switchDemoUserRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize Auth State
  useEffect(() => {
    if (!isDemoMode && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        setUser(fbUser);
        if (fbUser) {
          try {
            const profile = await getUserProfile(fbUser.uid);
            setUserProfile(profile);
          } catch (err) {
            console.error('Error fetching user profile:', err);
            setUserProfile(null);
          }
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // DEMO MODE Initialization
      const savedUid = localStorage.getItem(DEMO_CURRENT_USER_KEY) || 'donor_1';
      getUserProfile(savedUid).then((profile) => {
        setUserProfile(profile);
        setLoading(false);
      });
    }
  }, []);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    setLoading(true);
    try {
      if (!isDemoMode && auth) {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const profile = await getUserProfile(cred.user.uid);
        if (!profile) {
          throw new Error('User profile record not found in database.');
        }
        if (profile.isBlocked) {
          await signOut(auth);
          throw new Error('Your account has been restricted by an administrator.');
        }
        setUserProfile(profile);
        return profile;
      } else {
        // DEMO MODE LOGIN
        let targetUid = 'donor_1';
        if (email.includes('ngo')) targetUid = 'ngo_1';
        if (email.includes('admin')) targetUid = 'admin_1';

        const profile = await getUserProfile(targetUid);
        if (!profile) throw new Error('Demo account profile not found');
        if (profile.isBlocked) throw new Error('Account restricted by administrator.');
        
        localStorage.setItem(DEMO_CURRENT_USER_KEY, profile.uid);
        setUserProfile(profile);
        return profile;
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    phone: string,
    role: UserRole,
    organizationName: string,
    location: string
  ): Promise<UserProfile> => {
    setLoading(true);
    try {
      const now = new Date().toISOString();

      if (!isDemoMode && auth) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const uid = cred.user.uid;

        const newProfile: UserProfile = {
          uid,
          name,
          email,
          phone,
          role,
          organizationName: organizationName || (role === 'NGO' ? name : ''),
          location,
          isBlocked: false,
          createdAt: now,
          updatedAt: now,
        };

        await createUserProfile(newProfile);
        setUserProfile(newProfile);
        return newProfile;
      } else {
        // DEMO MODE REGISTER
        const uid = `${role.toLowerCase()}_${Date.now()}`;
        const newProfile: UserProfile = {
          uid,
          name,
          email,
          phone,
          role,
          organizationName: organizationName || (role === 'NGO' ? name : ''),
          location,
          isBlocked: false,
          createdAt: now,
          updatedAt: now,
        };

        await createUserProfile(newProfile);
        localStorage.setItem(DEMO_CURRENT_USER_KEY, uid);
        setUserProfile(newProfile);
        return newProfile;
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      if (!isDemoMode && auth) {
        await signOut(auth);
      } else {
        localStorage.removeItem(DEMO_CURRENT_USER_KEY);
      }
      setUser(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const switchDemoUserRole = async (role: UserRole): Promise<void> => {
    setLoading(true);
    try {
      const targetMap: Record<UserRole, string> = {
        DONOR: 'donor_1',
        NGO: 'ngo_1',
        ADMIN: 'admin_1',
      };
      const targetUid = targetMap[role];
      const profile = await getUserProfile(targetUid);
      if (profile) {
        localStorage.setItem(DEMO_CURRENT_USER_KEY, profile.uid);
        setUserProfile(profile);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        login,
        register,
        logout,
        switchDemoUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
