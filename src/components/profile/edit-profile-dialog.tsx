
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { User } from "@/types";
import { useForm } from "react-hook-form";
import { Camera } from "lucide-react";

interface EditProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSave: (user: User) => void;
}

type ProfileFormValues = {
  name: string;
  pronouns: string;
  bio: string;
  avatar?: string;
};

export function EditProfileDialog({ isOpen, onClose, user, onSave }: EditProfileDialogProps) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar || null);
  
  const form = useForm<ProfileFormValues>({
    defaultValues: {
      name: user.name,
      pronouns: user.pronouns || "",
      bio: user.bio || "",
    }
  });

  const handleSubmit = (values: ProfileFormValues) => {
    onSave({
      ...user,
      name: values.name,
      pronouns: values.pronouns,
      bio: values.bio,
      avatar: avatarPreview || user.avatar,
    });
  };

  // In a real implementation, this would upload to Supabase storage
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                  <AvatarImage src={avatarPreview || user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-talkstream-purple text-white text-2xl">
                    {user.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <label 
                  htmlFor="avatar-upload" 
                  className="absolute bottom-0 right-0 h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center cursor-pointer"
                >
                  <Camera className="h-4 w-4" />
                  <input 
                    id="avatar-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="pronouns"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pronouns</FormLabel>
                  <FormControl>
                    <Input placeholder="they/them, she/her, he/him, etc." {...field} />
                  </FormControl>
                  <FormDescription>
                    Optional - shared with other members
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell other members about yourself..." 
                      {...field} 
                      className="resize-none"
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
