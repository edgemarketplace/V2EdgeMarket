import { pgTable, text, timestamp, uuid, decimal } from 'drizzle-orm/pg-core';

export const marketplaces = pgTable('marketplaces', {
  id: uuid('id').defaultRandom().primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  businessName: text('business_name').notNull(),
  businessType: text('business_type').notNull(),
  offerings: text('offerings'),
  primaryGoal: text('primary_goal'),
  tone: text('tone'),
  contactEmail: text('contact_email').notNull(),
  contactPhone: text('contact_phone'),
  serviceArea: text('service_area'),
  brandColor: text('brand_color'),
  inventoryMethod: text('inventory_method'),
  inventoryRawContent: text('inventory_raw_content'),
  inventoryFileName: text('inventory_file_name'),
  plan: text('plan').default('launch'),
});

export const inventoryItems = pgTable('inventory_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  marketplaceId: uuid('marketplace_id').references(() => marketplaces.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  price: decimal('price'),
  description: text('description'),
  category: text('category'),
});
