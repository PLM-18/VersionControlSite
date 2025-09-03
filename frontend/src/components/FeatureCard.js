import React from 'react';
import { cn } from '../lib/utils.js';

const colorClasses = {
    red: 'bg-feature-red',
    pink: 'bg-feature-pink',
    green: 'bg-feature-green',
    blue: 'bg-feature-blue'
};

const FeatureCard = ({
    title,
    icon,
    color,
    className
}) => {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center p-8 rounded-2xl text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer",
                colorClasses[color],
                "text-white font-medium",
                className
            )}
        >
            <div className="mb-4 text-3xl">
                {icon}
            </div>
            <h3 className="text-lg font-semibold leading-tight">
                {title}
            </h3>
        </div>
    );
};

export default FeatureCard;