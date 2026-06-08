export function hasPermission(permissions, permissionKey) {
  if (!permissions || !Array.isArray(permissions)) return false;
  if (permissions.includes('*')) return true;
  return permissions.includes(permissionKey);
}

export function hasAnyPermission(permissions, keys) {
  if (!permissions || !Array.isArray(permissions)) return false;
  if (permissions.includes('*')) return true;
  return keys.some(key => permissions.includes(key));
}

export function hasAllPermissions(permissions, keys) {
  if (!permissions || !Array.isArray(permissions)) return false;
  if (permissions.includes('*')) return true;
  return keys.every(key => permissions.includes(key));
}

export function isPlatformAdmin(user) {
  return !!(user && user.isPlatformAdmin);
}
