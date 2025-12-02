import { Search, Bell } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./ThemeToggle"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export function Topbar() {
    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/60 px-6 backdrop-blur-xl transition-all">
            <div className="flex flex-1 items-center gap-4">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search employees, departments..."
                        className="w-full bg-background pl-9 md:w-[300px] lg:w-[400px] focus-visible:ring-primary"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-destructive text-[10px]">
                                3
                            </Badge>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer">
                            <div className="flex flex-col gap-1">
                                <span className="font-medium">New Employee Added</span>
                                <span className="text-xs text-muted-foreground">John Doe joined Engineering</span>
                            </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                            <div className="flex flex-col gap-1">
                                <span className="font-medium">System Update</span>
                                <span className="text-xs text-muted-foreground">Dashboard v2.0 is live!</span>
                            </div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <ThemeToggle />
            </div>
        </header>
    )
}
