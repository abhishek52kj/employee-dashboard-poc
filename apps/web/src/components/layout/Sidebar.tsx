import { useState } from "react"
import { NavLink } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
    LayoutDashboard,
    Users,
    Settings,
    ChevronRight,
    Menu,
    X,
    LogOut,
    PieChart,
    Briefcase,
    FileText,
    Calendar
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SidebarProps {
    isOpen: boolean
    setIsOpen: (open: boolean) => void
}

const menuItems = [
    {
        title: "Dashboard",
        icon: LayoutDashboard,
        href: "/",
    },
    {
        title: "Employees",
        icon: Users,
        href: "/employees",
        submenu: [
            { title: "All Employees", href: "/employees" },
            { title: "Departments", href: "/employees/departments" },
            { title: "Attendance", href: "/employees/attendance" },
        ]
    },
    {
        title: "Analytics",
        icon: PieChart,
        href: "/analytics",
    },
    {
        title: "Activity Logs",
        icon: FileText,
        href: "/activity-logs",
    },
    {
        title: "Leaves",
        icon: Calendar,
        href: "/leaves",
    },
    {
        title: "Organization",
        icon: Briefcase,
        href: "/organization",
        submenu: [
            { title: "Structure", href: "/organization/structure" },
            { title: "Policies", href: "/organization/policies" },
        ]
    },
    {
        title: "Settings",
        icon: Settings,
        href: "/settings",
    },
]

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
    const [expandedMenus, setExpandedMenus] = useState<string[]>([])

    const toggleSubmenu = (title: string) => {
        setExpandedMenus(prev =>
            prev.includes(title)
                ? prev.filter(t => t !== title)
                : [...prev, title]
        )
    }

    const sidebarVariants = {
        open: { width: 280 },
        closed: { width: 80 },
    }

    return (
        <motion.div
            initial="open"
            animate={isOpen ? "open" : "closed"}
            variants={sidebarVariants}
            className={cn(
                "h-screen bg-card border-r border-border flex flex-col z-40 relative transition-all duration-300 ease-in-out",
                !isOpen && "items-center"
            )}
        >
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-border w-full">
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent truncate"
                        >
                            EmpDash
                        </motion.div>
                    )}
                </AnimatePresence>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(!isOpen)}
                    className="shrink-0"
                >
                    {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
            </div>

            {/* User Profile (Compact) */}
            <div className={cn("p-4 border-b border-border", !isOpen && "flex justify-center")}>
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex flex-col overflow-hidden"
                        >
                            <span className="text-sm font-medium truncate">Admin User</span>
                            <span className="text-xs text-muted-foreground truncate">admin@company.com</span>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 py-4">
                <nav className="space-y-1 px-2">
                    {menuItems.map((item) => (
                        <div key={item.title}>
                            {item.submenu ? (
                                // Menu with Submenu
                                <div className="space-y-1">
                                    <Button
                                        variant="ghost"
                                        className={cn(
                                            "w-full justify-between hover:bg-accent hover:text-accent-foreground",
                                            !isOpen && "justify-center px-2"
                                        )}
                                        onClick={() => isOpen && toggleSubmenu(item.title)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon className="h-5 w-5 shrink-0" />
                                            {isOpen && <span>{item.title}</span>}
                                        </div>
                                        {isOpen && (
                                            <ChevronRight
                                                className={cn(
                                                    "h-4 w-4 transition-transform duration-200",
                                                    expandedMenus.includes(item.title) && "rotate-90"
                                                )}
                                            />
                                        )}
                                    </Button>

                                    {/* Submenu Items */}
                                    <AnimatePresence>
                                        {isOpen && expandedMenus.includes(item.title) && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden pl-10 space-y-1"
                                            >
                                                {item.submenu.map((sub) => (
                                                    <NavLink
                                                        key={sub.title}
                                                        to={sub.href}
                                                        className={({ isActive }) => cn(
                                                            "block py-2 text-sm text-muted-foreground hover:text-primary transition-colors",
                                                            isActive && "text-primary font-medium"
                                                        )}
                                                    >
                                                        {sub.title}
                                                    </NavLink>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                // Single Menu Item
                                <NavLink
                                    to={item.href}
                                    className={({ isActive }) => cn(
                                        "flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                                        isActive && "bg-accent text-accent-foreground",
                                        !isOpen && "justify-center px-2"
                                    )}
                                >
                                    <item.icon className="h-5 w-5 shrink-0" />
                                    {isOpen && <span>{item.title}</span>}
                                </NavLink>
                            )}
                        </div>
                    ))}
                </nav>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t border-border">
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10",
                        !isOpen && "justify-center px-2"
                    )}
                >
                    <LogOut className="h-5 w-5 shrink-0" />
                    {isOpen && <span className="ml-3">Logout</span>}
                </Button>
            </div>
        </motion.div>
    )
}
