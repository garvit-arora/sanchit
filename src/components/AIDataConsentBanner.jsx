import React from 'react';

export default function AIDataConsentBanner({ consentKey, feature, onDecision }) {
    const [choice, setChoice] = React.useState(() => localStorage.getItem(consentKey));

    if (choice) return null;

    const decide = (value) => {
        localStorage.setItem(consentKey, value);
        setChoice(value);
        onDecision?.(value);
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-5 text-sm text-gray-300 space-y-3">
            <div className="font-black text-white">AI Data Choice</div>
            <p className="text-xs leading-relaxed text-gray-400">
                Your {feature} messages can help improve the model. Turn this on to make responses smarter over time.
                It is important for quality, but it is always your choice.
            </p>
            <div className="flex flex-wrap gap-3">
                <button
                    onClick={() => decide('opt_in')}
                    className="px-4 py-2 rounded-xl bg-primary text-black font-black text-xs"
                >
                    Allow Training
                </button>
                <button
                    onClick={() => decide('opt_out')}
                    className="px-4 py-2 rounded-xl border border-white/10 text-gray-300 font-black text-xs"
                >
                    No Thanks
                </button>
            </div>
        </div>
    );
}
