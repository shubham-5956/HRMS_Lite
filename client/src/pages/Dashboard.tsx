import { useDashboardSummary } from "@/hooks/use-dashboard";
import { Users, UserCheck, UserX, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export default function Dashboard() {
  const { data, isLoading } = useDashboardSummary();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 rounded-2xl bg-slate-200 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    {
      label: "Total Employees",
      value: data.totalEmployees,
      icon: Users,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Present Today",
      value: data.presentToday,
      icon: UserCheck,
      color: "bg-emerald-500",
      textColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      label: "Absent Today",
      value: data.absentToday,
      icon: UserX,
      color: "bg-rose-500",
      textColor: "text-rose-600",
      bgColor: "bg-rose-50",
    },
  ];

  const chartData = [
    { name: "Present", value: data.presentToday, color: "#10b981" },
    { name: "Absent", value: data.absentToday, color: "#f43f5e" },
    { name: "Not Marked", value: Math.max(0, data.totalEmployees - data.presentToday - data.absentToday), color: "#e2e8f0" },
  ];

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Overview of your organization's daily metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between z-10 relative">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-3xl font-bold mt-2 text-slate-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.textColor} transition-transform group-hover:scale-110 duration-300`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            {/* Background decoration */}
            <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-5 ${stat.color} blur-2xl transition-opacity group-hover:opacity-10`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-slate-500" />
              Attendance Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 h-[300px]">
            {data.totalEmployees === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
            <p className="text-blue-100 mb-8 max-w-sm">
              Manage your workforce efficiently. Add new employees or mark daily attendance directly from here.
            </p>
            <div className="flex gap-4">
              <a href="/attendance" className="bg-white text-blue-600 px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg shadow-black/10">
                Mark Attendance
              </a>
              <a href="/employees" className="bg-blue-500/30 text-white border border-white/20 px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-500/40 transition-colors backdrop-blur-sm">
                Add Employee
              </a>
            </div>
          </div>
          
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-indigo-500/30 blur-3xl" />
        </div>
      </div>
    </>
  );
}
