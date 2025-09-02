import { ArrowRight } from "lucide-react";
import Navbar from "../components/LandingPage/Navbar";
import { BackgroundRippleEffect } from "../components/UI/BackgroundRippleEffect";
import { ContainerScroll } from "../components/UI/ContainerScroll";
import FeatureSection from "../components/LandingPage/FeatureSection";
import TestimonialSection from "../components/LandingPage/TestimonialSection";
import WhyChooseUsSection from "../components/LandingPage/WhyChooseUsSection";
import PricingSection from "../components/LandingPage/PricingSection";

function LandingPage() {
    return (
        <div className="overflow-hidden relative">
            <Navbar />
            <div className="absolute inset-0 -z-20 h-full">
                <BackgroundRippleEffect />
            </div>
            <div className="text-light-primary-text w-screen h-screen flex flex-col gap-6 items-center justify-center">
                <div className="flex flex-col items-center justify-center font-semibold leading-16">
                    <p className="text-[60px] font-bold flex z-10 dark:text-dark-primary-text text-light-primary-text">
                        Connect, Diagnose, Treat
                    </p>
                    <p className="text-light-secondary/50 dark:text-dark-secondary/50 text-[60px] font-extrabold sub-heading">
                        All in One App.
                    </p>
                </div>
                <div className="flex flex-col gap-4 items-center">
                    <p className="dark:text-dark-secondary-text text-light-secondary-text">
                        Check symptoms, consult doctors—one tap.
                    </p>
                    <button className="bg-light-secondary dark:bg-dark-secondary text-light-bg py-3 px-4 rounded flex gap-1">
                        <p>Get Started</p>
                        <ArrowRight />
                    </button>
                </div>
            </div>
            <div className="flex flex-col overflow-hidden bg-ligh-bg dark:bg-dark-bg">
                <ContainerScroll
                    titleComponent={
                        <>
                            <h1 className="text-3xl font-semibold text-neutral-700 ">
                                Unleash the power of <br />
                                <span className="text-[4rem] font-bold leading-none">
                                    AI-driven Healthcare
                                </span>
                            </h1>
                        </>
                    }>
                    <img
                        src={`/Dino.PNG`}
                        alt="hero"
                        height={720}
                        width={1400}
                        className="mx-auto rounded-2xl object-cover h-full object-left-top"
                        draggable={false}
                    />
                </ContainerScroll>
            </div>

            <FeatureSection />

            <TestimonialSection />

            <WhyChooseUsSection/>

            <PricingSection />
        </div>
    );
}

export default LandingPage;
