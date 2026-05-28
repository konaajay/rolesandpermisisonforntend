export function isModuleEnabled(modules, moduleName) {
  if (!modules || !Array.isArray(modules)) return false;
  return modules.includes(moduleName);
}
