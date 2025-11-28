import WomenHealthCalendar from '../../../components/patient/WomenHealthCalendar';
import { useAuth, useUser } from '@clerk/clerk-react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import WomenHealthHistory from '../../../components/patient/WomenHealthHistory';
import Loader from '../../../components/main/Loader';

const MenstrualHealthContent = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();
    const { getToken } = useAuth();

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const token = await getToken();
                const response = await axios.get(
                    `${import.meta.env.VITE_SERVER_URL}/api/patient/get-patient/${user.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setUserData(response.data);
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [user, getToken]);

    if (loading) return <Loader/>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-light-primary-text mb-4 dark:text-dark-primary-text">
                Women Health Content
            </h1>
            {userData && <WomenHealthCalendar patientId={userData._id} />}
            {userData && <WomenHealthHistory patientId={userData._id} />}
        </div>
    );
};

export default MenstrualHealthContent;
