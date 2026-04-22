interface TypographyProps {
    children: React.ReactNode;
    variant?: 'h1' | 'h2' | 'p' | 'label';
    className?: string;
}

export const Typography = ({ children, variant = 'p', className = '' }: TypographyProps) => {
    const styles = {
        h1: 'text-4xl font-bold tracking-tight text-brand-gray-900 md:text-5xl',
        h2: 'text-xl font-semibold text-brand-gray-700 tracking-tight',
        p: 'text-base text-brand-gray-500 leading-relaxed',
        label: 'text-xs font-bold uppercase tracking-widest text-brand-indigo',
    };

    const Component = variant === 'label' ? 'span' : variant;

    return (
        <Component className={`${styles[variant]} ${className}`}>
            {children}
        </Component>
    );
};