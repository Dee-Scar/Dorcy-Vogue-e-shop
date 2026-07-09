-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. PRODUCTS TABLE
create table public.products (
  id text primary key, -- e.g., 'p1', 'p2' or UUID string
  name text not null,
  price numeric not null,
  image text not null,
  images text[] not null default '{}',
  category text not null,
  description text not null,
  sizes text[] not null default '{}',
  colors text[] not null default '{}',
  details text[] not null default '{}',
  stock integer not null default 0,
  status text not null default 'Active', -- 'Active', 'Draft', 'Out of Stock'
  video_url text,
  created_at timestamptz default now()
);

-- 3. CATEGORIES TABLE
create table public.categories (
  name text primary key,
  products_count integer not null default 0,
  featured boolean not null default false,
  status text not null default 'Active', -- 'Active', 'Draft'
  created_at timestamptz default now()
);

-- 4. ORDERS TABLE
create table public.orders (
  id text primary key, -- e.g. 'DV-123456'
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  email text not null,
  address text not null,
  phone text not null,
  shipping_cost numeric not null default 0,
  total_amount numeric not null,
  payment_status text not null default 'Pending Payment', -- 'Pending Payment', 'Awaiting Verification', 'Confirmed'
  status text not null default 'Pending Payment', -- 'Pending Payment', 'Awaiting Verification', 'Payment Confirmed', 'Preparing Order', 'Driver Assigned', 'Shipped', 'Delivered'
  receipt_url text,
  receipt_uploaded_at timestamptz,
  driver_name text,
  created_at timestamptz default now()
);

-- 5. ORDER ITEMS TABLE
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text references public.orders(id) on delete cascade,
  product_id text,
  product_name text not null,
  size text not null,
  color text not null,
  quantity integer not null,
  price numeric not null,
  created_at timestamptz default now()
);

-- 6. WHATSAPP SETTINGS TABLE
create table public.whatsapp_settings (
  id integer primary key default 1 check (id = 1),
  phone_number text not null default '09071262856',
  is_connected boolean not null default true,
  updated_at timestamptz default now()
);

-- 7. CMS SETTINGS TABLE
create table public.cms_settings (
  id integer primary key default 1 check (id = 1),
  hero_slides jsonb not null default '[]'::jsonb,
  about_title text not null default 'About DORCY VOGUE',
  about_description text not null default 'DORCY VOGUE is a premium fashion brand offering stylish, affordable clothing for the modern Nigerian woman.',
  featured_products text[] not null default '{}',
  contact_phone text not null default '08012345678',
  contact_email text not null default 'hello@dorcyvogue.com',
  contact_whatsapp text not null default '+234 801 234 5678',
  contact_address text not null default '12 Lekki Phase 1, Lagos',
  faq_sections jsonb not null default '[]'::jsonb,
  updated_at timestamptz default now()
);

-- 8. EMAIL TEMPLATES TABLE
create table public.email_templates (
  id text primary key,
  name text not null,
  description text,
  subject text not null,
  body text not null,
  variables text[] not null default '{}',
  updated_at timestamptz default now()
);

-- 9. USER PROFILES TABLE (to capture user metadata from signup)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text not null,
  created_at timestamptz default now()
);

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.whatsapp_settings enable row level security;
alter table public.cms_settings enable row level security;
alter table public.email_templates enable row level security;
alter table public.profiles enable row level security;

-- Public Read Policies
create policy "Allow public read on products" on public.products for select using (true);
create policy "Allow public read on categories" on public.categories for select using (true);
create policy "Allow public read on whatsapp_settings" on public.whatsapp_settings for select using (true);
create policy "Allow public read on cms_settings" on public.cms_settings for select using (true);
create policy "Allow public read on email_templates" on public.email_templates for select using (true);

-- Admin Write Policies (Admin is identified by email 'dorcyben001@gmail.com')
create policy "Allow admin write on products" on public.products for all 
  using (auth.jwt() ->> 'email' = 'dorcyben001@gmail.com')
  with check (auth.jwt() ->> 'email' = 'dorcyben001@gmail.com');

create policy "Allow admin write on categories" on public.categories for all 
  using (auth.jwt() ->> 'email' = 'dorcyben001@gmail.com')
  with check (auth.jwt() ->> 'email' = 'dorcyben001@gmail.com');

create policy "Allow admin write on whatsapp_settings" on public.whatsapp_settings for all 
  using (auth.jwt() ->> 'email' = 'dorcyben001@gmail.com')
  with check (auth.jwt() ->> 'email' = 'dorcyben001@gmail.com');

create policy "Allow admin write on cms_settings" on public.cms_settings for all 
  using (auth.jwt() ->> 'email' = 'dorcyben001@gmail.com')
  with check (auth.jwt() ->> 'email' = 'dorcyben001@gmail.com');

