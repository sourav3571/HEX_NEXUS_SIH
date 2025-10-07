// Home.tsx - MODIFIED CODE TO COMBINE ANALYSIS AND RECREATION

import { useMutation } from "@tanstack/react-query";
import api from "../../lib/axios/axios";
import { API_ROUTES } from "../../lib/api";
import { useRef, useState, useEffect } from "react";
import { JsonViewer } from "../ui/home/JsonViewer";
import MessageBox from "../ui/home/MessageBox";
import AnimatedKolamSVG from "../ui/home/AnimatedKolamSVG";
import MessageBoxSkeleton from "../ui/home/MessageBoxSkeleton";
import KolamSkeleton from "../ui/home/KolamSkeleton";
import React from 'react';

// Define a common structure for image-related results to be used in history
type OperationData = {
    id: string;
    timestamp: number;
    type: 'analysis' | 'render' | 'recreate';
    data: {
        knowYourKolam?: string;
        searchKolam?: string[];
        predictKolam?: string;
        renderedImage?: string;
        recreatedImage?: string;
        metrics?: {
            dot_count?: number;
            path_count?: number;
            symmetry_percentage?: number;
            repetition_percentage?: number;
            pattern_type?: string;
        };
    };
};

export default function Home() {
    const inputRef = useRef<HTMLInputElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [operationHistory, setOperationHistory] = useState<OperationData[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isRecreating, setIsRecreating] = useState(false);

    // Auto-scroll to bottom when new operations are added
    useEffect(() => {
        if (scrollContainerRef.current && operationHistory.length > 0) {
            scrollContainerRef.current.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [operationHistory.length]);

    // API Mutations (No changes to the basic mutation functions)
    const knowYourKolamMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append("file", file);
            const res = await api.post(API_ROUTES.KOLAM.KNOW_YOUR_KOLAM, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data;
        }
    });

    const searchKolamMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append("file", file);
            const res = await api.post(API_ROUTES.KOLAM.SEARCH, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data.matches;
        }
    });

    const predictKolamMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append("file", file);
            const res = await api.post(API_ROUTES.KOLAM.PREDICT, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data.prediction;
        }
    });

    const renderKolamMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await api.post(API_ROUTES.KOLAM.RENDER, data, {
                headers: { "Content-Type": "application/json" },
            });
            return res.data.file;
        },
        onSuccess: (renderedImage: string) => {
            const renderEntry: OperationData = {
                id: Date.now().toString(),
                timestamp: Date.now(),
                type: 'render' as const,
                data: { renderedImage }
            };
            setOperationHistory(prev => [...prev, renderEntry]);

            const existing = localStorage.getItem("userKolams");
            const kolams = existing ? JSON.parse(existing) : [];
            kolams.unshift({
                id: Date.now(),
                title: `My Kolam #${kolams.length + 1}`,
                image: renderedImage.startsWith("http") ? renderedImage : `${import.meta.env.VITE_API_URL}/${renderedImage}`
            });
            localStorage.setItem("userKolams", JSON.stringify(kolams));
        }
    });

    // Kolam Re-creation Mutation
    const recreateKolamMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append("file", file);
            const res = await api.post<{
                image_url: string;
                metrics: any;
            }>(API_ROUTES.KOLAM.KNOW_AND_CREATE, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data;
        },
        onSuccess: (data) => {
            const recreateEntry: OperationData = {
                id: (Date.now() + 1).toString(), // Ensure unique ID
                timestamp: Date.now() + 1,
                type: 'recreate' as const,
                data: { recreatedImage: data.image_url, metrics: data.metrics }
            };
            setOperationHistory(prev => [...prev, recreateEntry]);

            // Save to Community page (optional, based on your original logic)
            const existing = localStorage.getItem("userKolams");
            const kolams = existing ? JSON.parse(existing) : [];
            kolams.unshift({
                id: Date.now(),
                title: `Recreated Kolam #${kolams.length + 1}`,
                image: data.image_url.startsWith("http") ? data.image_url : `${import.meta.env.VITE_API_URL}/${data.image_url}`,
                metrics: `${data.metrics}`
            });
            localStorage.setItem("userKolams", JSON.stringify(kolams));
        }
    });

    // MODIFIED: handleAnalyze now includes the recreation step
    const handleAnalyze = async () => {
        if (!file) return;

        // Clone the file to pass to the recreate step later, as the original file state will be cleared.
        // NOTE: We'll use the original 'file' state variable directly until the end of the try block.
        const originalFile = file;

        try {
            // 1. Run Initial Analysis
            setIsAnalyzing(true);
            const [knowResult, searchResult, predictResult] = await Promise.all([
                knowYourKolamMutation.mutateAsync(originalFile),
                searchKolamMutation.mutateAsync(originalFile),
                predictKolamMutation.mutateAsync(originalFile)
            ]);

            const analysisEntry: OperationData = {
                id: Date.now().toString(),
                timestamp: Date.now(),
                type: 'analysis' as const,
                data: {
                    knowYourKolam: JSON.stringify(knowResult),
                    searchKolam: searchResult,
                    predictKolam: predictResult
                }
            };
            setOperationHistory(prev => ([...prev, analysisEntry]));
            setIsAnalyzing(false);

            // 2. Render the initial (potentially imperfect) analyzed Kolam
            await renderKolamMutation.mutateAsync(knowResult);

            // 3. AUTOMATIC RECREATION: Get the clean, symmetric image
            // Note: We await the recreation, but use its onSuccess to handle state update.
            setIsRecreating(true);
            await recreateKolamMutation.mutateAsync(originalFile);
            setIsRecreating(false);

            // 4. Clear input fields
            setFile(null);
            setPreview(null);
            if (inputRef.current) inputRef.current.value = "";
        } catch (error) {
            console.error('Error in analyze and recreate flow:', error);
            setIsAnalyzing(false);
            setIsRecreating(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPreview(URL.createObjectURL(file));
            setFile(file);
        }
    };

    return (
        <div className="grid grid-cols-5 h-full w-full">
            <div className="col-span-4 p-8 w-full bg-gray-50 h-screen overflow-y-auto" ref={scrollContainerRef}>
                <div className="flex flex-col gap-8 h-full">
                    {(!operationHistory || operationHistory.length < 1) && !isAnalyzing && !isRecreating && (
                        <div className="w-full h-full bg-white rounded-2xl p-4 flex items-center justify-center flex-col">
                            <img src="/logo.webp" alt="" />
                            <p className="text-gray-500">Upload a kolam image to get started</p>
                        </div>
                    )}

                    {operationHistory.map(operation => {
                        if (operation.type === 'analysis') {
                            return (
                                <div key={operation.id} className="flex flex-col gap-6">
                                    <MessageBox width="fit-content" text={`Hmm, I think it's from the ${operation.data.predictKolam}, known as ${operation.data.predictKolam === "Maharastra" ? "Rangoli" : "Kolam"}.\nSimilar kolams found:`}>
                                        <div className="grid grid-cols-3 gap-4">
                                            {operation.data.searchKolam?.map(imgstr => (
                                                <div key={imgstr} className="h-[200px] overflow-hidden aspect-square rounded-lg border border-gray-200">
                                                    <img
                                                        src={imgstr.startsWith('http') ? imgstr : `${import.meta.env.VITE_API_URL}/${imgstr}`}
                                                        alt="Similar kolam"
                                                        className="object-cover w-full h-full"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </MessageBox>
                                    <MessageBox width="fit-content" text={`Mathematical representation of your kolam:`}>
                                        <JsonViewer text={operation.data.knowYourKolam || ""} />
                                    </MessageBox>
                                </div>
                            );
                        }
                        // else if (operation.type === 'render') {
                        //     // This is the initial analysis render
                        //     return (
                        //         <MessageBox key={operation.id} width="fit-content" text={`Here's the kolam rendered from initial analysis:`}>
                        //             <div className="w-full rounded-lg border border-gray-200 bg-white p-4">
                        //                 <img 
                        //                     src={operation.data.renderedImage?.startsWith("http") ? operation.data.renderedImage : `${import.meta.env.VITE_API_URL}/${operation.data.renderedImage}`}
                        //                     alt="Rendered kolam"
                        //                     className="w-full h-auto object-contain"
                        //                 />
                        //             </div>
                        //         </MessageBox>
                        //     );
                        // } 
                        else if (operation.type === 'recreate') {
                            // This is the automatically generated symmetrical kolam
                            return (
                                <MessageBox key={operation.id} width="fit-content" text={`Automatically generated clean, symmetric Kolam:`}>
                                    <div className="flex flex-col gap-4 max-w-xl">
                                        <div className="w-full rounded-lg border border-gray-200 bg-white p-8">
                                            <AnimatedKolamSVG
                                                svgUrl={operation.data.recreatedImage?.startsWith("http") ? operation.data.recreatedImage : `${import.meta.env.VITE_API_URL}/${operation.data.recreatedImage}`}
                                            />
                                        </div>
                                        <div className="text-gray-600 mt-4">
                                            This kolam was recreated using advanced AI techniques to ensure symmetry and clarity, based on the initial analysis.
                                            Metrics:
                                            {
                                                operation.data.metrics ? (
                                                    <div>
                                                        <ul className="list-disc list-inside mt-2">
                                                            {operation.data.metrics.dot_count !== undefined && <li>Dot Count: {operation.data.metrics.dot_count}</li>}
                                                            {operation.data.metrics.path_count !== undefined && <li>Path Count: {operation.data.metrics.path_count}</li>}
                                                            {operation.data.metrics.symmetry_percentage !== undefined && <li>Symmetry Percentage: {operation.data.metrics.symmetry_percentage}%</li>}
                                                            {operation.data.metrics.repetition_percentage !== undefined && <li>Repetition Percentage: {operation.data.metrics.repetition_percentage}%</li>}
                                                            {operation.data.metrics.pattern_type && <li>Pattern Type: {operation.data.metrics.pattern_type}</li>}
                                                        </ul>
                                                    </div>
                                                ) : " No metrics available."
                                            }
                                        </div>
                                        <div className="mt-4">
                                            <a
                                                href={operation.data.recreatedImage?.startsWith("http") ? operation.data.recreatedImage : `${import.meta.env.VITE_API_URL}/${operation.data.recreatedImage}`}
                                                download="recreated_kolam.svg"
                                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                            >
                                                📥 Download Symmetrical Kolam
                                            </a>
                                        </div>
                                    </div>
                                </MessageBox>
                            );
                        }
                        return null;
                    })}
                    {isAnalyzing && (
                        <div className="flex flex-col gap-6">
                            <MessageBoxSkeleton />
                            <MessageBoxSkeleton />
                        </div>
                    )}

                    {isRecreating && <KolamSkeleton />}
                </div>
            </div>

            {/* sidebar */}
            <div className="col-span-1 border-l border-gray-200 p-5">
                <input type="file" accept="image/*" ref={inputRef} onChange={handleFileChange} className="hidden" />

                <div
                    className="w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-2xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition overflow-hidden"
                    onClick={() => inputRef.current?.click()}
                >
                    {preview ? <img src={preview} alt="Preview" className="object-contain w-full h-full" /> : (
                        <>
                            <span className="text-4xl text-gray-500">+</span>
                            <p className="text-gray-600 mt-2">Upload Photo</p>
                        </>
                    )}
                </div>

                {file && (
                    <div className="flex flex-col gap-2 mt-4">
                        <button
                            className="px-4 py-2 text-primary border-1 font-semibold border-primary rounded-lg bg-white hover:bg-blue-50 transition-colors"
                            onClick={handleAnalyze}
                            // Disabled if ANY of the chained mutations are pending
                            disabled={knowYourKolamMutation.isPending || searchKolamMutation.isPending || predictKolamMutation.isPending || renderKolamMutation.isPending || recreateKolamMutation.isPending}
                        >
                            {(knowYourKolamMutation.isPending || searchKolamMutation.isPending || predictKolamMutation.isPending || renderKolamMutation.isPending || recreateKolamMutation.isPending) ? "Processing All Steps..." : "Analyze & Recreate"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}