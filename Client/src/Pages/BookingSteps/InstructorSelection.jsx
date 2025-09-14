'use client';

import { motion } from 'framer-motion';
import { Award, Check, Clock, Eye, Heart, Plus, Star } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Separator } from '../../components/ui/separator';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
import { cn } from '../../lib/utils';

export const InstructorSelection = ({
  mockInstructors,
  selectedInstructor,
  handleInstructorSelect,
  openInstructorDialog,
  isInstructorDialogOpen,
  setIsInstructorDialogOpen,
  currentInstructor,
  groupMembers,
}) => {
  const { t } = useTranslation();
  const [activeGalleryImage, setActiveGalleryImage] = useState(0);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  return (
    <div className="bg-black/5 backdrop-blur-md rounded-2xl p-6 shadow-xl mb-8 border border-white/10">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-xl font-bold text-black">
          {t('selectInstructor')}
        </h2>
        {groupMembers.length > 0 && (
          <Badge className="ml-2 bg-black/10 text-black">
            {t('groupOf')} {groupMembers.length + 1}
          </Badge>
        )}
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {mockInstructors.map((instructor) => (
          <motion.div key={instructor._id} variants={itemVariants}>
            <Card
              className={cn(
                'overflow-hidden h-full transition-all duration-300 border-2 hover:shadow-2xl',
                selectedInstructor && selectedInstructor._id === instructor._id
                  ? 'border-black shadow-lg shadow-black/10'
                  : 'border-transparent hover:border-black/20'
              )}
            >
              <div className="flex flex-col">
                <div className="w-full p-4 flex justify-center items-start bg-black/5">
                  <Avatar className="h-24 w-24 border-2 border-white shadow-md">
                    <AvatarImage
                      src={
                        instructor.instructorId?.profilePicture ||
                        '/placeholder.svg'
                      }
                      alt={instructor.instructorId?.name}
                    />
                    <AvatarFallback className="bg-black text-white">
                      {instructor.instructorId?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-black mb-1 text-center">
                    {instructor.instructorId?.name}
                  </h3>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
                    <span>
                      {instructor.instructorId?.instructor.description[0]}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) =>
                      star <= instructor.instructorId?.instructor.avgReview ? (
                        <Star
                          key={star}
                          className="w-3 h-3 fill-black text-black"
                        />
                      ) : (
                        <Star key={star} className="w-3 h-3 text-gray-300" />
                      )
                    )}
                    <span className="text-xs ml-1 text-gray-600">
                      {instructor.instructorId?.instructor.avgReview}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="font-bold text-black text-lg">
                      ${instructor.price + groupMembers.length * 30}
                      <span className="text-sm font-normal text-gray-500">
                        /session
                      </span>
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 border-black/50 text-black hover:bg-black hover:text-white transition-all duration-300"
                        onClick={() => openInstructorDialog(instructor)}
                      >
                        <Eye size={14} />
                        {t('view')}
                      </Button>
                      <Button
                        size="sm"
                        className={cn(
                          'flex items-center gap-1 transition-all duration-300',
                          selectedInstructor &&
                            selectedInstructor._id === instructor._id
                            ? 'bg-black text-white hover:bg-gray-800'
                            : 'bg-white text-black border border-black hover:bg-black hover:text-white'
                        )}
                        onClick={() =>
                          selectedInstructor?._id === instructor._id
                            ? handleInstructorSelect(null)
                            : handleInstructorSelect(instructor._id)
                        }
                      >
                        {selectedInstructor &&
                        selectedInstructor._id === instructor._id ? (
                          <>
                            <Check size={14} />
                            {t('selected')}
                          </>
                        ) : (
                          <>
                            <Plus size={14} />
                            {t('select')}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Instructor Dialog */}
      <Dialog
        open={isInstructorDialogOpen}
        onOpenChange={setIsInstructorDialogOpen}
      >
        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-white rounded-xl border border-black/10">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-2xl font-bold text-black">
              {currentInstructor?.instructorId?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left side - Photo and Gallery */}
              <div className="md:w-1/2">
                <Tabs defaultValue="profile" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-black/5">
                    <TabsTrigger
                      value="profile"
                      className="data-[state=active]:bg-black data-[state=active]:text-white"
                    >
                      {t('profile')}
                    </TabsTrigger>
                    <TabsTrigger
                      value="gallery"
                      className="data-[state=active]:bg-black data-[state=active]:text-white"
                    >
                      {t('gallery')}
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="profile" className="mt-4">
                    <div className="rounded-xl overflow-hidden border border-black/10">
                      <img
                        src={
                          currentInstructor?.instructorId.profilePicture ||
                          '/placeholder.svg'
                        }
                        alt={currentInstructor?.instructorId?.name}
                        className="w-full aspect-[3/4] object-cover rounded-xl"
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="gallery" className="mt-4">
                    <div className="space-y-4">
                      <div className="rounded-xl overflow-hidden border border-black/10">
                        <img
                          src={
                            (currentInstructor?.instructorId.instructor
                              .portfolioMedias &&
                              currentInstructor?.instructorId.instructor
                                .portfolioMedias.length > 0 &&
                              currentInstructor?.instructorId.instructor
                                ?.portfolioMedias[activeGalleryImage]) ||
                            '/placeholder.svg'
                          }
                          alt={`${currentInstructor?.instructorId?.name} gallery`}
                          className="w-full aspect-[3/4] object-cover rounded-xl"
                        />
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {currentInstructor?.instructorId.instructor.portfolioMedias?.map(
                          (img, index) => (
                            <div
                              key={index}
                              className={`rounded-lg overflow-hidden cursor-pointer border-2 ${activeGalleryImage === index ? 'border-black' : 'border-transparent'}`}
                              onClick={() => setActiveGalleryImage(index)}
                            >
                              <img
                                src={img || '/placeholder.svg'}
                                alt=""
                                className="w-full h-16 object-cover"
                              />
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="mt-6">
                  <h3 className="font-semibold text-black mb-2 text-lg">
                    {t('about')}
                  </h3>
                  <p className="text-gray-700">
                    {currentInstructor?.instructorId.instructor.description[0]}
                  </p>
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold text-black mb-2 text-lg">
                    {t('languages')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {currentInstructor?.languages?.map((language, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-black/5 border-black/20"
                      >
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right side - Details */}
              <div className="md:w-1/2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mt-1">
                      <span>{currentInstructor?.specialty}</span>
                      <span className="text-gray-300">•</span>
                      <div className="flex w-full items-center gap-1">
                        <Clock size={14} />
                        <span>{currentInstructor?.experience}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 md:mr-8 bg-black/5 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 fill-black text-black" />
                    <span className="font-bold">
                      {currentInstructor?.instructorId.instructor.avgReview}
                    </span>
                  </div>
                </div>

                <Separator className="my-6 bg-black/10" />

                <div className="space-y-8">
                  <div>
                    <h3 className="font-semibold text-black mb-3 text-lg">
                      {t('achievements')}
                    </h3>
                    <ul className="space-y-3">
                      {currentInstructor?.achievements?.map(
                        (achievement, index) => (
                          <li
                            key={index}
                            className="text-sm flex items-start gap-3 bg-black/5 p-3 rounded-lg"
                          >
                            <Check
                              size={16}
                              className="text-black mt-0.5 flex-shrink-0"
                            />
                            <span className="text-gray-700">{achievement}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-black mb-3 text-lg">
                      {t('certificates')}
                    </h3>
                    <ul className="space-y-3">
                      {currentInstructor?.certificates?.map(
                        (certificate, index) => (
                          <li
                            key={index}
                            className="text-sm flex items-start gap-3 bg-black/5 p-3 rounded-lg"
                          >
                            <Award
                              size={16}
                              className="text-black mt-0.5 flex-shrink-0"
                            />
                            <span className="text-gray-700">{certificate}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-5 md:gap-0 md:flex-row justify-between items-center">
                  <div className="font-bold text-black text-2xl">
                    ${currentInstructor?.price + groupMembers.length * 30}
                    <span className="text-sm font-normal text-gray-500">
                      /session
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      className={cn(
                        'flex items-center gap-2 transition-all duration-300',
                        selectedInstructor &&
                          selectedInstructor._id === currentInstructor?._id
                          ? 'bg-black text-white hover:bg-gray-800'
                          : 'bg-white text-black border border-black hover:bg-black hover:text-white'
                      )}
                      onClick={() => {
                        handleInstructorSelect(currentInstructor?._id);
                        setIsInstructorDialogOpen(false);
                      }}
                    >
                      {selectedInstructor &&
                      selectedInstructor._id === currentInstructor?._id ? (
                        <>
                          <Check size={16} />
                          {t('selected')}
                        </>
                      ) : (
                        <>
                          <Heart size={16} />
                          {t('selectInstructor')}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
