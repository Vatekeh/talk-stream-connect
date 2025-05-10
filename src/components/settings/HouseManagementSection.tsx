
import { useState } from "react";
import { SettingsSectionTitle } from "./SettingsItem";
import { Button } from "@/components/ui/button";
import { CreateHouseModal } from "./CreateHouseModal";

export function HouseManagementSection() {
  const [isCreateHouseModalOpen, setIsCreateHouseModalOpen] = useState(false);
  
  return (
    <div className="space-y-2">
      <SettingsSectionTitle>House Management</SettingsSectionTitle>
      
      <div className="py-2">
        <Button
          variant="outline"
          className="w-full border-clutsh-slate/60 hover:bg-clutsh-slate/30 text-clutsh-light"
          onClick={() => setIsCreateHouseModalOpen(true)}
        >
          Create a house
        </Button>
      </div>
      
      <CreateHouseModal 
        open={isCreateHouseModalOpen} 
        onOpenChange={setIsCreateHouseModalOpen} 
      />
    </div>
  );
}
