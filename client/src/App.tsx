import { Switch, Route } from "wouter";
import { useUser } from "./hooks/use-user";
import { useWebSocket } from "./hooks/use-websocket";
import { Loader2 } from "lucide-react";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectsPage from "./pages/ProjectsPage";
import TeamsPage from "./pages/TeamsPage";
import UsersPage from "./pages/UsersPage";
import Navbar from "./components/Navbar";

function App() {
  const { user, isLoading } = useUser();
  useWebSocket(user);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <main className="container mx-auto px-4 py-8">
        <Switch>
          <Route path="/" component={DashboardPage} />
          <Route path="/projects" component={ProjectsPage} />
          <Route path="/teams" component={TeamsPage} />
          <Route path="/users" component={UsersPage} />
        </Switch>
      </main>
    </div>
  );
}

export default App;
