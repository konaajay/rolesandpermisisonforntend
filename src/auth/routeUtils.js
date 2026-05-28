import { isPlatformAdmin, hasPermission } from './permissionUtils';

export function getDefaultRoute(user, permissions) {
  if (!user) return '/login';
  
  if (isPlatformAdmin(user)) {
    return '/tenants';
  }

  if (hasPermission(permissions, 'USER_VIEW')) {
    return '/users';
  }
  
  if (hasPermission(permissions, 'ROLE_CREATE')) {
    return '/create-role';
  }
  
  if (hasPermission(permissions, 'PERMISSION_CREATE')) {
    return '/permissions';
  }

  return '/role-hierarchy';
}
