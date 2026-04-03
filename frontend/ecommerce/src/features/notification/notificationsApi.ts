import { api } from "../../app/api";

import type { ApiResponse } from "../products/productApi";

export const notificationApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getNotifications: builder.query<any[], void>({
            query: () => "/notifications",
            transformResponse: (res: ApiResponse<{ notifications: any[] }>) =>
                res.data.notifications,
            providesTags: ["Notifications"],
        }),

        markAsRead: builder.mutation<void, string>({
            query: (id) => ({
                url: `/notifications/${id}/read`,
                method: "PATCH",
            }),
            invalidatesTags: ["Notifications"],
        }),
    }),
});

export const {
    useGetNotificationsQuery,
    useMarkAsReadMutation,
} = notificationApi;