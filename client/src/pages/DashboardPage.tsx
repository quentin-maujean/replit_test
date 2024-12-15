import Timer from "@/components/Timer";
import WeeklyChart from "@/components/WeeklyChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import type { TimeEntry } from "@db/schema";
import { format, startOfMonth, endOfMonth } from "date-fns";

export default function DashboardPage() {
  const startDate = startOfMonth(new Date());
  const endDate = endOfMonth(new Date());

  const { data: timeEntries } = useQuery<(TimeEntry & { project: { name: string } | null })[]>({
    queryKey: ['/api/time-entries', { start: startDate.toISOString(), end: endDate.toISOString() }],
  });

  const totalHours = timeEntries?.reduce((acc, entry) => {
    if (!entry.endTime) return acc;
    const hours = (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime()) / (1000 * 60 * 60);
    return acc + hours;
  }, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Timer />
        
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Monthly Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {totalHours.toFixed(1)} hours
            </div>
            <p className="text-sm text-muted-foreground">
              {format(startDate, 'MMMM yyyy')}
            </p>
          </CardContent>
        </Card>
      </div>

      <WeeklyChart />

      <Card>
        <CardHeader>
          <CardTitle>Recent Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {timeEntries?.slice(0, 5).map((entry) => (
              <div key={entry.id} className="flex justify-between items-center p-2 hover:bg-secondary rounded">
                <div>
                  <p className="font-medium">{entry.project?.name}</p>
                  <p className="text-sm text-muted-foreground">{format(new Date(entry.startTime), 'PPp')}</p>
                </div>
                {entry.endTime && (
                  <p className="text-sm">
                    {((new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime()) / (1000 * 60 * 60)).toFixed(1)} hours
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
