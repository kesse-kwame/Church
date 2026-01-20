import React from 'react'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar"
import { 
    LayoutDashboard, 
    Users, 
    CalendarCheck, 
    CircleDollarSign, 
    CalendarDays, 
    Briefcase, 
    Settings, 
    LogOut 
} from "lucide-react";
import { Button } from '@/components/ui/button';

// Updated items to match PDF categories 
const items = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Membership", url: "/membership", icon: Users },
    { title: "Attendance", url: "/attendance", icon: CalendarCheck },
    { title: "Finances", url: "/finances", icon: CircleDollarSign },
    { title: "Programs & Events", url: "/events", icon: CalendarDays },
    { title: "Staff & Payroll", url: "/staff", icon: Briefcase },
]

export function AppSidebar() {
    return (
    <Sidebar className="border-r border-gray-300">
        <SidebarHeader>
        </SidebarHeader>

        <SidebarContent className="bg-gray-200">
            <SidebarGroup>
                <SidebarGroupContent>
                    <SidebarMenu className='px-2'>
                        {items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton 
                                    asChild 
                                    className="w-full flex items-center gap-3 px-4 py-6 rounded-lg font-medium transition-colors hover:bg-gray-50 text-gray-600"
                                >
                                    <a href={item.url}>
                                        <item.icon className='h-5 w-5 text-gray-400 group-hover:text-black-600' />
                                        <span className="text-sm">{item.title}</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </SidebarContent>

        {/* Sidebar Footer matching Settings and Log Out [cite: 18-19] */}
        <SidebarFooter className="p-4 border-t border-gray-100 bg-gray-200">
            <SidebarMenu >
                <SidebarMenuItem>
                    <SidebarMenuButton asChild className="text-gray-600 hover:bg-gray-50">
                        <a href="/settings" className="flex items-center gap-3 px-4 py-2">
                            <Settings className="h-5 w-5 text-gray-400" />
                            <span className="text-sm font-medium">Settings</span>
                        </a>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild className="text-red-400 hover:text-red-500 bg-transparent">
                        <Button className="flex items-center gap-1 px-2 py-2 text-left">
                            <LogOut className="h-5 w-5" />
                            <span className="text-sm font-medium">Log Out</span>
                        </Button>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
    </Sidebar>
    )
}