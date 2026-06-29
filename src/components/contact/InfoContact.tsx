"use client";

import React, { useState } from "react";
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaPaperPlane,
} from "react-icons/fa";
import Button from "../ui/Button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

const contactSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .regex(/^[a-zA-Z\s'-]+$/, "Only alphabets allowed"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .regex(/^[a-zA-Z\s'-]+$/, "Only alphabets allowed"),
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\d+$/, "Phone number must be numeric"),
  message: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactSectionProps {
  address: string;
  addressMapUrl: string;
  phone: string;
  businessHours: string;
  email: string;
  mapEmbedUrl: string;
}

const ContactSection = ({
  address,
  addressMapUrl,
  phone,
  businessHours,
  email,
  mapEmbedUrl,
}: ContactSectionProps) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: "onSubmit",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const resetForm = () => {
    reset();
    setServerError("");
    setSuccessMessage("");
    setIsSubmitted(false);
  };

  const onSubmit = async (formData: ContactFormData) => {
    setServerError("");
    setIsSubmitting(true);

    try {
      // Map firstName and lastName back to name for the API if needed
      const payload = {
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`,
      };

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setServerError(
          data.message || "Something went wrong. Please try again.",
        );
        toast.error(data.message || "Something went wrong. Please try again.");
        return;
      }

      setSuccessMessage(data.message || "Message sent successfully");
      setIsSubmitted(true);
    } catch {
      setServerError(
        "Unable to send message. Please check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format phone for display: "0412713501" → "0412 713 501"
  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\s/g, "");
    if (digits.length === 10) {
      return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    }
    return raw;
  };

  // Split business hours on newlines for display
  const hoursLines = businessHours
    .split(/\\n|\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // Split address on commas for line breaks
  const addressLines = address.split(",").map((l) => l.trim());

  const inputBaseClass =
    "w-full px-5 py-4 rounded-xl border bg-gray-50/50 outline-none focus:bg-white transition-all disabled:opacity-50";
  const inputNormalClass = `${inputBaseClass} border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20`;
  const inputErrorClass = `${inputBaseClass} border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200`;

  return (
    <section className="halfSection">
      <div className="container">
        {/* Top Cards */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-12">
          {/* Address */}
          <a
            href={addressMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-gray-50 border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-3xl p-10 text-center transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          >
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <FaMapMarkerAlt className="text-2xl" />
            </div>
            <p className="text-gray-600 font-medium leading-relaxed tracking-wide">
              {addressLines.map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < addressLines.length - 1 && (
                    <>
                      ,<br />
                    </>
                  )}
                </React.Fragment>
              ))}
            </p>
          </a>

          {/* Phone */}
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="group block bg-gray-50 border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-3xl p-10 text-center transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          >
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <FaPhoneAlt className="text-2xl" />
            </div>
            <p className="text-gray-600 font-medium text-base leading-relaxed tracking-wide">
              {formatPhone(phone)}
              {hoursLines.map((line, i) => (
                <React.Fragment key={i}>
                  <br />
                  {line}
                </React.Fragment>
              ))}
            </p>
          </a>

          {/* Email */}
          <a
            href={`mailto:${email}`}
            className="group block bg-gray-50 border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-3xl p-10 text-center transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          >
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <FaEnvelope className="text-2xl" />
            </div>
            <p className="text-gray-600 font-medium leading-relaxed tracking-wide">
              {email}
            </p>
          </a>
        </div>

        {/* Bottom Section */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8" id="message">
          {/* Contact Form */}
          <form
            className="bg-gray-50 border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-4 md:p-6 flex flex-col h-full relative overflow-hidden"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              Send Us a Message
            </h2>

            {/* Success Overlay - Positioned absolutely over the form to prevent layout shift */}
            {isSubmitted && (
              <div className="absolute inset-0 z-10 bg-gray-50/95 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center text-4xl mb-4 shadow-sm">
                  ✓
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Message Sent!
                </h3>
                <p className="text-gray-600 mb-8 max-w-sm">
                  {successMessage ||
                    "Thank you for reaching out. We will get back to you shortly."}
                </p>
                <Button
                  text="Send Another Message"
                  onClick={resetForm}
                  className="mx-auto"
                  type="button"
                />
              </div>
            )}

            {/* Form Fields - Always rendered to maintain height, hidden when submitted */}
            <div
              className={`flex flex-col flex-1 transition-opacity duration-300 ${isSubmitted ? "opacity-0 pointer-events-none" : "opacity-100"}`}
            >
              {serverError && (
                <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
                  {serverError}
                </div>
              )}

              <div className="space-y-5 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* First Name */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="John"
                      disabled={isSubmitting}
                      {...register("firstName")}
                      onKeyDown={(e) => {
                        if (/[0-9]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      className={
                        errors.firstName ? inputErrorClass : inputNormalClass
                      }
                    />
                    {errors.firstName && (
                      <p className="mt-1.5 text-red-500 text-sm">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Doe"
                      disabled={isSubmitting}
                      {...register("lastName")}
                      onKeyDown={(e) => {
                        if (/[0-9]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      className={
                        errors.lastName ? inputErrorClass : inputNormalClass
                      }
                    />
                    {errors.lastName && (
                      <p className="mt-1.5 text-red-500 text-sm">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    disabled={isSubmitting}
                    {...register("email")}
                    className={
                      errors.email ? inputErrorClass : inputNormalClass
                    }
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-red-500 text-sm">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Phone (required) */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="0412 345 678"
                    disabled={isSubmitting}
                    {...register("phone")}
                    className={
                      errors.phone ? inputErrorClass : inputNormalClass
                    }
                  />
                  {errors.phone && (
                    <p className="mt-1.5 text-red-500 text-sm">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Message (optional) */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Message
                  </label>
                  <textarea
                    placeholder="How can we help you? (optional)"
                    rows={4}
                    disabled={isSubmitting}
                    {...register("message")}
                    className={`${inputNormalClass} resize-none`}
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button
                  text={isSubmitting ? "Sending..." : "Send Message"}
                  icon={isSubmitting ? undefined : FaPaperPlane}
                  className="w-full md:w-fit"
                  type="submit"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </form>

          {/* Map Section */}
          <div className="bg-gray-50 border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-4 md:p-6 flex flex-col gap-8 h-full">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Find Us On Map
            </h2>

            <div className="relative w-full flex-1 min-h-[300px] md:min-h-0 rounded-2xl overflow-hidden shadow-inner border border-gray-100">
              <iframe
                src={mapEmbedUrl}
                className="absolute inset-0 w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
