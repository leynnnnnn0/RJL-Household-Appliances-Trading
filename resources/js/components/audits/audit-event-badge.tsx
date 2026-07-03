import { Badge } from '@/components/ui/badge';
import { titleCase } from './audit-formatters';

export default function AuditEventBadge({ event }: { event: string }) {
    const badgeClassName =
        event === 'deleted' || event === 'logout'
            ? 'border-red-200 bg-red-50 text-red-700'
            : event === 'created' || event === 'login'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-gray-200 bg-gray-50 text-gray-700';

    return (
        <Badge variant="outline" className={badgeClassName}>
            {titleCase(event)}
        </Badge>
    );
}
