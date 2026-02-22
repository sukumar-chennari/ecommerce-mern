import { api } from "../../app/api";

import type { ApiResponse } from "../products/productApi";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<{ user: any }, { email: string; password: string }>(
      {
        query: (body) => ({
          url: "/auth/login",
          method: "POST",
          body,
        }),
        transformResponse: (response: ApiResponse<{ user: any }>) => response.data,
        invalidatesTags: ["Auth"],
      }
    ),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),

    getMe: builder.query<{ user: any }, void>({
      query: () => "/auth/me",
      transformResponse: (response: ApiResponse<{ user: any }>) => response.data,
      providesTags: ["Auth"],
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useGetMeQuery } = authApi;
