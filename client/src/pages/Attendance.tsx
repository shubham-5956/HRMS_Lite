import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEmployees } from "@/hooks/use-employees";
import { useAttendance, useCreateAttendance } from "@/hooks/use-attendance";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Attendance() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [status, setStatus] = useState<"Present" | "Absent">("Present");
  
  const formattedDate = date ? format(date, "yyyy-MM-dd") : undefined;
  
  const { data: employees } = useEmployees();
  const { data: attendance, isLoading } = useAttendance({ date: formattedDate });
  const createAttendance = useCreateAttendance();
  const { toast } = useToast();

  const handleMarkAttendance = () => {
    if (!date || !selectedEmployee) return;

    createAttendance.mutate(
      {
        employeeId: parseInt(selectedEmployee),
        date: format(date, "yyyy-MM-dd"),
        status,
      },
      {
        onSuccess: () => {
          toast({ title: "Success", description: "Attendance marked successfully" });
          setSelectedEmployee("");
        },
        onError: (error) => {
          toast({ 
            title: "Error", 
            description: error.message, 
            variant: "destructive" 
          });
        },
      }
    );
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Attendance</h1>
        <p className="text-slate-500">Track and manage daily attendance records.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Mark Attendance Form */}
        <div className="space-y-6">
          <Card className="rounded-2xl border-slate-100 shadow-md">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-lg">Mark Attendance</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Select Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal h-11 rounded-xl border-slate-200",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Select Employee</label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger className="w-full h-11 rounded-xl border-slate-200">
                    <SelectValue placeholder="Choose employee..." />
                  </SelectTrigger>
                  <SelectContent>
                    {employees?.map((emp) => (
                      <SelectItem key={emp.id} value={String(emp.id)}>
                        {emp.fullName} ({emp.employeeId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Status</label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setStatus("Present")}
                    className={`cursor-pointer border rounded-xl p-3 flex items-center justify-center gap-2 transition-all ${
                      status === "Present"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700 ring-2 ring-emerald-500/20"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <CheckCircle2 className={`w-5 h-5 ${status === "Present" ? "fill-emerald-200" : ""}`} />
                    <span className="font-medium">Present</span>
                  </div>
                  <div
                    onClick={() => setStatus("Absent")}
                    className={`cursor-pointer border rounded-xl p-3 flex items-center justify-center gap-2 transition-all ${
                      status === "Absent"
                        ? "bg-rose-50 border-rose-200 text-rose-700 ring-2 ring-rose-500/20"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <XCircle className={`w-5 h-5 ${status === "Absent" ? "fill-rose-200" : ""}`} />
                    <span className="font-medium">Absent</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleMarkAttendance}
                className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white mt-4"
                disabled={!date || !selectedEmployee || createAttendance.isPending}
              >
                {createAttendance.isPending ? "Marking..." : "Mark Attendance"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Attendance List */}
        <div className="lg:col-span-2">
          <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                Records for {date ? format(date, "MMMM do, yyyy") : "Selected Date"}
              </CardTitle>
              <Badge variant="outline" className="bg-white">
                {attendance?.length || 0} Records
              </Badge>
            </CardHeader>
            <div className="flex-1 overflow-auto p-0">
              {isLoading ? (
                <div className="p-12 text-center text-slate-500">Loading records...</div>
              ) : !attendance || attendance.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <CalendarIcon className="w-8 h-8 text-slate-300" />
                  </div>
                  <p>No attendance records found for this date.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {attendance.map((record) => (
                    <div key={record.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                          record.status === 'Present' 
                            ? 'bg-emerald-100 text-emerald-600' 
                            : 'bg-rose-100 text-rose-600'
                        }`}>
                          {record.employee?.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{record.employee?.fullName}</p>
                          <p className="text-xs text-slate-500 font-mono">{record.employee?.employeeId}</p>
                        </div>
                      </div>
                      <Badge className={
                        record.status === 'Present' 
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-transparent shadow-none" 
                          : "bg-rose-100 text-rose-700 hover:bg-rose-200 border-transparent shadow-none"
                      }>
                        {record.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
