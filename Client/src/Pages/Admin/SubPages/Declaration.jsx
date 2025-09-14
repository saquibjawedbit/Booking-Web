'use client';

import { motion } from 'framer-motion';
import { ClipboardCheck, Edit, Save, Search, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchAllAdventures } from '../../../Api/adventure.api.js';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Textarea } from '../../../components/ui/textarea';
import { useDeclaration } from '../../../hooks/useDeclaration.jsx';

export default function Dash_Declation() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeclaration, setSelectedDeclaration] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [declarationContent, setDeclarationContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [adventures, setAdventures] = useState([]);
  const [selectedAdventures, setSelectedAdventures] = useState([]);
  const [newDeclaration, setNewDeclaration] = useState({
    title: '',
    version: '',
    content: '',
    adventures: [],
  });

  // Use the custom hook for declarations
  const {
    declarations,
    loading,
    error,
    refetch,
    createDeclaration: handleCreateDeclaration,
    updateDeclaration: handleUpdateDeclaration,
    deleteDeclaration: handleDeleteDeclaration,
  } = useDeclaration();

  // Fetch adventures on component mount
  useEffect(() => {
    fetchAdventures();
  }, []);

  const fetchAdventures = async () => {
    try {
      const response = await fetchAllAdventures();
      setAdventures(response.data.adventures || []);
    } catch (error) {
      console.error('Error fetching adventures:', error);
    }
  };

  // Filter declarations based on search term
  const filteredDeclarations = declarations.filter((declaration) => {
    return (
      declaration.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      declaration.version.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  const handleSelectDeclaration = async (declaration) => {
    try {
      setSelectedDeclaration(declaration);
      setDeclarationContent(declaration.content);
      setSelectedAdventures(declaration.adventures || []);
      setEditMode(false);
    } catch (error) {
      console.error('Error selecting declaration:', error);
    }
  };

  const handleSaveChanges = async () => {
    try {
      if (selectedDeclaration) {
        await handleUpdateDeclaration(selectedDeclaration._id, {
          title: selectedDeclaration.title,
          version: selectedDeclaration.version,
          content: declarationContent,
          adventures: selectedAdventures.map((adv) => adv._id || adv),
        });

        setEditMode(false);
        alert('Declaration updated successfully!');
      }
    } catch (error) {
      console.error('Error updating declaration:', error);
      alert('Failed to update declaration');
    }
  };

  const handleCreateNewDeclaration = async () => {
    try {
      if (
        !newDeclaration.title ||
        !newDeclaration.version ||
        !newDeclaration.content
      ) {
        alert('Please fill all required fields');
        return;
      }

      await handleCreateDeclaration({
        ...newDeclaration,
        adventures: newDeclaration.adventures.map((adv) => adv._id || adv),
      });

      setNewDeclaration({
        title: '',
        version: '',
        content: '',
        adventures: [],
      });
      setIsCreating(false);
      alert('Declaration created successfully!');
    } catch (error) {
      console.error('Error creating declaration:', error);
      alert('Failed to create declaration');
    }
  };

  const handleDeleteDeclarationConfirm = async (declarationId) => {
    try {
      if (window.confirm('Are you sure you want to delete this declaration?')) {
        await handleDeleteDeclaration(declarationId);

        if (selectedDeclaration?._id === declarationId) {
          setSelectedDeclaration(null);
          setDeclarationContent('');
          setSelectedAdventures([]);
        }

        alert('Declaration deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting declaration:', error);
      alert('Failed to delete declaration');
    }
  };

  const addAdventureToSelection = (adventure, isForNewDeclaration = false) => {
    if (isForNewDeclaration) {
      if (
        !newDeclaration.adventures.find(
          (adv) => (adv._id || adv) === adventure._id
        )
      ) {
        setNewDeclaration({
          ...newDeclaration,
          adventures: [...newDeclaration.adventures, adventure],
        });
      }
    } else {
      if (
        !selectedAdventures.find((adv) => (adv._id || adv) === adventure._id)
      ) {
        setSelectedAdventures([...selectedAdventures, adventure]);
      }
    }
  };

  const removeAdventureFromSelection = (
    adventureId,
    isForNewDeclaration = false
  ) => {
    if (isForNewDeclaration) {
      setNewDeclaration({
        ...newDeclaration,
        adventures: newDeclaration.adventures.filter(
          (adv) => (adv._id || adv) !== adventureId
        ),
      });
    } else {
      setSelectedAdventures(
        selectedAdventures.filter((adv) => (adv._id || adv) !== adventureId)
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
      {' '}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h2 className="text-2xl font-bold tracking-tight">
          User Declaration Forms
        </h2>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsCreating(!isCreating)}>
            <ClipboardCheck className="mr-2 h-4 w-4" />
            {isCreating ? 'Cancel' : 'Add New Declaration'}
          </Button>
        </div>
      </div>{' '}
      {/* Create New Declaration Form */}
      {isCreating && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4">
              Create New Declaration
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Declaration title"
                  value={newDeclaration.title}
                  onChange={(e) =>
                    setNewDeclaration({
                      ...newDeclaration,
                      title: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Version</label>
                <Input
                  placeholder="e.g., v1.0"
                  value={newDeclaration.version}
                  onChange={(e) =>
                    setNewDeclaration({
                      ...newDeclaration,
                      version: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  placeholder="Declaration content..."
                  className="min-h-[200px]"
                  value={newDeclaration.content}
                  onChange={(e) =>
                    setNewDeclaration({
                      ...newDeclaration,
                      content: e.target.value,
                    })
                  }
                />
              </div>

              {/* Adventure Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Associated Adventures (Optional)
                </label>
                <div className="space-y-2">
                  <select
                    className="w-full p-2 border rounded-md"
                    onChange={(e) => {
                      const selectedAdventure = adventures.find(
                        (adv) => adv._id === e.target.value
                      );
                      if (selectedAdventure) {
                        addAdventureToSelection(selectedAdventure, true);
                      }
                      e.target.value = '';
                    }}
                    value=""
                  >
                    <option value="">Select an adventure to add...</option>
                    {adventures
                      .filter(
                        (adv) =>
                          !newDeclaration.adventures.find(
                            (selected) => (selected._id || selected) === adv._id
                          )
                      )
                      .map((adventure) => (
                        <option key={adventure._id} value={adventure._id}>
                          {adventure?.name}
                        </option>
                      ))}
                  </select>

                  {newDeclaration.adventures.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {newDeclaration.adventures.map((adventure) => (
                        <Badge
                          key={adventure._id || adventure}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {adventure?.name || 'Unknown Adventure'}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() =>
                              removeAdventureFromSelection(
                                adventure._id || adventure,
                                true
                              )
                            }
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreateNewDeclaration}>
                  Create Declaration
                </Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search declarations..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>{' '}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 text-center">Loading declarations...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Adventures</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeclarations.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-muted-foreground"
                        >
                          No declarations found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDeclarations.map((declaration) => (
                        <TableRow
                          key={declaration._id}
                          className={`cursor-pointer ${selectedDeclaration?._id === declaration._id ? 'bg-muted/50' : ''}`}
                          onClick={() => handleSelectDeclaration(declaration)}
                        >
                          <TableCell className="font-medium">
                            {declaration.title}
                          </TableCell>
                          <TableCell>{declaration.version}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {declaration.adventures &&
                              declaration.adventures.length > 0 ? (
                                declaration.adventures
                                  .slice(0, 2)
                                  .map((adventure) => (
                                    <Badge
                                      key={adventure._id || adventure}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {adventure?.name || 'Unknown'}
                                    </Badge>
                                  ))
                              ) : (
                                <span className="text-muted-foreground text-xs">
                                  No adventures
                                </span>
                              )}
                              {declaration.adventures &&
                                declaration.adventures.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{declaration.adventures.length - 2} more
                                  </Badge>
                                )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDeclarationConfirm(declaration._id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          {selectedDeclaration ? (
            <Card>
              <CardContent className="p-4">
                {' '}
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {selectedDeclaration.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Version {selectedDeclaration.version} • Created on{' '}
                      {new Date(
                        selectedDeclaration.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {editMode ? (
                      <Button onClick={handleSaveChanges}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => setEditMode(true)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
                {editMode ? (
                  <Textarea
                    className="min-h-[500px] font-mono text-sm"
                    value={declarationContent}
                    onChange={(e) => setDeclarationContent(e.target.value)}
                  />
                ) : (
                  <div className="prose max-w-none dark:prose-invert">
                    <pre className="whitespace-pre-wrap text-sm">
                      {declarationContent}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[400px] border rounded-lg border-dashed">
              <div className="text-center">
                <ClipboardCheck className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-semibold">
                  No Declaration Selected
                </h3>
                <p className="text-sm text-muted-foreground">
                  Select a declaration form from the list to view or edit
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
