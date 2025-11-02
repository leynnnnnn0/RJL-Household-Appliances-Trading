import ShowButton from "@/components/buttons/show-button";
import ModuleHeading from "@/components/cards/module-heading";
import NoResult from "@/components/cards/no-result";
import SearchBox from "@/components/cards/search-box";
import TableBodyRow from "@/components/cards/table-body-row";
import TableContainer from "@/components/cards/table-container";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import employees from "@/routes/employees";
import { Employee, Paginated } from "@/types";
import { Head, router } from "@inertiajs/react";
import { useEffect, useState } from "react";


interface PageProps {
    employees: Paginated<Employee>
}
export default function Index({employees} : PageProps){
    const [searchQuery, setSearchQuery] = useState('');
        useEffect(() => {
           const delayDebounce = setTimeout(() => {
             const params: Record<string, string> = {};
    
            if(searchQuery) params.search  = searchQuery;
    
            router.get('/employees', params, {
                preserveState: true,
                replace: true
            })
           }, 400)
    
           return () => clearTimeout(delayDebounce);
        }, [searchQuery])
    return <AppLayout>
        <Head title="Employees"/>

                   <ModuleHeading title="Employees List" description="Manage employees data">
                
            </ModuleHeading>

            <SearchBox>
                <Input
                    placeholder="Search employees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </SearchBox>

            <TableContainer>
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="font-semibold">
                                Name
                            </TableHead>
                             <TableHead className="font-semibold text-center">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {employees.data.length === 0 ? (
                            <NoResult count={4}/>
                        ) : employees.data.map(item => (
                            <TableBodyRow key={item.id}>
                                <TableCell>{item.full_name}</TableCell>
                                <TableCell>
                                    <div className="flex items-center justify-center gap-1">
                                        <ShowButton onClick={() => router.visit(`/customers/${item.id}`) }/>
                                    </div>
                                </TableCell>
                            </TableBodyRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
    </AppLayout>
}