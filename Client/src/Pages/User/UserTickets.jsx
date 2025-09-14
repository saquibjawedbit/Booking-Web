import {
  ChevronRight,
  Clock,
  FileText,
  Loader2,
  MessageSquare,
  Plus,
  Send,
  TicketIcon,
  Upload,
  User,
  UserCog,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { useTicket } from '../../hooks/useTicket';

export const UserTickets = () => {
  const [isNewTicketDialogOpen, setIsNewTicketDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isTicketDetailDialogOpen, setIsTicketDetailDialogOpen] =
    useState(false);
  const [ticketDetailLoading, setTicketDetailLoading] = useState(false);
  const [newResponse, setNewResponse] = useState('');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  // Form state for new ticket
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: '',
    priority: 'medium',
  });
  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const {
    tickets,
    loading,
    error,
    getUserTickets,
    createTicket,
    getTicketById,
    addTicketResponse,
    clearError,
  } = useTicket();
  // Fetch user tickets on component mount
  useEffect(() => {
    getUserTickets();
  }, [getUserTickets]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);
  const handleOpenTicketDetail = async (ticket) => {
    setIsTicketDetailDialogOpen(true);
    setTicketDetailLoading(true);
    try {
      const result = await getTicketById(ticket._id);
      if (result.success) {
        setSelectedTicket(result.data.data);
      } else {
        toast.error(result.error || 'Failed to load ticket details');
        setIsTicketDetailDialogOpen(false);
      }
    } catch (error) {
      toast.error('Failed to load ticket details');
      console.error('Error loading ticket details:', error);
      setIsTicketDetailDialogOpen(false);
    } finally {
      setTicketDetailLoading(false);
    }
  };
  const handleAddResponse = async () => {
    if (!newResponse.trim()) {
      toast.error('Please enter a response message');
      return;
    }

    setIsSubmittingResponse(true);
    try {
      const result = await addTicketResponse(
        selectedTicket._id,
        newResponse.trim()
      );
      if (result.success) {
        setSelectedTicket(result.data.data);
        setNewResponse('');
        toast.success('Response added successfully');
        // Refresh tickets list to update response count
        getUserTickets();
      } else {
        toast.error(result.error || 'Failed to add response');
      }
    } catch (error) {
      toast.error('Failed to add response');
      console.error('Error adding response:', error);
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  const handleTicketDetailDialogClose = () => {
    setIsTicketDetailDialogOpen(false);
    setSelectedTicket(null);
    setNewResponse('');
  };

  const handleOpenNewTicketDialog = () => {
    setIsNewTicketDialogOpen(true);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear specific field error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const maxFiles = 5;
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (attachments.length + files.length > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} files`);
      return;
    }

    const validFiles = files.filter((file) => {
      if (file.size > maxSize) {
        toast.error(`File ${file?.name} is too large. Maximum size is 10MB`);
        return false;
      }
      return true;
    });

    setAttachments((prev) => [...prev, ...validFiles]);
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    if (!formData.category) {
      errors.category = 'Category is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitTicket = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const ticketData = {
        ...formData,
        attachments: attachments,
      };

      const result = await createTicket(ticketData);

      if (result.success) {
        toast.success('Ticket created successfully!');
        setIsNewTicketDialogOpen(false);
        resetForm();
        // Refresh tickets list
        getUserTickets();
      } else {
        toast.error(result.error || 'Failed to create ticket');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Ticket creation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      subject: '',
      description: '',
      category: '',
      priority: 'medium',
    });
    setAttachments([]);
    setFormErrors({});
  };

  const handleDialogClose = () => {
    setIsNewTicketDialogOpen(false);
    resetForm();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-orange-600 text-white';
      case 'medium':
        return 'bg-yellow-600 text-white';
      case 'low':
        return 'bg-green-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-600 text-white';
      case 'closed':
        return 'bg-gray-600 text-white';
      case 'in-progress':
        return 'bg-blue-600 text-white';
      case 'open':
        return 'bg-orange-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  // Categories available for ticket creation
  const categories = [
    'Account Issues',
    'Billing & Payments',
    'Technical Support',
    'Product Inquiry',
    'Feature Request',
    'Bug Report',
    'Other',
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  // Show error message if there's an error
  if (error && !loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="rounded-2xl border-gray-200">
            <CardContent className="p-6">
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-red-400 mb-2" />
                <p className="text-red-600 font-medium">
                  Failed to load tickets
                </p>
                <p className="text-sm text-gray-500 mt-1">{error}</p>
                <Button
                  onClick={() => {
                    clearError();
                    getUserTickets();
                  }}
                  className="mt-4 bg-black text-white hover:bg-gray-800 rounded-xl"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Keep the help section for error state too */}
        <div>
          <Card className="rounded-2xl border-gray-200">
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
              <CardDescription>
                Contact our support team for assistance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-black" />
                </div>
                <div>
                  <p className="font-medium">Live Chat</p>
                  <p className="text-sm text-gray-500">Available now</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <TicketIcon className="h-5 w-5 text-black" />
                </div>
                <div>
                  <p className="font-medium">Support Ticket</p>
                  <p className="text-sm text-gray-500">Response within 24h</p>
                </div>
              </div>

              <Button
                className="w-full bg-black text-white hover:bg-gray-800 rounded-xl"
                onClick={() => setIsNewTicketDialogOpen(true)}
              >
                Create Ticket
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="rounded-2xl border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Support Tickets</CardTitle>
              <Button
                onClick={() => setIsNewTicketDialogOpen(true)}
                className="bg-black text-white hover:bg-gray-800 rounded-xl"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Ticket
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 mx-auto text-gray-400 mb-2 animate-spin" />
                  <p className="text-gray-500">Loading tickets...</p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">No tickets yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Create your first support ticket to get help
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => handleOpenTicketDetail(ticket)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col gap-2">
                          <Badge
                            className={`rounded-full ${getStatusColor(ticket.status)}`}
                          >
                            {ticket.status}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`rounded-full text-xs ${getPriorityColor(ticket.priority)}`}
                          >
                            {ticket.priority}
                          </Badge>
                        </div>
                        <div>
                          <p className="font-medium">{ticket.subject}</p>
                          <p className="text-sm text-gray-600 mb-1">
                            {ticket.category}
                          </p>
                          <p className="text-sm text-gray-500">
                            <Clock className="inline h-3 w-3 mr-1" />
                            {formatDate(ticket.createdAt)}
                          </p>
                          {ticket.responses.length > 0 && (
                            <p className="text-xs text-gray-400 mt-1">
                              <MessageSquare className="inline h-3 w-3 mr-1" />
                              {ticket.responses.length} response
                              {ticket.responses.length !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="rounded-2xl border-gray-200">
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
              <CardDescription>
                Contact our support team for assistance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-black" />
                </div>
                <div>
                  <p className="font-medium">Live Chat</p>
                  <p className="text-sm text-gray-500">Available now</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <TicketIcon className="h-5 w-5 text-black" />
                </div>
                <div>
                  <p className="font-medium">Support Ticket</p>
                  <p className="text-sm text-gray-500">Response within 24h</p>
                </div>
              </div>

              <Button
                className="w-full bg-black text-white hover:bg-gray-800 rounded-xl"
                onClick={() => setIsNewTicketDialogOpen(true)}
              >
                Create Ticket
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* New Ticket Dialog */}
        <Dialog open={isNewTicketDialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="max-w-2xl p-6 rounded-2xl">
            <DialogHeader>
              <DialogTitle>Create New Ticket</DialogTitle>
              <DialogDescription>
                Fill in the details below to create a new support ticket.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleFormChange('subject', e.target.value)}
                  placeholder="Enter a brief subject"
                  className="mt-2"
                />
                {formErrors.subject && (
                  <p className="text-red-600 text-sm mt-1">
                    {formErrors.subject}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleFormChange('description', e.target.value)
                  }
                  placeholder="Describe your issue in detail"
                  className="mt-2"
                  rows={4}
                />
                {formErrors.description && (
                  <p className="text-red-600 text-sm mt-1">
                    {formErrors.description}
                  </p>
                )}
              </div>{' '}
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleFormChange('category', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.category && (
                  <p className="text-red-600 text-sm mt-1">
                    {formErrors.category}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleFormChange('priority', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Attachments</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-gray-100 rounded-full px-3 py-1"
                    >
                      <span className="text-sm">{file?.name}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeAttachment(index)}
                        className="ml-2"
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                  <label
                    htmlFor="file-upload"
                    className="flex items-center cursor-pointer bg-gray-100 rounded-full px-3 py-1"
                  >
                    <Upload className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="text-sm text-gray-500">Upload files</span>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <DialogFooter className="flex justify-end gap-4 mt-4">
              <Button
                onClick={handleDialogClose}
                variant="outline"
                className="rounded-full"
              >
                Cancel
              </Button>{' '}
              <Button
                onClick={handleSubmitTicket}
                disabled={isSubmitting}
                className="bg-black text-white rounded-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Ticket'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Ticket Detail Dialog */}
        <Dialog
          open={isTicketDetailDialogOpen}
          onOpenChange={handleTicketDetailDialogClose}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <DialogHeader>
              <DialogTitle>Ticket Details</DialogTitle>
              <DialogDescription>
                View ticket information and conversation history
              </DialogDescription>
            </DialogHeader>

            {ticketDetailLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 mx-auto text-gray-400 mb-2 animate-spin" />
                <p className="text-gray-500">Loading ticket details...</p>
              </div>
            ) : selectedTicket ? (
              <div className="space-y-6">
                {/* Ticket Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Ticket ID
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedTicket._id}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Status
                    </label>
                    <div className="mt-1">
                      <Badge
                        className={`${getStatusColor(selectedTicket.status)}`}
                      >
                        {selectedTicket.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Priority
                    </label>
                    <div className="mt-1">
                      <Badge
                        variant="outline"
                        className={`${getPriorityColor(selectedTicket.priority)}`}
                      >
                        {selectedTicket.priority}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Category
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedTicket.category}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Created
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatDateTime(selectedTicket.createdAt)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Last Updated
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatDateTime(selectedTicket.updatedAt)}
                    </p>
                  </div>
                </div>

                {/* Subject and Description */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Subject
                    </label>
                    <p className="text-lg font-medium text-gray-900 mt-1">
                      {selectedTicket.subject}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Description
                    </label>
                    <div className="mt-1 p-4 bg-gray-50 rounded-lg border">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">
                        {selectedTicket.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Attachments */}
                {selectedTicket.attachments &&
                  selectedTicket.attachments.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Attachments
                      </label>
                      <div className="mt-2 space-y-2">
                        {selectedTicket.attachments.map((attachment, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <a
                              href={attachment}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm underline"
                            >
                              Attachment {index + 1}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Conversation History */}
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-3 block">
                    Conversation
                  </label>
                  <div className="space-y-4 max-h-80 overflow-y-auto border rounded-lg p-4 bg-white">
                    {/* Original ticket message */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            You
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDateTime(selectedTicket.createdAt)}
                          </span>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-sm text-gray-900 whitespace-pre-wrap">
                            {selectedTicket.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Responses */}
                    {selectedTicket.responses &&
                      selectedTicket.responses.map((response, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              response.isAdmin ? 'bg-green-100' : 'bg-blue-100'
                            }`}
                          >
                            {response.isAdmin ? (
                              <UserCog className="h-4 w-4 text-green-600" />
                            ) : (
                              <User className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {response.isAdmin ? 'Support Team' : 'You'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDateTime(response.timestamp)}
                              </span>
                            </div>
                            <div
                              className={`rounded-lg p-3 ${
                                response.isAdmin ? 'bg-green-50' : 'bg-blue-50'
                              }`}
                            >
                              <p className="text-sm text-gray-900 whitespace-pre-wrap">
                                {response.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Add Response */}
                {selectedTicket.status !== 'closed' && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-600">
                      Add Response
                    </label>
                    <Textarea
                      value={newResponse}
                      onChange={(e) => setNewResponse(e.target.value)}
                      placeholder="Type your response here..."
                      className="min-h-[100px]"
                      disabled={isSubmittingResponse}
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handleAddResponse}
                        disabled={isSubmittingResponse || !newResponse.trim()}
                        className="bg-black text-white hover:bg-gray-800 rounded-xl"
                      >
                        {isSubmittingResponse ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Send Response
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {selectedTicket.status === 'closed' && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">
                      This ticket has been closed. No further responses can be
                      added.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Failed to load ticket details</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};
