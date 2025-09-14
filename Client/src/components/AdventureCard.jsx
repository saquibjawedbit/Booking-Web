import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

const AdventureCard = ({ adventure, onEdit, onDelete }) => (
  <Card className="flex flex-col h-full">
    <CardContent className="flex-1 p-4">
      <h3 className="text-lg font-semibold mb-2">{adventure?.name}</h3>
      <p className="text-sm text-muted-foreground mb-1">{adventure.location}</p>
      <p className="text-sm mb-2">{adventure.description}</p>
      <div className="flex justify-between items-center mt-auto">
        <Button size="sm" variant="outline" onClick={onEdit}>
          Edit
        </Button>
        <Button size="sm" variant="destructive" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default AdventureCard;
