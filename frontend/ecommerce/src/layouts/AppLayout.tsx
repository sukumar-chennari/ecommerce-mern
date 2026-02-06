import Navbar from "../components/layout/Navbar";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background text-textPrimary">
      <Navbar />
      <main className="pt-16 px-6">{children}</main>
    </div>
  );
};

export default AppLayout;