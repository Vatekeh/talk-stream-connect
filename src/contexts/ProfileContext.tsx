
import { createContext, useContext, useState } from 'react';
import { User } from '@/types';

interface ProfileContextType {
  user: User;
  setUser: (user: User) => void;
  isEditProfileOpen: boolean;
  setIsEditProfileOpen: (isOpen: boolean) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>({
    id: "1",
    name: "Alex Johnson",
    avatar: "/placeholder.svg",
    pronouns: "they/them",
    bio: "Passionate about technology and connecting with like-minded individuals.",
    createdAt: "2023-01-15T12:00:00Z",
    lastActive: "2023-04-17T14:30:00Z",
    isModerator: true
  });
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  return (
    <ProfileContext.Provider
      value={{
        user,
        setUser,
        isEditProfileOpen,
        setIsEditProfileOpen,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
