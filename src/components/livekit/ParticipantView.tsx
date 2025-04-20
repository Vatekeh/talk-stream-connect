
import { useEffect, useRef, useState } from "react";
import { LocalParticipant, RemoteParticipant, Track } from "livekit-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MicOff, User } from "lucide-react";

interface ParticipantViewProps {
  participant: LocalParticipant | RemoteParticipant;
  isLocal: boolean;
  isMuted?: boolean;
  isVideoEnabled?: boolean;
}

export function ParticipantView({ 
  participant, 
  isLocal, 
  isMuted, 
  isVideoEnabled 
}: ParticipantViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [videoTrack, setVideoTrack] = useState<Track | null>(null);
  const [audioTrack, setAudioTrack] = useState<Track | null>(null);
  const [participantIsMuted, setParticipantIsMuted] = useState(isMuted);
  const [participantVideoEnabled, setParticipantVideoEnabled] = useState(isVideoEnabled);
  
  // Get the first letter of the participant's identity for the fallback avatar
  const fallbackAvatar = participant.identity.charAt(0).toUpperCase();
  
  useEffect(() => {
    setParticipantIsMuted(isMuted);
  }, [isMuted]);
  
  useEffect(() => {
    setParticipantVideoEnabled(isVideoEnabled);
  }, [isVideoEnabled]);
  
  useEffect(() => {
    // Function to set up tracks
    const setupTracks = () => {
      // For local participant, use the camera and microphone tracks
      if (isLocal) {
        const camTrack = participant.getTrack(Track.Source.Camera);
        const micTrack = participant.getTrack(Track.Source.Microphone);
        
        setVideoTrack(camTrack?.track || null);
        setAudioTrack(micTrack?.track || null);
      } 
      // For remote participants, listen for track subscriptions
      else {
        const remoteParticipant = participant as RemoteParticipant;
        
        // Check for already subscribed tracks - Fixed method
        const trackPublications = Array.from(remoteParticipant.getTracks());
        for (const trackPub of trackPublications) {
          if (trackPub.track) {
            if (trackPub.kind === Track.Kind.Video) {
              setVideoTrack(trackPub.track);
            } else if (trackPub.kind === Track.Kind.Audio) {
              setAudioTrack(trackPub.track);
              setParticipantIsMuted(!trackPub.isEnabled);
            }
          }
        }
        
        // Subscribe to future track changes
        const onTrackSubscribed = (track: Track) => {
          if (track.kind === Track.Kind.Video) {
            setVideoTrack(track);
          } else if (track.kind === Track.Kind.Audio) {
            setAudioTrack(track);
          }
        };
        
        const onTrackUnsubscribed = (track: Track) => {
          if (track.kind === Track.Kind.Video && videoTrack === track) {
            setVideoTrack(null);
          } else if (track.kind === Track.Kind.Audio && audioTrack === track) {
            setAudioTrack(null);
          }
        };
        
        const onMuteChanged = () => {
          const micPub = remoteParticipant.getTrack(Track.Source.Microphone);
          if (micPub) {
            setParticipantIsMuted(!micPub.isEnabled);
          }
        };
        
        remoteParticipant.on('trackSubscribed', onTrackSubscribed);
        remoteParticipant.on('trackUnsubscribed', onTrackUnsubscribed);
        remoteParticipant.on('trackMuted', onMuteChanged);
        remoteParticipant.on('trackUnmuted', onMuteChanged);
        
        return () => {
          remoteParticipant.off('trackSubscribed', onTrackSubscribed);
          remoteParticipant.off('trackUnsubscribed', onTrackUnsubscribed);
          remoteParticipant.off('trackMuted', onMuteChanged);
          remoteParticipant.off('trackUnmuted', onMuteChanged);
        };
      }
    };
    
    setupTracks();
    
    return () => {
      // Cleanup function
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      if (audioRef.current) {
        audioRef.current.srcObject = null;
      }
    };
  }, [participant, isLocal, videoTrack, audioTrack]);
  
  // Attach video track to video element when available
  useEffect(() => {
    if (videoTrack && videoRef.current) {
      videoTrack.attach(videoRef.current);
      return () => {
        videoTrack.detach(videoRef.current!);
      };
    }
  }, [videoTrack]);
  
  // Attach audio track to audio element when available
  useEffect(() => {
    if (audioTrack && audioRef.current) {
      audioTrack.attach(audioRef.current);
      return () => {
        audioTrack.detach(audioRef.current!);
      };
    }
  }, [audioTrack]);
  
  // Determine if video is available and enabled
  const hasVideo = videoTrack && (isLocal ? participantVideoEnabled : true);
  
  return (
    <div className="flex flex-col p-4 bg-muted rounded-lg overflow-hidden relative">
      <div className="relative w-full h-52 md:h-64 lg:h-80 bg-background rounded-md overflow-hidden">
        {hasVideo ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal} // Local preview should be muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-accent">
            <Avatar className="h-24 w-24">
              <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(participant.identity)}&background=random`} />
              <AvatarFallback>{fallbackAvatar}</AvatarFallback>
            </Avatar>
          </div>
        )}
        
        {participantIsMuted && (
          <div className="absolute bottom-2 right-2 bg-background/80 rounded-full p-1">
            <MicOff size={16} className="text-destructive" />
          </div>
        )}
      </div>
      
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback>{fallbackAvatar}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">
            {participant.identity} {isLocal && "(You)"}
          </span>
        </div>
      </div>
      
      {/* Hidden audio element for remote participants */}
      {!isLocal && (
        <audio ref={audioRef} autoPlay playsInline />
      )}
    </div>
  );
}
