import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { toast } from "@/components/ui/sonner";

/**
 * Registers the service worker and shows a toast notification
 * when a new version of the app is available.
 */
export function usePWAUpdate() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        // Poll for SW updates every 60 minutes
        setInterval(() => r.update(), 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error("Service worker registration error:", error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      toast("Update available", {
        description: "A new version of Inspectra is ready.",
        action: {
          label: "Reload",
          onClick: () => {
            updateServiceWorker(true);
            setNeedRefresh(false);
          },
        },
        duration: Infinity,
      });
    }
  }, [needRefresh, updateServiceWorker, setNeedRefresh]);
}
