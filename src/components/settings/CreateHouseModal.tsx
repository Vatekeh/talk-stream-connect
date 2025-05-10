
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";

interface CreateHouseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateHouseModal({ open, onOpenChange }: CreateHouseModalProps) {
  const [houseName, setHouseName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating house:', { houseName, avatarUrl });
    // Here you would implement the actual house creation logic
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-clutsh-navy border-clutsh-slate sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-clutsh-light">Create a House</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-20 w-20 border-2 border-clutsh-slate">
                <AvatarImage src={avatarUrl || undefined} alt="House avatar" />
                <AvatarFallback className="bg-clutsh-slate text-clutsh-light">
                  {houseName ? houseName[0].toUpperCase() : '🏠'}
                </AvatarFallback>
              </Avatar>
              
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="absolute bottom-0 right-0 rounded-full h-7 w-7 p-0 bg-clutsh-slate/80 border-clutsh-light"
                onClick={() => {
                  // Here you would implement an avatar selector, for now just set a random placeholder
                  setAvatarUrl(`https://api.dicebear.com/7.x/shapes/svg?seed=${Math.random()}`);
                }}
              >
                +
              </Button>
            </div>
            
            <div className="space-y-2 w-full">
              <Label htmlFor="house-name" className="text-clutsh-light">House Name</Label>
              <Input
                id="house-name"
                value={houseName}
                onChange={(e) => setHouseName(e.target.value)}
                placeholder="Enter a name for your house"
                className="bg-clutsh-slate/20 border-clutsh-slate text-clutsh-light"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-clutsh-slate/60 text-clutsh-light"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={!houseName.trim()}
            >
              Create House
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
