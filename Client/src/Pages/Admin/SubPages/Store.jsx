'use client';

import { motion } from 'framer-motion';
import {
  ChevronDown,
  Download,
  Edit,
  Eye,
  Filter,
  Grid,
  List,
  Package,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Checkbox } from '../../../components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs';
import { Textarea } from '../../../components/ui/textarea';
import { useAdventures } from '../../../hooks/useAdventure';
import { useCategory } from '../../../hooks/useCategory';
import { useMyItems } from '../../../hooks/useMyItems';

export default function ItemsPage() {
  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: {
      name: '',
      category: '',
      price: '',
      purchaseStock: '',
      description: '',
      status: '',
      rentalStock: '',
      rentalPrice: '',
    },
  });
  const [showAddItem, setShowAddItem] = useState(false);
  const [images, setImages] = useState([]);
  const [selectedAdventures, setSelectedAdventures] = useState([]);
  const [itemType, setItemType] = useState({ rent: false, buy: true });
  // State for add category dialog
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [pendingCategoryOnAdd, setPendingCategoryOnAdd] = useState(null);

  const { adventures } = useAdventures();
  const { categories, handleCreateCetegory } = useCategory();
  const {
    handleCreateItem,
    items,
    handleEditItem,
    handleDeleteItem,
    search,
    setSearch,
    setCategory,
  } = useMyItems();
  const [editItem, setEditItem] = useState(null); // Add this with other useState hooks

  // Handle adding a new category from dropdown
  // UI-based add category
  const handleCategoryChange = (value, onChange) => {
    if (value === 'new') {
      setShowAddCategory(true);
      setPendingCategoryOnAdd(() => onChange);
    } else {
      onChange(value);
    }
  };

  const handleAddCategorySubmit = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const created = await handleCreateCetegory(newCategoryName.trim());
      if (created && created._id && pendingCategoryOnAdd) {
        pendingCategoryOnAdd(created._id);
      }
    } catch (error) {
      toast.error('Error creating category');
    }
    setShowAddCategory(false);
    setNewCategoryName('');
    setPendingCategoryOnAdd(null);
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length + images.length > 4) {
      alert('You can upload up to 4 images only.');
      return;
    }

    const newImages = files.map((file) => ({
      url: URL.createObjectURL(file),
      file,
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    if (images.length === 0) {
      toast.error('Please upload at least one image.');
      return;
    }

    const toastId = toast.loading('Uploading items...');

    const formData = new FormData();
    formData.append('name', data?.name);
    formData.append('description', data.description);
    formData.append('price', data.price);
    formData.append('purchaseStock', data.purchaseStock);
    formData.append('category', data.category);
    formData.append('status', data.status);
    if (selectedAdventures.length > 0) {
      selectedAdventures.forEach((adventureId) => {
        formData.append('adventures', adventureId);
      });
    }
    formData.append('purchase', itemType.buy);
    formData.append('rent', itemType.rent);
    formData.append('rentalStock', data.rentalStock || 0);
    formData.append('rentalPrice', data.rentalPrice || 0);

    images.forEach((img) => {
      if (img.file) {
        formData.append('images', img.file);
      } else if (img.url) {
        formData.append('existingImages', img.url); // For already uploaded images
      }
    });

    try {
      if (editItem) {
        await handleEditItem(editItem._id, formData);
        toast.success('Item updated successfully!', { id: toastId });
      } else {
        await handleCreateItem(formData);
        toast.success('Item posted successfully!', { id: toastId });
      }
      reset();
      setImages([]);
      setSelectedAdventures([]);
      setShowAddItem(false);
      setEditItem(null);
    } catch (error) {
      toast.error(
        editItem ? 'Failed to update item.' : 'Failed to post item.',
        { id: toastId }
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h2 className="text-2xl font-bold tracking-tight">Items</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowAddItem(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="list">
              <List />
            </TabsTrigger>
            <TabsTrigger value="grid">
              <Grid />
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search items..."
                className="w-[200px] sm:w-[300px] pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Category
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem onClick={() => setCategory('')}>
                  All Categories
                </DropdownMenuItem>
                {categories.map((category) => (
                  <DropdownMenuItem
                    key={category._id}
                    onClick={() => setCategory(category?.name)}
                  >
                    {category?.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Purchase Stock</TableHead>
                    <TableHead>Rental Stock</TableHead>
                    <TableHead>Adventures</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!items || items.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground"
                      >
                        No items found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item?.name}
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>${item.price.toFixed(2)}</TableCell>
                        <TableCell>{item.purchaseStock}</TableCell>
                        <TableCell>{item.rentalStock}</TableCell>
                        <TableCell>
                          {item.adventures &&
                            item.adventures.map((adventure) => (
                              <Badge
                                key={adventure._id}
                                variant="outline"
                                className="mr-1"
                              >
                                {adventure?.name}
                              </Badge>
                            ))}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditItem(item);
                                setShowAddItem(true);
                                reset({
                                  name: item?.name,
                                  category: item.category,
                                  price: item.price,
                                  purchaseStock: item.purchaseStock,
                                  description: item.description,
                                  status: item.status,
                                  rentalStock: item.rentalStock || '',
                                  rentalPrice: item.rentalPrice || '',
                                });
                                setSelectedAdventures(
                                  item.adventures
                                    ? item.adventures.map((adv) => adv._id)
                                    : []
                                );
                                setItemType({
                                  buy: item.purchase,
                                  rent: item.rent,
                                });
                                setImages(
                                  item.images
                                    ? item.images.map((url) => ({
                                        url,
                                        file: null,
                                      }))
                                    : []
                                );
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteItem(item._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grid" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items &&
              items.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="aspect-square relative">
                    <img
                      src={item.images || '/placeholder.svg'}
                      alt={item?.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{item?.name}</CardTitle>
                    <CardDescription className="flex flex-col">
                      <div className="category flex items-center">
                        <Tag className="h-3 w-3 mr-1" /> {item.category}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {item.description}
                      </p>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 pb-2">
                    <div className="flex justify-between text-sm">
                      <div className="flex flex-col">
                        <span className="flex items-center">
                          <Package className="h-3 w-3 mr-1" />
                          {item.purchaseStock} in Purchase stock
                        </span>
                        <span className="flex items-center">
                          <Package className="h-3 w-3 mr-1" />
                          {item.rentalStock} in Rental stock
                        </span>
                      </div>
                    </div>
                    {item.adventure &&
                      items.adventures.map((adventure) => (
                        <Badge variant="outline" className="mt-1">
                          {adventure?.name}
                        </Badge>
                      ))}
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <div className="price">
                      <div className="font-bold">
                        ${item.price.toFixed(2)} Buy
                      </div>
                      <div className="font-bold">
                        ${item?.rentalPrice.toFixed(2)} Rent
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditItem(item);
                          setShowAddItem(true);
                          reset({
                            name: item?.name,
                            category: item.category,
                            price: item.price,
                            stock: item.stock,
                            description: item.description,
                            status: item.status,
                          });
                          setSelectedAdventures(
                            item.adventures
                              ? item.adventures.map((adv) => adv._id)
                              : []
                          );
                          setItemType({ buy: item.purchase, rent: item.rent });
                          setImages(
                            item.images
                              ? item.images.map((url) => ({ url, file: null }))
                              : []
                          );
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog
        open={showAddItem}
        onOpenChange={(open) => {
          setShowAddItem(open);
          if (!open) {
            setEditItem(null);
            reset();
            setImages([]);
            setSelectedAdventures([]);
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
            <DialogDescription>
              {editItem
                ? 'Edit the details of your item.'
                : 'Add a new product to your inventory.'}
            </DialogDescription>{' '}
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="">
                  <Label htmlFor="name">Item Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter item name"
                    {...register('name', { required: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Controller
                    name="category"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select
                        onValueChange={(value) =>
                          handleCategoryChange(value, field.onChange)
                        }
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem
                              key={category._id}
                              value={category?.name}
                            >
                              {category?.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="new">Add New Category</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {/* Add Category Dialog */}
                  <Dialog
                    open={showAddCategory}
                    onOpenChange={setShowAddCategory}
                  >
                    <DialogContent className="sm:max-w-[400px]">
                      <DialogHeader>
                        <DialogTitle>Add New Category</DialogTitle>
                        <DialogDescription>
                          Enter a name for the new category.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddCategorySubmit}>
                        <div className="space-y-2 py-2">
                          <Label htmlFor="new-category-name">
                            Category Name
                          </Label>
                          <Input
                            id="new-category-name"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Enter category name"
                            autoFocus
                          />
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowAddCategory(false);
                              setNewCategoryName('');
                              setPendingCategoryOnAdd(null);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={!newCategoryName.trim()}
                          >
                            Add
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register('price', { required: true, min: 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="purchaseStock"
                    type="number"
                    placeholder="0"
                    {...register('purchaseStock', { required: true, min: 0 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the item"
                  {...register('description', { required: true })}
                />
              </div>
              <div className="space-y-2">
                <Label>Associated Adventures</Label>
                <div className="max-h-32 overflow-y-auto border rounded-md p-3 space-y-2">
                  {adventures.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No adventures available
                    </p>
                  ) : (
                    adventures.map((adventure) => (
                      <div
                        key={adventure._id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`adventure-${adventure._id}`}
                          checked={selectedAdventures.includes(adventure._id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedAdventures((prev) => [
                                ...prev,
                                adventure._id,
                              ]);
                            } else {
                              setSelectedAdventures((prev) =>
                                prev.filter((id) => id !== adventure._id)
                              );
                            }
                          }}
                        />
                        <Label
                          htmlFor={`adventure-${adventure._id}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {adventure.title || adventure?.name}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
                {selectedAdventures.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {selectedAdventures.length} adventure(s) selected
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Item Availability</Label>
                <div className="grid grid-cols-2 gap-4 items-center">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="buy"
                      checked={itemType.buy}
                      onCheckedChange={(checked) =>
                        setItemType((prev) => ({ ...prev, buy: checked }))
                      }
                    />
                    <Label htmlFor="buy" className="cursor-pointer">
                      Available for Purchase
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rent"
                      checked={itemType.rent}
                      onCheckedChange={(checked) =>
                        setItemType((prev) => ({ ...prev, rent: checked }))
                      }
                    />
                    <Label htmlFor="rent" className="cursor-pointer">
                      Available for Rent
                    </Label>
                  </div>
                </div>
                {itemType.rent && (
                  <div className="rental grid grid-cols-2 gap-4">
                    <div className="rentStock">
                      <Label htmlFor="rentStock">Rental Quantity</Label>
                      <Input
                        {...register('rentalStock')}
                        placeholder="Rental Quantity"
                      />
                    </div>
                    <div className="rentalPrice">
                      <Label htmlFor="rentalPrice">Rental Price</Label>
                      <Input
                        {...register('rentalPrice')}
                        placeholder="Rental Price"
                        type="text"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Upload Images (Max 4)</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={images.length >= 4}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {images?.map((img, index) => (
                    <div key={index} className="relative group w-[22%] h-24">
                      <img
                        src={img.url || '/placeholder.svg'}
                        alt={`Uploaded ${index + 1}`}
                        className="w-full h-full object-cover rounded-md"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddItem(false);
                  reset();
                  setImages([]);
                  setSelectedAdventures([]);
                  setEditItem(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editItem ? 'Update Item' : 'Add Item'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
