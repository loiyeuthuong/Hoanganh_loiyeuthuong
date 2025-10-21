import React, { useState, useEffect } from 'react';
import { GreetingCreator } from './components/GreetingCreator';
import { GreetingPreview } from './components/GreetingPreview';
import { Message } from './types';

const App: React.FC = () => {
    const [isCreating, setIsCreating] = useState(true);
    const [isLoadingFromUrl, setIsLoadingFromUrl] = useState(true);

    const [title, setTitle] = useState("Chúc mừng ngày 20/10");
    const [messages, setMessages] = useState<Message[]>([]);
    
    const [musicFile, setMusicFile] = useState<File | null>(null);
    const [musicUrl, setMusicUrl] = useState<string | null>(null);

    useEffect(() => {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const cardDataParam = urlParams.get('card');

            if (cardDataParam) {
                const decodedData = decodeURIComponent(atob(cardDataParam));
                const cardData = JSON.parse(decodedData);

                if (cardData.title && cardData.messages) {
                    setTitle(cardData.title);
                    const loadedMessages: Message[] = cardData.messages.map((msg: any, index: number) => ({
                        id: Date.now() + index,
                        image: null, // No file object when loading from URL
                        imageUrl: msg.imageUrl,
                        text: msg.text,
                    }));
                    setMessages(loadedMessages);
                    setIsCreating(false);
                }
            }
        } catch (error) {
            console.error("Failed to load card from URL:", error);
            // In case of error, just proceed to the creator.
        } finally {
            setIsLoadingFromUrl(false);
        }
    }, []);

    useEffect(() => {
        if (musicFile) {
            const url = URL.createObjectURL(musicFile);
            setMusicUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [musicFile]);

    const handlePreview = () => {
      const messagesWithUrls = messages.map(msg => {
        if (msg.image && !msg.imageUrl) {
          return { ...msg, imageUrl: URL.createObjectURL(msg.image) };
        }
        return msg;
      });
      setMessages(messagesWithUrls);
      setIsCreating(false);
    };

    const handleBackToEditor = () => {
        // When going back to editor, clear the URL param to avoid confusion
        window.history.pushState({}, '', window.location.pathname);
        setIsCreating(true);
    };
    
    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => {
            messages.forEach(msg => {
                if (msg.imageUrl && msg.imageUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(msg.imageUrl);
                }
            });
        };
    }, [messages]);

    if (isLoadingFromUrl) {
        return (
            <div className="h-screen w-screen bg-rose-50 flex items-center justify-center">
                <div className="text-pink-500 text-2xl font-semibold animate-pulse">Loading your card...</div>
            </div>
        );
    }

    if (isCreating) {
        return (
            <GreetingCreator
                title={title}
                setTitle={setTitle}
                messages={messages}
                setMessages={setMessages}
                setMusicFile={setMusicFile}
                onPreview={handlePreview}
            />
        );
    }

    return (
        <GreetingPreview
            title={title}
            messages={messages.filter(m => (m.image || m.imageUrl) && m.text.trim())} // only show valid messages
            musicUrl={musicUrl}
            onBackToEditor={handleBackToEditor}
        />
    );
};

export default App;
