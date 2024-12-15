import { Link } from "wouter";
import { Clock, Users, FolderKanban, UserCircle, Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import type { User } from "@db/schema";

interface NavbarProps {
  user: User;
}

export default function Navbar({ user }: NavbarProps) {
  const { logout } = useUser();

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/">
              <a className="flex items-center space-x-2">
                <Clock className="h-6 w-6" />
                <span className="font-bold">TimeTrack</span>
              </a>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link href="/">
                <a className="flex items-center space-x-1 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>Dashboard</span>
                </a>
              </Link>
              <Link href="/projects">
                <a className="flex items-center space-x-1 text-sm">
                  <FolderKanban className="h-4 w-4" />
                  <span>Projects</span>
                </a>
              </Link>
              <Link href="/teams">
                <a className="flex items-center space-x-1 text-sm">
                  <Users className="h-4 w-4" />
                  <span>Teams</span>
                </a>
              </Link>
              {user.isAdmin && (
                <Link href="/users">
                  <a className="flex items-center space-x-1 text-sm">
                    <UserCircle className="h-4 w-4" />
                    <span>Users</span>
                  </a>
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>No new notifications</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <UserCircle className="h-5 w-5" />
                  <span>{user.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => logout()}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
