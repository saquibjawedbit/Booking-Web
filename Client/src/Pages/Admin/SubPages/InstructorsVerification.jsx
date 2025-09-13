'use client';

import { motion } from 'framer-motion';
import {
  Download,
  Eye,
  FileText,
  Percent,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Slider } from '../../../components/ui/slider';
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
import { useInstructors } from '../../../hooks/useInstructor';

export default function InstructorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [showDocuments, setShowDocuments] = useState(false);
  const [commissionValue, setCommissionValue] = useState(20);
  const {
    instructors,
    page,
    setPage,
    deleteInstructorById,
    totalPages,
    changeDocumentStatus,
    updateCommission,
    getProfile,
  } = useInstructors();

  const handleViewDocuments = (instructor) => {
    setSelectedInstructor(instructor);
    setCommissionValue(instructor?.instructor?.commission || 20);
    setShowDocuments(true);
  };

  const handleDocumentStatus = async (status) => {
    const loading = toast.loading('Changing document status...');
    try {
      // Make sure we're passing the instructor ID, not the user ID
      console.log(selectedInstructor);
      if (selectedInstructor && selectedInstructor?._id) {
        await changeDocumentStatus(selectedInstructor._id, status);
        toast.success('Document status changed successfully', {
          id: loading,
        });
        // Refresh the instructors list after status change
        await getProfile();
      } else {
        toast.error('Instructor ID not found', {
          id: loading,
        });
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to change document status', {
        id: loading,
      });
    } finally {
      setShowDocuments(false);
      setSelectedInstructor(null);
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
        <h2 className="text-2xl font-bold tracking-tight">Instructors</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export List
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search instructors..."
            className="w-full sm:w-[300px] pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Adventures</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instructors.map((instructor) => (
                <TableRow key={instructor._id}>
                  <TableCell>{instructor.name}</TableCell>
                  <TableCell>{instructor.email}</TableCell>
                  <TableCell>
                    {instructor?.instructor?.adventure?.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {instructor?.instructor?.commission || 20}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        instructor?.instructor?.documentVerified === 'verified'
                          ? 'default'
                          : instructor?.instructor?.documentVerified ===
                              'pending'
                            ? 'outline'
                            : 'secondary'
                      }
                    >
                      {instructor?.instructor?.documentVerified
                        .charAt(0)
                        .toUpperCase() +
                        instructor?.instructor?.documentVerified.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDocuments(instructor)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteInstructorById(instructor._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="px-2">
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
      )}

      {/* Full-width Document Viewer Dialog */}
      <Dialog
        open={showDocuments}
        onOpenChange={setShowDocuments}
        className="w-full"
      >
        <DialogContent className="max-w-full w-full h-[90vh] p-0 border-none rounded-none sm:rounded-none">
          <DialogHeader className="sticky top-0 z-10 bg-background px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl">
                Documents for {selectedInstructor?.name}
              </DialogTitle>
              <DialogClose className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogClose>
            </div>
            <DialogDescription className="mt-1">
              Review all submitted documents and certifications
            </DialogDescription>
          </DialogHeader>

          {selectedInstructor && (
            <div className="p-6 overflow-y-auto">
              <Tabs defaultValue="documents" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="details">Instructor Details</TabsTrigger>
                  <TabsTrigger value="commission">Commission</TabsTrigger>
                </TabsList>
                <TabsContent value="documents" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <motion.div
                      className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="aspect-[4/3] bg-muted relative group">
                        <img
                          src={
                            selectedInstructor?.instructor?.certificate ||
                            '/placeholder.svg'
                          }
                          alt={'Certificate'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium">{'Certifcate'}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          Certificate Document
                        </p>
                        <div className="mt-4 flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              window.open(
                                selectedInstructor?.instructor?.certificate ||
                                  '/placeholder.svg',
                                '_blank'
                              );
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="aspect-[4/3] bg-muted relative group">
                        <img
                          src={
                            selectedInstructor?.instructor?.governmentId ||
                            '/placeholder.svg'
                          }
                          alt={'Government ID'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium">{'Government Id'}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          Government Id Document
                        </p>
                        <div className="mt-4 flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              window.open(
                                selectedInstructor?.instructor?.governmentId ||
                                  '/placeholder.svg',
                                '_blank'
                              );
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </TabsContent>
                <TabsContent value="details">
                  <div className="bg-muted/40 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Personal Information
                        </h3>
                        <div className="mt-3 space-y-3">
                          <div>
                            <p className="text-sm font-medium">Full Name</p>
                            <p>{selectedInstructor.name}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Email Address</p>
                            <p>{selectedInstructor.email}</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Professional Information
                        </h3>
                        <div className="mt-3 space-y-3">
                          <div>
                            <p className="text-sm font-medium">Specialties</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {selectedInstructor?.instructor?.adventure?.name}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              Verification Status
                            </p>
                            <Badge
                              variant={
                                selectedInstructor?.instructor
                                  ?.documentVerified === 'verified'
                                  ? 'default'
                                  : selectedInstructor?.instructor
                                        ?.documentVerified === 'pending'
                                    ? 'outline'
                                    : 'secondary'
                              }
                              className="mt-1"
                            >
                              {selectedInstructor?.instructor?.documentVerified
                                ?.charAt(0)
                                ?.toUpperCase() +
                                selectedInstructor?.instructor?.documentVerified?.slice(
                                  1
                                ) || 'Unknown'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="commission">
                  <div className="bg-muted/40 rounded-lg p-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium">
                          Commission Rate Management
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Adjust the commission percentage for this instructor.
                          The default rate is 20%.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="commission-slider">
                              Commission Rate
                            </Label>
                            <div className="flex items-center space-x-1">
                              <span className="text-xl font-medium">
                                {commissionValue}
                              </span>
                              <Percent className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                          <Slider
                            id="commission-slider"
                            min={0}
                            max={100}
                            step={1}
                            value={[commissionValue]}
                            onValueChange={(value) =>
                              setCommissionValue(value[0])
                            }
                            className="py-4"
                          />
                        </div>

                        <div className="flex flex-col space-y-2">
                          <div className="text-sm text-muted-foreground">
                            <strong>Current commission rate:</strong>{' '}
                            {selectedInstructor?.instructor?.commission || 20}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <strong>New commission rate:</strong>{' '}
                            {commissionValue}%
                          </div>
                        </div>

                        <Button
                          onClick={async () => {
                            const loading = toast.loading(
                              'Updating commission rate...'
                            );
                            try {
                              await updateCommission(
                                selectedInstructor?.instructor?._id,
                                commissionValue
                              );
                              toast.success(
                                `Commission updated to ${commissionValue}%`,
                                {
                                  id: loading,
                                }
                              );
                            } catch (error) {
                              toast.error('Failed to update commission rate', {
                                id: loading,
                              });
                            }
                          }}
                          disabled={
                            !selectedInstructor?.instructor ||
                            commissionValue ===
                              (selectedInstructor?.instructor?.commission || 20)
                          }
                        >
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              {/* Only show approve/reject buttons if document is not already verified */}
              {selectedInstructor?.instructor?.documentVerified !==
                'verified' && (
                <div className="mt-8 flex justify-end space-x-4 sticky bottom-0 bg-background p-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => handleDocumentStatus('rejected')}
                  >
                    Reject Documents
                  </Button>
                  <Button onClick={() => handleDocumentStatus('verified')}>
                    Approve Documents
                  </Button>
                </div>
              )}
              {/* Show a message if already verified */}
              {selectedInstructor?.instructor?.documentVerified ===
                'verified' && (
                <div className="mt-8 flex justify-center sticky bottom-0 bg-background p-4 border-t">
                  <p className="text-green-600 font-medium">
                    This instructor's documents have been verified
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
