import { useQuery } from "@tanstack/react-query";
import { Loader2, Pill } from "lucide-react";
import { getPrescribedMedications } from "@/api/patient";
import {useUser} from "@clerk/clerk-react"
const PrescribedMedications = () => {
  const { user, isLoaded } = useUser();
  const { data: medications, isLoading } = useQuery({
    queryKey: ["prescribed-medications",user?.id],
    queryFn: getPrescribedMedications(user.id),
    enabled: !!isLoaded && !!user?.id,
  });

  if (!isLoaded || isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  

  return (
    <div className="space-y-4">
      {medications?.length > 0 ? (
        medications.map((med) => (
          <div
            key={med._id}
            className="p-4 border rounded-lg bg-card text-card-foreground"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Pill className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{med.medicationName}</h3>
                <p className="text-sm text-muted-foreground">
                  {med.dosage} • {med.frequency}
                </p>
                {med.instructions && (
                  <p className="mt-1 text-sm">{med.instructions}</p>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(med.prescribedDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No prescribed medications found.
        </div>
      )}
    </div>
  );
};

export default PrescribedMedications;