interface ModuleHeadingProps {
    children?: React.ReactNode;
    title: string;
    description: string;
}

export default function ModuleHeading({
    children,
    title,
    description,
}: ModuleHeadingProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight break-words sm:text-3xl">
                    {title}
                </h1>
                <p className="mt-1 max-w-3xl text-sm text-muted-foreground sm:text-base">
                    {description}
                </p>
            </div>
            {children && (
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
                    {children}
                </div>
            )}
        </div>
    );
}
