import { createClient } from "@supabase/supabase-js";

// service_role key ishlatiladi, chunki bot serverdan yoziladi (RLS chetlab o'tiladi)
// Bu key faqat Vercel Environment Variables'da, hech qachon frontend/mobile kodga chiqarilmaydi
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type Shop = {
  id: string;
  name: string;
  owner_name: string;
  owner_phone: string | null;
  telegram_chat_id: number | null;
  language: "uz" | "tj" | "ru" | null;
  debt_limit: number;
  current_debt: number;
  status: "pending_link" | "active" | "blocked";
};

export type Product = {
  id: string;
  category: string;
  name: string;
  image_url: string | null;
  price: number;
  stock_qty: number;
  low_stock_threshold: number;
  is_active: boolean;
};

export type CartItem = { product_id: string; qty: number };

export type Cart = {
  shop_id: string;
  items: CartItem[];
  updated_at: string;
};
