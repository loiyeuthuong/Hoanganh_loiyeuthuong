import React, { useState } from 'react';
import { Message } from '../types';
import { UploadIcon, MusicIcon, GiftIcon, SparklesIcon, XIcon, QRCodeIcon } from './icons';

interface GreetingCreatorProps {
    title: string;
    setTitle: (title: string) => void;
    messages: Message[];
    setMessages: (messages: Message[]) => void;
    setMusicFile: (file: File | null) => void;
    onPreview: () => void;
}

export const GreetingCreator: React.FC<GreetingCreatorProps> = ({
    title,
    setTitle,
    messages,
    setMessages,
    setMusicFile,
    onPreview,
}) => {
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    
    const handleAddMessage = () => {
        if (messages.length < 5) {
            setMessages([...messages, { id: Date.now(), image: null, text: '' }]);
        }
    };

    const handleMessageChange = <T extends keyof Message>(
        id: number,
        field: T,
        value: Message[T]
    ) => {
        setMessages(
            messages.map((msg) => (msg.id === id ? { ...msg, [field]: value } : msg))
        );
    };

    const handleRemoveMessage = (id: number) => {
        setMessages(messages.filter((msg) => msg.id !== id));
    };

    const fileToBase64 = (file: File, quality = 0.7, maxWidth = 800): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const reader = new FileReader();

            reader.onload = (e) => {
                if (typeof e.target?.result !== 'string') {
                    return reject(new Error('FileReader did not return a string.'));
                }
                img.src = e.target.result;
            };
            reader.onerror = (error) => reject(error);

            img.onload = () => {
                let { width, height } = img;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round(height * (maxWidth / width));
                        width = maxWidth;
                    }
                } else {
                    if (height > maxWidth) {
                        width = Math.round(width * (maxWidth / height));
                        height = maxWidth;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    return reject(new Error('Failed to get canvas context.'));
                }

                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    };

    const handleGenerateQrCode = async () => {
        const messagesToShare = messages.filter(m => m.image && m.text.trim());
        if (messagesToShare.length === 0) return;

        try {
            const messagesWithBase64 = await Promise.all(
                messagesToShare.map(async (msg) => {
                    const imageUrl = await fileToBase64(msg.image!);
                    return { text: msg.text, imageUrl };
                })
            );

            const cardData = {
                title,
                messages: messagesWithBase64,
            };

            const serializedData = JSON.stringify(cardData);
            const encodedData = btoa(encodeURIComponent(serializedData));

            const shareableUrl = `${window.location.origin}${window.location.pathname}?card=${encodedData}`;
            
            if (shareableUrl.length > 2000) {
                 alert("The generated card is too large to create a QR code. Please use fewer or smaller images.");
                 return;
            }

            const qrApiUrl = `https://chart.googleapis.com/chart?cht=qr&chs=250x250&chl=${encodeURIComponent(shareableUrl)}`;
            setQrCodeUrl(qrApiUrl);
        } catch (error) {
            console.error("Error generating QR code:", error);
            alert("Sorry, there was an error creating the QR code. Please try again.");
        }
    };

    return (
        <div className="bg-rose-50 min-h-screen text-gray-800">
            <div className="container mx-auto p-4 sm:p-8 max-w-4xl">
                <header className="text-center mb-10">
                    <h1 className="text-4xl sm:text-5xl font-bold text-pink-600 tracking-tight">
                        Greeting Card Creator
                    </h1>
                    <p className="text-pink-500 mt-2 text-lg">
                        Design your own animated celebration page!
                    </p>
                </header>

                <div className="space-y-8">
                    {/* Main Greeting Section */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-pink-100">
                        <h2 className="text-2xl font-semibold text-pink-700 mb-4 flex items-center gap-2">
                           <SparklesIcon /> Main Greeting
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:ring-pink-500 focus:border-pink-500 transition"
                                    placeholder="e.g., Happy Birthday!"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Image & Wishes Section */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-pink-100">
                         <h2 className="text-2xl font-semibold text-pink-700 mb-4 flex items-center gap-2">
                           <GiftIcon /> Images & Wishes ({messages.length}/5)
                        </h2>
                        <div className="space-y-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className="p-4 bg-rose-50 rounded-lg border border-pink-200 flex flex-col sm:flex-row items-start gap-4 relative">
                                    <div className="flex-shrink-0 w-24 h-24 bg-pink-100 rounded-md flex items-center justify-center">
                                       {msg.image ? (
                                            <img src={URL.createObjectURL(msg.image)} alt="Preview" className="w-full h-full object-cover rounded-md" />
                                        ) : (
                                            <UploadIcon />
                                        )}
                                    </div>
                                    <div className="flex-grow w-full">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => e.target.files && handleMessageChange(msg.id, 'image', e.target.files[0])}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-100 file:text-pink-700 hover:file:bg-pink-200 transition cursor-pointer"
                                        />
                                        <textarea
                                            value={msg.text}
                                            onChange={(e) => handleMessageChange(msg.id, 'text', e.target.value)}
                                            rows={2}
                                            className="mt-2 w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-pink-500 focus:border-pink-500 transition"
                                            placeholder={`Wish for image #${messages.indexOf(msg) + 1}`}
                                        />
                                    </div>
                                     <button
                                        onClick={() => handleRemoveMessage(msg.id)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                                        aria-label="Remove message"
                                    >
                                        <XIcon />
                                    </button>
                                </div>
                            ))}
                        </div>
                        {messages.length < 5 && (
                            <button
                                onClick={handleAddMessage}
                                className="mt-4 w-full bg-pink-200 text-pink-800 font-semibold py-2 px-4 rounded-lg hover:bg-pink-300 transition"
                            >
                                + Add Image & Wish
                            </button>
                        )}
                    </div>
                    
                    {/* Attachments Section */}
                     <div className="bg-white p-6 rounded-2xl shadow-lg border border-pink-100">
                       <h2 className="text-2xl font-semibold text-pink-700 mb-4 flex items-center gap-2">
                           <MusicIcon /> Background Music
                        </h2>
                        <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => e.target.files && setMusicFile(e.target.files[0])}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-100 file:text-violet-700 hover:file:bg-violet-200 transition cursor-pointer"
                        />
                    </div>

                    <div className="pt-6 flex flex-col items-center">
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={onPreview}
                                disabled={messages.filter(m => m.image && m.text).length === 0}
                                className="bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-3 px-10 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
                            >
                                Generate & Preview
                            </button>
                            <button
                                onClick={handleGenerateQrCode}
                                disabled={messages.filter(m => m.image && m.text).length === 0}
                                className="bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-3 px-10 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg flex items-center gap-2"
                            >
                               <QRCodeIcon /> Generate QR Code
                            </button>
                        </div>
                         {messages.filter(m => m.image && m.text).length === 0 && (
                            <p className="text-sm text-red-500 mt-2">Please add at least one image and wish to preview or generate a QR code.</p>
                        )}
                    </div>
                </div>
            </div>
            {qrCodeUrl && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overlay-active" onClick={() => setQrCodeUrl(null)}>
                    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-sm text-center popup-show" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Share Your Greeting!</h3>
                        <p className="text-gray-600 mb-4">Scan this QR code with a phone camera to open the greeting card.</p>
                        <div className="p-2 border-4 border-gray-200 rounded-lg inline-block bg-white">
                             <img src={qrCodeUrl} alt="QR Code" width="250" height="250" />
                        </div>
                        <button
                            onClick={() => setQrCodeUrl(null)}
                            className="mt-6 w-full bg-pink-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-pink-600 transition"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};