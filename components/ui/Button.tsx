interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline';
    isLoading?: boolean;
}

export const Button = ({
    children,
    variant = 'primary',
    isLoading,
    className = '',
    ...props
}: ButtonProps) => {
    const baseStyles = "px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        primary: "bg-brand-indigo text-white hover:bg-brand-indigo-dark shadow-md shadow-brand-indigo/20",
        secondary: "bg-brand-indigo-light text-brand-indigo hover:bg-brand-indigo/10",
        outline: "border-2 border-brand-gray-300 text-brand-gray-700 hover:border-brand-indigo hover:text-brand-indigo"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            disabled={isLoading}
            {...props}
        >
            {isLoading ? (
                <div className="h-5 w-5 border-2 border-current border-t-transparent animate-spin rounded-full" />
            ) : children}
        </button>
    );
};