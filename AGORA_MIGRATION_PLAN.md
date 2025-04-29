
# LiveKit to Agora Migration Plan

This document outlines the plan for migrating from LiveKit to Agora SDK for our audio room functionality.

## Overview of Changes

| LiveKit Component | Agora Equivalent | Migration Notes |
|------------------|------------------|----------------|
| Room | Channel | Agora uses "channels" instead of "rooms" |
| Participant | Remote User | Agora identifies remote users by uid |
| LocalParticipant | Local Client | Agora has a client object for the local user |
| Track | LocalTrack/RemoteTrack | Agora separates audio/video tracks by local/remote |
| Room.connect() | client.join() | Different parameters required |
| Token generation | Agora Token Builder | Different security parameters |
| Room events | Agora events | Different event model and naming |

## Affected Components

1. **Token Generation (Edge Function)**
   - Replace LiveKit token generation with Agora token generation
   - Update parameters from room/user to channel/uid

2. **Room Controls**
   - Update audio mute/unmute with Agora equivalents
   - Implement custom hand-raising with Agora RTM

3. **Room Page**
   - Add Agora client initialization
   - Implement channel joining logic
   - Update participant tracking

4. **Participant List**
   - Update to use Agora user tracking instead of LiveKit participants

5. **Room Chat**
   - Consider using Agora RTM for chat functionality

## Implementation Steps

1. Add Agora SDK dependency
   ```
   npm install agora-rtc-sdk-ng
   ```

2. Create AgoraContext for managing the client instance

3. Implement token generation with Agora Token Builder

4. Update RoomPage with Agora initialization and channel joining

5. Update UI components to use Agora methods and events

6. Test and verify functionality

## API Differences

### Initialization
```javascript
// LiveKit
const room = new Room();

// Agora
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
```

### Joining a Room/Channel
```javascript
// LiveKit
await room.connect(url, token);

// Agora
await client.join(appId, channelName, token, uid);
```

### Audio Control
```javascript
// LiveKit
await localParticipant.setMicrophoneEnabled(enabled);

// Agora
await localAudioTrack.setEnabled(enabled);
```

### Leaving
```javascript
// LiveKit
room.disconnect();

// Agora
client.leave();
```

## Environment Variables

The following environment variables will need to be updated:

- Replace `LIVEKIT_API_KEY` with `AGORA_APP_ID`
- Replace `LIVEKIT_API_SECRET` with `AGORA_APP_CERTIFICATE`

## Testing Strategy

1. Test token generation
2. Test joining/leaving channels
3. Test audio transmission
4. Test mute/unmute functionality
5. Test participant listing
6. Test room creation and management
