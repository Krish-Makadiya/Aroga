export default function TestimonialSection() {
    return (
        <section className="relative overflow-hidden bg-light-bg dark:bg-dark-bg px-6 py-16 sm:py-20 lg:px-8">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,var(--color-dark-bg),transparent)] opacity-10 dark:opacity-20" />
            <div className="mx-auto max-w-2xl lg:max-w-4xl">
                <img
                    alt=""
                    src="https://tailwindcss.com/plus-assets/img/logos/workcation-logo-indigo-400.svg"
                    className="mx-auto h-12"
                />
                <figure className="mt-10">
                    <blockquote className="text-center text-xl/8 font-semibold text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)] sm:text-2xl/9">
                        <p>
                            “ResQ made it so easy to get medical advice and
                            prescriptions from home. The AI symptom checker is
                            incredibly accurate and the doctors are always
                            available. Highly recommended for anyone looking for
                            fast, reliable healthcare!”
                        </p>
                    </blockquote>
                    <figcaption className="mt-10">
                        <img
                            alt=""
                            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                            className="mx-auto size-10 rounded-full"
                        />
                        <div className="mt-4 flex items-center justify-center space-x-3 text-base">
                            <div className="font-semibold text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                Judith Black
                            </div>
                            <svg
                                width={3}
                                height={3}
                                viewBox="0 0 2 2"
                                aria-hidden="true"
                                className="fill-[var(--color-light-secondary-text)] dark:fill-[var(--color-dark-secondary-text)]">
                                <circle r={1} cx={1} cy={1} />
                            </svg>
                            <div className="text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                                ResQ User
                            </div>
                        </div>
                    </figcaption>
                </figure>
            </div>
        </section>
    );
}
