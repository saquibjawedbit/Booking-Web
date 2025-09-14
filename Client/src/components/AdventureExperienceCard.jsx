import { Award } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';

// Add CSS animations
const styles = `
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
`;

const AdventureExperienceCard = ({
  adventureExp,
  isFullWidth = false,
  index = 0,
}) => {
  const { adventure, experience, completedSessions, lastSessionDate } =
    adventureExp;

  // Calculate level based on experience (every 100 exp = 1 level)
  const level = Math.floor(experience / 100);
  const nextLevelExp = (level + 1) * 100;
  const progressPercentage = ((experience % 100) / 100) * 100;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <Card
        className={`rounded-2xl border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] ${
          isFullWidth ? 'max-w-2xl mx-auto' : ''
        }`}
        style={{
          animationDelay: `${index * 100}ms`,
          animation: 'fadeInUp 0.5s ease-out forwards',
          opacity: 0,
        }}
      >
        <CardHeader className="pb-4">
          <div
            className={`flex items-start ${isFullWidth ? 'gap-6' : 'justify-between'}`}
          >
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-gray-900 leading-tight truncate">
                {adventure?.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge
                  variant="secondary"
                  className="text-xs bg-blue-100 text-blue-800"
                >
                  Level {level}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {completedSessions} session
                  {completedSessions !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
            {adventure.thumbnail && (
              <div className={`flex-shrink-0 ${isFullWidth ? 'ml-0' : 'ml-4'}`}>
                <img
                  src={adventure.thumbnail}
                  alt={adventure?.name}
                  className={`rounded-lg object-cover shadow-sm ${
                    isFullWidth ? 'w-24 h-24' : 'w-16 h-16'
                  }`}
                />
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Experience Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Experience
                </span>
                <span className="text-sm text-gray-500">
                  {experience}/{nextLevelExp} XP
                </span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {nextLevelExp - experience} XP to level {level + 1}
              </p>
            </div>

            {/* Stats */}
            <div
              className={`grid gap-3 ${isFullWidth ? 'grid-cols-3' : 'grid-cols-2'}`}
            >
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                <Award className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {experience}
                  </p>
                  <p className="text-xs text-gray-600">Total XP</p>
                </div>
              </div>
              {isFullWidth && (
                <>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                    <div className="h-5 w-5 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">
                        {level}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        Level {level}
                      </p>
                      <p className="text-xs text-gray-600">Current</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                    <div className="h-5 w-5 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">+</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {nextLevelExp - experience}
                      </p>
                      <p className="text-xs text-gray-600">XP to Next</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Last Session */}
            {lastSessionDate && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Last session: {formatDate(lastSessionDate)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default AdventureExperienceCard;
