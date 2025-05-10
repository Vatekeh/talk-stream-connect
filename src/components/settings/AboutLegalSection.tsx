
import { SettingsItem, SettingsSectionTitle } from "./SettingsItem";

export function AboutLegalSection() {
  return (
    <div className="space-y-2">
      <SettingsSectionTitle>About & Legal</SettingsSectionTitle>
      
      <SettingsItem to="/changelog">
        <p className="text-clutsh-light">What's New</p>
      </SettingsItem>
      
      <SettingsItem to="/faq" external>
        <p className="text-clutsh-light">FAQ</p>
      </SettingsItem>
      
      <SettingsItem to="/contact" external>
        <p className="text-clutsh-light">Contact Us</p>
      </SettingsItem>
      
      <SettingsItem to="/guidelines" external>
        <p className="text-clutsh-light">Community Guidelines</p>
      </SettingsItem>
      
      <SettingsItem to="/terms">
        <p className="text-clutsh-light">Terms of Service</p>
      </SettingsItem>
      
      <SettingsItem to="/privacy">
        <p className="text-clutsh-light">Privacy Policy</p>
      </SettingsItem>
    </div>
  );
}
