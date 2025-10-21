import React, { useEffect, useRef, useState } from 'react';
import { Message } from '../types';

interface GreetingPreviewProps {
    title: string;
    messages: Message[];
    musicUrl: string | null;
    onBackToEditor: () => void;
}

const letterImages = [
    "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f48c.svg", // letter
    "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f381.svg", // gift
    "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f338.svg", // flower
    "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f496.svg", // sparkling heart
    "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f382.svg", // birthday cake
    "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f38a.svg", // confetti
];

const heartIcons = ['💗', '💖', '💕', '💓', '💞', '💝'];

export const GreetingPreview: React.FC<GreetingPreviewProps> = ({
    title,
    messages,
    musicUrl,
    onBackToEditor,
}) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [popupMessage, setPopupMessage] = useState<Message | null>(null);
    const [centerText, setCenterText] = useState("Click on the falling items<br>to see your wishes!");
    const messageIndexRef = useRef(0);

    const createHeartExplosion = (x: number, y: number) => {
        const numHearts = 12;
        for (let i = 0; i < numHearts; i++) {
            const heart = document.createElement('div');
            heart.classList.add('heart', 'animate-explode');
            heart.textContent = heartIcons[Math.floor(Math.random() * heartIcons.length)];
            const angle = (Math.PI * 2 / numHearts) * i;
            const distance = Math.random() * 80 + 40;
            heart.style.position = 'fixed';
            heart.style.left = x + 'px';
            heart.style.top = y + 'px';
            heart.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
            heart.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
            heart.style.fontSize = `${Math.random() * 10 + 20}px`;
            heart.style.pointerEvents = 'none';
            heart.style.userSelect = 'none';
            heart.style.zIndex = '101';
            document.body.appendChild(heart);
            setTimeout(() => heart.remove(), 2000);
        }
    };

    const showPopup = (message: Message) => {
        setPopupMessage(message);
    };

    const closePopup = () => {
        if(popupMessage) {
            setCenterText(popupMessage.text);
        }
        setPopupMessage(null);
    };

    useEffect(() => {
        const createFallingLetter = () => {
            if (messages.length === 0) return;

            const letter = document.createElement("img");
            const randomImage = letterImages[Math.floor(Math.random() * letterImages.length)];
            letter.src = randomImage;
            letter.className = "falling-letter fixed top-[-100px] w-[50px] h-auto animate-fall cursor-pointer select-none z-[2] filter drop-shadow-lg transition-transform duration-300 ease-in-out hover:scale-125 hover:rotate-12";
            letter.style.left = `${Math.random() * (window.innerWidth - 50)}px`;
            letter.style.animationDuration = `${Math.random() * 5 + 7}s`;
            
            const handleClick = (e: MouseEvent) => {
                createHeartExplosion(e.clientX, e.clientY);
                letter.classList.add('letter-clicked');

                const messageToShow = messages[messageIndexRef.current];
                messageIndexRef.current = (messageIndexRef.current + 1) % messages.length;

                setTimeout(() => {
                    showPopup(messageToShow);
                    letter.remove();
                }, 500);
                letter.removeEventListener('click', handleClick);
            };

            letter.addEventListener("click", handleClick);

            document.body.appendChild(letter);

            setTimeout(() => {
                letter.remove();
            }, 12000);
        };
        
        const interval = setInterval(createFallingLetter, 1200);
        return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messages]);
    
    useEffect(() => {
        const playMusic = () => {
            if (audioRef.current && audioRef.current.paused) {
                audioRef.current.play().catch(console.error);
            }
            document.body.removeEventListener('click', playMusic);
        };
        document.body.addEventListener('click', playMusic);
        return () => document.body.removeEventListener('click', playMusic);
    }, []);

    return (
        <div className="h-screen w-screen bg-gradient-to-br from-rose-50 to-pink-100 overflow-hidden relative">
            <button onClick={onBackToEditor} className="absolute top-4 left-4 z-50 bg-white/70 text-pink-600 font-semibold px-4 py-2 rounded-full shadow-md hover:bg-white transition">
                Back to Editor
            </button>

            <div className="center-message fixed top-1/2 left-1/2 w-[90%] max-w-lg -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-white/95 to-rose-50/90 p-6 sm:p-10 rounded-3xl text-lg sm:text-xl font-normal text-pink-800 text-center shadow-2xl shadow-pink-500/20 z-[1] backdrop-blur-lg border-2 border-white/30 animate-[pulse_3s_ease-in-out_infinite]">
                <strong className="block text-2xl sm:text-3xl mb-4 font-bold bg-gradient-to-r from-pink-600 to-rose-400 bg-clip-text text-transparent animate-[gradient_3s_ease_infinite]">
                    {title}
                </strong>
                <span dangerouslySetInnerHTML={{ __html: centerText }} />
            </div>

            {popupMessage && (
                <>
                    <div className="overlay fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm z-[99] overlay-active" onClick={closePopup}></div>
                    <div className="popup fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-white to-rose-100 rounded-3xl shadow-2xl shadow-pink-500/40 p-5 sm:p-8 text-center z-[100] w-[90%] max-w-md popup-show border-4 border-white/80">
                        <div className="popup-content">
                            <img src={popupMessage.imageUrl} alt="Wish" className="w-full h-auto max-h-64 object-contain rounded-2xl mb-4 shadow-lg border-2 border-white" />
                            <p className="text-base sm:text-lg text-pink-700 leading-relaxed font-medium">
                                {popupMessage.text}
                            </p>
                            <button onClick={closePopup} className="mt-5 bg-gradient-to-r from-pink-500 to-rose-500 text-white border-none py-2 px-8 rounded-full cursor-pointer text-base font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all">
                                Close
                            </button>
                        </div>
                    </div>
                </>
            )}

            {musicUrl && <audio ref={audioRef} src={musicUrl} loop />}
        </div>
    );
};