import { useNotificationRunner } from "@/hooks/use-notification-runner";

/** Headless: evaluates notification rules while the app is open. */
export function NotificationRunner() {
  useNotificationRunner();
  return null;
}
