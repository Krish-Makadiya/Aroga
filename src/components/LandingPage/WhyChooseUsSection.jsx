export default function WhyChooseUsSection() {
    return (
        <div className="bg-light-bg dark:bg-dark-bg py-18 sm:py-32">
            <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
                <h2 className="text-center text-base/7 font-semibold text-light-primary dark:text-dark-primary">
                    Why Choose Us
                </h2>
                <p className="mx-auto mt-2 max-w-lg text-center text-4xl font-semibold tracking-tight text-balance text-light-primary-text dark:text-dark-primary-text sm:text-5xl">
                    Experience the future of healthcare
                </p>
                <div className="mt-10 grid gap-4 sm:mt-16 lg:grid-cols-3 lg:grid-rows-2">
                    <div className="relative lg:row-span-2">
                        <div className="absolute inset-px rounded-lg bg-light-surface dark:bg-dark-surface lg:rounded-l-4xl shadow-2xl" />
                        <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] lg:rounded-l-[calc(2rem+1px)]">
                            <div className="px-8 pt-8 pb-3 sm:px-10 sm:pt-10 sm:pb-0">
                                <p className="mt-2 text-lg font-medium tracking-tight text-light-primary-text dark:text-dark-primary-text max-lg:text-center">
                                    Mobile friendly
                                </p>
                                <p className="mt-2 max-w-lg text-sm/6 text-light-secondary-text dark:text-dark-secondary-text max-lg:text-center">
                                    Our app is designed to work seamlessly on
                                    mobile devices, providing a user-friendly
                                    experience.
                                </p>
                            </div>
                            <div className="@container relative min-h-120 w-full grow max-lg:mx-auto max-lg:max-w-sm">
                                <div className="absolute inset-x-10 top-10 bottom-0 overflow-hidden rounded-t-[12cqw] border-x-[3cqw] border-t-[3cqw] border-gray-800 bg-gray-900 outline outline-white/20">
                                    <img
                                        alt=""
                                        src="https://tailwindcss.com/plus-assets/img/component-images/bento-03-mobile-friendly.png"
                                        className="size-full object-cover object-top"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="pointer-events-none absolute inset-px rounded-lg shadow-sm outline outline-white/15 lg:rounded-l-4xl" />
                    </div>
                    <div className="relative max-lg:row-start-1">
                        <div className="absolute inset-px rounded-lg bg-light-surface dark:bg-dark-surface max-lg:rounded-t-4xl shadow-2xl" />
                        <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] max-lg:rounded-t-[calc(2rem+1px)]">
                            <div className="px-8 pt-8 sm:px-10 sm:pt-10">
                                <p className="mt-2 text-lg font-medium tracking-tight text-light-primary-text dark:text-dark-primary-text max-lg:text-center">
                                    Performance
                                </p>
                                <p className="mt-2 max-w-lg text-sm/6 text-light-secondary-text dark:text-dark-secondary-text max-lg:text-center">
                                    Our app is optimized for speed and
                                    efficiency, ensuring quick load times and
                                    smooth interactions.
                                </p>
                            </div>
                            <div className="flex flex-1 items-center justify-center px-8 max-lg:pt-10 max-lg:pb-12 sm:px-10 lg:pb-2">
                                <img
                                    alt=""
                                    src="https://tailwindcss.com/plus-assets/img/component-images/dark-bento-03-performance.png"
                                    className="w-full max-lg:max-w-xs"
                                />
                            </div>
                        </div>
                        <div className="pointer-events-none absolute inset-px rounded-lg shadow-sm outline outline-white/15 max-lg:rounded-t-4xl" />
                    </div>
                    <div className="relative max-lg:row-start-3 lg:col-start-2 lg:row-start-2">
                        <div className="absolute inset-px rounded-lg bg-light-surface dark:bg-dark-surface shadow-2xl" />
                        <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)]">
                            <div className="px-8 pt-8 sm:px-10 sm:pt-10">
                                <p className="mt-2 text-lg font-medium tracking-tight text-light-primary-text dark:text-dark-primary-text max-lg:text-center">
                                    Security
                                </p>
                                <p className="mt-2 max-w-lg text-sm/6 text-light-secondary-text dark:text-dark-secondary-text max-lg:text-center">
                                    We prioritize your data privacy and employ robust security measures to protect your information.
                                </p>
                            </div>
                            <div className="@container flex flex-1 items-center max-lg:py-6 lg:pb-2">
                                <img
                                    alt=""
                                    src="https://tailwindcss.com/plus-assets/img/component-images/dark-bento-03-security.png"
                                    className="h-[min(152px,40cqw)] object-cover"
                                />
                            </div>
                        </div>
                        <div className="pointer-events-none absolute inset-px rounded-lg shadow-sm outline outline-white/15" />
                    </div>
                    <div className="relative lg:row-span-2">
                        <div className="absolute inset-px rounded-lg bg-light-surface dark:bg-dark-surface max-lg:rounded-b-4xl lg:rounded-r-4xl shadow-2xl" />
                        <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] max-lg:rounded-b-[calc(2rem+1px)] lg:rounded-r-[calc(2rem+1px)]">
                            <div className="px-8 pt-8 pb-3 sm:px-10 sm:pt-10 sm:pb-0">
                                <p className="mt-2 text-lg font-medium tracking-tight text-light-primary-text dark:text-dark-primary-text max-lg:text-center">
                                    24/7 Support
                                </p>
                                <p className="mt-2 max-w-lg text-sm/6 text-light-secondary-text dark:text-dark-secondary-text max-lg:text-center">
                                    Our dedicated support team is available around the clock to assist you with any issues or questions.
                                </p>
                            </div>
                            <div className="@container relative min-h-120 w-full grow max-lg:mx-auto max-lg:max-w-sm">
                                <div className="absolute inset-x-10 top-10 bottom-0 overflow-hidden rounded-t-[12cqw] border-x-[3cqw] border-t-[3cqw] border-gray-800 bg-gray-900 outline outline-white/20">
                                    <img
                                        alt=""
                                        src="https://tailwindcss.com/plus-assets/img/component-images/dark-bento-02-security.png"
                                        className="size-full object-cover object-top"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="pointer-events-none absolute inset-px rounded-lg shadow-sm outline outline-white/15 max-lg:rounded-b-4xl lg:rounded-r-4xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}
