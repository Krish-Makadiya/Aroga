
import { useState } from "react";
import { FileText, Calendar, Pill } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PrescribedMedications from "../../../components/patient/PrescribedMedications";
import AppointmentHistory from "../../../components/patient/AppointmentHistory";
import PersonalMedicalRecords from "../../../components/patient/PersonalMedicalRecords";

const MedicalHistoryContent = () => {
  const [activeTab, setActiveTab] = useState("prescribed");

  const getTabTriggerClass = (tabName) => {
    const isActive = activeTab === tabName;

    const baseClasses = "flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl transition-all duration-200 border border-black/5 dark:border-white/5";    
    const activeColor = "bg-[var(--color-light-primary)] dark:bg-[var(--color-dark-primary)] text-white shadow-sm border-transparent";
    const inactiveColor = "bg-[var(--color-light-surface)] dark:bg-lime-600 text-[var(--color-light-secondary-text)] dark:text-white hover:bg-black/5 dark:hover:bg-white/5";

    return `${baseClasses} ${isActive ? activeColor : inactiveColor}`;
  };

  return (
    <div className="p-6 h-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)] mb-2">
          Medical History
        </h2>
        <p className="text-sm text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
          View and manage your medical records and history
        </p>
      </div>

      <div className="bg-[var(--color-light-surface)] dark:bg-[var(--color-dark-bg)] rounded-2xl p-6 shadow-sm border border-black/5 dark:border-white/5">
        <Tabs
          defaultValue="prescribed"
          className="w-full"
          onValueChange={setActiveTab}
        >
        
          <TabsList className="grid w-full grid-cols-3 bg-[var(--color-light-bg)] dark:bg-[var(--color-dark-surface)] rounded-xl mb-6 h-auto p-1.5 gap-2 border border-black/5 dark:border-white/5">
            <TabsTrigger
              value="prescribed"
              className={getTabTriggerClass("prescribed")}
            >
              <Pill className="w-4 h-4" />
              <span>Medications</span>
            </TabsTrigger>
            
            <TabsTrigger
              value="appointments"
              className={getTabTriggerClass("appointments")}
            >
              <Calendar className="w-4 h-4" />
              <span>Appointments</span>
            </TabsTrigger>
            
            <TabsTrigger
              value="personal"
              className={getTabTriggerClass("personal")}
            >
              <FileText className="w-4 h-4" />
              <span>My Records</span>
            </TabsTrigger>
          </TabsList>

          <div className="bg-[var(--color-light-surface)] dark:bg-[var(--color-dark-bg)] rounded-xl p-6 border border-black/5 dark:border-white/5 min-h-[200px]">
            <TabsContent value="prescribed" className="m-0  focus-visible:outline-none">
              <PrescribedMedications />
            </TabsContent>

            <TabsContent value="appointments" className="m-0 focus-visible:outline-none">
              <AppointmentHistory />
            </TabsContent>

            <TabsContent value="personal" className="m-0 focus-visible:outline-none">
              <PersonalMedicalRecords />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default MedicalHistoryContent;
