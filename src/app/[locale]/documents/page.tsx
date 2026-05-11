"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Trash2, Maximize2, X, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Navigation } from "@/components/sections/Navigation";
import { Button } from "@/components/ui/Button";

interface Document {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadDate: Date;
  status: "processing" | "ready" | "error";
  summary?: string;
  language?: string;
}

const mockDocuments: Document[] = [
  {
    id: "1",
    name: "lease_agreement.pdf",
    size: "245 KB",
    type: "application/pdf",
    uploadDate: new Date("2024-03-15"),
    status: "ready",
    summary: "Standard residential lease agreement with 12-month term. Key provisions include monthly rent of $1,500, security deposit of $3,000, and standard maintenance responsibilities. Tenant responsible for utilities and minor repairs under $100."
  },
  {
    id: "2",
    name: "traffic_citation.pdf",
    size: "89 KB",
    type: "application/pdf",
    uploadDate: new Date("2024-03-10"),
    status: "ready",
    summary: "Traffic citation for speeding (15 mph over limit) in residential zone. Fine amount: $150. Requested court date: April 5, 2024. Possible defenses include calibration verification and timing inconsistencies."
  },
];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [dragActive, setDragActive] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [processing, setProcessing] = useState(false);

  const processFiles = useCallback((files: File[]) => {
    setProcessing(true);
    files.forEach((file) => {
      const newDoc: Document = {
        id: crypto.randomUUID(),
        name: file.name,
        size: `${Math.round(file.size / 1024)} KB`,
        type: file.type,
        uploadDate: new Date(),
        status: "processing",
      };
      setDocuments((prev) => [...prev, newDoc]);

      setTimeout(() => {
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === newDoc.id
              ? {
                  ...d,
                  status: "ready",
                  summary: "Document processed successfully. Key points extracted and summarized for easy understanding."
                }
              : d
          )
        );
      }, 2000 + Math.random() * 1000);
    });
    setProcessing(false);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  }, [processFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      processFiles(files);
    }
  }, [processFiles]);

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Document Understanding</h1>
          <p className="text-muted-foreground">
            Upload legal documents for plain-language explanations
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Upload Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-2xl p-8 text-center transition-colors mb-8",
            dragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          )}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileInput}
            accept=".pdf,.doc,.docx,.txt"
            multiple
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Drop files here or click to upload</h3>
            <p className="text-sm text-muted-foreground">
              Supports PDF, DOC, DOCX, TXT up to 10MB
            </p>
          </label>
        </div>

        {processing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing documents...
          </div>
        )}

        {/* Documents List */}
        <div className="space-y-3">
          <h2 className="font-semibold text-lg">Uploaded Documents</h2>
          <AnimatePresence>
            {documents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No documents uploaded yet</p>
              </div>
            ) : (
              documents.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-background border rounded-xl p-4 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{doc.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span>{doc.uploadDate.toLocaleDateString()}</span>
                        {doc.status === "processing" && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Processing
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {doc.status === "ready" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedDoc(doc)}
                        >
                          <Maximize2 className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteDocument(doc.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {doc.summary && doc.status === "ready" && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-muted-foreground">{doc.summary}</p>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Document Detail Modal */}
      <AnimatePresence>
        {selectedDoc && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
              onClick={() => setSelectedDoc(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[80vh] bg-background border rounded-2xl shadow-xl z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="font-semibold">{selectedDoc.name}</h2>
                <Button variant="ghost" size="icon" onClick={() => setSelectedDoc(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="prose prose-sm max-w-none">
                  <h3 className="text-lg font-semibold mb-4">Summary</h3>
                  <p>{selectedDoc.summary}</p>

                  <h3 className="text-lg font-semibold mt-6 mb-4">Key Points</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary mt-2" />
                      Document type: {selectedDoc.name.split(".").pop()?.toUpperCase()} file
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary mt-2" />
                      File size: {selectedDoc.size}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary mt-2" />
                      Upload date: {selectedDoc.uploadDate.toLocaleDateString()}
                    </li>
                  </ul>

                  <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                    <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200 mb-2">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">Important Notice</span>
                    </div>
                    <p className="text-sm">
                      This is an educational summary. For specific legal advice about this document,
                      please consult a licensed attorney in your jurisdiction.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}