
CREATE TABLE public.restaurant_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  name text NOT NULL,
  tagline text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  opening_hours text NOT NULL DEFAULT '',
  open_from integer NOT NULL DEFAULT 7,
  open_to integer NOT NULL DEFAULT 23,
  pix_key text NOT NULL DEFAULT '',
  delivery_fee_per_block numeric(10,2) NOT NULL DEFAULT 2,
  delivery_block_km numeric(10,2) NOT NULL DEFAULT 2,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.products (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  ingredients text[] NOT NULL DEFAULT '{}',
  price numeric(10,2) NOT NULL DEFAULT 0,
  category text NOT NULL,
  rating numeric(2,1) NOT NULL DEFAULT 5,
  available boolean NOT NULL DEFAULT true,
  addons jsonb NOT NULL DEFAULT '[]'::jsonb,
  sales integer NOT NULL DEFAULT 0,
  promo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.stock_items (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Geral',
  quantity numeric(10,2) NOT NULL DEFAULT 0,
  min_quantity numeric(10,2) NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'un'
);

CREATE TABLE public.customers (
  id text PRIMARY KEY,
  name text NOT NULL,
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  avatar text NOT NULL DEFAULT '',
  district text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  cep text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id text REFERENCES public.customers(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'Casa',
  cep text NOT NULL DEFAULT '',
  street text NOT NULL DEFAULT '',
  number text NOT NULL DEFAULT '',
  complement text NOT NULL DEFAULT '',
  district text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT 'PE',
  reference text NOT NULL DEFAULT '',
  is_primary boolean NOT NULL DEFAULT false,
  distance_km numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  customer_id text,
  customer_name text NOT NULL DEFAULT '',
  customer_phone text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  district text NOT NULL DEFAULT '',
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  delivery_fee numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  payment text NOT NULL DEFAULT 'pix',
  paid boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'novo',
  distance_km numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX orders_created_at_idx ON public.orders (created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.restaurant_settings TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stock_items TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.addresses TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO anon, authenticated;
GRANT ALL ON public.restaurant_settings TO service_role;
GRANT ALL ON public.products TO service_role;
GRANT ALL ON public.stock_items TO service_role;
GRANT ALL ON public.customers TO service_role;
GRANT ALL ON public.addresses TO service_role;
GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "demo open access" ON public.restaurant_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "demo open access" ON public.products FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "demo open access" ON public.stock_items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "demo open access" ON public.customers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "demo open access" ON public.addresses FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "demo open access" ON public.orders FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO public.restaurant_settings (id, name, tagline, address, phone, opening_hours, open_from, open_to, pix_key, delivery_fee_per_block, delivery_block_km)
VALUES (1, 'Restaurante Sabor da Casa', 'Peça sua refeição de forma rápida e fácil.', 'Rua das Palmeiras, 320 — Boa Viagem, Recife/PE', '(81) 3333-1020', 'Todos os dias, 07:00 às 23:00', 7, 23, 'pagamentos@sabordacasa.com.br', 2, 2);

INSERT INTO public.products (id, name, description, ingredients, price, category, rating, available, sales, promo, addons) VALUES
('p1','X-Burger Especial','Hambúrguer artesanal, queijo, alface, tomate e molho especial.','{"Pão brioche","Blend 180g","Queijo prato","Alface","Tomate"}',18.90,'lanches',4.9,true,128,true,'[{"id":"a1","name":"Queijo extra","price":3},{"id":"a2","name":"Bacon","price":4.5},{"id":"a3","name":"Molho especial","price":2}]'),
('p2','X-Bacon Duplo','Dois blends, bacon crocante, cheddar e cebola caramelizada.','{"Pão brioche","2 blends 150g","Bacon","Cheddar"}',26.50,'lanches',4.8,true,96,false,'[{"id":"a1","name":"Queijo extra","price":3},{"id":"a2","name":"Bacon","price":4.5},{"id":"a3","name":"Molho especial","price":2}]'),
('p3','Coxinha da Casa','Coxinha de frango com catupiry, massa leve e crocante.','{"Frango desfiado","Catupiry","Massa de batata"}',7.50,'lanches',4.7,true,142,true,'[{"id":"a1","name":"Queijo extra","price":3},{"id":"a2","name":"Bacon","price":4.5},{"id":"a3","name":"Molho especial","price":2}]'),
('p4','Pastel de Carne','Pastel frito na hora com recheio generoso de carne temperada.','{"Massa de pastel","Carne moída","Temperos"}',9.90,'lanches',4.5,true,78,false,'[{"id":"a1","name":"Queijo extra","price":3},{"id":"a2","name":"Bacon","price":4.5},{"id":"a3","name":"Molho especial","price":2}]'),
('p5','Tapioca de Queijo Coalho','Tapioca fresquinha com queijo coalho e manteiga de garrafa.','{"Goma de tapioca","Queijo coalho"}',12.90,'cafe-da-manha',4.6,true,64,false,'[{"id":"a1","name":"Queijo extra","price":3},{"id":"a2","name":"Bacon","price":4.5},{"id":"a3","name":"Molho especial","price":2}]'),
('p6','Cuscuz Nordestino','Cuscuz com ovos mexidos, queijo e manteiga.','{"Cuscuz de milho","Ovos","Queijo"}',14.50,'cafe-da-manha',4.7,true,88,false,'[{"id":"a1","name":"Queijo extra","price":3},{"id":"a2","name":"Bacon","price":4.5},{"id":"a3","name":"Molho especial","price":2}]'),
('p7','Pão na Chapa com Café','Pão francês na chapa acompanhado de café coado.','{"Pão francês","Manteiga","Café"}',9.50,'cafe-da-manha',4.4,true,110,false,'[{"id":"a1","name":"Queijo extra","price":3},{"id":"a2","name":"Bacon","price":4.5},{"id":"a3","name":"Molho especial","price":2}]'),
('p8','Misto Quente','Pão de forma, presunto e queijo derretido na chapa.','{"Pão de forma","Presunto","Queijo"}',10.90,'cafe-da-manha',4.3,true,52,false,'[{"id":"a1","name":"Queijo extra","price":3},{"id":"a2","name":"Bacon","price":4.5},{"id":"a3","name":"Molho especial","price":2}]'),
('p9','Prato Executivo de Frango','Filé de frango grelhado, arroz, feijão, salada e farofa.','{"Filé de frango","Arroz","Feijão","Salada"}',27.90,'almoco',4.8,true,156,true,'[{"id":"a1","name":"Queijo extra","price":3},{"id":"a2","name":"Bacon","price":4.5},{"id":"a3","name":"Molho especial","price":2}]'),
('p10','Feijoada Completa','Feijoada tradicional com arroz, couve, laranja e torresmo.','{"Feijão preto","Carnes suínas","Couve","Arroz"}',38.90,'almoco',4.9,true,74,false,'[{"id":"a1","name":"Queijo extra","price":3},{"id":"a2","name":"Bacon","price":4.5},{"id":"a3","name":"Molho especial","price":2}]'),
('p11','Filé à Parmegiana','Filé empanado com molho de tomate, queijo gratinado e arroz.','{"Filé bovino","Molho de tomate","Queijo","Arroz"}',42.50,'almoco',4.8,true,68,false,'[{"id":"a1","name":"Queijo extra","price":3},{"id":"a2","name":"Bacon","price":4.5},{"id":"a3","name":"Molho especial","price":2}]'),
('p12','Baião de Dois','Arroz com feijão de corda, queijo coalho e carne de sol.','{"Arroz","Feijão de corda","Carne de sol","Queijo coalho"}',34.90,'almoco',4.7,true,91,false,'[{"id":"a1","name":"Queijo extra","price":3},{"id":"a2","name":"Bacon","price":4.5},{"id":"a3","name":"Molho especial","price":2}]'),
('p13','Escondidinho de Carne de Sol','Purê de macaxeira gratinado com carne de sol desfiada.','{"Macaxeira","Carne de sol","Queijo"}',32.90,'jantar',4.9,true,83,false,'[{"id":"a1","name":"Queijo extra","price":3},{"id":"a2","name":"Bacon","price":4.5},{"id":"a3","name":"Molho especial","price":2}]'),
('p14','Risoto de Camarão','Risoto cremoso com camarões salteados e alho-poró.','{"Arroz arbóreo","Camarão","Creme de leite"}',49.90,'jantar',4.8,true,41,false,'[{"id":"a1","name":"Queijo extra","price":3},{"id":"a2","name":"Bacon","price":4.5},{"id":"a3","name":"Molho especial","price":2}]'),
('p15','Espaguete ao Sugo','Massa fresca com molho de tomate rústico e manjericão.','{"Massa fresca","Tomate","Manjericão"}',28.50,'jantar',4.5,false,57,false,'[{"id":"a1","name":"Queijo extra","price":3},{"id":"a2","name":"Bacon","price":4.5},{"id":"a3","name":"Molho especial","price":2}]'),
('p16','Coca-Cola 350ml','Refrigerante lata bem gelado.','{"Refrigerante"}',6.50,'bebidas',4.6,true,210,false,'[{"id":"a4","name":"Gelo e limão","price":1},{"id":"a5","name":"Copo 500ml","price":2.5}]'),
('p17','Suco de Caju 500ml','Suco natural de caju feito na hora.','{"Polpa de caju","Água","Açúcar"}',9.90,'bebidas',4.7,true,132,false,'[{"id":"a4","name":"Gelo e limão","price":1},{"id":"a5","name":"Copo 500ml","price":2.5}]'),
('p18','Água Mineral 500ml','Água mineral sem gás.','{"Água mineral"}',4.00,'bebidas',4.4,false,98,false,'[{"id":"a4","name":"Gelo e limão","price":1},{"id":"a5","name":"Copo 500ml","price":2.5}]'),
('p19','Pudim de Leite','Pudim cremoso de leite condensado com calda de caramelo.','{"Leite condensado","Ovos","Caramelo"}',11.90,'sobremesas',4.9,true,86,true,'[{"id":"a1","name":"Queijo extra","price":3},{"id":"a2","name":"Bacon","price":4.5},{"id":"a3","name":"Molho especial","price":2}]'),
('p20','Bolo de Rolo Fatia','Fatia de bolo de rolo pernambucano com goiabada.','{"Massa fina","Goiabada"}',10.50,'sobremesas',4.8,true,63,false,'[{"id":"a1","name":"Queijo extra","price":3},{"id":"a2","name":"Bacon","price":4.5},{"id":"a3","name":"Molho especial","price":2}]');

INSERT INTO public.stock_items (id, name, category, quantity, min_quantity, unit) VALUES
('s1','Pão brioche','Padaria',120,40,'un'),
('s2','Blend bovino 150g','Carnes',68,30,'un'),
('s3','Bacon em fatias','Carnes',12,15,'kg'),
('s4','Queijo prato','Frios',9,10,'kg'),
('s5','Queijo coalho','Frios',22,8,'kg'),
('s6','Frango desfiado','Carnes',34,12,'kg'),
('s7','Carne de sol','Carnes',0,10,'kg'),
('s8','Goma de tapioca','Secos',25,10,'kg'),
('s9','Cuscuz de milho','Secos',40,15,'kg'),
('s10','Arroz','Secos',90,30,'kg'),
('s11','Feijão preto','Secos',6,15,'kg'),
('s12','Camarão limpo','Frutos do mar',0,6,'kg'),
('s13','Coca-Cola 350ml','Bebidas',144,48,'un'),
('s14','Polpa de caju','Bebidas',18,20,'kg'),
('s15','Leite condensado','Sobremesas',0,12,'un');

INSERT INTO public.customers (id, name, phone, email, avatar, district, address, cep, city, created_at) VALUES
('c1','João Silva','(81) 99999-1234','joao.silva@email.com','https://api.dicebear.com/9.x/initials/svg?seed=Jo%C3%A3o%20Silva','Boa Viagem','Rua Exemplo, 100','51000-000','Recife','2026-02-05'),
('c2','Maria Souza','(81) 98888-2201','maria.souza@email.com','https://api.dicebear.com/9.x/initials/svg?seed=Maria%20Souza','Pina','Av. Central, 450','51001-001','Recife','2026-03-06'),
('c3','Carlos Pereira','(81) 97777-3312','carlos.pereira@email.com','https://api.dicebear.com/9.x/initials/svg?seed=Carlos%20Pereira','Imbiribeira','Rua das Acácias, 78','51002-002','Recife','2026-04-07'),
('c4','Ana Beatriz','(81) 96666-4423','ana.beatriz@email.com','https://api.dicebear.com/9.x/initials/svg?seed=Ana%20Beatriz','Setúbal','Rua do Sol, 12','51003-003','Recife','2026-05-08'),
('c5','Pedro Henrique','(81) 95555-5534','pedro.henrique@email.com','https://api.dicebear.com/9.x/initials/svg?seed=Pedro%20Henrique','Espinheiro','Rua Verde, 340','51004-004','Recife','2026-06-09'),
('c6','Juliana Lima','(81) 94444-6645','juliana.lima@email.com','https://api.dicebear.com/9.x/initials/svg?seed=Juliana%20Lima','Graças','Av. Rosa e Silva, 900','51005-005','Recife','2026-07-10'),
('c7','Rafael Costa','(81) 93333-7756','rafael.costa@email.com','https://api.dicebear.com/9.x/initials/svg?seed=Rafael%20Costa','Boa Viagem','Rua Ribeiro de Brito, 55','51006-006','Recife','2026-08-11'),
('c8','Fernanda Alves','(81) 92222-8867','fernanda.alves@email.com','https://api.dicebear.com/9.x/initials/svg?seed=Fernanda%20Alves','Pina','Rua Antônio Falcão, 210','51007-007','Recife','2026-09-12'),
('c9','Lucas Martins','(81) 91111-9978','lucas.martins@email.com','https://api.dicebear.com/9.x/initials/svg?seed=Lucas%20Martins','Torre','Rua Real da Torre, 620','51008-008','Recife','2026-10-13'),
('c10','Camila Rocha','(81) 90000-1089','camila.rocha@email.com','https://api.dicebear.com/9.x/initials/svg?seed=Camila%20Rocha','Casa Forte','Rua Fernandes Vieira, 88','51009-009','Recife','2026-11-14');

INSERT INTO public.addresses (customer_id, label, cep, street, number, complement, district, city, state, reference, is_primary, distance_km) VALUES
('c5','Casa','51020-000','Rua Exemplo','100','Apto 402','Boa Viagem','Recife','PE','Próximo à praça',true,4.3),
('c5','Trabalho','51110-220','Av. Central','450','Sala 12','Pina','Recife','PE','Prédio azul',false,7.1);

DO $$
DECLARE
  i integer;
  cust record;
  prod record;
  j integer;
  item_count integer;
  items jsonb;
  qty integer;
  sub numeric(10,2);
  dist numeric(10,2);
  fee numeric(10,2);
  created timestamptz;
  days_ago integer;
  st text;
  pay text;
  statuses text[] := ARRAY['novo','preparacao','entrega','entregue','entregue','cancelado'];
  payments text[] := ARRAY['pix','pix','dinheiro','cartao'];
BEGIN
  FOR i IN 0..29 LOOP
    SELECT * INTO cust FROM public.customers ORDER BY id OFFSET ((i * 7919 + 13) % 10) LIMIT 1;
    days_ago := i / 2;
    created := (date_trunc('day', now()) - (days_ago || ' days')::interval)
               + ((10 + ((i * 7919 + 13) % 12)) || ' hours')::interval
               + (((i * 3 * 7919 + 13) % 60) || ' minutes')::interval;
    item_count := 1 + ((i * 7919 + 13) % 3);
    items := '[]'::jsonb;
    sub := 0;
    FOR j IN 0..(item_count - 1) LOOP
      SELECT * INTO prod FROM public.products ORDER BY length(id), id OFFSET (((i * 5 + j * 3) * 7919 + 13) % 20) LIMIT 1;
      qty := 1 + (((i + j) * 7919 + 13) % 2);
      items := items || jsonb_build_array(jsonb_build_object(
        'productId', prod.id, 'name', prod.name, 'quantity', qty, 'price', prod.price));
      sub := sub + prod.price * qty;
    END LOOP;
    dist := round((1.5 + ((i * 7919 + 13) % 70) / 10.0)::numeric, 1);
    fee := ceil(dist / 2) * 2;
    IF days_ago = 0 THEN
      st := statuses[1 + ((i * 7919 + 13) % 4)];
    ELSE
      st := statuses[4 + ((i * 7919 + 13) % 3)];
    END IF;
    pay := payments[1 + ((i * 7919 + 13) % 4)];
    INSERT INTO public.orders (code, customer_id, customer_name, customer_phone, address, district, items, subtotal, delivery_fee, total, payment, paid, status, distance_km, created_at)
    VALUES (
      'PED-' || to_char(created, 'YYYYMMDD') || '-' || lpad((18 + i)::text, 4, '0'),
      cust.id, cust.name, cust.phone, cust.address || ' — ' || cust.district, cust.district,
      items, sub, fee, sub + fee, pay,
      (pay <> 'dinheiro' AND st <> 'cancelado'), st, dist, created
    );
  END LOOP;
END $$;
