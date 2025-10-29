interface ModuleHeadingProps {
    children?: React.ReactNode;
    title: string;
    description: string;
}
export default function ModuleHeading({ children, title, description } : ModuleHeadingProps) {
    return  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground mt-1">
              {description}
            </p>
          </div>
         <div className="flex items-center justify-center gap-3">
           {children}
         </div>
    </div>
}