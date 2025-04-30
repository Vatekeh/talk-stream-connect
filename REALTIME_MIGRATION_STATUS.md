
# LiveKit to Agora Migration Status

This document outlines the migration progress from LiveKit to Agora SDK for our audio room functionality.

## Migration Checklist

- [x] Install required Agora packages (agora-rtc-sdk-ng, agora-rtc-react)
- [x] Create new Agora token generator edge function
- [x] Update Supabase config.toml for new edge function
- [x] Implement AgoraContext for managing client connections
- [x] Update App.tsx with AgoraRTCProvider
- [x] Refactor RoomControls component to use Agora
- [x] Refactor RoomPage to use Agora
- [ ] Configure Agora secrets in Supabase
- [ ] Test end-to-end functionality
- [ ] Remove LiveKit dependencies
- [ ] Update tests to use Agora

## Why Agora v4.x?

We chose Agora's latest SDK (v4.x) for our migration for several key benefits:

1. **Smaller bundle size**: Agora's SDK is more lightweight than LiveKit
2. **Simpler React hooks API**: Easier integration with our React components
3. **Continued support**: Agora has strong enterprise support and regular updates
4. **Better scalability**: Supports larger rooms with more participants

## Component Mapping

| LiveKit Component | Agora Equivalent | Implementation Status |
|------------------|------------------|----------------------|
| Room | AgoraRTCClient | ✅ Implemented |
| Participant | RemoteUser | ✅ Implemented |
| LocalParticipant | LocalUser | ✅ Implemented |
| Track | LocalTrack/RemoteTrack | ✅ Implemented |
| Room.connect() | client.join() | ✅ Implemented |
| Token generation | RtcTokenBuilder | ✅ Implemented |
| Room events | Agora events | ✅ Implemented |

## Next Steps

1. Configure the Agora App ID and App Certificate as secrets in Supabase
2. Test the token generation and audio functionality
3. Update any remaining LiveKit references in the codebase
4. Remove the LiveKit token generation function once migration is complete
