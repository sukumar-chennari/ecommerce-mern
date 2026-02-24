import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

const MainLayout = () => {
    return (
        <div className="min-h-screen bg-background text-textPrimary flex flex-col">

            {/* Navbar */}
            <Navbar />

            {/* Main Content */}
            <main className="flex-1 pt-20">
                <div className="max-w-7xl mx-auto px-6 py-10">
                    <Outlet />
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t mt-16 py-6 text-center text-sm text-textMuted">
                © {new Date().getFullYear()} E-Commerce. All rights reserved.
            </footer>

        </div>
    );
};

export default MainLayout;