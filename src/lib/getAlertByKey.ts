import { alertsMap } from "../data/alerts";

export function getAlertByKey(key: string) {
  return alertsMap.find(a => a.key === key);
}