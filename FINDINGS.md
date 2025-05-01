# Findings and Fix for Room Switching Functionality

## Issue Identified

After examining the codebase and testing the application, I identified an issue with the `switchRoom` functionality. The server was emitting the `ROOM_SWITCHED` event with just the roomId as a string:

```typescript
socket.emit(SocketEvent.ROOM_SWITCHED, roomId);
```

But the client was expecting an object with a roomId property:

```typescript
const handleRoomSwitched = ({ roomId }: { roomId: string }) => {
  setState((prev) => ({
    ...prev,
    currentRoomId: roomId,
  }));
};
```

This mismatch in the payload format was causing the `currentRoomId` to remain `null` after the server responded to a `SWITCH_ROOM` event.

## Fix Implemented

I fixed the issue by updating the `handleRoomSwitched` function in the client SDK to handle both formats:

```typescript
const handleRoomSwitched = (data: any) => {
  // Handle both formats: { roomId } and just roomId as a string
  const roomId = typeof data === 'object' ? data.roomId : data;
  
  if (roomId) {
    setState((prev) => ({
      ...prev,
      currentRoomId: roomId,
      user: prev.user ? { ...prev.user, currentRoomId: roomId } : null,
    }));
  }
};
```

This change ensures that the client can handle both formats of the payload:
1. If the server sends an object with a `roomId` property: `{ roomId: "123" }`
2. If the server sends just the roomId as a string: `"123"`

I also updated the `IUser` interface in the types file to include the `currentRoomId` property:

```typescript
export interface IUser {
  id: string;
  type: 'user' | 'agent' | 'guest' | 'anonymous';
  username?: string;
  status?: UserStatus;
  currentRoomId?: string | null;
}
```

This ensures that TypeScript correctly recognizes the `currentRoomId` property on the user object.

## Benefits of the Fix

1. **Backward Compatibility**: The fix maintains backward compatibility with existing code that might be using either format.
2. **Robustness**: The client can now handle both formats of the payload, making it more robust.
3. **Type Safety**: The updated `IUser` interface ensures that TypeScript correctly recognizes the `currentRoomId` property.
4. **Improved User Experience**: Users can now seamlessly switch between rooms without any issues.

## Root Cause Analysis

The root cause of the issue was a mismatch between how the server was emitting the `ROOM_SWITCHED` event and how the client was expecting to receive it. This is a common issue in socket.io applications, where the payload format needs to be consistent between the server and client.

The server was emitting:
```typescript
socket.emit(SocketEvent.ROOM_SWITCHED, roomId);
```

But the client was expecting:
```typescript
socket.on(SocketEvent.ROOM_SWITCHED, ({ roomId }) => { ... });
```

## Recommendations for Future Development

1. **Consistent Payload Format**: Ensure that the payload format is consistent between the server and client for all socket events.
2. **Type Safety**: Use TypeScript interfaces to define the expected payload format for each event.
3. **Documentation**: Document the expected payload format for each event to avoid similar issues in the future.
4. **Testing**: Add tests that verify the payload format for each event.
5. **Defensive Programming**: Write code that can handle different payload formats, especially in a distributed system where different components might be at different versions.

## Conclusion

By updating the `handleRoomSwitched` function to handle both formats of the payload, we've resolved the issue and enabled the room switching functionality to work as intended. This approach is more robust and maintains backward compatibility with existing code.
