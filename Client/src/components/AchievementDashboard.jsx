import { Award, ChevronDown, ChevronUp, Target } from 'lucide-react';
import { useState } from 'react';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';

export default function AchievementDashboard({
  achievementData = [],
  loading = false,
  updateLoading = false,
  error = null,
  onRetry = () => {},
  adventureStats = [],
}) {
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Get a list of recently earned achievements (earned in the last 30 days)
  const getRecentAchievements = () => {
    const recentAchievements = [];

    achievementData?.forEach((category) => {
      category?.achievements?.forEach((achievement) => {
        if (achievement?.isEarned && achievement?.earnedAt) {
          const earnedDate = new Date(achievement?.earnedAt);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          if (earnedDate >= thirtyDaysAgo) {
            recentAchievements.push({
              ...achievement,
              category: category?.category,
            });
          }
        }
      });
    });

    // Sort by most recently earned
    return recentAchievements.sort((a, b) => {
      return new Date(b.earnedAt) - new Date(a.earnedAt);
    });
  };

  // Calculate the total achievements and earned achievements
  const calculateAchievementStats = () => {
    let total = 0;
    let earned = 0;

    achievementData?.forEach((category) => {
      total += category?.achievements?.length || 0;
      earned += category?.achievements?.filter((a) => a?.isEarned)?.length || 0;
    });

    return { total, earned };
  };

  const { total, earned } = calculateAchievementStats();
  const progressPercentage = total > 0 ? (earned / total) * 100 : 0;
  const recentAchievements = getRecentAchievements();

  const toggleCategory = (categoryName) => {
    if (expandedCategory === categoryName) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryName);
    }
  };

  // Find achievements that are close to being earned (next milestone)
  const getNextMilestones = () => {
    const milestones = [];

    achievementData?.forEach((category) => {
      // Normalize category name for matching
      const normalizedCategoryName = category?.category?.trim().toLowerCase();

      // Try to find a match by exact normalized name first
      let matchedAdventure = adventureStats?.find(
        (adv) => adv?.name?.trim().toLowerCase() === normalizedCategoryName
      );

      // If no exact match, try to find a partial match (category name contains adventure name or vice versa)
      if (!matchedAdventure) {
        matchedAdventure = adventureStats?.find(
          (adv) =>
            normalizedCategoryName?.includes(adv?.name?.trim().toLowerCase()) ||
            adv?.name?.trim().toLowerCase().includes(normalizedCategoryName)
        );
      }

      const totalSessions = matchedAdventure?.totalSessions || 0;

      // Find the first non-earned achievement in each category
      const nextAchievement = category?.achievements?.find((a) => !a?.isEarned);

      if (nextAchievement && nextAchievement?.requiredSessions) {
        const progress = totalSessions / nextAchievement?.requiredSessions;

        if (progress > 0 && progress < 1) {
          milestones.push({
            category: category?.category,
            title: nextAchievement?.title,
            description: nextAchievement?.description,
            progress,
            current: totalSessions,
            required: nextAchievement?.requiredSessions,
          });
        }
      }
    });

    // Sort by closest to completion
    return milestones.sort((a, b) => b.progress - a.progress).slice(0, 3);
  };

  const nextMilestones = getNextMilestones();

  if (loading) {
    return (
      <Card className="rounded-2xl border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Your Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p>Loading achievements...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="rounded-2xl border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Your Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-red-500 mb-4">
              <p className="font-medium">Failed to load achievements</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
            <button
              className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onRetry}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Retry'}
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (achievementData.length === 0) {
    return (
      <Card className="rounded-2xl border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Your Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Award className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p>No achievements found.</p>
            <p className="text-sm text-gray-500 mt-2">
              Start exploring adventures to unlock achievements!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Award className="h-5 w-5 mr-2" />
          Your Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall achievement progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Overall Progress</h3>
              <div className="flex items-center gap-2">
                {updateLoading && (
                  <span className="text-xs text-blue-600 animate-pulse">
                    Updating...
                  </span>
                )}
                <Badge variant="outline" className="font-medium">
                  {earned} / {total}
                </Badge>
              </div>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-black rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {Math.round(progressPercentage)}% of all achievements unlocked
            </p>
          </div>

          {/* Recently earned achievements */}
          {recentAchievements.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-medium mb-3">Recently Earned</h3>
                <div className="space-y-3">
                  {recentAchievements.slice(0, 3).map((achievement, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                    >
                      <Award className="h-6 w-6 text-black" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">
                              {achievement.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {achievement.description}
                            </p>
                          </div>
                          <Badge className="bg-green-100 text-green-800 border-0 text-xs">
                            {achievement.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Next milestones */}
          {nextMilestones.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-medium mb-3">Next Milestones</h3>
                <div className="space-y-3">
                  {nextMilestones.map((milestone, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <Target className="h-6 w-6 text-gray-400" />
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="font-medium text-sm">
                              {milestone.title}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {milestone.current} / {milestone.required}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500">
                            {milestone.description}
                          </p>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-400 rounded-full"
                          style={{ width: `${milestone.progress * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Achievement categories */}
          <Separator />
          <div>
            <h3 className="font-medium mb-3">Achievement Categories</h3>
            <div className="space-y-3">
              {achievementData.map((category, index) => {
                const earnedCount = category.achievements.filter(
                  (a) => a.isEarned
                ).length;
                const isExpanded = expandedCategory === category.category;

                return (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-xl overflow-hidden"
                  >
                    <button
                      className="w-full p-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100"
                      onClick={() => toggleCategory(category.category)}
                    >
                      <div className="flex items-center gap-3">
                        <Award className="h-5 w-5" />
                        <span className="font-medium">{category.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="font-medium text-xs"
                        >
                          {earnedCount} / {category.achievements.length}
                        </Badge>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-3 space-y-2">
                        {category.achievements.map((achievement, i) => (
                          <div
                            key={i}
                            className={`flex items-center gap-3 p-2 rounded-lg ${
                              achievement.isEarned
                                ? 'bg-gray-50'
                                : 'bg-white opacity-70'
                            }`}
                          >
                            <Award
                              className={`h-5 w-5 ${
                                achievement.isEarned
                                  ? 'text-black'
                                  : 'text-gray-400'
                              }`}
                            />
                            <div>
                              <p
                                className={`text-sm font-medium ${
                                  achievement.isEarned
                                    ? 'text-black'
                                    : 'text-gray-500'
                                }`}
                              >
                                {achievement.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {achievement.description}
                              </p>
                            </div>
                            {achievement.isEarned && (
                              <Badge className="ml-auto bg-green-100 text-green-800 border-0 text-xs">
                                Earned
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
