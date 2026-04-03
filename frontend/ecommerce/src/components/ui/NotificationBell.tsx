import { useState } from "react";
import {
    useGetNotificationsQuery,
    useMarkAsReadMutation,
} from "../../features/notification/notificationsApi";

const NotificationBell = () => {
    const [open, setOpen] = useState(false);

    const { data = [] } = useGetNotificationsQuery();
    const [markAsRead] = useMarkAsReadMutation();

    console.log('opened this compnent on every cliked', data);
    const unreadCount = data.filter((n) => !n.read).length;

    return (
        <div className="relative">
            {/* 🔔 Bell */}
            <button onClick={() => setOpen(!open)} className="relative">
                🔔

                {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white shadow-xl rounded-xl p-3 space-y-2 z-50">
                    <h3 className="font-semibold">Notifications</h3>

                    {data.length === 0 && (
                        <p className="text-gray-500 text-sm">No notifications</p>
                    )}

                    {data.map((n) => (
                        <div
                            key={n._id}
                            className={`p-2 rounded-lg border cursor-pointer ${n.read ? "bg-gray-100" : "bg-blue-50"
                                }`}
                            onClick={() => markAsRead(n._id)}
                        >
                            <p className="font-medium text-sm">{n.title}</p>
                            <p className="text-xs text-gray-600">{n.message}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;