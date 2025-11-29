import { useLocation } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import LocationMapContent from "./LocationMapContent";

export default function LocationMap({ tabs }) {
    const location = useLocation();

    const getActiveTab = () => {
        return (
            tabs.find((tab) => tab.path === location.pathname)?.name ||
            tabs[0].name
        );
    };

    return (
        <div className="flex relative">
            <Sidebar tabs={tabs} getActiveTab={getActiveTab} />

            <div className="h-full w-full bg-light-bg dark:bg-dark-surface">
                <LocationMapContent />
            </div>
        </div>
    );
}
