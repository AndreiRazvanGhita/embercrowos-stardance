export const apps = [];

export function getApp(id) {
  return apps.find((a) => a.id === id);
}
