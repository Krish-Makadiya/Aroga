import React from "react";
import { ArrowRight, PhoneCall } from "lucide-react";

export default function Footer() {
    return (
        <footer className="relative w-full bg-light-bg dark:bg-dark-bg md:py-16 pb-16 pt-6 md:pt-5 px-4">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
                {/* Logo and tagline */}
                <div className="flex flex-col items-center md:items-start gap-3">
                    <a href="/" className="flex items-center gap-2">
                        <img
                            src={"https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"}
                            alt="Arogya Logo"
                            className="h-10 w-10"
                        />
                        <span className="text-xl font-bold text-light-primary-text dark:text-dark-primary-text">
                            Arogya
                        </span>
                    </a>
                    <p className="text-light-secondary-text dark:text-dark-secondary-text text-sm max-w-xs text-center md:text-left">
                        Your Health, Our Priority - Empowering Wellness with AI.
                    </p>
                </div>
                {/* Links */}
                <div className="flex md:gap-24 gap-28">
                    <div className="flex flex-col gap-2 items-center">
                        <span className="font-semibold text-light-primary-text dark:text-dark-primary-text mb-1">
                            Product
                        </span>
                        <a
                            href="#features"
                            className="hover:underline text-light-secondary-text dark:text-dark-secondary-text text-sm">
                            Features
                        </a>
                        <a
                            href="/pricing"
                            className="hover:underline text-light-secondary-text dark:text-dark-secondary-text text-sm">
                            Pricing
                        </a>
                        <a
                            href="#faq"
                            className="hover:underline text-light-secondary-text dark:text-dark-secondary-text text-sm">
                            FAQ
                        </a>
                    </div>
                    <div className="flex flex-col gap-2 items-center">
                        <span className="font-semibold text-light-primary-text dark:text-dark-primary-text mb-1">
                            Company
                        </span>
                        <a
                            href="/about-us"
                            className="hover:underline text-light-secondary-text dark:text-dark-secondary-text text-sm">
                            About Us
                        </a>
                        <a
                            href="#"
                            className="hover:underline text-light-secondary-text dark:text-dark-secondary-text text-sm">
                            Privacy Policy
                        </a>
                        <a
                            href="/terms"
                            className="hover:underline text-light-secondary-text dark:text-dark-secondary-text text-sm">
                            Terms of Service
                        </a>
                    </div>
                </div>
                {/* CTA */}
                <div className="flex flex-col items-center gap-4 md:mt-0 mt-8">
                    <a
                        href="/contact-us"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-light-primary text-white dark:bg-dark-primary font-semibold text-base shadow transition">
                        Contact Us{" "}
                        <span>
                            <PhoneCall className="w-5 h-5" />
                        </span>
                    </a>
                    <span className="text-xs text-light-secondary-text dark:text-dark-secondary-text">
                        &copy; {new Date().getFullYear()} Arogya. All rights
                        reserved.
                    </span>
                </div>
            </div>
        </footer>
    );
}
