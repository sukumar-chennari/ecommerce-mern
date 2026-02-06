import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api",
    credentials: "include", // 🔥 IMPORTANT (cookies)
  }),
  tagTypes: [
    "Auth",
    "Product",
    "Cart",
    "Order",
    "Admin",
    "Analytics",
    "Wishlist",
  ],
  endpoints: () => ({}),
});


// const baseQueryWithReauth = async (
//   args: any,
//   api: any,
//   extraOptions: any
// ) => {
//   // 1️⃣ Make the original request
//   let result = await baseQuery(args, api, extraOptions);

//   // 2️⃣ If access token expired
//   if (result.error && result.error.status === 401) {
//     // 3️⃣ Try refreshing token
//     const refreshResult = await baseQuery(
//       {
//         url: "/auth/refresh",
//         method: "POST",
//       },
//       api,
//       extraOptions
//     );

//     // 4️⃣ If refresh succeeded → retry original request
//     if (refreshResult.data) {
//       result = await baseQuery(args, api, extraOptions);
//     } else {
//       // 5️⃣ Refresh failed → logout user
//       api.dispatch(clearUser());
//     }
//   }

//   return result;
// };