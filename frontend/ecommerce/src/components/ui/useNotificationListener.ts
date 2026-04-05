import { useEffect } from "react";
import { socket } from "../../socket";
import toast from "react-hot-toast";

export const useNotificationListener = () => {
    useEffect(() => {
        socket.on("new_notification", (data) => {
            console.log("📢 New notification:", data);


            // toast.custom((t) => (
            //     <div className="bg-white shadow-lg rounded-xl p-4 border">
            //         <p className="font-semibold">{data.title}</p>
            //         <p className="text-sm text-gray-600">{data.message}</p>
            //     </div>
            // ));

            toast.success(
                `${data.title}\n${data.message}`,
                {
                    duration: 5000,
                    style: {
                        borderRadius: "10px",
                        background: "#333",
                        color: "#fff",
                    },
                }
            );
        });

        return () => {
            socket.off("new_notification");
        };
    }, []);
};