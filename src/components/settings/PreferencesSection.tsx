
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { SettingsItem, SettingsSectionTitle, SettingsToggleItem } from "./SettingsItem";

export function PreferencesSection() {
  const [spatialAudio, setSpatialAudio] = useState(true);
  
  return (
    <div className="space-y-2">
      <SettingsSectionTitle>Preferences</SettingsSectionTitle>
      
      <SettingsItem to="/settings/languages">
        <p className="text-clutsh-light">Languages</p>
      </SettingsItem>
      
      <SettingsItem to="/settings/appearance">
        <div>
          <p className="text-clutsh-light">Dark Mode</p>
          <p className="text-xs text-clutsh-muted">Currently set to dark</p>
        </div>
      </SettingsItem>
      
      <SettingsToggleItem>
        <div>
          <p className="text-clutsh-light">Spatial Audio</p>
          <p className="text-xs text-clutsh-muted">Enhanced audio experience</p>
        </div>
        <Switch
          checked={spatialAudio}
          onCheckedChange={setSpatialAudio}
        />
      </SettingsToggleItem>
      
      <SettingsItem to="/settings/blocked-users">
        <p className="text-clutsh-light">Blocked Users</p>
      </SettingsItem>
      
      <SettingsItem to="/settings/saved-replays">
        <p className="text-clutsh-light">Saved Replays</p>
      </SettingsItem>
      
      <SettingsItem to="/settings/archived-chats">
        <p className="text-clutsh-light">Archived Async Chats</p>
      </SettingsItem>
    </div>
  );
}
