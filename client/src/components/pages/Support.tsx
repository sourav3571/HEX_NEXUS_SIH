import { useState } from "react";

export default function Support() {
  // --- All of your state and logic remains completely unchanged ---
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    issue: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this data to a backend.
    alert("Thank you for your feedback! We'll get back to you soon.");
    setFormData({ name: "", email: "", issue: "", message: "" });
  };

  // --- Your updated FAQ content is preserved ---
  const faqs = [
    { question: "How to search Kolam designs by state?", answer: "Go to the Learn page and select the state buttons at the top to view designs from that state." },
    { question: "How to download Kolam designs?", answer: "Click on any design image to open it in full size, then right-click and select 'Save image as...'." },
    { question: "Can I upload my own designs?", answer: "Absolutely! You can easily upload your own designs and showcase your creativity. Our platform supports custom uploads, so your personal touch shines through in every creation." },
    { question: "What is the 'Recreate' feature?", answer: "The Recreate feature uses AI to generate a new, more aesthetic version of a kolam design you provide. You can either draw one or upload an image." },
  ];

  // --- The visual structure (JSX) is enhanced below ---
  return (
    // MODIFIED: Added 'relative' and 'overflow-hidden' for the new background
    <div className="relative min-h-screen bg-slate-50 text-slate-800 overflow-hidden">
      
      {/* ADDED: Decorative animated gradient background */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-20 right-20 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* MODIFIED: Added 'relative' and 'z-10' to place content above the background */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900">Support & Help</h1>
          <p className="mt-4 text-lg text-slate-600">
            We're here to help. Find answers to common questions or send us a message directly.
          </p>
        </div>

        {/* --- The rest of your component's structure is the same, but with new classes --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold text-slate-900 border-b pb-3">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                // MODIFIED: Added glassmorphism effect and interactive group styles
                <details key={index} className="group bg-white/70 backdrop-blur-sm p-4 rounded-lg shadow-sm cursor-pointer transition hover:shadow-md">
                  <summary className="flex justify-between items-center font-semibold text-slate-900 list-none">
                    {faq.question}
                    <span className="transform transition-transform duration-300 group-open:rotate-180">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </span>
                  </summary>
                  <p className="mt-3 pt-3 border-t border-slate-300/50 text-slate-700">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-semibold text-slate-900 border-b pb-3">
              Send Us a Message
            </h2>
            {/* MODIFIED: Added glassmorphism effect to the form card */}
            <form onSubmit={handleSubmit} className="space-y-5 bg-white/70 backdrop-blur-sm p-6 rounded-lg shadow-sm">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
                <input
                  type="text" id="name" name="name" value={formData.name} onChange={handleChange}
                  placeholder="e.g., Sourav Kumar"
                  className="w-full p-2.5 bg-white/50 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Your Email</label>
                <input
                  type="email" id="email" name="email" value={formData.email} onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full p-2.5 bg-white/50 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" required
                />
              </div>
              <div>
                <label htmlFor="issue" className="block text-sm font-medium text-slate-700 mb-1">Issue Type</label>
                <select
                  id="issue" name="issue" value={formData.issue} onChange={handleChange}
                  className="w-full p-2.5 bg-white/50 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" required
                >
                  <option value="" disabled>Select an issue...</option>
                  <option value="Bug">Technical Issue / Bug</option>
                  <option value="Suggestion">Feature Suggestion</option>
                  <option value="Feedback">General Feedback</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                <textarea
                  id="message" name="message" value={formData.message} onChange={handleChange}
                  placeholder="Please describe your issue or feedback in detail..."
                  className="w-full p-2.5 bg-white/50 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  rows={5} required
                />
              </div>
              <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-bold px-4 py-3 rounded-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Submit Feedback
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}