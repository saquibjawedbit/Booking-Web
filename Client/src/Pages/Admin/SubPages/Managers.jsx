'use client';

import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  ChevronDown,
  Download,
  Edit,
  Filter,
  Search,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  createAdmin,
  deleteAdmin,
  fetchAdmins,
  updateAdmin,
} from '../../../Api/admin.api';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';

const deleteUser = async (userId) => {
  // Mock implementation
  console.log('Deleting user:', userId);
};

export default function Managers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [addAdminLoading, setAddAdminLoading] = useState(false);
  const [addAdminForm, setAddAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    adminRoles: [],
  });
  const [addAdminError, setAddAdminError] = useState('');
  const [isEdit, setIsEdit] = useState(false);

  // Available roles
  const availableRoles = ['Instructor', 'User', 'Hotel'];

  // Fetch users function
  const getUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdmins({
        search: searchTerm,
        role: 'admin',
        page,
      });
      setUsers(res.admins);
      setTotalPages(res.totalPages);
    } catch (e) {
      setUsers([]);
      setTotalPages(1);
    }
    setLoading(false);
  }, [searchTerm, page]);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Delete user handler
  const handleDeleteUser = async (userId) => {
    const toastId = toast.loading('Deleting user...');
    try {
      await deleteAdmin(userId);
      await getUsers();
      toast.success('User deleted successfully', { id: toastId });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error deleting user', { id: toastId });
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddAdminForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle checkbox changes - simplified
  const handleRoleChange = (role, checked) => {
    setAddAdminForm((prev) => {
      if (checked) {
        return {
          ...prev,
          adminRoles: [...prev.adminRoles, role],
        };
      } else {
        return {
          ...prev,
          adminRoles: prev.adminRoles.filter((r) => r !== role),
        };
      }
    });
  }; // Reset form
  const resetForm = () => {
    setAddAdminForm({
      name: '',
      email: '',
      password: '',
      adminRoles: [],
    });
    setAddAdminError('');
    setIsEdit(false);
  };

  const handleEdit = (user) => {
    setAddAdminForm({
      name: user?.name || '',
      email: user.email || '',
      password: '',
      adminRoles: user.admin?.adminRole || [],
      _id: user._id || '',
    });
    setShowAddAdmin(true);
    setIsEdit(true);
  };

  // Handle form submission
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setAddAdminLoading(true);
    setAddAdminError('');
    try {
      if (!isEdit) {
        const res = await createAdmin(addAdminForm);
        if (res.statusCode === 201) {
          toast.success('Admin added successfully!');
          resetForm();
          setShowAddAdmin(false);
          getUsers();
        }
      } else {
        const res = await updateAdmin(addAdminForm);
        if (res.statusCode === 200) {
          toast.success('Admin updated successfully!');
          resetForm();
          setShowAddAdmin(false);
          getUsers();
        }
      }
    } catch (error) {
      console.error('Error adding admin:', error);
      setAddAdminError('Failed to add admin. Please try again.');
      toast.error('Error adding admin');
    } finally {
      setAddAdminLoading(false);
    }
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setShowAddAdmin(false);
    resetForm();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h2 className="text-2xl font-bold tracking-tight">Admin Management</h2>{' '}
        <Button
          onClick={() => {
            resetForm();
            setShowAddAdmin(true);
          }}
          size="sm"
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" /> Add Admin
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="w-full sm:w-[300px] pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem onClick={() => setRoleFilter('all')}>
                All Users
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRoleFilter('user')}>
                Explorers
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRoleFilter('admin')}>
                Admins
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRoleFilter('instructor')}>
                Instructors
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Assigned Roles</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : !users || users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No admins found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">{user?.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {Array.isArray(user.admin?.adminRole) &&
                      user.admin?.adminRole.length > 0 ? (
                        user.admin.adminRole.map((role) => (
                          <Badge key={role} variant="outline" className="mr-1">
                            {role}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="outline">Admin</Badge>
                      )}{' '}
                    </TableCell>
                    <TableCell>
                      {user?.createdAt && new Date(user.createdAt).getTime()
                        ? format(new Date(user.createdAt), 'dd/MM/yyyy')
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteUser(user?._id)}
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

          {/* Pagination Controls */}
          <div className="flex justify-end items-center gap-2 p-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Prev
            </Button>
            <span>
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Admin Dialog */}
      <Dialog open={showAddAdmin} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit Admin' : 'Add Admin'}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? 'Update the fields'
                : 'Fill in the details to add a new admin and assign roles.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddAdmin} className="space-y-4">
            <div>
              <Label htmlFor="admin-name">Name</Label>
              <Input
                id="admin-name"
                name="name"
                value={addAdminForm?.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                name="email"
                type="email"
                value={addAdminForm.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                name="password"
                type="password"
                value={addAdminForm.password}
                onChange={handleInputChange}
                required={isEdit ? false : true}
              />
            </div>

            <div>
              <Label>Assign Roles</Label>
              <div className="flex flex-col gap-2 mt-2">
                {availableRoles.map((role) => (
                  <div key={role} className="flex items-center space-x-2">
                    <Checkbox
                      id={`role-${role}`}
                      checked={addAdminForm.adminRoles.includes(role)}
                      onCheckedChange={(checked) =>
                        handleRoleChange(role, checked)
                      }
                    />
                    <Label htmlFor={`role-${role}`}>{role}</Label>
                  </div>
                ))}
              </div>
            </div>

            {addAdminError && (
              <div className="text-red-500 text-sm">{addAdminError}</div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleDialogClose}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addAdminLoading}>
                {addAdminLoading
                  ? 'Adding...'
                  : isEdit
                    ? 'Update Admin'
                    : 'Add Admin'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
