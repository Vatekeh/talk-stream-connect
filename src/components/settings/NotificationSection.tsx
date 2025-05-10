
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { SettingsItem, SettingsSectionTitle, SettingsToggleItem } from "./SettingsItem";

export function NotificationSection() {
  const [pauseNotifications, setPauseNotifications] = useState(false);
  
  return (
    <div className="space-y-2">
      <SettingsSectionTitle>Notifications</SettingsSectionTitle>
      
      <SettingsToggleItem>
        <div>
          <p className="text-clutsh-light">Pause Notifications</p>
          <p className="text-xs text-clutsh-muted">Silence all notifications temporarily</p>
        </div>
        <Switch
          checked={pauseNotifications}
          onCheckedChange={setPauseNotifications}
        />
      </SettingsToggleItem>
      
      <SettingsItem to="/settings/notifications">
        <div>
          <p className="text-clutsh-light">Notification Settings</p>
          <p className="text-xs text-clutsh-muted">Configure notification preferences</p>
        </div>
      </SettingsItem>
    </div>
  );
}
