import React, { useState } from 'react';

const UserAvatar = ({ src, name, size = "md", className = "" }) => {
    const [error, setError] = useState(false);
    const fallback = "/profile.png";
    const initialsFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=6366f1&color=fff`;

    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-10 h-10",
        lg: "w-16 h-16",
        xl: "w-32 h-32 md:w-40 md:h-40",
        full: "w-full h-full"
    };

    const currentSize = sizeClasses[size] || sizeClasses.md;

    return (
        <div className={`${currentSize} rounded-full overflow-hidden bg-surface border border-white/10 flex-shrink-0 ${className}`}>
            <img
                src={error ? fallback : (src || initialsFallback)}
                alt={name || "User"}
                className="w-full h-full object-cover"
                onError={() => {
                    if (!error) setError(true);
                }}
            />
        </div>
    );
};

export default UserAvatar;
