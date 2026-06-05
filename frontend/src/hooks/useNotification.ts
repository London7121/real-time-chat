export function useNotification() {
  const requestPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  };

  const notify = (title: string, body: string, icon?: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: icon || "/favicon.ico" });
    }
  };

  return { requestPermission, notify };
}
