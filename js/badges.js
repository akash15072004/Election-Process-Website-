/**
 * @module Badges
 * @description VoteGuide AI — Achievement Badge & Gamification System.
 * Tracks user progress via localStorage, awards badges for milestones
 * (first visit, quiz completion, section exploration), and renders badge UI.
 * @version 1.0.0
 */

import { showToast } from './utils.js';
import { badges as badgeDefs } from './data.js';

/** @constant {string} LocalStorage key for unlocked badge IDs */
const STORAGE_KEY = 'voteguide_badges';

/**
 * Retrieves the list of unlocked badge IDs from localStorage.
 * @returns {string[]} Array of unlocked badge ID strings
 */
export function getUnlockedBadges() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch { return []; }
}

/**
 * Unlocks a badge by ID, persists to localStorage, and shows a toast notification.
 * No-ops if the badge is already unlocked (idempotent).
 * @param {string} badgeId - The unique badge identifier to unlock
 */
export function unlockBadge(badgeId) {
  const unlocked = getUnlockedBadges();
  if (unlocked.includes(badgeId)) return;
  unlocked.push(badgeId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked));

  const badge = badgeDefs.find(b => b.id === badgeId);
  if (badge) {
    showToast(`🏅 Achievement Unlocked: ${badge.title}!`, 'success');
  }
}

/**
 * Checks whether a specific badge has been unlocked.
 * @param {string} badgeId - The badge identifier to check
 * @returns {boolean} True if the badge is unlocked
 */
export function isBadgeUnlocked(badgeId) {
  return getUnlockedBadges().includes(badgeId);
}

/**
 * Renders all badge definitions as HTML cards with locked/unlocked states.
 * @returns {string} HTML string of badge cards
 */
export function renderBadges() {
  const unlocked = getUnlockedBadges();
  return badgeDefs.map(b => `
    <div class="achievement-badge ${unlocked.includes(b.id) ? 'unlocked' : 'locked'}">
      <span class="badge-icon">${b.icon}</span>
      <span class="badge-title">${b.title}</span>
      <span class="badge-desc">${b.desc}</span>
    </div>
  `).join('');
}

/** @constant {string} LocalStorage key for visited section tracking */
const SECTIONS_KEY = 'voteguide_sections';

/**
 * Tracks a section visit for the 'Election Expert' badge milestone.
 * Automatically unlocks the badge when 10+ sections have been visited.
 * @param {string} section - The section identifier being visited
 */
export function trackSection(section) {
  try {
    const visited = JSON.parse(localStorage.getItem(SECTIONS_KEY)) || [];
    if (!visited.includes(section)) {
      visited.push(section);
      localStorage.setItem(SECTIONS_KEY, JSON.stringify(visited));
    }
    if (visited.length >= 10) unlockBadge('election_expert');
  } catch {}
}

/**
 * Initializes the badge system by awarding the 'First Visit' badge.
 * Called once on app startup via dynamic import in AppController.
 */
export function initBadges() {
  unlockBadge('first_visit');
}
