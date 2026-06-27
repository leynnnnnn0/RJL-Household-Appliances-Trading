import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
    backUrl?: string | null;
    label?: string;
}

export default function BackButton({
    backUrl,
    label = 'Back',
}: BackButtonProps) {
    const handleBack = () => {
        if (backUrl && backUrl !== window.location.href) {
            router.visit(backUrl);
            return;
        }

        window.history.back();
    };

    return (
        <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            className="min-h-11 w-full sm:w-auto"
        >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {label}
        </Button>
    );
}
