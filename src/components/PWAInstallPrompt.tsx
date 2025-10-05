import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, X } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

export const PWAInstallPrompt = () => {
  const { isInstallable, promptInstall } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  const handleInstall = () => {
    promptInstall();
    setIsDismissed(true);
  };

  if (!isInstallable || isDismissed) return null;

  return (
    <Card className="fixed bottom-20 left-4 right-4 lg:left-auto lg:right-4 lg:w-80 p-4 bg-gradient-to-br from-primary/10 to-success/10 border-primary/30 shadow-balloon z-40 animate-fade-in">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/5 transition-colors"
        aria-label="Fermer"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </button>

      <div className="flex items-start gap-3">
        <div className="text-2xl">🎈</div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">
            Installer Balloon Tasks
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            Accédez rapidement à vos tâches depuis votre écran d'accueil
          </p>
          <Button
            onClick={handleInstall}
            size="sm"
            className="w-full bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Installer l'app
          </Button>
        </div>
      </div>
    </Card>
  );
};
