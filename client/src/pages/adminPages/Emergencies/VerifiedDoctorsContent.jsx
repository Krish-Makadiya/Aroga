import React from "react";

const VerifiedDoctorsContent = ({ doctors }) => {
    return (
        <div className="mb-8 bg-white dark:bg-dark-surface rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Verified Doctors
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctors?.map((doctor) => (
                    <div
                        key={doctor._id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                                    {doctor.fullName}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {doctor.specialty}
                                </p>
                            </div>
                            {doctor.rating?.average && (
                                <div className="flex items-center gap-1">
                                    <span className="text-yellow-500">★</span>
                                    <span className="text-sm font-medium">
                                        {doctor.rating.average.toFixed(1)}
                                    </span>
                                </div>
                            )}
                        </div>
                        {doctor.availableSlots &&
                            doctor.availableSlots.length > 0 && (
                                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    <p className="font-semibold mb-1">
                                        Availability:
                                    </p>
                                    {doctor.availableSlots.map((slot, idx) => (
                                        <p key={idx}>
                                            {slot.day}: {slot.startTime} -{" "}
                                            {slot.endTime}
                                        </p>
                                    ))}
                                </div>
                            )}
                        {doctor.consultationFee && (
                            <p className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                                ₹{doctor.consultationFee}
                            </p>
                        )}
                    </div>
                ))} 
            </div>
        </div>
    );
};

export default VerifiedDoctorsContent;
