import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import path from "path";

async function main() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaLibSql } = require("@prisma/adapter-libsql");
  const dbPath = path.resolve(process.cwd(), "dev.db");
  const adapter = new PrismaLibSql({ url: `file://${dbPath}` });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prisma = new PrismaClient({ adapter } as any);

  const dmPassword = await bcrypt.hash("password123", 10);
  const playerPassword = await bcrypt.hash("password123", 10);

  const dm = await prisma.user.upsert({
    where: { email: "dm@dungeon.com" },
    update: {},
    create: { name: "Dungeon Master", email: "dm@dungeon.com", password: dmPassword, role: "DM" },
  });

  const player1 = await prisma.user.upsert({
    where: { email: "player1@dungeon.com" },
    update: {},
    create: { name: "Aragorn", email: "player1@dungeon.com", password: playerPassword, role: "PLAYER" },
  });

  const player2 = await prisma.user.upsert({
    where: { email: "player2@dungeon.com" },
    update: {},
    create: { name: "Legolas", email: "player2@dungeon.com", password: playerPassword, role: "PLAYER" },
  });

  const campaign = await prisma.campaign.upsert({
    where: { id: "seed-campaign-1" },
    update: {},
    create: {
      id: "seed-campaign-1",
      name: "The Lost Mines of Phandelver",
      description: "A classic adventure in the Forgotten Realms",
      dmId: dm.id,
      status: "ACTIVE",
      nextSessionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      nextSessionType: "IN_PERSON",
    },
  });

  await prisma.campaignMember.upsert({
    where: { campaignId_userId: { campaignId: campaign.id, userId: player1.id } },
    update: {},
    create: { campaignId: campaign.id, userId: player1.id },
  });

  await prisma.campaignMember.upsert({
    where: { campaignId_userId: { campaignId: campaign.id, userId: player2.id } },
    update: {},
    create: { campaignId: campaign.id, userId: player2.id },
  });

  const char1 = await prisma.character.upsert({
    where: { id: "seed-char-1" },
    update: {},
    create: {
      id: "seed-char-1",
      name: "Thorin Ironforge",
      class: "Fighter",
      level: 3,
      xp: 750,
      baseHealth: 32,
      avatarSeed: "Thorin",
      userId: player1.id,
      campaignId: campaign.id,
    },
  });

  const char2 = await prisma.character.upsert({
    where: { id: "seed-char-2" },
    update: {},
    create: {
      id: "seed-char-2",
      name: "Elenara Moonwhisper",
      class: "Wizard",
      level: 3,
      xp: 680,
      baseHealth: 18,
      avatarSeed: "Elenara",
      userId: player2.id,
      campaignId: campaign.id,
    },
  });

  const achievement1 = await prisma.achievement.upsert({
    where: { id: "ach-1" },
    update: {},
    create: {
      id: "ach-1",
      name: "DPS Leader",
      description: "Most damage dealt in a session",
      icon: "sword",
      type: "AUTO",
    },
  });

  await prisma.achievement.upsert({
    where: { id: "ach-2" },
    update: {},
    create: {
      id: "ach-2",
      name: "Tank Master",
      description: "Most damage received in a session",
      icon: "shield",
      type: "AUTO",
    },
  });

  await prisma.achievement.upsert({
    where: { id: "ach-3" },
    update: {},
    create: {
      id: "ach-3",
      name: "Assassin",
      description: "Most final blows in a session",
      icon: "skull",
      type: "AUTO",
    },
  });

  const session1 = await prisma.session.upsert({
    where: { id: "seed-session-1" },
    update: {},
    create: {
      id: "seed-session-1",
      title: "The Goblin Ambush",
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      notes: "The party encountered a goblin ambush on the road to Phandalin. Thorin charged in while Elenara cast firebolt from range.",
      status: "COMPLETED",
      campaignId: campaign.id,
    },
  });

  const goblin1 = await prisma.creature.upsert({
    where: { id: "seed-goblin-1" },
    update: {},
    create: { id: "seed-goblin-1", name: "Goblin Leader", maxHp: 15, sessionId: session1.id },
  });

  const goblin2 = await prisma.creature.upsert({
    where: { id: "seed-goblin-2" },
    update: {},
    create: { id: "seed-goblin-2", name: "Goblin Archer", maxHp: 8, sessionId: session1.id },
  });

  // Combat events
  const combatEventsData = [
    { id: "ev-1", sessionId: session1.id, eventType: "DAMAGE", sourceType: "PLAYER", sourceId: char1.id, targetType: "CREATURE", targetId: goblin1.id, amount: 8, isFinalBlow: false },
    { id: "ev-2", sessionId: session1.id, eventType: "DAMAGE", sourceType: "PLAYER", sourceId: char2.id, targetType: "CREATURE", targetId: goblin2.id, amount: 6, isFinalBlow: true },
    { id: "ev-3", sessionId: session1.id, eventType: "DAMAGE", sourceType: "CREATURE", sourceId: goblin1.id, targetType: "PLAYER", targetId: char1.id, amount: 5, isFinalBlow: false },
    { id: "ev-4", sessionId: session1.id, eventType: "DAMAGE", sourceType: "PLAYER", sourceId: char1.id, targetType: "CREATURE", targetId: goblin1.id, amount: 11, isFinalBlow: true },
  ];
  for (const ev of combatEventsData) {
    await prisma.combatEvent.upsert({ where: { id: ev.id }, update: {}, create: ev });
  }

  await prisma.characterAchievement.upsert({
    where: { id: "char-ach-1" },
    update: {},
    create: {
      id: "char-ach-1",
      characterId: char1.id,
      achievementId: achievement1.id,
      sessionId: session1.id,
    },
  });

  for (const note of [
    { id: "note-1", characterId: char1.id, sessionId: session1.id, content: "I took quite a hit from the goblin leader. Need to stock up on healing potions before next session." },
    { id: "note-2", characterId: char2.id, sessionId: session1.id, content: "My firebolt finally proved its worth! Killed that pesky archer in one shot." },
  ]) {
    await prisma.playerNote.upsert({ where: { id: note.id }, update: {}, create: note });
  }

  console.log("Seed complete!");
  console.log("DM: dm@dungeon.com / password123");
  console.log("Player 1: player1@dungeon.com / password123");
  console.log("Player 2: player2@dungeon.com / password123");

  await prisma.$disconnect();
}

main().catch(console.error);
