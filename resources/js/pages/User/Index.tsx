import ShowButton from '@/components/buttons/show-button';
import ModuleHeading from '@/components/cards/module-heading';
import NoResult from '@/components/cards/no-result';
import SearchBox from '@/components/cards/search-box';
import TableBodyRow from '@/components/cards/table-body-row';
import TableContainer from '@/components/cards/table-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { User, Paginated } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';



interface PageProps {
    users: Paginated<User>
}
export default function Index({users} : PageProps ) {
    const [searchQuery, setSearchQuery] = useState('');
    useEffect(() => {
       const delayDebounce = setTimeout(() => {
         const params: Record<string, string> = {};

        if(searchQuery) params.search  = searchQuery;

        router.get('/users', params, {
            preserveState: true,
            replace: true
        })
       }, 400)

       return () => clearTimeout(delayDebounce);
    }, [searchQuery])
    return (
        <AppLayout>
            <Head title="Users" />

            <ModuleHeading
                title="Users List"
                description="Manage users data"
            >
              {window.can('view add user') &&   <Button onClick={() => router.get('/users/create')}>
                  <Plus/>Add New User
                    </Button>}
            </ModuleHeading>

            <SearchBox>
                <Input
                    placeholder="Search users..."
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
                                Full Name
                            </TableHead>
                            <TableHead className="font-semibold">
                                Email
                            </TableHead>
                          {window.can('can view user details') &&    <TableHead className="font-semibold text-center">
                                Actions
                            </TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.data.length === 0 ? (
                            <NoResult count={3}/>
                        ) : users.data.map(item => (
                            <TableBodyRow key={item.id}>
                                <TableCell>{item.full_name}</TableCell>
                                <TableCell>{item.email}</TableCell>
                              {window.can('can view user details') &&   <TableCell>
                                    <div className="flex items-center justify-center gap-1">
                                        <ShowButton onClick={() => router.visit(`/users/${item.id}`) }/>
                                    </div>
                                </TableCell>}
                            </TableBodyRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </AppLayout>
    );
}
