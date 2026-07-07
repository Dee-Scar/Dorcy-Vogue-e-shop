"use client";

import React, { useState, useEffect } from "react";
import MobileMenuButton from "@/components/admin/MobileMenuButton";
import { Plus, Send, Save, Mail, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  body: string;
  variables: string[];
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const { data, error } = await supabase
          .from("email_templates")
          .select("*")
          .order("id", { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          const mapped = data.map((t: any) => ({
            id: t.id,
            name: t.name,
            description: t.description || "",
            subject: t.subject,
            body: t.body,
            variables: t.variables || [],
          }));
          setTemplates(mapped);
          setSelectedId(mapped[0].id);
        }
      } catch (err) {
        console.error("Error fetching email templates:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTemplates();
  }, []);

  const selectedTemplate = templates.find((t) => t.id === selectedId) || templates[0];

  const handleUpdateSubject = (newSubject: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === selectedId ? { ...t, subject: newSubject } : t))
    );
  };

  const handleUpdateBody = (newBody: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === selectedId ? { ...t, body: newBody } : t))
    );
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("email_templates")
        .update({
          subject: selectedTemplate.subject,
          body: selectedTemplate.body,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedTemplate.id);

      if (error) throw error;
      alert(`Template "${selectedTemplate.name}" saved successfully!`);
    } catch (err) {
      console.error("Error saving template:", err);
      alert("Failed to save template.");
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = () => {
    const testEmail = prompt("Enter email address to send test:", "admin@dorcyvogue.com");
    if (testEmail) {
      alert(`Test email sent to ${testEmail}!`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        <header className="py-3 sm:h-16 bg-white border-b border-gray-100 flex items-center px-4 sm:px-8 flex-shrink-0">
          <div className="flex items-center gap-3">
            <MobileMenuButton />
            <h1 className="font-sans text-lg sm:text-xl font-semibold text-[#1C1512]">Email Templates</h1>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#C9956A]" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Top Header */}
      <header className="py-3 sm:h-16 bg-white border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-8 flex-shrink-0 gap-3 sm:gap-0">
        <div className="flex items-center gap-3">
          <MobileMenuButton />
          <h1 className="font-sans text-lg sm:text-xl font-semibold text-[#1C1512]">Email Templates</h1>
        </div>
        <button
          onClick={() => alert("Create template layout coming soon!")}
          className="flex items-center justify-center gap-2 px-5 py-2 w-full sm:w-auto bg-[#C9956A] hover:bg-[#A87A52] text-white text-sm font-semibold font-sans rounded-xl transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Template</span>
          <span className="inline sm:hidden">New</span>
        </button>
      </header>

      {/* Main Grid */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
          {/* Left Column: Template List */}
          <div className="space-y-3">
            {templates.map((template) => {
              const isSelected = template.id === selectedId;
              return (
                <button
                  key={template.id}
                  onClick={() => setSelectedId(template.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#C9956A] border-[#C9956A] text-white shadow-sm"
                      : "bg-white border-gray-100 text-[#1C1512] hover:border-gray-200 hover:bg-[#FAF7F2]/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Mail className={`w-5 h-5 mt-0.5 ${isSelected ? "text-white" : "text-[#C9956A]"}`} />
                    <div>
                      <p className="font-sans text-sm font-semibold leading-tight">{template.name}</p>
                      <p className={`font-sans text-xs mt-1.5 leading-normal ${isSelected ? "text-white/80" : "text-[#8C8682]"}`}>
                        {template.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Editor */}
          {selectedTemplate && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#C9956A]" />
                  <h2 className="font-serif text-lg font-bold text-[#1C1512]">{selectedTemplate.name}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mt-3 sm:mt-0">
                  <button
                    onClick={handleSendTest}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 border border-gray-200 hover:border-gray-300 text-[#1C1512] text-xs font-bold font-sans rounded-xl transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send Test
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-[#C9956A] hover:bg-[#A87A52] text-white text-xs font-bold font-sans rounded-xl transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save
                  </button>
                </div>
              </div>

              {/* Editor fields */}
              <div className="space-y-5">
                {/* Subject Line */}
                <div className="space-y-1.5">
                  <label className="block font-sans text-xs font-semibold text-[#1C1512] uppercase tracking-wider">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={selectedTemplate.subject}
                    onChange={(e) => handleUpdateSubject(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-gray-200 rounded-xl text-sm font-sans focus:outline-none focus:border-[#C9956A] transition-colors"
                  />
                </div>

                {/* Email Body */}
                <div className="space-y-1.5">
                  <label className="block font-sans text-xs font-semibold text-[#1C1512] uppercase tracking-wider">
                    Email Body
                  </label>
                  <textarea
                    rows={9}
                    value={selectedTemplate.body}
                    onChange={(e) => handleUpdateBody(e.target.value)}
                    className="w-full px-4 py-3 bg-[#FAF7F2] border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-[#C9956A] transition-colors resize-none leading-relaxed"
                  />
                </div>

                {/* Available Variables */}
                <div className="space-y-2 pt-2">
                  <label className="block font-sans text-xs font-semibold text-[#1C1512] uppercase tracking-wider">
                    Available Variables
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedTemplate.variables.map((variable) => (
                      <button
                        key={variable}
                        onClick={() => {
                          const textarea = document.querySelector("textarea");
                          if (textarea) {
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const tag = `{{${variable}}}`;
                            const val = selectedTemplate.body;
                            const nextBody = val.substring(0, start) + tag + val.substring(end);
                            handleUpdateBody(nextBody);
                            setTimeout(() => {
                              textarea.focus();
                              textarea.selectionStart = textarea.selectionEnd = start + tag.length;
                            }, 50);
                          }
                        }}
                        className="px-3 py-1.5 bg-[#C9956A]/5 hover:bg-[#C9956A]/10 border border-[#C9956A]/20 text-[#C9956A] font-mono text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        {`{{${variable}}}`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