create policy "Allow admin write on email_templates" on public.email_templates for all 
  using (auth.jwt() ->> 'email' = 'dorcyben001@gmail.com')
  with check (auth.jwt() ->> 'email' = 'dorcyben001@gmail.com');

-- Orders policies (Select is allowed for matching user or matching email or admin; insert is public)
create policy "Allow public insert on orders" on public.orders for insert with check (true);
create policy "Allow read on orders" on public.orders for select using (
  auth.uid() = user_id or 
  auth.jwt() ->> 'email' = 'dorcyben001@gmail.com' or
  auth.jwt() ->> 'email' = email
);
create policy "Allow admin update on orders" on public.orders for update using (
  auth.jwt() ->> 'email' = 'dorcyben001@gmail.com'
);

-- Order Items policies
create policy "Allow public insert on order_items" on public.order_items for insert with check (true);
create policy "Allow read on order_items" on public.order_items for select using (
  exists (
    select 1 from public.orders o 
    where o.id = order_id and (
      o.user_id = auth.uid() or 
      auth.jwt() ->> 'email' = 'dorcyben001@gmail.com' or 
      auth.jwt() ->> 'email' = o.email
    )
  )
);

-- Profiles policies
create policy "Allow read/write on own profile" on public.profiles for all using (auth.uid() = id);
create policy "Allow admin read on profiles" on public.profiles for select using (auth.jwt() ->> 'email' = 'dorcyben001@gmail.com');

-- 11. PROFILE CREATION TRIGGER ON AUTH SIGNUP
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 12. INITIAL SEED DATA

