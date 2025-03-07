  import { useState, useEffect, useCallback } from 'react';
  import axios from 'axios';
  import { useSession } from 'next-auth/react';

  /**
   * Hook to manage user progress across the application
   * Handles saving, loading, and syncing progress with the database
   */
  export function useProgress() {
    const { data: session } = useSession();
    const [progressData, setProgressData] = useState<Record<string, any>>({});
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Load progress from localStorage and/or database
     */
    const getProgress = useCallback(async () => {
      setIsLoading(true);
      try {
        // Load the progress from local storage
        const localProgress = localStorage.getItem("progress");

        // Load the progress from the database if user is logged in
        const savedProgress = session
          ? await axios
              .get("/api/get-progress", {
                params: { user: session?.user },
              })
              .then((res) => {
                return res.data.progress;
              })
              .catch((err) => {
                console.error("Error fetching progress:", err);
                return null;
              })
          : null;

        // Merge the progress from local storage and the database
        const progress = JSON.parse(
          savedProgress ? savedProgress : localProgress || "{}"
        );

        setProgressData(progress);
        return progress;
      } catch (error) {
        console.error("Error in getProgress:", error);
        return {};
      } finally {
        setIsLoading(false);
      }
    }, [session]);

    /**
     * Save progress for a specific chapter
     */
    const saveProgress = useCallback(
      async (courseId: string, lessonId: string, chapterId: string) => {
        try {
          // Load the current progress
          const currentProgress = JSON.parse(
            localStorage.getItem("progress") || "{}"
          );

          // Update the progress
          if (!currentProgress[courseId]) {
            currentProgress[courseId] = {};
          }
          if (!currentProgress[courseId][lessonId]) {
            currentProgress[courseId][lessonId] = {};
          }
          currentProgress[courseId][lessonId][chapterId] = true;

          // Save the progress back to local storage
          localStorage.setItem("progress", JSON.stringify(currentProgress));

          // Save the progress to the database if user is logged in
          if (session) {
            await axios
              .post("/api/update-progress", {
                updates: [{ user: session?.user, progress: currentProgress }],
              })
              .catch((err) => {
                console.error("Error updating progress:", err);
                const pendingUpdates = JSON.parse(
                  localStorage.getItem("pendingUpdates") || "[]"
                );
                pendingUpdates.push({ courseId, lessonId, chapterId });
                localStorage.setItem(
                  "pendingUpdates",
                  JSON.stringify(pendingUpdates)
                );
              });
          } else {
            // Store pending updates for when user logs in
            const pendingUpdates = JSON.parse(
              localStorage.getItem("pendingUpdates") || "[]"
            );
            pendingUpdates.push({ courseId, lessonId, chapterId });
            localStorage.setItem("pendingUpdates", JSON.stringify(pendingUpdates));
          }

          // Update the state
          setProgressData(currentProgress);
          return true;
        } catch (error) {
          console.error("Error in saveProgress:", error);
          return false;
        }
      },
      [session]
    );

    /**
     * Sync pending progress updates when user logs in
     */
    const syncProgress = useCallback(async () => {
      if (session) {
        try {
          const pendingUpdates = JSON.parse(
            localStorage.getItem("pendingUpdates") || "[]"
          );

          if (pendingUpdates.length === 0) return true;

          const updates = pendingUpdates.map(
            ({ courseId, lessonId, chapterId }: any) => {
              const progress = JSON.parse(localStorage.getItem("progress") || "{}");
              // Update the progress
              if (!progress[courseId]) {
                progress[courseId] = {};
              }
              if (!progress[courseId][lessonId]) {
                progress[courseId][lessonId] = {};
              }
              progress[courseId][lessonId][chapterId] = true;
              return {
                user: session?.user,
                progress,
              };
            }
          );

          if (updates.length > 0) {
            await axios
              .post("/api/update-progress", {
                updates,
              })
              .then(() => {
                localStorage.removeItem("pendingUpdates");
                return true;
              })
              .catch((err) => {
                console.error("Error syncing progress:", err);
                return false;
              });
          }
        } catch (error) {
          console.error("Error in syncProgress:", error);
          return false;
        }
      }
      return true;
    }, [session]);

    /**
     * Calculate completion percentage for a lesson or course
     */
    const calculateCompletion = useCallback(
      (courseId: string, lessonId?: string, totalChapters?: number) => {
        try {
          if (!progressData || Object.keys(progressData).length === 0) return 0;

          // If no lesson specified, calculate course completion
          if (!lessonId) {
            let totalCompleted = 0;
            let totalChaptersInCourse = 0;

            // Count all chapters in the course
            for (const lesson in progressData[courseId] || {}) {
              for (const chapter in progressData[courseId][lesson]) {
                if (progressData[courseId][lesson][chapter]) {
                  totalCompleted++;
                }
                totalChaptersInCourse++;
              }
            }

            return totalChaptersInCourse > 0
              ? Math.round((totalCompleted / totalChaptersInCourse) * 100)
              : 0;
          }

          // Calculate completion for a specific lesson
          let completed = 0;
          const lessonProgress = progressData[courseId]?.[lessonId] || {};

          for (const chapter in lessonProgress) {
            if (lessonProgress[chapter]) {
              completed++;
            }
          }

          return totalChapters && totalChapters > 0
            ? Math.round((completed / totalChapters) * 100)
            : 0;
        } catch (error) {
          console.error("Error calculating completion:", error);
          return 0;
        }
      },
      [progressData]
    );

    // Load progress on initial mount
    useEffect(() => {
      getProgress();
    }, [getProgress]);

    // Sync progress when session changes
    useEffect(() => {
      syncProgress();
    }, [syncProgress]);

    return {
      progressData,
      isLoading,
      getProgress,
      saveProgress,
      syncProgress,
      calculateCompletion,
    };
  }