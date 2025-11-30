import { useQuery } from "@tanstack/react-query";
import { Loader2, Calendar, Stethoscope } from "lucide-react";
import { getAppointmentHistory } from "@/api/patient";
import { format } from "date-fns";
import { useUser } from "@clerk/clerk-react";

const AppointmentHistory = () => {
  const {user}  = useUser();
  const { data: appointments, isLoading } = useQuery({
    queryKey: ["appointment-history",user.id],
    queryFn: getAppointmentHistory(user.id),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments?.length > 0 ? (
        <div className="space-y-2">
          {appointments.map((appointment) => (
            <div
              key={appointment._id}
              className="p-4 border rounded-lg bg-card text-card-foreground"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-medium">
                      {appointment.doctor?.name || "Doctor"}
                    </h3>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {format(new Date(appointment.date), "MMM d, yyyy")} •{" "}
                      {appointment.time}
                    </span>
                  </div>
                  {appointment.diagnosis && (
                    <div className="mt-2 text-sm">
                      <p className="font-medium">Diagnosis:</p>
                      <p className="text-muted-foreground">
                        {appointment.diagnosis}
                      </p>
                    </div>
                  )}
                  {appointment.notes && (
                    <div className="mt-2 text-sm">
                      <p className="font-medium">Notes:</p>
                      <p className="text-muted-foreground">
                        {appointment.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No appointment history found.
        </div>
      )}
    </div>
  );
};

export default AppointmentHistory;