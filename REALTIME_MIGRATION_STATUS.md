
# LiveKit to Agora Migration Status

This document outlines the migration progress from LiveKit to Agora SDK for our audio room functionality.

## Migration Checklist

- [x] Install required Agora packages (agora-rtc-sdk-ng, agora-rtc-react)
- [x] Create new Agora token generator edge function
- [x] Update Supabase config.toml for new edge function
- [x] Implement AgoraContext for managing client connections
- [x] Update App.tsx with AgoraProvider
- [x] Refactor RoomControls component to use Agora
- [x] Refactor RoomPage to use Agora
- [x] Fix TypeScript imports and build configuration
- [x] Configure Agora secrets in Supabase
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

## Important Notes

- The following Supabase secrets have been configured:
  - `AGORA_APP_ID` - Your Agora App ID
  - `AGORA_APP_CERTIFICATE` - Your Agora App Certificate

## Debugging Tips

If you encounter build issues:
1. Make sure Agora packages are properly installed
2. Check that Vite configuration includes proper handling of Agora packages
3. Verify that TypeScript types are properly imported
4. Test token generation by checking the Edge Function logs
