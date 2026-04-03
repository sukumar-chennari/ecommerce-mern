import { Response } from "express";
import Notification from "../models/Notification.model";
import { ApiResponse } from "../utils/response.util";

/**
 * Get all notifications for the current user
 */
export const getNotifications = async (req: any, res: Response): Promise<any> => {
    try {
        const notifications = await Notification.find({
            userId: req.userId,
        })
            .sort({ createdAt: -1 })
            .lean();

        return ApiResponse.success(res, "Notifications", { notifications });
    } catch (error) {
        return ApiResponse.error(res, "Server error", error);
    }
};

export const markNotificationRead = async (req: any, res: Response) => {
    const { id } = req.params;

    await Notification.findOneAndUpdate(
        { _id: id, userId: req.userId },
        { read: true }
    );

    return ApiResponse.success(res, "Marked as read");
};