const features = [
    {
        name: "AI Symptom Checker",
        description:
            "Quickly analyze your symptoms and get instant, AI-powered health insights.",
    },
    {
        name: "Instant Doctor Consultation",
        description:
            "Connect with certified doctors via chat or video call, anytime, anywhere.",
    },
    {
        name: "Digital Prescriptions",
        description:
            "Receive secure, digital prescriptions after your consultation.",
    },
    {
        name: "Health Records Management",
        description:
            "Store, access, and share your medical history and reports securely.",
    },
    {
        name: "Appointment Scheduling",
        description: "Book appointments with specialists at your convenience.",
    },
    {
        name: "Medication Reminders",
        description: "Get notified for your medication schedules and refills.",
    },
];

export default function FeatureSection() {
    return (
        <div className="bg-ligh-bg">
            <div className="mx-auto max-w-2xl grid-cols-1 items-center px-4 py-24 sm:px-6 sm:py-32 lg:max-w-7xl  flex gap-20">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-light-primary-text dark:text-dark-primary-text sm:text-4xl">
                        Our Features
                    </h2>
                    <p className="mt-4 text-light-secondary-text dark:text-dark-secondary-text">
                        Discover the unique features that set our product apart.
                    </p>

                    <dl className="mt-16 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 sm:gap-y-16 lg:gap-x-8">
                        {features.map((feature) => (
                            <div
                                key={feature.name}
                                className="border-t border-light-bg dark:border-dark-secondary-text pt-4">
                                <dt className="font-medium text-light-primary-text dark:text-dark-primary-text">
                                    {feature.name}
                                </dt>
                                <dd className="mt-2 text-sm text-light-secondary-text dark:text-dark-secondary-text">
                                    {feature.description}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
                <div className="flex items-center justify-center">
                    <div className="bg-light-surface dark:bg-dark-surface rounded-[2rem] p-4 shadow-lg border border-gray-200 dark:border-gray-700 w-[360px] h-[650px] flex items-center justify-center">
                        <img
                            src="/Dino.PNG" // Replace with your actual prototype image path
                            alt="App Prototype"
                            className="rounded-[1.4rem] w-[350px] h-[620px] object-cover"
                            draggable={false}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
