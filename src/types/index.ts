export type UserRole = "DM" | "PLAYER";
export type CampaignStatus = "ACTIVE" | "PAUSED" | "COMPLETED";
export type SessionStatus = "PLANNED" | "COMPLETED";
export type EventType = "DAMAGE" | "HEAL";
export type ActorType = "PLAYER" | "CREATURE";
export type AchievementType = "MANUAL" | "AUTO";

export interface CharacterStats {
  damageDealt: number;
  damageReceived: number;
  healingDone: number;
  enemiesKilled: number;
}
