import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Upload, FileText, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useUser, useAuth } from "@clerk/clerk-react";
import {
  getPersonalMedicalRecords,
  addPersonalMedicalRecord,
  deleteMedicalRecord,
} from "@/api/patient";
import { parseMedicalDocument } from "@/api/gemini";

const PersonalMedicalRecords = () => {

  const { user } = useUser();
  const { getToken } = useAuth();

  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [recordType, setRecordType] = useState("");
  const [recordDate, setRecordDate] = useState("");
  const [recordNotes, setRecordNotes] = useState("");
  const [file, setFile] = useState(null);

  const { data: records, isLoading } = useQuery({
    queryKey: ["personal-medical-records"],
    queryFn: async () => {
      const token = await getToken();
      return getPersonalMedicalRecords(token);
    },
  });

  const addRecordMutation = useMutation({
    mutationFn: async (formData) => {
      const token = await getToken();
      return addPersonalMedicalRecord(formData, token);
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["personal-medical-records"]);
      setIsAdding(false);
      setRecordType("");
      setRecordDate("");
      setRecordNotes("");
      setFile(null);
      toast.success("Medical record added successfully");
    },
    onError: (error) => {
       toast.error(error.message || "An error occurred");
    },
  });

  const deleteRecordMutation = useMutation({
    mutationFn: async (recordId) => {
      const token = await getToken();
      return deleteMedicalRecord(recordId, token);
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["personal-medical-records"]);
      toast.success("Medical record deleted successfully");
    },
  });

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const result = await parseMedicalDocument(formData);
      
      if (result.data) {
        setRecordType(result.data.type || "Medical Report");
        setRecordDate(result.data.date || new Date().toISOString().split("T")[0]);
        setRecordNotes(result.data.summary || "");
      }
      setFile(selectedFile);
    } catch (error) {
      toast.error(error.message || "Failed to process document");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!recordType || !recordDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    const formData = new FormData();
    formData.append("clerkUserId", user.id);
    formData.append("type", recordType);
    formData.append("date", recordDate);
    if (recordNotes) formData.append("notes", recordNotes);
    if (file) formData.append("file", file);

    addRecordMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Your Medical Records</h3>
        <Button
          onClick={() => setIsAdding(!isAdding)}
          variant={isAdding ? "outline" : "default"}
        >
          {isAdding ? "Cancel" : "Add Record"}
        </Button>
      </div>

      {isAdding && (
        <div className="p-4 border rounded-lg bg-muted/20">
          <h4 className="font-medium mb-4">Add New Medical Record</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recordType">Record Type *</Label>
                <Input
                  id="recordType"
                  value={recordType}
                  onChange={(e) => setRecordType(e.target.value)}
                  placeholder="e.g., Blood Test, X-Ray, Prescription"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recordDate">Date *</Label>
                <Input
                  id="recordDate"
                  type="date"
                  value={recordDate}
                  onChange={(e) => setRecordDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recordNotes">Notes</Label>
              <Textarea
                id="recordNotes"
                value={recordNotes}
                onChange={(e) => setRecordNotes(e.target.value)}
                placeholder="Add any additional notes about this record"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Upload Document (Optional)</Label>
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="document-upload"
                  className="cursor-pointer border border-dashed rounded-md p-4 flex flex-col items-center justify-center w-full hover:bg-accent/50 transition-colors"
                >
                  <Upload className="w-6 h-6 mb-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {file ? file.name : "Click to upload or drag and drop"}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    PDF, JPG, or PNG (max 5MB)
                  </span>
                  <Input
                    id="document-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                  />
                </Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setRecordType("");
                  setRecordDate("");
                  setRecordNotes("");
                  setFile(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addRecordMutation.isLoading}
                className="gap-2"
              >
                {addRecordMutation.isLoading && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Save Record
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {records?.length > 0 ? (
          records.map((record) => (
            <div
              key={record._id}
              className="p-4 border rounded-lg bg-card text-card-foreground"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <h3 className="font-medium">{record.type}</h3>
                    <span className="text-sm text-muted-foreground">
                      - {new Date(record.date).toLocaleDateString()}
                    </span>
                  </div>
                  {record.notes && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {record.notes}
                    </p>
                  )}
                  {record.fileUrl && (
                    <div className="mt-2">
                      {(() => {
                        const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
                        const href = record.fileUrl.startsWith("/uploads/")
                          ? `${apiBase}${record.fileUrl}`
                          : record.fileUrl;
                        return (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center gap-1"
                          >
                            <FileText className="w-4 h-4" />
                            View Document
                          </a>
                        );
                      })()}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive/90"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to delete this record?"
                      )
                    ) {
                      deleteRecordMutation.mutate(record._id);
                    }
                  }}
                  disabled={deleteRecordMutation.isLoading}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No medical records found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add your first record to get started
            </p>
            <Button
              className="mt-4"
              onClick={() => setIsAdding(true)}
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Record
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalMedicalRecords;