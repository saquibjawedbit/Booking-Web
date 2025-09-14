import { Award } from 'lucide-react';
import { useEffect, useState } from 'react';
import { updateUserAchievements } from '../../Api/achievement.api';
import { getUserAchievements } from '../../Api/user.api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';

export default function AchievementTestComponent() {
  const [achievementData, setAchievementData] = useState([]);
  const [adventureStats, setAdventureStats] = useState([]);
  const [achievementsLoading, setAchievementsLoading] = useState(true);
  const [achievementsError, setAchievementsError] = useState(null);
  const [testStatus, setTestStatus] = useState('idle');
  const [testLogs, setTestLogs] = useState([]);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const logTest = (message, type = 'info') => {
    setTestLogs((prev) => [
      ...prev,
      { message, type, time: new Date().toLocaleTimeString() },
    ]);
  };

  const fetchAchievements = async () => {
    try {
      setAchievementsLoading(true);
      setAchievementsError(null);
      logTest('Fetching achievements...');

      const response = await getUserAchievements();

      if (response.success) {
        setAchievementData(response.data.achievements || []);
        logTest('Successfully fetched achievements', 'success');

        // Check if we have test achievements
        const testCategory = response.data.achievements.find(
          (a) => a.category === 'Test Adventure'
        );
        if (testCategory) {
          logTest(
            `Found Test Adventure category with ${testCategory.achievements.length} achievements`,
            'success'
          );
        } else {
          logTest(
            'Test Adventure category not found. Run backend tests first.',
            'warning'
          );
        }
      } else {
        setAchievementsError('Failed to load achievements');
        logTest(
          'Failed to load achievements: ' +
            (response.message || 'Unknown error'),
          'error'
        );
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
      setAchievementsError('Failed to load achievements');
      logTest('Error fetching achievements: ' + error.message, 'error');
    } finally {
      setAchievementsLoading(false);
    }
  };

  const updateTestAchievements = async (sessions) => {
    try {
      setTestStatus('updating');
      logTest(`Updating Test Adventure with ${sessions} sessions...`);

      const stats = [
        {
          name: 'Test Adventure',
          totalSessions: sessions,
        },
      ];

      setAdventureStats(stats);

      const response = await updateUserAchievements(stats);

      if (response.success) {
        logTest('Successfully updated achievements', 'success');
        await fetchAchievements();
      } else {
        logTest(
          'Failed to update achievements: ' +
            (response.message || 'Unknown error'),
          'error'
        );
      }
    } catch (error) {
      console.error('Error updating achievements:', error);
      logTest('Error updating achievements: ' + error.message, 'error');
    } finally {
      setTestStatus('idle');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Achievement System Test</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <h3 className="font-medium">Achievement Actions</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={fetchAchievements}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
                    disabled={achievementsLoading}
                  >
                    Refresh Achievements
                  </button>
                </div>

                <h3 className="font-medium mt-4">Test Achievement Progress</h3>
                <p className="text-sm text-gray-600">
                  Simulate completing Test Adventure sessions:
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[1, 5, 10, 20].map((sessions) => (
                    <button
                      key={sessions}
                      onClick={() => updateTestAchievements(sessions)}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                      disabled={testStatus === 'updating'}
                    >
                      {sessions} {sessions === 1 ? 'Session' : 'Sessions'}
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium">Test Logs</h3>
                <div className="mt-2 h-64 overflow-y-auto border rounded-md p-2 bg-gray-50">
                  {testLogs.length === 0 ? (
                    <p className="text-gray-400 italic">No logs yet</p>
                  ) : (
                    testLogs.map((log, index) => (
                      <div
                        key={index}
                        className={`text-sm mb-1 ${
                          log.type === 'error'
                            ? 'text-red-600'
                            : log.type === 'success'
                              ? 'text-green-600'
                              : log.type === 'warning'
                                ? 'text-amber-600'
                                : 'text-gray-700'
                        }`}
                      >
                        <span className="text-gray-400">[{log.time}]</span>{' '}
                        {log.message}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Achievement Display Test</CardTitle>
          </CardHeader>
          <CardContent>
            {achievementsLoading ? (
              <div className="text-center py-8">
                <p>Loading achievements...</p>
              </div>
            ) : achievementsError ? (
              <div className="text-center py-8 text-red-500">
                <p>{achievementsError}</p>
                <button
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md"
                  onClick={fetchAchievements}
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="font-medium">Test Results</h3>
                {achievementData.length === 0 ? (
                  <div className="text-center py-8">
                    <p>No achievements found.</p>
                  </div>
                ) : (
                  <>
                    <div className="text-sm text-gray-600 mb-4">
                      <p>✅ Achievement data loaded successfully</p>
                      <p>
                        ✅ Found {achievementData.length} achievement categories
                      </p>
                      <p>✅ UI rendering working correctly</p>
                    </div>

                    {/* Only show Test Adventure for testing */}
                    {achievementData
                      .filter(
                        (section) => section.category === 'Test Adventure'
                      )
                      .map((section, index) => {
                        const matchedAdventure = adventureStats.find(
                          (adv) =>
                            adv?.name.toLowerCase() ===
                            section.category.toLowerCase()
                        );

                        const totalSessions =
                          matchedAdventure?.totalSessions || 0;

                        return (
                          <div key={index} className="mb-6">
                            <h4 className="text-lg font-medium mb-3">
                              {section.category}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              Current test sessions: {totalSessions}
                            </p>
                            <div className="flex flex-col gap-4">
                              {section.achievements.map((item, i) => {
                                // Use the isEarned property from the backend if available,
                                // otherwise fall back to the previous logic
                                let isEarned = item.isEarned;

                                // If isEarned is not provided by the backend, calculate it
                                if (isEarned === undefined) {
                                  if (i === 0 && totalSessions >= 1)
                                    isEarned = true;
                                  if (i === 1 && totalSessions >= 5)
                                    isEarned = true;
                                  if (i === 2 && totalSessions >= 10)
                                    isEarned = true;
                                  if (i === 3 && totalSessions >= 20)
                                    isEarned = true;
                                }

                                return (
                                  <div
                                    key={i}
                                    className={`flex items-center gap-4 p-4 rounded-2xl bg-gray-100 ${
                                      isEarned ? 'opacity-100' : 'opacity-50'
                                    }`}
                                  >
                                    <Award
                                      className={`h-8 w-8 ${
                                        isEarned
                                          ? 'text-gray-800 opacity-100'
                                          : 'text-gray-800 opacity-50'
                                      }`}
                                    />
                                    <div>
                                      <span className="text-sm font-medium text-gray-600">
                                        {item.title}
                                      </span>
                                      <p className="text-xs text-gray-400">
                                        {item.description}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Verification Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="font-medium mr-2">1.</span>
                <div>
                  <span className="font-medium">Backend API Integration:</span>
                  <ul className="ml-6 list-disc text-sm mt-1">
                    <li>
                      Achievement data is fetched correctly from the backend
                    </li>
                    <li>Achievement updates are sent to the backend</li>
                    <li>Error handling works as expected</li>
                  </ul>
                </div>
              </li>

              <li className="flex items-start mt-4">
                <span className="font-medium mr-2">2.</span>
                <div>
                  <span className="font-medium">UI Rendering:</span>
                  <ul className="ml-6 list-disc text-sm mt-1">
                    <li>Achievements are grouped by category</li>
                    <li>Loading state is displayed during data fetching</li>
                    <li>Error state is displayed with retry option</li>
                    <li>Empty state is handled appropriately</li>
                  </ul>
                </div>
              </li>

              <li className="flex items-start mt-4">
                <span className="font-medium mr-2">3.</span>
                <div>
                  <span className="font-medium">Achievement Logic:</span>
                  <ul className="ml-6 list-disc text-sm mt-1">
                    <li>Earned achievements are visually distinct</li>
                    <li>Achievement status updates correctly with new data</li>
                    <li>Progress calculation follows the correct rules</li>
                  </ul>
                </div>
              </li>

              <li className="flex items-start mt-4">
                <span className="font-medium mr-2">4.</span>
                <div>
                  <span className="font-medium">Performance:</span>
                  <ul className="ml-6 list-disc text-sm mt-1">
                    <li>UI remains responsive during data loading</li>
                    <li>Achievement updates are processed efficiently</li>
                  </ul>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
