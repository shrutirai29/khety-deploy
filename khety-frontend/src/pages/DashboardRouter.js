import DashboardFarmer from "./DashboardFarmer";
import DashboardOwner from "./DashboardOwner";

function DashboardRouter() {
  const user = JSON.parse(sessionStorage.getItem("user"));

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-xl">Please login first</h1>
      </div>
    );
  }

  // 🔥 ROLE CHECK
  if (user.role === "owner") {
    return <DashboardOwner />;
  } else {
    return <DashboardFarmer />;
  }
}

export default DashboardRouter;
