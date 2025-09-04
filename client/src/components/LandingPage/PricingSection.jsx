import { CheckCheckIcon } from "lucide-react";

const tiers = [
    {
        name: "Hobby",
        id: "tier-hobby",
        href: "#",
        priceMonthly: "$29",
        description:
            "The perfect plan if you're just getting started with our product.",
        features: [
            "25 consultations/month",
            "AI symptom checker access",
            "Basic health records",
            "Email support",
        ],
        featured: false,
    },
    {
        name: "Enterprise",
        id: "tier-enterprise",
        href: "#",
        priceMonthly: "$99",
        description: "Dedicated support and infrastructure for your company.",
        features: [
            "Unlimited consultations",
            "Priority doctor access",
            "Advanced analytics",
            "Dedicated support representative",
            "Medication reminders",
            "Custom integrations",
        ],
        featured: true,
    },
];

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function PricingSection() {
    return (
        <div className="relative isolate bg-light-bg dark:bg-dark-bg px-6 py-24 sm:py-32 lg:px-8">
            <div
                aria-hidden="true"
                className="absolute inset-x-0 -top-3 -z-10 transform-gpu overflow-hidden px-36 blur-3xl">
                <div
                    style={{
                        clipPath:
                            "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                    }}
                    className="mx-auto aspect-1155/678 w-288.75 bg-gradient-to-tr from-[var(--color-light-secondary)] to-[var(--color-light-primary)] dark:from-[var(--color-dark-secondary)] dark:to-[var(--color-dark-primary)] opacity-20"
                />
            </div>
            <div className="mx-auto max-w-4xl text-center">
                <h2 className="text-base/7 font-semibold text-light-primary dark:text-dark-primary">
                    Pricing
                </h2>
                <p className="mt-2 text-4xl font-semibold tracking-tight text-balance text-light-primary-text dark:text-dark-primary-text sm:text-6xl">
                    Choose the right plan for you
                </p>
            </div>
            <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2">
                {tiers.map((tier, tierIdx) => (
                    <div
                        key={tier.id}
                        className={classNames(
                            tier.featured
                                ? "relative bg-light-surface dark:bg-dark-surface border-3 border-light-primary dark:border-dark-primary"
                                : "bg-light-surface/80 dark:bg-dark-surface/80 border border-light-primary/30 dark:border-dark-primary/30 sm:mx-8 lg:mx-0",
                            tier.featured
                                ? ""
                                : tierIdx === 0
                                ? "rounded-t-3xl sm:rounded-b-none lg:rounded-tr-none lg:rounded-bl-3xl"
                                : "sm:rounded-t-none lg:rounded-tr-3xl lg:rounded-bl-none",
                            "rounded-3xl p-8 ring-1 ring-light-secondary/10 dark:ring-dark-secondary/10 sm:p-10 shadow-lg"
                        )}>
                        <h3
                            id={tier.id}
                            className={classNames(
                                tier.featured
                                    ? "text-light-primary dark:text-dark-primary"
                                    : "text-light-primary dark:text-dark-primary",
                                "text-base/7 font-semibold"
                            )}>
                            {tier.name}
                        </h3>
                        <p className="mt-4 flex items-baseline gap-x-2">
                            <span
                                className={classNames(
                                    "text-5xl font-semibold tracking-tight text-light-primary-text dark:text-dark-primary-text"
                                )}>
                                {tier.priceMonthly}
                            </span>
                            <span
                                className={classNames(
                                    "text-base text-light-secondary-text dark:text-dark-secondary-text"
                                )}>
                                /month
                            </span>
                        </p>
                        <p
                            className={classNames(
                                "mt-6 text-base/7 text-light-secondary-text dark:text-dark-secondary-text"
                            )}>
                            {tier.description}
                        </p>
                        <ul
                            role="list"
                            className={classNames(
                                "mt-8 space-y-3 text-sm/6 sm:mt-10 text-light-primary-text dark:text-dark-primary-text"
                            )}>
                            {tier.features.map((feature) => (
                                <li key={feature} className="flex gap-x-3">
                                    <CheckCheckIcon
                                        aria-hidden="true"
                                        className={classNames(
                                            "h-6 w-5 flex-none text-light-primary dark:text-dark-primary"
                                        )}
                                    />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <a
                            href={tier.href}
                            aria-describedby={tier.id}
                            className={classNames(
                                "mt-8 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold bg-light-primary dark:bg-dark-primary text-light-bg dark:text-dark-bg hover:bg-light-primary-hover dark:hover:bg-dark-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-10 transition-colors"
                            )}>
                            Get started today
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}
