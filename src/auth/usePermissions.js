import { useAuth } from './AuthContext';
import { hasPermission, hasAnyPermission, hasAllPermissions, isPlatformAdmin as checkPlatformAdmin } from './permissionUtils';
import { isModuleEnabled as checkModuleEnabled } from './moduleUtils';

export function usePermissions() {
  const { permissions, modules, user } = useAuth();

  return {
    permissions,
    modules,
    user,
    hasPermission: (perm) => hasPermission(permissions, perm),
    hasAnyPermission: (perms) => hasAnyPermission(permissions, perms),
    hasAllPermissions: (perms) => hasAllPermissions(permissions, perms),
    isModuleEnabled: (mod) => checkModuleEnabled(modules, mod),
    isPlatformAdmin: checkPlatformAdmin(user),
  };
}
