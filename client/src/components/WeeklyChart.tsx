import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import type { TimeEntry } from "@db/schema";
import { startOfWeek, endOfWeek, format, differenceInHours } from "date-fns";

export default function WeeklyChart() {
  const startDate = startOfWeek(new Date());
  const endDate = endOfWeek(new Date());

  const { data: timeEntries } = useQuery<TimeEntry[]>({
    queryKey: ['/api/time-entries', { start: startDate.toISOString(), end: endDate.toISOString() }],
  });

  const chartData = useMemo(() => {
    if (!timeEntries) return [];

    const dailyHours = new Array(7).fill(0).map((_, index) => ({
      day: format(new Date(startDate.getTime() + index * 24 * 60 * 60 * 1000), 'EEE'),
      hours: 0,
    }));

    timeEntries.forEach(entry => {
      if (!entry.endTime) return;
      const dayIndex = new Date(entry.startTime).getDay();
      const hours = differenceInHours(new Date(entry.endTime), new Date(entry.startTime));
      dailyHours[dayIndex].hours += hours;
    });

    return dailyHours;
  }, [timeEntries, startDate]);

  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle>Weekly Hours</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="hours" fill="hsl(var(--primary))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
