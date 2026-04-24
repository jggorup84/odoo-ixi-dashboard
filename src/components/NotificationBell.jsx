import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);

  const load = async () => {
    try {
      const data = await base44.entities.Notification.filter({ is_read: false }, "-created_date", 10);
      setNotifications(data);
    } catch {
      // Erreur réseau temporaire — on ignore silencieusement
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const markRead = async (id) => {
    try {
      await base44.entities.Notification.update(id, { is_read: true, read_at: new Date().toISOString() });
      load();
    } catch {
      // Erreur réseau temporaire — on ignore silencieusement
    }
  };

  const typeColor = { info: "text-primary", success: "text-emerald-500", warning: "text-amber-500", error: "text-destructive" };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-1.5 rounded-lg hover:bg-muted transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {notifications.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-bold">
              {notifications.length > 9 ? "9+" : notifications.length}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-3 border-b border-border">
          <p className="font-semibold text-sm">Notifications</p>
          <p className="text-xs text-muted-foreground">{notifications.length} non lue(s)</p>
        </div>
        <div className="max-h-80 overflow-y-auto divide-y divide-border">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Aucune notification</p>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="p-3 hover:bg-muted/50 cursor-pointer" onClick={() => markRead(n.id)}>
                <div className="flex items-start justify-between gap-2">
                  <p className={cn("text-xs font-semibold", typeColor[n.type] || "text-foreground")}>{n.title}</p>
                  <Badge variant="outline" className="text-xs shrink-0">{n.priority}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}