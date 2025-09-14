import { Button } from './ui/button';
import { TableCell, TableRow } from './ui/table';

const AdventureTableRow = ({ adventure, onEdit, onDelete }) => (
  <TableRow>
    <TableCell>{adventure?.name}</TableCell>
    <TableCell>
      {Array.isArray(adventure.location) && adventure.location.length > 0
        ? adventure.location.map((loc) => loc?.name).join(', ')
        : 'No location'}
    </TableCell>
    <TableCell>{adventure.bookings?.length || 0}</TableCell>
    <TableCell>{adventure.instructors?.length || 0}</TableCell>
    <TableCell className="text-left">
      <Button size="sm" variant="outline" onClick={onEdit} className="mr-2">
        Edit
      </Button>
      <Button size="sm" variant="destructive" onClick={onDelete}>
        Delete
      </Button>
    </TableCell>
  </TableRow>
);

export default AdventureTableRow;
