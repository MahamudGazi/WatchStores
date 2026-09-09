const steps = [
    "Pending",
    "Confirmed",
    "Processing",
    "Shipped",
    "Out for Delivery",
    "Delivered",
];

export default function OrderTimeline({ status }) {
    const current = steps.indexOf(status);

    // If status doesn't match any step
    const currentStep = current === -1 ? 0 : current;

    return (
        <div className="w-full">

            {/* Timeline */}
            <div className="relative">

                {steps.map((step, index) => {
                    const completed = index < currentStep;
                    const active = index === currentStep;
                    const upcoming = index > currentStep;

                    return (
                        <div
                            key={step}
                            className="relative flex gap-4 pb-8 last:pb-0"
                        >

                            {/* Connecting Line */}
                            {index !== steps.length - 1 && (
                                <div
                                    className={`
                                        absolute
                                        left-[11px]
                                        top-6
                                        h-full
                                        w-0.5
                                        ${
                                            index < currentStep
                                                ? "bg-green-600"
                                                : "bg-gray-300"
                                        }
                                    `}
                                />
                            )}

                            {/* Circle */}
                            <div
                                className={`
                                    relative
                                    z-10
                                    flex
                                    h-6
                                    w-6
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-full
                                    text-xs
                                    font-bold
                                    transition

                                    ${
                                        completed
                                            ? "bg-green-600 text-white"
                                            : active
                                            ? "bg-yellow-500 text-black ring-4 ring-yellow-100"
                                            : "bg-gray-300 text-gray-500"
                                    }
                                `}
                            >
                                {completed || active ? "✓" : index + 1}
                            </div>

                            {/* Step Content */}
                            <div className="-mt-1">

                                <p
                                    className={`
                                        text-sm
                                        sm:text-base
                                        ${
                                            completed
                                                ? "font-semibold text-green-600"
                                                : active
                                                ? "font-bold text-yellow-600"
                                                : upcoming
                                                ? "text-gray-400"
                                                : "text-gray-700"
                                        }
                                    `}
                                >
                                    {step}
                                </p>

                                {/* Current status */}
                                {active && (
                                    <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                                        Current Status
                                    </p>
                                )}

                            </div>

                        </div>
                    );
                })}

            </div>

        </div>
    );
}

