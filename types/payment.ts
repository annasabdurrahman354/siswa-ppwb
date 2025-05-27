export interface PaymentCategory {
  id: string;
  name: string;
  created_at: string;
  // Fetched separately or joined:
  payment_category_options?: PaymentCategoryOption[];
}

export interface PaymentCategoryOption {
  id: string;
  category_id: string;
  amount: number; // This is the price per unit for this option
  description: string; // e.g., "2 sisi, siswa reguler (per card)"
  created_at: string;
  // Joined data from parent category for convenience in UI
  category_name?: string;
}

export interface PaymentTransactionItem {
  id: string;
  transaction_id: string;
  category_option_id: string; // Now mandatory
  amount: number; // Final amount for this item in the transaction
  quantity: number;
  created_at?: string;

  // Joined data for display purposes (to be populated in frontend)
  category_option?: PaymentCategoryOption; // Contains original unit price and description
  category_name?: string; // Name of the parent category
  description_for_nota?: string; // Constructed for the nota
}

export interface PaymentTransaction {
  id: string;
  siswa_nispn: string;
  total_amount: number;
  transaction_date: string;
  processed_by_petugas: string;
  notes?: string | null;
  created_at?: string;
  items: PaymentTransactionItem[];
}

// Used for managing state within the "Add Payment" form
export interface NewPaymentItem {
  client_id: string; // Temporary client-side ID for list management
  categoryOptionId: string;
  selectedCategory: PaymentCategory; // Keep the whole category object
  selectedOption: PaymentCategoryOption; // Keep the whole option object
  quantity: number;
  unitPrice: number; // Original price from selectedOption.amount
  calculatedAmount: number; // unitPrice * quantity, can be overridden by user
  descriptionForNota: string; // Constructed from category name and option description
}