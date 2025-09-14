'use client';

import { motion } from 'framer-motion';
import {
  ChevronDown,
  Download,
  Eye,
  Filter,
  MessageCircle,
  Search,
  Send,
  TicketCheck,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  addTicketResponse,
  deleteTicket,
  getAllTickets,
  getTicketById,
  updateTicketStatus,
} from '../../../Api/ticket.api';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
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
import { Textarea } from '../../../components/ui/textarea';

export default function Dash_Tickets() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [respondDialogOpen, setRespondDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedTicketDetails, setSelectedTicketDetails] = useState(null);

  // Form states
  const [responseMessage, setResponseMessage] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset pagination when active search term or status filter changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [activeSearchTerm, statusFilter]);
  // Handle search button click
  const handleSearch = () => {
    setActiveSearchTerm(searchTerm.trim());
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchTerm('');
    setActiveSearchTerm('');
  };

  // Handle Enter key press in search input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError(null);
      try {
        // Prepare filters based on current state
        const filters = {
          page: pagination.page,
          limit: pagination.limit,
          search: activeSearchTerm,
        };
        if (statusFilter !== 'all') {
          filters.status = statusFilter;
        }

        const response = await getAllTickets(filters);

        if (response && response.data && Array.isArray(response.data.tickets)) {
          if (response.data.tickets.length === 0) {
            setTickets([]);
            setPagination((prev) => ({ ...prev, totalPages: 1 }));
          } else {
            setTickets(response.data.tickets);
            setPagination((prev) => ({
              ...prev,
              totalPages: Number(response.data.totalPages) || 1,
              page: Number(response.data.currentPage) || 1,
            }));
          }
        } else {
          setTickets([]);
          setPagination((prev) => ({ ...prev, totalPages: 1 }));
        }
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError('Failed to fetch tickets. Please try again.');
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [statusFilter, pagination.page, pagination.limit, activeSearchTerm]);
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };
  // Handle view ticket details
  const handleViewTicket = async (ticket) => {
    const loadingToast = toast.loading('Loading ticket details...');
    try {
      setSelectedTicket(ticket);
      const response = await getTicketById(ticket._id || ticket.id);
      if (response?.data) {
        setSelectedTicketDetails(response.data);
        setViewDialogOpen(true);
        toast.dismiss(loadingToast);
      } else {
        toast.dismiss(loadingToast);
        toast.error('Failed to load ticket details');
      }
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to load ticket details');
    }
  };
  // Handle respond to ticket
  const handleRespondToTicket = async (ticket) => {
    const loadingToast = toast.loading('Loading ticket details...');
    try {
      setSelectedTicket(ticket);
      const response = await getTicketById(ticket._id || ticket.id);
      if (response?.data) {
        setSelectedTicketDetails(response.data);
        setNewStatus(ticket.status);
        setRespondDialogOpen(true);
        toast.dismiss(loadingToast);
      } else {
        toast.dismiss(loadingToast);
        toast.error('Failed to load ticket details');
      }
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to load ticket details');
    }
  };

  // Handle delete ticket
  const handleDeleteTicket = (ticket) => {
    setSelectedTicket(ticket);
    setDeleteDialogOpen(true);
  };
  // Submit response
  const handleSubmitResponse = async () => {
    if (!responseMessage.trim() && newStatus === selectedTicket?.status) {
      toast.error('Please enter a response message or change the status');
      return;
    }

    const submittingToast = toast.loading('Submitting response...');
    try {
      setIsSubmitting(true);

      // Add response if message provided
      if (responseMessage.trim()) {
        await addTicketResponse(
          selectedTicket._id || selectedTicket.id,
          responseMessage.trim()
        );
      }

      // Update status if changed
      if (newStatus !== selectedTicket?.status) {
        await updateTicketStatus(
          selectedTicket._id || selectedTicket.id,
          newStatus
        );
      }

      toast.dismiss(submittingToast);
      toast.success('Response submitted successfully');
      setRespondDialogOpen(false);
      setResponseMessage('');
      setNewStatus('');

      // Refresh tickets
      const filters = {
        page: pagination.page,
        limit: pagination.limit,
        search: activeSearchTerm,
      };
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      const response = await getAllTickets(filters);
      if (response?.data?.tickets) {
        setTickets(response.data.tickets);
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      toast.dismiss(submittingToast);
      toast.error('Failed to submit response');
    } finally {
      setIsSubmitting(false);
    }
  };
  // Confirm delete ticket
  const handleConfirmDelete = async () => {
    const deletingToast = toast.loading('Deleting ticket...');
    try {
      setIsSubmitting(true);
      await deleteTicket(selectedTicket._id || selectedTicket.id);
      toast.dismiss(deletingToast);
      toast.success('Ticket deleted successfully');
      setDeleteDialogOpen(false);

      // Refresh tickets
      const filters = {
        page: pagination.page,
        limit: pagination.limit,
        search: activeSearchTerm,
      };
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      const response = await getAllTickets(filters);
      if (response?.data?.tickets) {
        setTickets(response.data.tickets);
      }
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast.dismiss(deletingToast);
      toast.error('Failed to delete ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading tickets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6"
    >
      <h1 className="text-3xl font-semibold text-gray-800 dark:text-white">
        Support Tickets
      </h1>

      {/* Filters and Actions */}
      <Card>
        {' '}
        <CardContent className="p-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-1/3 flex gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search by ID, subject, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>{' '}
            <Button onClick={handleSearch} disabled={loading}>
              Search
            </Button>
            {activeSearchTerm && (
              <Button
                variant="outline"
                onClick={handleClearSearch}
                disabled={loading}
              >
                Clear
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Status:{' '}
                  {statusFilter === 'all'
                    ? 'All'
                    : statusFilter.charAt(0).toUpperCase() +
                      statusFilter.slice(1)}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                  All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('open')}>
                  Open
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setStatusFilter('in-progress')}
                >
                  In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('resolved')}>
                  Resolved
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('closed')}>
                  Closed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      {tickets.length === 0 && !loading ? (
        <div className="text-center py-10">
          <TicketCheck className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-200">
            No tickets found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            There are no tickets matching your current filters.
          </p>
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>{' '}
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket._id || ticket.id}>
                  <TableCell className="font-medium">
                    {ticket._id || ticket.id}
                  </TableCell>
                  <TableCell>{ticket.subject}</TableCell>
                  <TableCell>{ticket.user?.name || 'N/A'}</TableCell>
                  <TableCell>{ticket.user?.email || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        ticket.status === 'open'
                          ? 'default'
                          : ticket.status === 'in-progress'
                            ? 'secondary'
                            : ticket.status === 'resolved'
                              ? 'outline'
                              : ticket.status === 'closed'
                                ? 'destructive'
                                : 'default'
                      }
                      className={
                        ticket.status === 'open'
                          ? 'bg-blue-500 text-white'
                          : ticket.status === 'in-progress'
                            ? 'bg-yellow-500 text-black'
                            : ticket.status === 'resolved'
                              ? 'bg-green-500 text-white'
                              : ticket.status === 'closed'
                                ? 'bg-gray-500 text-white'
                                : ''
                      }
                    >
                      {ticket.status.charAt(0).toUpperCase() +
                        ticket.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        ticket.priority === 'high'
                          ? 'bg-red-500 text-white'
                          : ticket.priority === 'critical'
                            ? 'bg-red-700 text-white'
                            : ticket.priority === 'medium'
                              ? 'bg-orange-500 text-white'
                              : 'bg-gray-200 text-gray-700' // Low or default
                      }
                    >
                      {ticket.priority.charAt(0).toUpperCase() +
                        ticket.priority.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{ticket.category}</TableCell>
                  <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                  <TableCell>{formatDate(ticket.updatedAt)}</TableCell>{' '}
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="View Details"
                        onClick={() => handleViewTicket(ticket)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Respond"
                        onClick={() => handleRespondToTicket(ticket)}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete Ticket"
                        onClick={() => handleDeleteTicket(ticket)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <Button
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                page: Math.max(1, prev.page - 1),
              }))
            }
            disabled={pagination.page <= 1 || loading}
            variant="outline"
          >
            Previous
          </Button>
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                page: Math.min(prev.totalPages, prev.page + 1),
              }))
            }
            disabled={pagination.page >= pagination.totalPages || loading}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}

      {/* View Ticket Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ticket Details</DialogTitle>
            <DialogDescription>
              View complete ticket information and conversation history
            </DialogDescription>
          </DialogHeader>

          {selectedTicketDetails && (
            <div className="space-y-6">
              {/* Ticket Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Ticket ID</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {selectedTicketDetails._id || selectedTicketDetails.id}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className="ml-2">
                    {selectedTicketDetails.status?.charAt(0).toUpperCase() +
                      selectedTicketDetails.status?.slice(1)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <Badge className="ml-2">
                    {selectedTicketDetails.priority?.charAt(0).toUpperCase() +
                      selectedTicketDetails.priority?.slice(1)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {selectedTicketDetails.category}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Customer</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {selectedTicketDetails.user?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {selectedTicketDetails.user?.email || 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {formatDate(selectedTicketDetails.createdAt)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Updated</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {formatDate(selectedTicketDetails.updatedAt)}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Subject</Label>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {selectedTicketDetails.subject}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-wrap">
                  {selectedTicketDetails.description}
                </p>
              </div>

              {/* Attachments */}
              {selectedTicketDetails.attachments &&
                selectedTicketDetails.attachments.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Attachments</Label>
                    <div className="mt-2 space-y-2">
                      {selectedTicketDetails.attachments.map(
                        (attachment, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <a
                              href={attachment}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700 text-sm"
                            >
                              Attachment {index + 1}
                            </a>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Conversation History */}
              {selectedTicketDetails.responses &&
                selectedTicketDetails.responses.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">
                      Conversation History
                    </Label>
                    <div className="mt-2 space-y-3 max-h-60 overflow-y-auto">
                      {selectedTicketDetails.responses.map(
                        (response, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-sm font-medium">
                                {response.isAdmin ? 'Admin' : 'Customer'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(response.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                              {response.message}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Respond to Ticket Dialog */}
      <Dialog open={respondDialogOpen} onOpenChange={setRespondDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Respond to Ticket</DialogTitle>
            <DialogDescription>
              Add a response and/or update the ticket status
            </DialogDescription>
          </DialogHeader>
          {selectedTicketDetails && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">
                  Ticket: {selectedTicketDetails.subject}
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Customer: {selectedTicketDetails.user?.name || 'N/A'} (
                  {selectedTicketDetails.user?.email || 'N/A'})
                </p>
              </div>

              {/* Original Description */}
              <div>
                <Label className="text-sm font-medium">
                  Original Description
                </Label>
                <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                  <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedTicketDetails.description}
                  </p>
                </div>
              </div>

              {/* Conversation History */}
              {selectedTicketDetails.responses &&
                selectedTicketDetails.responses.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">
                      Previous Responses
                    </Label>
                    <div className="mt-2 space-y-3 max-h-48 overflow-y-auto border rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                      {selectedTicketDetails.responses.map(
                        (response, index) => (
                          <div
                            key={index}
                            className="border rounded-lg p-3 bg-white dark:bg-gray-700"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span
                                className={`text-sm font-medium ${response.isAdmin ? 'text-blue-600' : 'text-green-600'}`}
                              >
                                {response.isAdmin ? 'Admin' : 'Customer'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(response.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                              {response.message}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              <div>
                <Label htmlFor="status">Update Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="response">Response Message</Label>
                <Textarea
                  id="response"
                  placeholder="Enter your response message..."
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRespondDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitResponse}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Submitting...' : 'Submit Response'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Ticket</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this ticket? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <div className="py-4">
              <p className="text-sm">
                <span className="font-medium">Ticket ID:</span>{' '}
                {selectedTicket._id || selectedTicket.id}
              </p>
              <p className="text-sm">
                <span className="font-medium">Subject:</span>{' '}
                {selectedTicket.subject}
              </p>
              <p className="text-sm">
                <span className="font-medium">Customer:</span>{' '}
                {selectedTicket.user?.name || 'N/A'}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete Ticket'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
