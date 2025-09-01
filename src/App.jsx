import "./App.css";
import DarkVeil from "./components/LandingPage/DarkVeil";
import Navbar from "./components/LandingPage/Navbar";
import { useTheme } from "./context/ThemeProvider";

function App() {
    return (
        <div>
            <Navbar />
            <div className="absolute inset-0 -z-10 h-full ">
                <DarkVeil />
            </div>
            <div className="text-white w-screen h-screen flex flex-col gap-10 items-center justify-center">
                <div className="flex flex-col items-center justify-center text-[60px] font-semibold leading-16">
                    <p>Connect, Diagnose, Treat</p>
                    <p className="text-blue-500/50">All in One App.</p>
                </div>
                <div className="flex flex-col gap-5 items-center">
                    <p>Check symptoms, consult doctors—one tap.</p>
                    <button className="bg-blue-500/80 text-white py-2 px-4 rounded">
                        Get Started
                    </button>
                </div>
            </div>
        </div>
    );
}

export default App;
