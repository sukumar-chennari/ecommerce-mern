import cron from "node-cron";
import { releaseExpiredStock } from "./stockRelease.job";

export const initCronJobs = () => {
    cron.schedule("*/5 * * * *", async () => {
        console.log("🕒 Running stock release job...");
        await releaseExpiredStock();
    });
};