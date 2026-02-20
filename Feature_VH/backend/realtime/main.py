"""
FastAPI Real-time Server for WebSocket Chat and WebRTC Signaling.
Run separately: uvicorn realtime.main:app --port 8001 --reload
"""
import os
import sys
import json
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware

# Set up Django integration for DB access
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

import jwt
from django.conf import settings as django_settings
from api.models import User, ChatMessage, Appointment

from .manager import chat_manager, signal_manager

app = FastAPI(title="Virtual Hospital Realtime", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def verify_token(token: str) -> Optional[User]:
    """Verify JWT token and return user."""
    try:
        from rest_framework_simplejwt.tokens import AccessToken
        access_token = AccessToken(token)
        user_id = access_token['user_id']
        return User.objects.get(id=user_id)
    except Exception:
        return None


# ─── WebSocket Chat ───────────────────────────────────────────────────────────

@app.websocket("/ws/chat/{appointment_id}")
async def websocket_chat(websocket: WebSocket, appointment_id: int, token: str = Query(...)):
    """Real-time chat for a consultation room."""
    user = verify_token(token)
    if not user:
        await websocket.close(code=4001, reason="Invalid token")
        return

    room_id = f"chat_{appointment_id}"
    await chat_manager.connect(websocket, room_id)

    try:
        # Send join notification
        await chat_manager.broadcast({
            "type": "system",
            "message": f"{user.get_full_name()} joined the chat",
            "timestamp": datetime.now().strftime("%I:%M %p"),
        }, room_id)

        while True:
            data = await websocket.receive_json()
            message_text = data.get("message", "")

            if not message_text.strip():
                continue

            # Persist to database
            try:
                chat_msg = ChatMessage.objects.create(
                    appointment_id=appointment_id,
                    sender=user,
                    message=message_text,
                )
                timestamp = chat_msg.timestamp.strftime("%I:%M %p")
            except Exception:
                timestamp = datetime.now().strftime("%I:%M %p")

            # Broadcast to room (including sender for confirmation)
            broadcast_data = {
                "type": "chat",
                "sender": user.get_full_name() or user.username,
                "sender_role": user.role,
                "sender_id": user.id,
                "message": message_text,
                "timestamp": timestamp,
            }

            # Send to all in room
            for connection in chat_manager.active_connections.get(room_id, set()):
                try:
                    await connection.send_json(broadcast_data)
                except Exception:
                    pass

    except WebSocketDisconnect:
        chat_manager.disconnect(websocket, room_id)
        await chat_manager.broadcast({
            "type": "system",
            "message": f"{user.get_full_name()} left the chat",
            "timestamp": datetime.now().strftime("%I:%M %p"),
        }, room_id)
    except Exception:
        chat_manager.disconnect(websocket, room_id)


# ─── WebSocket WebRTC Signaling ───────────────────────────────────────────────

@app.websocket("/ws/signal/{appointment_id}")
async def websocket_signal(websocket: WebSocket, appointment_id: int, token: str = Query(...)):
    """WebRTC signaling relay for video calls."""
    user = verify_token(token)
    if not user:
        await websocket.close(code=4001, reason="Invalid token")
        return

    room_id = f"signal_{appointment_id}"
    await signal_manager.connect(websocket, room_id)

    try:
        # Notify others that a peer joined
        await signal_manager.broadcast({
            "type": "peer-joined",
            "user_id": user.id,
            "user_name": user.get_full_name(),
            "role": user.role,
            "peer_count": signal_manager.get_room_count(room_id),
        }, room_id, exclude=websocket)

        while True:
            data = await websocket.receive_json()
            signal_type = data.get("type", "")

            # Relay signaling messages to other peers
            if signal_type in ("offer", "answer", "ice-candidate"):
                relay_data = {
                    **data,
                    "from_user_id": user.id,
                    "from_user_name": user.get_full_name(),
                }
                await signal_manager.broadcast(relay_data, room_id, exclude=websocket)

            elif signal_type == "call-ended":
                await signal_manager.broadcast({
                    "type": "call-ended",
                    "user_id": user.id,
                    "user_name": user.get_full_name(),
                }, room_id, exclude=websocket)

    except WebSocketDisconnect:
        signal_manager.disconnect(websocket, room_id)
        await signal_manager.broadcast({
            "type": "peer-left",
            "user_id": user.id,
            "user_name": user.get_full_name(),
            "peer_count": signal_manager.get_room_count(room_id),
        }, room_id)
    except Exception:
        signal_manager.disconnect(websocket, room_id)


# ─── Health Check ─────────────────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "Virtual Hospital Realtime",
        "chat_rooms": len(chat_manager.active_connections),
        "signal_rooms": len(signal_manager.active_connections),
    }