-- Products seed
insert into public.products (id, name, price, image, images, category, description, sizes, colors, details, stock, status) values
('p1', 'Silk Maxi Dress', 45000, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80', array['https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=800&q=80'], 'Dresses', 'Indulge in pure elegance with our Silk Maxi Dress. Tailored from premium liquid silk, it features a draped neckline and a high side slit, offering a timeless silhouette that flows gracefully with every movement. Ideal for luxury evening events and modern weddings.', array['S', 'M', 'L', 'XL'], array['Wine Red', 'Emerald Green', 'Classic Black'], array['100% Premium Mulberry Silk', 'Adjustable spaghetti straps', 'Concealed back zipper closure', 'Dry clean only'], 12, 'Active'),
('p2', 'Denim Baggy Jeans', 32000, 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80', array['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=800&q=80'], 'Baggy Jeans', 'An effortless nod to vintage streetwear. Engineered with robust medium-weight cotton denim, these baggy jeans offer a comfortable loose fit through the thighs and legs, tapering slightly at the ankle. A perfect blend of street style and everyday comfort.', array['28', '30', '32', '34', '36'], array['Light Wash Indigo', 'Midnight Black', 'Acid Gray'], array['100% Organic Cotton Denim', 'Five-pocket design', 'Branded metal buttons', 'Machine wash cold inside out'], 24, 'Active'),
('p3', 'Essential Basic Top', 15000, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80', array['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80'], 'Basic Tops', 'The ultimate luxury foundation piece. Crafted from a highly breathable ribbed modal-cotton blend, this top offers a second-skin feel and exceptional stretch retention. Featuring a classic crew neck, it coordinates seamlessly with high-waisted denim or structured blazers.', array['XS', 'S', 'M', 'L', 'XL'], array['Optic White', 'Charcoal Gray', 'Nude Beige'], array['95% Modal Cotton, 5% Elastane', 'Ultra-soft ribbed finish', 'Double-stitch hems', 'Tumble dry low'], 15, 'Active'),
('p4', 'High-Waist Joggers', 22000, 'https://images.unsplash.com/photo-1551799517-eb8f03cb5e6a?auto=format&fit=crop&w=800&q=80', array['https://images.unsplash.com/photo-1551799517-eb8f03cb5e6a?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=800&q=80'], 'Joggers', 'Refining off-duty aesthetics. These joggers are cut from an incredibly soft heavyweight French Terry cotton. Designed with a flexible ribbed drawstring waistband, tapered leg contours, and side zippered pockets to keep your items secure during travel or lounging.', array['S', 'M', 'L', 'XL', 'XXL'], array['Heather Gray', 'Oatmeal Beige', 'Forest Green'], array['Heavyweight French Terry Cotton', 'Drawstring closure', 'Two side pockets, one back pocket', 'Pre-shrunk fabric'], 22, 'Active'),
('p5', 'Ankara Print Dress', 38000, 'https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&w=800&q=80', array['https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80'], 'Dresses', 'Celebrate heritage with a contemporary outline. Our Ankara Print Dress features high-contrast authentic wax print patterns, dynamic bell sleeves, and a flattering waist cinch. Made with premium breathable cotton to ensure vibrancy and comfort in warmer climates.', array['S', 'M', 'L', 'XL'], array['Vibrant Pattern'], array['100% Premium African Wax Cotton', 'Flared bell sleeves', 'Hidden back zip', 'Hand wash or dry clean recommended'], 18, 'Active'),
('p6', 'Silk Cami Top', 18000, 'https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?auto=format&fit=crop&w=800&q=80', array['https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1549064492-ccf369c254e0?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80'], 'Basic Tops', 'Graceful elegance in its simplest form. This double-lined silk camisole features a sleek V-neckline and elegant bias cut for a fluid drape. Perfect as a base layer under luxury suits or paired with casual wears for an effortless daytime look.', array['XS', 'S', 'M', 'L'], array['Champagne Gold', 'Soft Rose', 'Ivory White'], array['100% Mulberry Silk', 'Double layered bust padding', 'Hypoallergenic breathable material', 'Hand wash cold'], 31, 'Active'),
('p7', 'Pleated Maxi Skirt', 28000, 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80', array['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=800&q=80'], 'Casual Wears', 'Introduce texturized silhouettes to your wardrobe. This pleated maxi skirt features high-density permanent accordion pleats and a soft elasticized waistband for a versatile high or mid-rise fit. Moves beautifully and transitions-colors from brunch to dinner.', array['S', 'M', 'L', 'XL'], array['Caramel Tan', 'Navy Blue', 'Olive Green'], array['Flowy chiffon polyester blend', 'Permanent accordion pleating', 'Comfort elastic waistband', 'Machine wash delicate'], 15, 'Active'),
('p8', 'Canvas Tote Bag', 14000, 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80', array['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80'], 'Accessories', 'Your daily functional companion. Crafted from ultra-durable heavy canvas with premium full-grain leather handle accents, this tote bag features a spacious main compartment, a secure inside zip pocket, and water-resistant interior lining for daily utility.', array['OS (One Size)'], array['Ecru Natural', 'Sage Green', 'Charcoal Black'], array['18oz heavy duty cotton canvas', 'Genuine leather hand straps', 'Interior zip pocket & keys clip', 'Wipe clean with damp cloth'], 12, 'Active'),
('p9', 'Oversized Tee', 12000, 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80', array['https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'], 'T-Shirts', 'Relaxed fit and premium heavy cotton feel. Features a slightly dropped shoulder design, durable ribbed collar, and graphic imprint styling for an effortless streetwear aesthetic.', array['S', 'M', 'L', 'XL'], array['Vibrant Orange', 'Off-White', 'Washed Black'], array['100% heavy organic combed cotton', '240 GSM pre-shrunk fabric', 'Screen-printed graphics', 'Wash inside out with cold water'], 22, 'Active'),
('p10', 'Beaded Necklace', 8500, 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80', array['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=800&q=80'], 'Accessories', 'An elegant, handmade accessory to complete your outfits. Strung with authentic polished wood, bone beads, and brass details, this necklace captures rich African textures with modern minimalist styling.', array['OS (One Size)'], array['Natural Multi'], array['Handcrafted wood and brass beads', 'Adjustable secure lobster clasp', 'Total length: 45cm', 'Keep away from perfumes and liquids'], 19, 'Active'),
('p11', 'Silk Evening Dress', 85000, 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80', array['https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80'], 'Dresses', 'Luxurious silk evening dress with a flattering A-line silhouette. Features delicate hand-stitched detailing and a subtle sheen that catches the light beautifully.', array['XS', 'S', 'M', 'L', 'XL'], array['Classic Black', 'Beige Tan', 'Deep Cocoa', 'Warm Cream'], array['100% Premium liquid silk fabric', 'Hand-stitched micro details', 'Bias cut for natural body contour', 'Dry clean only'], 0, 'Draft'),
('p12', 'Leather Crossbody Bag', 45000, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80', array['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=800&q=80'], 'Accessories', 'Indulge in functional luxury. Tailored from full-grain textured calfskin leather, this crossbody bag offers a compact silhouette, adjustable leather shoulder strap, secure zip pockets, and elegant brushed gold hardware.', array['One Size'], array['Brown', 'Classic Black', 'Oatmeal Beige'], array['100% Premium Full-grain Calfskin', 'Soft canvas lined inner compartment', 'Adjustable strap length: 55-65cm', 'Made in Nigeria'], 0, 'Draft'),
('p13', 'Gold Statement Earrings', 15000, 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80', array['https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'], 'Accessories', 'Make a striking statement. These sculptural lightweight earrings are plated in high-shine 18k yellow gold, featuring a unique hammered surface that reflects light beautifully for day-to-night elegance.', array['One Size'], array['Gold', 'Silver'], array['18k Yellow Gold Plating over Brass', 'Hypoallergenic titanium posts', 'Ultra lightweight design', 'Length: 5.5cm'], 0, 'Draft');

-- Categories seed
insert into public.categories (name, products_count, featured, status) values
('Jeans', 24, true, 'Active'),
('Dresses', 18, true, 'Active'),
('Two Piece Sets', 12, false, 'Active'),
('Bags', 31, true, 'Active'),
('Tops', 15, false, 'Active'),
('Slides', 22, true, 'Active'),
('T-Shirts', 19, false, 'Draft'),
('Hoodies', 0, false, 'Draft'),
('Jackets', 0, false, 'Draft');

-- WhatsApp settings seed
insert into public.whatsapp_settings (id, phone_number, is_connected) values
(1, '09071262856', true);

-- CMS settings seed
insert into public.cms_settings (id, hero_slides, about_title, about_description, featured_products, contact_phone, contact_email, contact_whatsapp, contact_address, faq_sections) values
(1, 
 '[
   {"id": 1, "title": "New Summer Collection — Up to 40% Off", "status": "Active"},
   {"id": 2, "title": "Free Delivery on Orders Over ₦50,000", "status": "Active"},
   {"id": 3, "title": "Baggy Jeans — Trending Now", "status": "Draft"}
 ]'::jsonb,
 'About DORCY VOGUE',
 'DORCY VOGUE is a premium fashion brand offering stylish, affordable clothing for the modern Nigerian woman. From casual wears to statement pieces, we deliver quality fashion to your doorstep.',
 array['Baggy Jeans — Washed Blue', 'Floral Summer Dress', 'Classic White Top', 'Leather Crossbody Bag', 'Jogger Pants — Olive'],
 '08012345678',
 'hello@dorcyvogue.com',
 '+234 801 234 5678',
 '12 Lekki Phase 1, Lagos',
 '[
   {"id": 1, "title": "Delivery Questions", "questionsCount": 4},
   {"id": 2, "title": "Return Policy", "questionsCount": 3},
   {"id": 3, "title": "Payment Information", "questionsCount": 5},
   {"id": 4, "title": "Sizing Guide", "questionsCount": 2}
 ]'::jsonb
);

-- Email templates seed
insert into public.email_templates (id, name, description, subject, body, variables) values
('payment-confirmation', 'Payment Confirmation', 'Sent when admin verifies payment', 'Your payment for order {{order_number}} has been confirmed!', 'Hi {{customer_name}},\n\nGreat news! We''ve confirmed your payment of {{order_total}} for order {{order_number}}.\n\nYour order is now being prepared and we''ll notify you once it''s ready for shipping.\n\nThank you for shopping with DORCY VOGUE!', array['customer_name', 'order_number', 'order_total', 'driver_name', 'tracking_number']),
('driver-assignment', 'Driver Assignment', 'Sent when driver is assigned', 'A driver has been assigned to your order {{order_number}}', 'Hi {{customer_name}},\n\nYour order {{order_number}} has been packed and handed over to our driver {{driver_name}}.\n\nThey will contact you shortly to coordinate delivery.\n\nThank you for choosing DORCY VOGUE!', array['customer_name', 'order_number', 'driver_name']),
('shipping-update', 'Shipping Update', 'Sent when order is shipped', 'Your order {{order_number}} is on the way!', 'Hi {{customer_name}},\n\nExciting news! Your order {{order_number}} has been shipped.\n\nTracking number: {{tracking_number}}\n\nThank you for shopping with DORCY VOGUE!', array['customer_name', 'order_number', 'tracking_number']),
('delivery-confirmation', 'Delivery Confirmation', 'Sent when order is delivered', 'Your order {{order_number}} has been delivered!', 'Hi {{customer_name}},\n\nWe hope you love your purchase! Order {{order_number}} has been marked as successfully delivered.\n\nIf you have any questions, feel free to reply to this email.\n\nThank you for shopping with DORCY VOGUE!', array['customer_name', 'order_number']),
('order-created', 'Order Created', 'Sent when customer places order', 'Order {{order_number}} Placed Successfully', 'Hi {{customer_name}},\n\nThank you for your order!\n\nOrder Number: {{order_number}}\nTotal Amount: {{order_total}}\n\nPlease upload your payment receipt to complete your order verification.\n\nThank you,\nDORCY VOGUE', array['customer_name', 'order_number', 'order_total']),
('receipt-uploaded', 'Receipt Uploaded', 'Sent when receipt is uploaded', 'Receipt received for Order {{order_number}}', 'Hi {{customer_name}},\n\nWe have received your payment receipt upload for order {{order_number}}.\n\nOur team is currently verifying the transaction and will notify you as soon as payment is confirmed.\n\nBest regards,\nDORCY VOGUE', array['customer_name', 'order_number']);
