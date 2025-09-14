import { Check, Clock, Search, UserPlus, Users, UserX, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { useFriend } from '../../hooks/useFriend.jsx';

export function UserFriendRequests() {
  const {
    friends,
    receivedRequests,
    sentRequests,
    searchResult,
    loading,
    error,
    fetchFriends,
    fetchFriendRequests,
    searchUser,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeFriendship,
    clearSearchResult,
  } = useFriend();

  const [activeTab, setActiveTab] = useState('received');
  const [searchEmail, setSearchEmail] = useState('');

  // Fetch friend requests and friends when component mounts
  useEffect(() => {
    fetchFriendRequests();
    fetchFriends();
  }, [fetchFriendRequests, fetchFriends]);

  const handleSearchUser = async (e) => {
    e.preventDefault();
    if (!searchEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      await searchUser(searchEmail);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleSendFriendRequest = async (userId) => {
    try {
      console.log('Sending friend request to user ID:', userId);
      if (!userId) {
        toast.error('Invalid user ID');
        return;
      }
      await sendRequest(userId);
      toast.success('Friend request sent!', {
        position: 'top-right',
      });
      clearSearchResult();
      setSearchEmail('');
    } catch (err) {
      console.error('Error sending friend request:', err);
      toast.error('Failed to send friend request', {
        position: 'top-right',
      });
    }
  };

  const handleRemoveFriend = async (friendId, friendName) => {
    try {
      await removeFriendship(friendId);
      toast.success(`Removed ${friendName} from friends`, {
        position: 'top-right',
      });
    } catch (err) {
      toast.error('Failed to remove friend', {
        position: 'top-right',
      });
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await acceptRequest(requestId);
      toast.success('Friend request accepted!', {
        position: 'top-right',
      });
    } catch (err) {
      toast.error('Failed to accept friend request', {
        position: 'top-right',
      });
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await rejectRequest(requestId);
      toast.success('Friend request rejected', {
        position: 'top-right',
      });
    } catch (err) {
      toast.error('Failed to reject friend request', {
        position: 'top-right',
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading.requests || loading.friends) {
    return (
      <div className="space-y-6">
        <Card className="rounded-2xl border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Friends & Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error.requests) {
    return (
      <Card className="rounded-2xl border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Friend Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-500">{error.requests}</p>
            <Button
              onClick={fetchFriendRequests}
              className="mt-4"
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-6">
      {/* Main Friend Requests Card */}
      <Card className="rounded-2xl border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Friend Management
            {receivedRequests.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {receivedRequests.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6">
            <Button
              variant={activeTab === 'received' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('received')}
              className="flex-1 relative"
            >
              Received
              {receivedRequests.length > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs"
                >
                  {receivedRequests.length}
                </Badge>
              )}
            </Button>
            <Button
              variant={activeTab === 'sent' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('sent')}
              className="flex-1 relative"
            >
              Sent
              {sentRequests.length > 0 && (
                <Badge
                  variant="secondary"
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs"
                >
                  {sentRequests.length}
                </Badge>
              )}
            </Button>
            <Button
              variant={activeTab === 'friends' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('friends')}
              className="flex-1 relative"
            >
              Friends
              {friends.length > 0 && (
                <Badge
                  variant="outline"
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs"
                >
                  {friends.length}
                </Badge>
              )}
            </Button>
            <Button
              variant={activeTab === 'search' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('search')}
              className="flex-1"
            >
              <Search className="h-4 w-4 mr-1" />
              Find Friends
            </Button>
          </div>

          {/* Received Requests Tab */}
          {activeTab === 'received' && (
            <div className="space-y-4">
              {receivedRequests.length === 0 ? (
                <div className="text-center py-8">
                  <UserPlus className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No friend requests received</p>
                  <p className="text-gray-400 text-sm mt-1">
                    When someone sends you a friend request, it will appear here
                  </p>
                </div>
              ) : (
                receivedRequests.map((request) => (
                  <div
                    key={request._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={request.sender?.profilePicture}
                          alt={request.sender?.name || 'User'}
                        />
                        <AvatarFallback>
                          {request.sender?.name?.charAt(0) ||
                            request.sender?.email?.charAt(0) ||
                            'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">
                          {request.sender?.name || 'Unknown User'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {request.sender?.email}
                        </p>
                        <p className="text-xs text-gray-400">
                          Sent on {formatDate(request.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptRequest(request._id)}
                        disabled={loading.action}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectRequest(request._id)}
                        disabled={loading.action}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Sent Requests Tab */}
          {activeTab === 'sent' && (
            <div className="space-y-4">
              {sentRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No friend requests sent</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Friend requests you send will appear here
                  </p>
                </div>
              ) : (
                sentRequests.map((request) => (
                  <div
                    key={request._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={request.receiver?.profilePicture}
                          alt={request.receiver?.name || 'User'}
                        />
                        <AvatarFallback>
                          {request.receiver?.name?.charAt(0) ||
                            request.receiver?.email?.charAt(0) ||
                            'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">
                          {request.receiver?.name || 'Unknown User'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {request.receiver?.email}
                        </p>
                        <p className="text-xs text-gray-400">
                          Sent on {formatDate(request.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          request.status === 'pending' ? 'secondary' : 'outline'
                        }
                        className="capitalize"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {request.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Friends List Tab */}
          {activeTab === 'friends' && (
            <div className="space-y-4">
              {friends.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No friends yet</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Add friends to see them here
                  </p>
                </div>
              ) : (
                friends.map((friend) => (
                  <div
                    key={friend._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={friend.profilePicture}
                          alt={friend?.name || 'User'}
                        />
                        <AvatarFallback>
                          {friend?.name?.charAt(0) ||
                            friend.email?.charAt(0) ||
                            'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">
                          {friend?.name || 'Unknown User'}
                        </p>
                        <p className="text-sm text-gray-500">{friend.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleRemoveFriend(friend._id, friend?.name)
                        }
                        disabled={loading.action}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Search Friends Tab */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              <form onSubmit={handleSearchUser} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter email address to find friends..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={loading.search || !searchEmail.trim()}
                >
                  {loading.search ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </form>

              {searchResult && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={searchResult.profilePicture}
                          alt={searchResult.user?.name || 'User'}
                        />
                        <AvatarFallback>
                          {searchResult.user?.name?.charAt(0) ||
                            searchResult.email?.charAt(0) ||
                            'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">
                          {searchResult.user?.name || 'Unknown User'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {searchResult.email}
                        </p>
                        {searchResult && (
                          <Badge
                            variant={
                              searchResult.isAlreadyFriend === true
                                ? 'default'
                                : searchResult.hasPendingRequest === false
                                  ? 'secondary'
                                  : searchResult.status === 'pending_received'
                                    ? 'outline'
                                    : 'secondary'
                            }
                            className="mt-1"
                          >
                            {searchResult.isAlreadyFriend === true &&
                              'Already Friends'}
                            {searchResult.hasPendingRequest === true &&
                              'Request Sent'}
                            {searchResult.status === 'pending_received' &&
                              'Request Pending'}
                            {searchResult.requestStatus === null &&
                              'Not Connected'}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      {searchResult.hasPendingRequest === false && (
                        <Button
                          size="sm"
                          onClick={() =>
                            handleSendFriendRequest(searchResult?.user?._id)
                          }
                          disabled={loading.action}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Add Friend
                        </Button>
                      )}
                      {searchResult.status === 'pending_received' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleAcceptRequest(searchResult.requestId)
                            }
                            disabled={loading.action}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleRejectRequest(searchResult.requestId)
                            }
                            disabled={loading.action}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                      {(searchResult.status === 'friends' ||
                        searchResult.status === 'pending_sent') && (
                        <Button size="sm" variant="outline" disabled>
                          {searchResult.status === 'friends'
                            ? 'Already Friends'
                            : 'Request Sent'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {error.search && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error.search}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
