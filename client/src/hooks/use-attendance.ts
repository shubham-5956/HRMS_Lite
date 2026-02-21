import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type AttendanceInput } from "@shared/routes";

export function useAttendance(filters?: { date?: string; employeeId?: number }) {
  return useQuery({
    queryKey: [api.attendance.list.path, filters],
    queryFn: async () => {
      const url = new URL(api.attendance.list.path, window.location.origin);
      if (filters?.date) url.searchParams.set("date", filters.date);
      if (filters?.employeeId) url.searchParams.set("employeeId", String(filters.employeeId));
      
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch attendance records");
      return api.attendance.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AttendanceInput) => {
      const res = await fetch(api.attendance.create.path, {
        method: api.attendance.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.attendance.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        if (res.status === 409) {
          const error = await res.json();
          throw new Error(error.message);
        }
        throw new Error("Failed to mark attendance");
      }
      return api.attendance.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.attendance.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.summary.path] });
    },
  });
}
