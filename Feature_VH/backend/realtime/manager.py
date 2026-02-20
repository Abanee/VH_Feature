"""
WebSocket Connection Manager for chat rooms and signaling.
"""
from typing import Dict, List, Set
from fastapi import WebSocket
import json


class ConnectionManager:
    """Manages WebSocket connections per room (appointment_id)."""

    def __init__(self):
        # room_id -> set of active websockets
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: str):
        """Accept connection and add to room."""
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = set()
        self.active_connections[room_id].add(websocket)

    def disconnect(self, websocket: WebSocket, room_id: str):
        """Remove connection from room."""
        if room_id in self.active_connections:
            self.active_connections[room_id].discard(websocket)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    async def send_personal(self, message: dict, websocket: WebSocket):
        """Send message to a specific connection."""
        await websocket.send_json(message)

    async def broadcast(self, message: dict, room_id: str, exclude: WebSocket = None):
        """Broadcast message to all connections in a room."""
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                if connection != exclude:
                    try:
                        await connection.send_json(message)
                    except Exception:
                        pass

    def get_room_count(self, room_id: str) -> int:
        """Get number of active connections in a room."""
        return len(self.active_connections.get(room_id, set()))


# Global managers
chat_manager = ConnectionManager()
signal_manager = ConnectionManager()
