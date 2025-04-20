
import React from 'react';
import { AppHeader } from "@/components/layout/app-header";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileData } from "@/hooks/useProfileData";
import { Loader2 } from "lucide-react";

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { profile, userStats, saves, clips, isLoading } = useProfileData(user?.id || '');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader 
        isAuthenticated={true} 
        userName={profile?.username || ''} 
        userAvatar={profile?.avatar_url} 
        isModerator={profile?.is_moderator} 
      />
      
      <main className="container py-6 space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        
        <section>
          <h2 className="text-xl font-semibold mb-4">Profile Overview</h2>
          <div className="bg-white shadow rounded-lg p-6">
            <p><strong>Username:</strong> {profile?.username}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            {profile?.bio && <p><strong>Bio:</strong> {profile.bio}</p>}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">User Stats</h2>
          <div className="bg-white shadow rounded-lg p-6 grid grid-cols-2 gap-4">
            <div>
              <p><strong>Time in Rooms:</strong> {userStats?.timeInRooms || 0} minutes</p>
              <p><strong>Rooms Joined:</strong> {userStats?.roomsJoined || 0}</p>
            </div>
            <div>
              <p><strong>Messages Posted:</strong> {userStats?.messagesPosted || 0}</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Recent Saves</h2>
          <div className="bg-white shadow rounded-lg p-6">
            {saves && saves.length > 0 ? (
              saves.map(save => (
                <div key={save.id} className="border-b last:border-b-0 py-2">
                  <p>{save.message}</p>
                  <small className="text-gray-500">From: {save.fromUserName}</small>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No saves yet</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Recent Clips</h2>
          <div className="bg-white shadow rounded-lg p-6">
            {clips && clips.length > 0 ? (
              clips.map(clip => (
                <div key={clip.id} className="border-b last:border-b-0 py-2">
                  <p>{clip.title}</p>
                  <small className="text-gray-500">Room: {clip.roomName}</small>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No clips yet</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
