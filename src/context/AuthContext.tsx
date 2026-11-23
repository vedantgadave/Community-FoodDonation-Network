import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  type User as FirebaseUser 
} from 'firebase/auth';
import { auth, isDemoMode } from '../services/firebase';
import { getUserProfile, createUserProfile, updateUserProfile } from '../services/userService';
import type { UserProfile, UserRole } from '../types';
import { isAdminEmail } from '../constants';

const DEMO_CURRENT_USER_KEY = 'cfdn_demo_current_uid';
const ACTIVE_ROLE_OVERRIDE_KEY = 'cfdn_active_role_override';

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
  switchActiveRole: (newRole: UserRole) => Promise<UserProfile>;
  requestNgoRole: (orgName: string, distributionLocation: string) => Promise<UserProfile>;
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
            const isAdmin = isAdminEmail(fbUser.email);
            let profile = await getUserProfile(fbUser.uid);
            
            if (isAdmin) {
              if (!profile) {
                const now = new Date().toISOString();
                profile = {
                  uid: fbUser.uid,
                  name: fbUser.displayName || 'System Admin',
                  email: fbUser.email || 'admin@gmail.com',
                  phone: fbUser.phoneNumber || '+1 (555) 000-1122',
                  role: 'ADMIN',
                  authorizedRoles: ['ADMIN'],
                  ngoVerificationStatus: 'VERIFIED',
                  organizationName: 'Food Donation Network HQ',
                  location: 'Global Operations Center',
                  isBlocked: false,
                  createdAt: now,
                  updatedAt: now,
                };
                await createUserProfile(profile);
              } else if (profile.role !== 'ADMIN' || !profile.authorizedRoles?.includes('ADMIN')) {
                profile.role = 'ADMIN';
                profile.authorizedRoles = ['ADMIN'];
                try {
                  await updateUserProfile(profile.uid, {
                    role: 'ADMIN',
                    authorizedRoles: ['ADMIN'],
                  });
                } catch (err) {
                  console.warn('Could not sync admin role to database:', err);
                }
              }
            } else if (profile) {
              // Check if user previously switched to an authorized role in this browser
              const storedRole = localStorage.getItem(`${ACTIVE_ROLE_OVERRIDE_KEY}_${fbUser.uid}`) as UserRole | null;
              if (
                storedRole &&
                storedRole !== 'ADMIN' &&
                profile.authorizedRoles?.includes(storedRole)
              ) {
                profile.role = storedRole;
              }
            }
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
        if (profile) {
          const isAdmin = isAdminEmail(profile.email);
          if (isAdmin) {
            profile.role = 'ADMIN';
            profile.authorizedRoles = ['ADMIN'];
          } else {
            const storedRole = localStorage.getItem(`${ACTIVE_ROLE_OVERRIDE_KEY}_${profile.uid}`) as UserRole | null;
            if (
              storedRole &&
              storedRole !== 'ADMIN' &&
              profile.authorizedRoles?.includes(storedRole)
            ) {
              profile.role = storedRole;
            }
          }
        }
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
        const isAdmin = isAdminEmail(cred.user.email || email);
        let profile = await getUserProfile(cred.user.uid);

        if (!profile) {
          if (isAdmin) {
            const now = new Date().toISOString();
            profile = {
              uid: cred.user.uid,
              name: cred.user.displayName || 'System Admin',
              email: cred.user.email || email,
              phone: cred.user.phoneNumber || '+1 (555) 000-1122',
              role: 'ADMIN',
              authorizedRoles: ['ADMIN'],
              ngoVerificationStatus: 'VERIFIED',
              organizationName: 'Food Donation Network HQ',
              location: 'Global Operations Center',
              isBlocked: false,
              createdAt: now,
              updatedAt: now,
            };
            await createUserProfile(profile);
          } else {
            throw new Error('User profile record not found in database.');
          }
        } else if (isAdmin && (profile.role !== 'ADMIN' || !profile.authorizedRoles?.includes('ADMIN'))) {
          profile.role = 'ADMIN';
          profile.authorizedRoles = ['ADMIN'];
          try {
            await updateUserProfile(profile.uid, {
              role: 'ADMIN',
              authorizedRoles: ['ADMIN'],
            });
          } catch (err) {
            console.warn('Could not sync admin role to database:', err);
          }
        }

        if (profile.isBlocked) {
          await signOut(auth);
          throw new Error('Your account has been restricted by an administrator.');
        }
        
        if (!isAdmin) {
          // Restore role preference if authorized
          const storedRole = localStorage.getItem(`${ACTIVE_ROLE_OVERRIDE_KEY}_${profile.uid}`) as UserRole | null;
          if (
            storedRole &&
            storedRole !== 'ADMIN' &&
            profile.authorizedRoles?.includes(storedRole)
          ) {
            profile.role = storedRole;
          }
        } else {
          profile.role = 'ADMIN';
        }

        setUserProfile(profile);
        return profile;
      } else {
        // DEMO MODE LOGIN
        let targetUid = 'donor_1';
        if (email.includes('ngo')) targetUid = 'ngo_1';
        if (isAdminEmail(email) || email.includes('admin')) targetUid = 'admin_1';

        const profile = await getUserProfile(targetUid);
        if (!profile) throw new Error('Demo account profile not found');
        if (profile.isBlocked) throw new Error('Account restricted by administrator.');
        
        if (isAdminEmail(email) || email.includes('admin')) {
          profile.role = 'ADMIN';
          profile.authorizedRoles = ['ADMIN'];
        }

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
      const isAdmin = isAdminEmail(email);
      if (role === 'ADMIN' && !isAdmin) {
        throw new Error('Unauthorized: Admin accounts cannot be self-registered.');
      }
      const effectiveRole: UserRole = isAdmin ? 'ADMIN' : role;
      const now = new Date().toISOString();

      if (!isDemoMode && auth) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const uid = cred.user.uid;

        const newProfile: UserProfile = {
          uid,
          name: name || (isAdmin ? 'System Admin' : ''),
          email,
          phone,
          role: effectiveRole,
          authorizedRoles: [effectiveRole],
          ngoVerificationStatus: isAdmin ? 'VERIFIED' : (effectiveRole === 'NGO' ? 'PENDING' : 'NONE'),
          organizationName: organizationName || (isAdmin ? 'Food Donation Network HQ' : (effectiveRole === 'NGO' ? name : '')),
          location: location || (isAdmin ? 'Global Operations Center' : ''),
          isBlocked: false,
          createdAt: now,
          updatedAt: now,
        };

        await createUserProfile(newProfile);
        setUserProfile(newProfile);
        return newProfile;
      } else {
        // DEMO MODE REGISTER
        const uid = `${effectiveRole.toLowerCase()}_${Date.now()}`;
        const newProfile: UserProfile = {
          uid,
          name: name || (isAdmin ? 'System Admin' : ''),
          email,
          phone,
          role: effectiveRole,
          authorizedRoles: [effectiveRole],
          ngoVerificationStatus: isAdmin ? 'VERIFIED' : (effectiveRole === 'NGO' ? 'PENDING' : 'NONE'),
          organizationName: organizationName || (isAdmin ? 'Food Donation Network HQ' : (effectiveRole === 'NGO' ? name : '')),
          location: location || (isAdmin ? 'Global Operations Center' : ''),
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

  /**
   * Switch the active operational role between authorized roles (e.g. DONOR <-> NGO).
   * Strict security checks:
   * 1. Cannot switch to ADMIN.
   * 2. Must be an authorized role for this user.
   * 3. If switching to NGO, user must have NGO authorization or verified status.
   */
  const switchActiveRole = async (newRole: UserRole): Promise<UserProfile> => {
    if (!userProfile) {
      throw new Error('You must be logged in to switch roles.');
    }

    if (newRole === 'ADMIN') {
      throw new Error('Access Denied: Administrative permissions cannot be assumed via role switching.');
    }

    const currentAuthorized = userProfile.authorizedRoles || [userProfile.role];
    if (!currentAuthorized.includes(newRole)) {
      throw new Error(`Your account is not currently authorized as ${newRole}. Please complete the registration or verification flow.`);
    }

    if (newRole === 'NGO' && userProfile.ngoVerificationStatus === 'REJECTED') {
      throw new Error('Your NGO verification was rejected. Please contact support.');
    }

    // Persist to database & localStorage
    await updateUserProfile(userProfile.uid, { role: newRole });
    localStorage.setItem(`${ACTIVE_ROLE_OVERRIDE_KEY}_${userProfile.uid}`, newRole);

    const updated: UserProfile = {
      ...userProfile,
      role: newRole,
      updatedAt: new Date().toISOString()
    };
    setUserProfile(updated);
    return updated;
  };

  /**
   * Onboard/Upgrade a Donor to also have NGO/Receiver authorization
   */
  const requestNgoRole = async (orgName: string, distributionLocation: string): Promise<UserProfile> => {
    if (!userProfile) {
      throw new Error('You must be logged in to request an NGO role.');
    }

    const currentAuthorized = new Set(userProfile.authorizedRoles || [userProfile.role]);
    currentAuthorized.add('NGO');
    currentAuthorized.add('DONOR'); // ensure both roles are present

    const updates: Partial<UserProfile> = {
      role: 'NGO',
      authorizedRoles: Array.from(currentAuthorized),
      organizationName: orgName || userProfile.organizationName || userProfile.name,
      location: distributionLocation || userProfile.location,
      ngoVerificationStatus: userProfile.ngoVerificationStatus === 'VERIFIED' ? 'VERIFIED' : 'PENDING',
    };

    await updateUserProfile(userProfile.uid, updates);
    localStorage.setItem(`${ACTIVE_ROLE_OVERRIDE_KEY}_${userProfile.uid}`, 'NGO');

    const updated: UserProfile = {
      ...userProfile,
      ...updates,
      updatedAt: new Date().toISOString()
    } as UserProfile;

    setUserProfile(updated);
    return updated;
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
        switchActiveRole,
        requestNgoRole,
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
