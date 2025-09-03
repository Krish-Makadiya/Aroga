import { ChevronDown } from "lucide-react";

export default function ContactSection() {
    return (
        <div className="isolate bg-light-bg dark:bg-dark-bg px-6 py-24 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-5xl text-center">
                <h2 className="text-base/7 font-semibold text-light-primary dark:text-dark-primary">
                    Contact Us
                </h2>
                <p className="mx-auto mt-2 max-w-lg text-center text-4xl font-semibold tracking-tight text-balance text-light-primary-text dark:text-dark-primary-text sm:text-5xl">
                    Get in touch with our support team
                </p>
            </div>
            <form
                action="#"
                method="POST"
                className="mx-auto mt-16 max-w-xl sm:mt-20">
                <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                    <div>
                        <label
                            htmlFor="first-name"
                            className="block text-sm/6 font-semibold text-light-primary-text dark:text-dark-primary-text">
                            First name
                        </label>
                        <div className="mt-2.5">
                            <input
                                id="first-name"
                                name="first-name"
                                type="text"
                                autoComplete="given-name"
                                className="block w-full rounded-md bg-light-surface dark:bg-dark-surface px-3.5 py-2 text-base text-light-primary-text dark:text-dark-primary-text border border-light-primary/40 dark:border-dark-primary/40 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-none focus:ring-1 focus:ring-light-primary dark:focus:ring-dark-primary"
                            />
                        </div>
                    </div>
                    <div>
                        <label
                            htmlFor="last-name"
                            className="block text-sm/6 font-semibold text-light-primary-text dark:text-dark-primary-text">
                            Last name
                        </label>
                        <div className="mt-2.5">
                            <input
                                id="last-name"
                                name="last-name"
                                type="text"
                                autoComplete="family-name"
                                className="block w-full rounded-md bg-light-surface dark:bg-dark-surface px-3.5 py-2 text-base text-light-primary-text dark:text-dark-primary-text border border-light-primary/40 dark:border-dark-primary/40 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-none focus:ring-1 focus:ring-light-primary dark:focus:ring-dark-primary"
                            />
                        </div>
                    </div>
                    <div className="sm:col-span-2">
                        <label
                            htmlFor="email"
                            className="block text-sm/6 font-semibold text-light-primary-text dark:text-dark-primary-text">
                            Email
                        </label>
                        <div className="mt-2.5">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                className="block w-full rounded-md bg-light-surface dark:bg-dark-surface px-3.5 py-2 text-base text-light-primary-text dark:text-dark-primary/40-text border border-light-primary/40 dark:border-dark-primary/40 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-none focus:ring-1 focus:ring-light-primary dark:focus:ring-dark-primary"
                            />
                        </div>
                    </div>
                    <div className="sm:col-span-2">
                        <label
                            htmlFor="phone-number"
                            className="block text-sm/6 font-semibold text-light-primary-text dark:text-dark-primary-text">
                            Phone number
                        </label>
                        <div className="mt-2.5">
                            <div className="flex rounded-md bg-light-surface dark:bg-dark-surface border border-light-primary/40 dark:border-dark-primary/40">
                                <div className="grid shrink-0 grid-cols-1 focus-within:relative">
                                    <select
                                        id="country"
                                        name="country"
                                        autoComplete="country"
                                        aria-label="Country"
                                        className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-transparent py-2 pr-7 pl-3.5 text-base text-light-secondary-text dark:text-dark-secondary-text focus:outline-none sm:text-sm/6">
                                        <option>US</option>
                                        <option>CA</option>
                                        <option>EU</option>
                                    </select>
                                    <ChevronDown
                                        aria-hidden="true"
                                        className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-light-secondary-text dark:text-dark-secondary-text sm:size-4"
                                    />
                                </div>
                                <input
                                    id="phone-number"
                                    name="phone-number"
                                    type="text"
                                    placeholder="123-456-7890"
                                    className="block min-w-0 grow bg-transparent py-1.5 pr-3 pl-1 text-base text-light-primary-text dark:text-dark-primary-text placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-none sm:text-sm/6"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="sm:col-span-2">
                        <label
                            htmlFor="message"
                            className="block text-sm/6 font-semibold text-light-primary-text dark:text-dark-primary-text">
                            Message
                        </label>
                        <div className="mt-2.5">
                            <textarea
                                id="message"
                                name="message"
                                rows={4}
                                className="block w-full rounded-md bg-light-surface dark:bg-dark-surface px-3.5 py-2 text-base text-light-primary-text dark:text-dark-primary-text border border-light-primary/40 dark:border-dark-primary/40 placeholder:text-light-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-none focus:ring-1 focus:ring-light-primary dark:focus:ring-dark-primary"
                                defaultValue={""}
                            />
                        </div>
                    </div>
                </div>
                <div className="mt-10">
                    <button
                        type="submit"
                        className="block w-full rounded-md bg-light-primary dark:bg-dark-primary px-3.5 py-2.5 text-center text-sm font-semibold text-light-bg dark:text-dark-bg shadow-xs hover:bg-light-primary-hover dark:hover:bg-dark-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-light-primary dark:focus-visible:outline-dark-primary transition-colors">
                        Let's talk
                    </button>
                </div>
            </form>
        </div>
    );
}
