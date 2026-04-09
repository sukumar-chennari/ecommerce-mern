import { useEffect, useRef } from "react";
import { socket } from "../../socket";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";

export const useNotificationListener = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const joinedRoom = useRef<string | null>(null);

    useEffect(() => {
        if (!user?._id) {
            // No user — disconnect socket if connected
            if (socket.connected) {
                console.log("🔌 No user, disconnecting socket");
                socket.disconnect();
            }
            joinedRoom.current = null;
            return;
        }

        const userId = String(user._id);

        // ── Helper: join room + register listener ──
        const joinAndListen = () => {
            console.log("🔌 Emitting join for room:", userId);
            socket.emit("join", userId);
            joinedRoom.current = userId;
        };

        // ── Notification handler ──
        const onNotification = (data: any) => {
            console.log("📢 Received new_notification:", data);
            toast.success(data.title || "New notification", {
                duration: 5000,
            });
        };

        // ── Connect handler (fires on initial connect AND reconnect) ──
        const onConnect = () => {
            console.log("✅ Socket connected in listener hook, id:", socket.id);
            // Re-join room on every connect/reconnect
            joinAndListen();
        };

        // Register listeners BEFORE connecting — this prevents the race condition
        socket.on("new_notification", onNotification);
        socket.on("connect", onConnect);

        // Connect if not already connected
        if (!socket.connected) {
            console.log("🔌 Connecting socket...");
            socket.connect();
        } else {
            // Already connected — join immediately
            joinAndListen();
        }

        // ── Cleanup ──
        return () => {
            console.log("🧹 Cleaning up notification listener");
            socket.off("new_notification", onNotification);
            socket.off("connect", onConnect);
        };
    }, [user?._id]);
};