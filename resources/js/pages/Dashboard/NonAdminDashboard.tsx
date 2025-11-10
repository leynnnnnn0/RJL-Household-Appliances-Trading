import { useState, useEffect } from 'react';
import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Star, Gift, Zap } from "lucide-react";
import Image1 from "../../../images/advertisements/1.jpg";
import Image2 from "../../../images/advertisements/2.jpg";
import Image3 from "../../../images/advertisements/3.jpg";
import Image4 from "../../../images/advertisements/4.jpg";
import Image5 from "../../../images/advertisements/5.jpg";

export default function NonAdminDashboard(): JSX.Element {
    const [currentSlide, setCurrentSlide] = useState<number>(0);
    const [userName] = useState<string>("User"); // Replace with actual user name from props
    
    const images: string[] = [Image1, Image2, Image3, Image4, Image5];
    
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % images.length);
        }, 4000);
        
        return () => clearInterval(interval);
    }, [images.length]);
    
    return (
        <AppLayout>
            <Head title="Dashboard" />
            
            <div className="min-h-screen  p-3 sm:p-4 md:p-6 lg:p-8">
                {/* Welcome Header */}
                <div className="mb-4 sm:mb-6 md:mb-8 animate-fade-in">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-yellow-500 animate-pulse flex-shrink-0" />
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Hello, {userName}!
                        </h1>
                    </div>
                    <p className="text-gray-600 text-sm sm:text-base md:text-lg ml-8 sm:ml-10 md:ml-11">
                        Welcome back! Check out what's new for you today.
                    </p>
                </div>
                
                {/* Feature Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
                    <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-500 to-green-600 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                        <CardContent className="p-4 sm:p-5 md:p-6 relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <Zap className="w-8 h-8 sm:w-10 sm:h-10 opacity-90" />
                                <span className="text-2xl sm:text-3xl font-bold">FREE</span>
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold mb-2">Free Delivery</h3>
                            <p className="text-green-100 text-sm">On all orders above minimum purchase</p>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-red-500 to-red-600 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                        <CardContent className="p-4 sm:p-5 md:p-6 relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <Gift className="w-8 h-8 sm:w-10 sm:h-10 opacity-90" />
                                <span className="text-2xl sm:text-3xl font-bold">50% OFF</span>
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold mb-2">Mega Discount</h3>
                            <p className="text-red-100 text-sm">Exclusive savings on selected items</p>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative sm:col-span-2 lg:col-span-1">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                        <CardContent className="p-4 sm:p-5 md:p-6 relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <Star className="w-8 h-8 sm:w-10 sm:h-10 opacity-90" />
                                <span className="text-2xl sm:text-3xl font-bold">0% APR</span>
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold mb-2">Low Interest Rate</h3>
                            <p className="text-blue-100 text-sm">Special financing available for 12 months</p>
                        </CardContent>
                    </Card>
                </div>
                
                {/* Advertisement Slideshow */}
                <Card className="border-none shadow-2xl overflow-hidden bg-white/90 backdrop-blur">
                    <CardContent className="p-0">
                        <div className="relative h-[250px] sm:h-[350px] md:h-[450px] lg:h-[500px] xl:h-[550px] bg-gradient-to-r from-gray-900 to-gray-800">
                            {/* Images */}
                            {images.map((image, index) => (
                                <div
                                    key={index}
                                    className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                                        index === currentSlide 
                                            ? 'opacity-100 scale-100' 
                                            : 'opacity-0 scale-105'
                                    }`}
                                >
                                    <img
                                        src={image}
                                        alt={`Advertisement ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                </div>
                            ))}
                            
                            {/* Slide Indicators */}
                            <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 left-0 right-0 flex justify-center gap-1.5 sm:gap-2 z-10 px-4">
                                {images.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentSlide(index)}
                                        className={`transition-all duration-300 rounded-full ${
                                            index === currentSlide 
                                                ? 'w-8 sm:w-10 md:w-12 h-2 sm:h-2.5 md:h-3 bg-white' 
                                                : 'w-2 sm:w-2.5 md:w-3 h-2 sm:h-2.5 md:h-3 bg-white/50 hover:bg-white/75'
                                        }`}
                                        aria-label={`Go to slide ${index + 1}`}
                                    />
                                ))}
                            </div>
                            
                            {/* Featured Badge */}
                            <div className="absolute top-3 sm:top-4 md:top-6 right-3 sm:right-4 md:right-6 z-10">
                                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full font-bold shadow-lg animate-pulse text-xs sm:text-sm md:text-base">
                                    ✨ Featured
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
            </div>
            
            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fade-in {
                    animation: fade-in 0.6s ease-out;
                }
            `}</style>
        </AppLayout>
    );
}