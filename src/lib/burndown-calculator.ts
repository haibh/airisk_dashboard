/**
 * Burndown calculation utilities for task remediation tracking
 * Supports burndown chart generation, ideal line calculation, and velocity metrics
 */

import type { Task } from '@prisma/client';

export interface BurndownPoint {
  date: string;
  remaining: number;
  completed: number;
  ideal: number;
}

export interface VelocityPoint {
  week: string;
  completed: number;
  avgDaysToComplete: number;
}

/**
 * Generate burndown data from tasks over a date range
 */
export function generateBurndownData(
  tasks: Array<Task & { createdAt: Date; completedAt: Date | null }>,
  startDate: Date,
  endDate: Date
): BurndownPoint[] {
  const burndownData: BurndownPoint[] = [];
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const totalTasks = tasks.length;

  for (let i = 0; i <= totalDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];

    // Count tasks created before or on this date
    const tasksAtDate = tasks.filter((t) => t.createdAt <= currentDate).length;

    // Count completed tasks by this date
    const completedByDate = tasks.filter(
      (t) => t.status === 'COMPLETED' && t.completedAt && t.completedAt <= currentDate
    ).length;

    const remaining = tasksAtDate - completedByDate;
    const ideal = generateIdealLine(totalTasks, totalDays, i);

    burndownData.push({
      date: dateStr,
      remaining,
      completed: completedByDate,
      ideal,
    });
  }

  return burndownData;
}

/**
 * Generate ideal burndown line point for a given day
 */
export function generateIdealLine(totalTasks: number, totalDays: number, dayIndex: number): number {
  if (totalDays === 0) return totalTasks;
  const ideal = totalTasks - (totalTasks / totalDays) * dayIndex;
  return Math.max(0, Math.round(ideal));
}

/**
 * Calculate task completion velocity by week
 */
export function calculateVelocity(
  completedTasks: Array<Task & { completedAt: Date | null; createdAt: Date }>,
  weeks: number,
  startDate: Date
): VelocityPoint[] {
  const velocityData: VelocityPoint[] = [];

  for (let i = 0; i < weeks; i++) {
    const weekStart = new Date(startDate);
    weekStart.setDate(weekStart.getDate() + i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    // Filter tasks completed in this week
    const weekTasks = completedTasks.filter((t) => {
      if (!t.completedAt) return false;
      return t.completedAt >= weekStart && t.completedAt < weekEnd;
    });

    // Calculate average days to complete
    const totalDays = weekTasks.reduce((sum, t) => {
      if (!t.completedAt) return sum;
      const days = (t.completedAt.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return sum + days;
    }, 0);

    const avgDaysToComplete =
      weekTasks.length > 0 ? Math.round((totalDays / weekTasks.length) * 10) / 10 : 0;

    velocityData.push({
      week: weekStart.toISOString().split('T')[0],
      completed: weekTasks.length,
      avgDaysToComplete,
    });
  }

  return velocityData;
}

/**
 * Calculate count of overdue tasks
 */
export function calculateOverdueTasks(tasks: Array<Task & { dueDate: Date | null }>): number {
  const now = new Date();
  return tasks.filter(
    (t) =>
      t.status !== 'COMPLETED' &&
      t.status !== 'CANCELLED' &&
      t.dueDate &&
      new Date(t.dueDate) < now
  ).length;
}
