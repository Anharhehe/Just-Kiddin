"use client";

import type { ChangeEvent, ComponentType, FormEvent } from "react";
import { useState } from "react";
import { CheckCircle2, Loader2, Mail, MessageSquare, Phone, Send, User } from "lucide-react";

type Status = "idle" | "submitting" | "success" | "error";

type Props = {
  apiBaseUrl: string;
};

type FieldProps = {
  icon: ComponentType<{ className?: string }>;
  type?: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  required?: boolean;
};

export default function ContactForm({ apiBaseUrl }: Props) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (status === "submitting") return;

    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/contact-queries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const payload = (await response.json().catch(() => null)) as { success?: boolean; message?: string } | null;

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.message ?? "Failed to send message");
      }

      setStatus("success");
      setFormData({ name: "", email: "", mobile: "", subject: "", message: "" });
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to send message");
    }
  };

  if (status === "success") {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[1.5rem] border border-[#e3dccb] bg-white p-8 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#3a988a]/15 text-[#3a988a]">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <h3 className="mt-5 text-2xl font-bold" style={{ fontFamily: "'Baloo 2', cursive" }}>
          Message Sent!
        </h3>
        <p className="mt-2 max-w-sm text-sm leading-6 text-[#7A6F5D]">
          Thanks for reaching out. We’ll get back to you within 24 hours.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 rounded-full bg-[#ff7d6b] px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-[34rem]">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field icon={User} name="name" placeholder="Your name" value={formData.name} onChange={handleChange} required />
        <Field icon={Mail} type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field icon={Phone} type="tel" name="mobile" placeholder="03XX XXXXXXX" value={formData.mobile} onChange={handleChange} required />
        <label className="relative block">
          <span className="sr-only">Subject</span>
          <MessageSquare className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A6F5D]" />
          <select
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="h-11 w-full rounded-xl border border-[#e3dccb] bg-white pl-10 pr-3 text-sm text-[#0F2540] outline-none transition-colors focus:border-[#ff7d6b]"
          >
            <option value="" disabled>
              Select a topic
            </option>
            <option>Order Inquiry</option>
            <option>Product Question</option>
            <option>Sizing Help</option>
            <option>Feedback</option>
            <option>Wholesale / Bulk Order</option>
            <option>Something Else</option>
          </select>
        </label>
      </div>

      <label className="relative block">
        <span className="sr-only">Message</span>
        <MessageSquare className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[#7A6F5D]" />
        <textarea
          name="message"
          rows={5}
          value={formData.message}
          onChange={handleChange}
          required
          placeholder="Tell us what’s on your mind..."
          className="w-full resize-none rounded-xl border border-[#e3dccb] bg-white pl-10 pr-3 py-3 text-sm text-[#0F2540] outline-none transition-colors focus:border-[#ff7d6b]"
        />
      </label>

      {status === "error" && errorMessage ? (
        <p className="text-sm text-red-600" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff7d6b] px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            Send Message
            <Send className="h-4 w-4 " />
          </>
        )}
      </button>
    </form>
  );
}

function Field({
  icon: Icon,
  type = "text",
  name,
  placeholder,
  value,
  onChange,
  required,
}: FieldProps) {
  return (
    <label className="relative block">
      <span className="sr-only">{placeholder}</span>
      <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A6F5D]" />
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="h-11 w-full rounded-xl border border-[#e3dccb] bg-white pl-10 pr-3 text-sm text-[#0F2540] outline-none transition-colors focus:border-[#ff7d6b]"
      />
    </label>
  );
}