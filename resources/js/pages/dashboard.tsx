import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import SummaryCard from '@/components/cards/summary-card';
import ChartAreaInteractive from '@/components/dashboard/chart-area';


export default function Dashboard() {
    return (
        <AppLayout>
            <Head title="Dashboard" />
            <div className="h-fit grid gap-5 grid-cols-3">
                <SummaryCard/>
                <SummaryCard/>
                <SummaryCard/>
            </div>
            <div>
                <ChartAreaInteractive/>
            </div>
        </AppLayout>
    );
}
