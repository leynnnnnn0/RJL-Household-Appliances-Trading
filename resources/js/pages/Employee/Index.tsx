import ModuleHeading from "@/components/cards/module-heading";
import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";

export default function Index(){
    return <AppLayout>
        <Head title="Employees">
            <ModuleHeading title="Employees List" description="Manage employees data">
                
            </ModuleHeading>
        </Head>
    </AppLayout>
}