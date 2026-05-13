import { supabase } from './supabaseClient';
import { MarketplaceIntakeData, InventoryItem } from './types';

export const marketplaceService = {
  async saveMarketplace(data: MarketplaceIntakeData) {
    const { data: marketplace, error } = await supabase
      .from('marketplaces')
      .insert([
        {
          business_name: data.businessName,
          business_type: data.businessType,
          offerings: data.offerings,
          primary_goal: data.primaryGoal,
          tone: data.tone,
          contact_email: data.contactEmail,
          contact_phone: data.contactPhone,
          service_area: data.serviceArea,
          brand_color: data.brandColor,
          inventory_method: data.inventory?.method || 'text',
          inventory_raw_content: data.inventory?.content,
          inventory_file_name: data.inventory?.fileName,
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Save inventory items if they exist
    if (data.inventory?.items && data.inventory.items.length > 0 && marketplace) {
      const itemsToInsert = data.inventory.items
        .filter(item => item.name.trim() !== '')
        .map(item => ({
          marketplace_id: marketplace.id,
          name: item.name,
          price: item.price,
          description: item.description,
          category: item.category,
        }));

      if (itemsToInsert.length > 0) {
        const { error: inventoryError } = await supabase
          .from('inventory_items')
          .insert(itemsToInsert);

        if (inventoryError) throw inventoryError;
      }
    }

    return marketplace;
  },

  async getMarketplaces() {
    const { data, error } = await supabase
      .from('marketplaces')
      .select('*, inventory_items(*)');

    if (error) throw error;
    return data;
  }
};
