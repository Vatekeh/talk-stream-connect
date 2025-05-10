
import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AppHeader } from "@/components/layout/app-header";
import { SettingsToggleItem, SettingsSectionTitle } from "@/components/settings/SettingsItem";

export default function NotificationSettingsPage() {
  const [roomInvites, setRoomInvites] = useState(true);
  const [newFollowers, setNewFollowers] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [announcements, setAnnouncements] = useState(false);
  
  return (
    <div className="flex flex-col min-h-screen bg-clutsh-midnight">
      <AppHeader />
      
      <div className="flex-1 container max-w-md mx-auto px-4 py-6">
        <div className="mb-6 flex items-center">
          <Link to="/settings" className="mr-3">
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-clutsh-light">Notifications</h1>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <SettingsSectionTitle>Social</SettingsSectionTitle>
            
            <SettingsToggleItem>
              <div>
                <p className="text-clutsh-light">Room Invites</p>
                <p className="text-xs text-clutsh-muted">When someone invites you to a room</p>
              </div>
              <Switch
                checked={roomInvites}
                onCheckedChange={setRoomInvites}
              />
            </SettingsToggleItem>
            
            <SettingsToggleItem>
              <div>
                <p className="text-clutsh-light">New Followers</p>
                <p className="text-xs text-clutsh-muted">When someone follows you</p>
              </div>
              <Switch
                checked={newFollowers}
                onCheckedChange={setNewFollowers}
              />
            </SettingsToggleItem>
            
            <SettingsToggleItem>
              <div>
                <p className="text-clutsh-light">Mentions</p>
                <p className="text-xs text-clutsh-muted">When someone mentions you</p>
              </div>
              <Switch
                checked={mentions}
                onCheckedChange={setMentions}
              />
            </SettingsToggleItem>
          </div>
          
          <div className="space-y-2">
            <SettingsSectionTitle>Updates</SettingsSectionTitle>
            
            <SettingsToggleItem>
              <div>
                <p className="text-clutsh-light">Announcements</p>
                <p className="text-xs text-clutsh-muted">News and feature updates</p>
              </div>
              <Switch
                checked={announcements}
                onCheckedChange={setAnnouncements}
              />
            </SettingsToggleItem>
          </div>
        </div>
      </div>
    </div>
  );
}
