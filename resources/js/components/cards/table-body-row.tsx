import { TableRow } from "../ui/table";

interface PageProps {
    children: React.ReactNode
}

export default function TableBodyRow({children} : PageProps)
{
    return  <TableRow  className="hover:bg-muted/50 transition-colors">
        {children}
    </TableRow>
}