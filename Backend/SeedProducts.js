import mongoose from "mongoose";
import Product from "./models/Product.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { syncSeedFilesFromDb } from "./utils/seedSync.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from Backend folder or root
dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config();

// 1. Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ Error: MONGO_URI is not defined in .env file!");
  process.exit(1);
}

// 2. Define products array (67 default products)
export const products = [
  // 1. Millet (5 products)
  {"name":"Kambu (Bajra) Flour 500g","category":"Millet","price":40,"mrp":55,"description":"Nutritious pearl millet flour.\nRich in iron and fiber.","image":"https://res.cloudinary.com/dbuyr00w6/image/upload/v1760268062/bajra-flour_ngkfkc.png","slug":"kambu-bajra-flour-500g","stock":50,"lowStockThreshold":10,"inStock":true},
  {"name":"Millet Puttu Podi 250g","category":"Millet","price":55,"mrp":75,"description":"Specialty millet puttu mix.\nAuthentic taste.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790241094/sowmiyafoods/kwmpwirw7fcagtjyxfrd.jpg","slug":"millet-puttu-podi-250g","stock":50,"lowStockThreshold":10,"inStock":true},
  {"name":"Millet Idly Dosa Mix 500g","category":"Millet","price":65,"mrp":85,"description":"Healthy multi-millet dosa mix.\nEasy to prepare.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790241146/sowmiyafoods/egrg9uu3moxyi72jg0eb.jpg","slug":"millet-idly-dosa-mix-500g","stock":50,"lowStockThreshold":10,"inStock":true},
  {"name":"Sivappu Kavuni Puttu Flour – 250g","category":"Millet","price":92,"mrp":100,"description":"Enjoy the traditional taste and rich character of Sivappu Kavuni Puttu with Ramar Sivappu Kavuni Puttu Flour. Made from traditional red kavuni rice, this flour is specially prepared for making soft, flavorful and authentic South Indian puttu at home.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790246403/sowmiyafoods/bw9bbkwt83fwafg29yaz.jpg","slug":"sivappu-kavuni-puttu-flour-250g","stock":250,"lowStockThreshold":10,"inStock":true},
  {"name":"Millet Puttu Podi – 250g","category":"Millet","price":56,"mrp":65,"description":"Ramar Millet Puttu Podi is a traditional South Indian puttu mix made for preparing soft, wholesome and flavourful puttu at home. The millet-based flour offers a convenient way to enjoy a traditional steamed breakfast with an authentic taste and texture.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790257908/sowmiyafoods/zzvm9thcn1v44xn7ms11.jpg","slug":"millet-puttu-podi-250g-1","stock":25,"lowStockThreshold":10,"inStock":true},

  // 2. Instant Products (11 products)
  {"name":"Instant Parotta 200g","category":"Instant Products","price":30,"mrp":45,"description":"Ready-to-cook parotta.\nSoft and fluffy every time.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790241290/sowmiyafoods/ymuowqhmn4wdjhb54rd8.jpg","slug":"instant-parotta-200g","stock":50,"lowStockThreshold":10,"inStock":true},
  {"name":"Adai Dosa Mix 500g","category":"Instant Products","price":85,"mrp":110,"description":"Quick adai dosa mix.\nEasy and protein-packed meals.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790226985/sowmiyafoods/ixe7a74wlx5p0k6fnjn6.png","slug":"adai-dosa-mix-500g","stock":500,"lowStockThreshold":10,"inStock":true},
  {"name":"Ramar Adai Dosa Flour - 500g","category":"Instant Products","price":85,"mrp":105,"description":"Ramar Adai Dosa Flour is a convenient traditional South Indian breakfast mix prepared with rice, chana dhal, urad dhal, spices and seasonings. It makes it easy to prepare flavourful, crispy and wholesome adai dosa at home with minimal preparation.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790247037/sowmiyafoods/efs70nk7tfoxxhfeqjwc.jpg","slug":"ramar-adai-dosa-flour-500g","stock":25,"lowStockThreshold":10,"inStock":true},
  {"name":"Murukku Flour 500g","category":"Instant Products","price":60,"mrp":85,"description":"Special murukku flour.\nCrunchy and delicious.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790227641/sowmiyafoods/ncltgttpvj0anfjmcnoe.jpg","slug":"murukku-flour-500g","stock":50,"lowStockThreshold":10,"inStock":true},
  {"name":"Idiappa Flour 500g","category":"Instant Products","price":50,"mrp":70,"description":"Authentic idiappa flour.\nPerfect for soft traditional dishes.","image":"https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266660/WhatsApp_Image_2025-10-11_at_18.54.23_9b813d28_vdt6gm.jpg","slug":"idiappa-flour-500g","stock":50,"lowStockThreshold":10,"inStock":true},
  {"name":"Bajji Flour 200g","category":"Instant Products","price":30,"mrp":45,"description":"Special bajji flour blend.\nPerfect for deep-fried evening snacks.","image":"https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266659/WhatsApp_Image_2025-10-11_at_18.54.22_39290d95_uqyz0z.jpg","slug":"bajji-flour-200g","stock":50,"lowStockThreshold":10,"inStock":true},
  {"name":"Puliyotharai Mix 100g","category":"Instant Products","price":30,"mrp":30,"description":"Traditional authentic temple-style puliyotharai mix.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790240775/sowmiyafoods/jkt1box6mkf8qs0nhhhl.jpg","slug":"puliyotharai-mix-100g","stock":50,"lowStockThreshold":10,"inStock":true},
  {"name":"Ulundhankali Mix 250g","category":"Instant Products","price":56,"mrp":65,"description":"Nutritious roasted black gram mix for kali.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790240945/sowmiyafoods/maoi1oedhaw0icll3dcb.jpg","slug":"ulundhankali-mix-250g","stock":50,"lowStockThreshold":10,"inStock":true},
  {"name":"Idli Podi 100g","category":"Instant Products","price":35,"mrp":41,"description":"Flavorful spicy gun powder for idlis and dosas.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790240818/sowmiyafoods/niackpov8jlb1159in1l.jpg","slug":"idli-podi-100g","stock":50,"lowStockThreshold":10,"inStock":true},
  {"name":"Ellu Idli Podi 100g","category":"Instant Products","price":43,"mrp":47,"description":"Traditional sesame seed gunpowder.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790240861/sowmiyafoods/qgfqpb5jaay9ckumu5ya.jpg","slug":"ellu-idli-podi-100g","stock":50,"lowStockThreshold":10,"inStock":true},
  {"name":"Puliyotharai Mix - 200g","category":"Instant Products","price":80,"mrp":100,"description":"Enjoy the authentic taste of traditional South Indian Puliyotharai (Tamarind Rice) with Ramar Puliyotharai Mix. Specially prepared to make flavorful, tangy and aromatic Puliyotharai quickly and conveniently at home.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790312546/sowmiyafoods/yoj8jnq6jxvxf8ywr6lw.jpg","slug":"puliyotharai-mix-200g-pack","stock":200,"lowStockThreshold":10,"inStock":true},

  // 3. Noodles (5 products)
  {"name":"Noodles – 100g","category":"Noodles","price":14,"mrp":20,"description":"Classic Ramar instant noodles.\nQuick and tasty snack.","image":"https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272313/noodles_ryybot.png","slug":"noodles-100g","stock":50,"lowStockThreshold":10,"inStock":true},
  {"name":"Noodles – 200g","category":"Noodles","price":28,"mrp":40,"description":"Family pack Ramar noodles.\nQuick and tasty meal.","image":"https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272313/noodles_ryybot.png","slug":"noodles-200g","stock":50,"lowStockThreshold":10,"inStock":true},
  {"name":"Millet Noodles 200g","category":"Noodles","price":55,"mrp":75,"description":"Healthy finger millet noodles.\nNutritious comfort food.","image":"https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272312/millet-noodles_d2kyyw.png","slug":"millet-noodles-200g","stock":50,"lowStockThreshold":10,"inStock":true},
  {"name":"Ramar Soft & Tasty Noodles – 1kg","category":"Noodles","price":115,"mrp":130,"description":"Enjoy the soft, delicious and satisfying taste of Ramar Soft & Tasty Noodles. Made for easy everyday cooking, these noodles have a smooth texture and are perfect for preparing quick and flavorful noodle dishes at home.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790241410/sowmiyafoods/tx6zesldkw3yjweasscx.jpg","slug":"ramar-soft-tasty-noodles-1kg","stock":250,"lowStockThreshold":10,"inStock":true},
  {"name":"Ramar Raaman Noodles – 1kg","category":"Noodles","price":115,"mrp":130,"description":"Enjoy delicious, quick and easy-to-cook Ramar Raaman Noodles, specially made for convenient everyday meals. With a smooth texture and classic noodle taste, they are perfect for preparing flavorful noodle dishes at home. Add your favourite vegetables, sauces and seasonings for a tasty meal in minutes.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790241481/sowmiyafoods/ke5wqhxhimt7471ngcdg.jpg","slug":"ramar-raaman-noodles-1kg","stock":250,"lowStockThreshold":10,"inStock":true},

  // 4. Semiya (3 products)
  {"name":"Regular Semiya – 200g","category":"Semiya","price":25,"mrp":35,"description":"Soft and healthy vermicelli.\nPerfect for quick breakfast meals.","image":"https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272316/vermicelli_oekzvx.png","slug":"regular-semiya-200g","stock":50,"lowStockThreshold":10,"inStock":true},
  {"name":"Semia – 500g","category":"Semiya","price":58,"mrp":80,"description":"Roasted long vermicelli.\nIdeal for savory upma and sweet payasam.","image":"https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272316/vermicelli_oekzvx.png","slug":"semia-500g","stock":50,"lowStockThreshold":10,"inStock":true},
  {"name":"Ragi Semiya – 200g","category":"Semiya","price":32,"mrp":45,"description":"Rich in fiber and nutrients.\nIdeal for wholesome healthy eating.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790227462/sowmiyafoods/axoe7hpewc3t3luqnvfc.jpg","slug":"ragi-semiya-200g","stock":50,"lowStockThreshold":10,"inStock":true},

  // 5. Flour Items (13 products)
  {"name":"Ragi Flour 500g","category":"Flour Items","price":35,"mrp":50,"description":"Nutritious finger millet flour.\nGreat for healthy recipes.","image":"https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272312/ragi-flour_mi8rqx.png","slug":"ragi-flour-500g","stock":50,"lowStockThreshold":10,"inStock":true},
  {"name":"Chakki Atta 500g","category":"Flour Items","price":32,"mrp":45,"description":"Freshly ground 100% whole wheat atta.\nSoft and healthy rotis.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790227488/sowmiyafoods/tzgnd6ncrstze8gkgkuj.jpg","slug":"chakki-atta-500g","stock":50,"lowStockThreshold":10,"inStock":true},
  {"name":"Chakki Atta 5kg","category":"Flour Items","price":270,"mrp":350,"description":"Freshly ground whole wheat atta bulk pack.","image":"https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266660/WhatsApp_Image_2025-10-11_at_18.54.22_f8b79ba1_jzvxuq.jpg","slug":"chakki-atta-5kg","stock":50,"lowStockThreshold":10,"inStock":true},
  {"name":"Rice Flour 250g","category":"Flour Items","price":16,"mrp":25,"description":"Pure rice flour.\nGreat for idiappam, dosa and sweets.","image":"https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272316/rice-flour_cj7msm.png","slug":"rice-flour-250g","stock":50,"lowStockThreshold":10,"inStock":true},
  {"name":"Rice Flour 500g","category":"Flour Items","price":30,"mrp":45,"description":"Pure rice flour.\nGreat for idiappam, dosa and sweets.","image":"https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272316/rice-flour_cj7msm.png","slug":"rice-flour-500g","stock":50,"lowStockThreshold":10,"inStock":true},
  {"name":"Gram Flour 250g","category":"Flour Items","price":33,"mrp":45,"description":"High-quality gram flour.\nGreat for snacks and sweets.","image":"https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272311/gram-flour_yyeeec.png","slug":"gram-flour-250g","stock":50,"lowStockThreshold":10,"inStock":true},
  {"name":"Gram Flour 500g","category":"Flour Items","price":60,"mrp":85,"description":"High-quality gram flour.\nGreat for snacks and sweets.","image":"https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272311/gram-flour_yyeeec.png","slug":"gram-flour-500g","stock":50,"lowStockThreshold":10,"inStock":true},
  {"name":"Chakki Fresh Atta – 1kg","category":"Flour Items","price":65,"mrp":70,"description":"Enjoy the fine texture and delicious taste of Ramar Chakki Fresh Atta, made from quality wheat and ideal for preparing soft, tasty rotis and chapatis. A convenient 1kg pack for everyday family cooking.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790246096/sowmiyafoods/nzush9wtpicrpfci04fq.jpg","slug":"chakki-fresh-atta-1kg","stock":250,"lowStockThreshold":10,"inStock":true},
  {"name":"Corn Flour – Small Pack","category":"Flour Items","price":5,"mrp":5,"description":"Ramar Corn Flour is a fine-quality maize starch that helps add smoothness and crispiness to everyday dishes. This convenient small pack is ideal for home cooking and preparing soups, sauces, gravies and crispy snacks.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790247145/sowmiyafoods/d0e5puf4qr9htrwllzcy.jpg","slug":"corn-flour-small-pack","stock":252,"lowStockThreshold":10,"inStock":true},
  {"name":"Corn Flour – ₹10 Pack","category":"Flour Items","price":10,"mrp":10,"description":"Ramar Corn Flour is a fine-quality maize starch that helps add smoothness and crispiness to everyday dishes. This convenient small pack is ideal for home cooking and preparing soups, sauces, gravies and crispy snacks.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790247264/sowmiyafoods/d74jhexrxyr3eiiv4tv3.jpg","slug":"corn-flour-10-pack","stock":250,"lowStockThreshold":10,"inStock":true},
  {"name":"Corn Flour – 500g","category":"Flour Items","price":44,"mrp":50,"description":"Ramar Corn Flour is a versatile kitchen essential made from maize starch. It helps create smooth gravies, thick sauces and crispy fried dishes, making it suitable for a wide range of everyday recipes.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790247329/sowmiyafoods/itzkgsx91mnisnxnj5zc.jpg","slug":"corn-flour-500g","stock":25,"lowStockThreshold":10,"inStock":true},
  {"name":"Corn Flour – 1kg","category":"Flour Items","price":76,"mrp":90,"description":"Ramar Corn Flour is a versatile kitchen essential made from maize starch. It helps create smooth gravies, thick sauces and crispy fried dishes, making it suitable for a wide range of everyday recipes.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790247602/sowmiyafoods/m1j9tp835yfbw5oomf1m.jpg","slug":"corn-flour-1kg","stock":250,"lowStockThreshold":10,"inStock":true},
  {"name":"Ramar Kozhukattai Flour – 500g","category":"Flour Items","price":92,"mrp":100,"description":"Ramar Kozhukattai Flour is a convenient flour specially prepared for making traditional South Indian kozhukattai. It can be used to prepare soft, smooth and delicious steamed kozhukattai with your choice of sweet or savoury filling. A convenient option for preparing authentic traditional dishes at home.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790257585/sowmiyafoods/a05izrqkdhpwwbimcpdw.jpg","slug":"ramar-kozhukattai-flour-500g","stock":25,"lowStockThreshold":10,"inStock":true},

  // 6. Rava Sooji (4 products)
  {"name":"Broken Samba Wheat 500g","category":"Rava Sooji","price":65,"mrp":85,"description":"Premium broken samba wheat.\nHealthy and nutritious.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790246615/sowmiyafoods/y4mhrlxpywbltvykgmka.jpg","slug":"broken-samba-wheat-500g","stock":50,"lowStockThreshold":10,"inStock":true},
  {"name":"Roasted Sooji 250g","category":"Rava Sooji","price":20,"mrp":30,"description":"Premium roasted sooji.\nIdeal for idli, upma and kesari.","image":"https://res.cloudinary.com/dbuyr00w6/image/upload/v1760276417/rava-org_yvgm7r.png","slug":"roasted-sooji-250g","stock":50,"lowStockThreshold":10,"inStock":true},
  {"name":"Roasted Sooji 500g","category":"Rava Sooji","price":36,"mrp":50,"description":"Premium roasted sooji.\nIdeal for idli, upma and kesari.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790245914/sowmiyafoods/zv4xfp2u17fodktgwuta.png","slug":"roasted-sooji-500g","stock":50,"lowStockThreshold":10,"inStock":true},
  {"name":"Roasted Sooji 1kg","category":"Rava Sooji","price":71,"mrp":95,"description":"Premium roasted sooji value pack.","image":"https://res.cloudinary.com/dbuyr00w6/image/upload/v1760276417/rava-org_yvgm7r.png","slug":"roasted-sooji-1kg","stock":50,"lowStockThreshold":10,"inStock":true},

  // 7. Pickles (10 products)
  {"name":"Sweet Mango Pickle - 200g","category":"Pickles","price":75,"mrp":100,"description":"Spicy and tangy cut mango pickle in glass bottle.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790227758/sowmiyafoods/srahc7pdbefphziklv7p.jpg","slug":"sweet-mango-pickle-200g","stock":50,"lowStockThreshold":10,"inStock":true},
  {"name":"Lemon Pickle – 200g","category":"Pickles","price":70,"mrp":95,"description":"Authentic lemon pickle in glass jar.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790227819/sowmiyafoods/rbakqulhaxduxpl4fbgx.jpg","slug":"lemon-pickle-200g","stock":50,"lowStockThreshold":10,"inStock":true},
  {"name":"Sweet Mango Pickle (Pack)","category":"Pickles","price":30,"mrp":60,"description":"Authentic mango pickle in pouch pack.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790227886/sowmiyafoods/dqmzo3fdlf4ej5gs5xut.jpg","slug":"sweet-mango-pickle-pack","stock":50,"lowStockThreshold":10,"inStock":true},
  {"name":"Lemon Pickle – (Pack)","category":"Pickles","price":30,"mrp":30,"description":"Enjoy the zesty and tangy taste of traditional Lemon Pickle, made with flavorful lemons and aromatic Indian spices. Its refreshing sourness and balanced spice make it a delicious accompaniment to everyday South Indian meals.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790241644/sowmiyafoods/b81nmneoocgkb7w3avyp.jpg","slug":"lemon-pickle-pack","stock":25,"lowStockThreshold":10,"inStock":true},
  {"name":"Citron Pickle – (Pack)","category":"Pickles","price":30,"mrp":30,"description":"Experience the tangy, refreshing taste of traditional Citron Pickle, made with carefully selected citron and authentic Indian spices. Its perfect balance of tanginess, spice, and traditional flavours makes it a delicious companion for everyday meals.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790241716/sowmiyafoods/f9jrd864gef6qdqquifm.jpg","slug":"citron-pickle-pack","stock":25,"lowStockThreshold":10,"inStock":true},
  {"name":"Cut Mango Pickle –  (Pack)","category":"Pickles","price":30,"mrp":30,"description":"Enjoy the classic taste of traditional Cut Mango Pickle, made with flavorful raw mango pieces and a delicious blend of aromatic Indian spices. The perfect combination of tangy mango and spicy seasoning makes it an irresistible accompaniment for everyday meals.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790241961/sowmiyafoods/okyiop4f6swtzqw6dieu.jpg","slug":"cut-mango-pickle-pack","stock":25,"lowStockThreshold":10,"inStock":true},
  {"name":"Citron Pickle – 200g","category":"Pickles","price":70,"mrp":90,"description":"Experience the tangy, refreshing taste of traditional Citron Pickle, made with carefully selected citron and authentic Indian spices. Its perfect balance of tanginess, spice, and traditional flavours makes it a delicious companion for everyday meals.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790242060/sowmiyafoods/xmxviyozkriniilbeonx.jpg","slug":"citron-pickle-200g","stock":250,"lowStockThreshold":10,"inStock":true},
  {"name":"Cut Mango Pickle – 200g","category":"Pickles","price":65,"mrp":85,"description":"Enjoy the classic taste of traditional Cut Mango Pickle, made with flavorful raw mango pieces and a delicious blend of aromatic Indian spices. The perfect combination of tangy mango and spicy seasoning makes it an irresistible accompaniment for everyday meals.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790242133/sowmiyafoods/b4hbe0zos6h1xn5esh2v.jpg","slug":"cut-mango-pickle-200g","stock":250,"lowStockThreshold":10,"inStock":true},
  {"name":"Garlic Pickle –  (Pack)","category":"Pickles","price":30,"mrp":30,"description":"Enjoy the bold and flavorful taste of traditional Garlic Pickle, made with garlic and a delicious blend of aromatic Indian spices. Its rich garlic flavour, tangy notes, and spicy seasoning make it a perfect accompaniment for everyday meals.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790242208/sowmiyafoods/oorzigurn7svupxmhzkl.jpg","slug":"garlic-pickle-pack","stock":250,"lowStockThreshold":10,"inStock":true},
  {"name":"Garlic Pickle – 200g","category":"Pickles","price":90,"mrp":110,"description":"Enjoy the bold and flavorful taste of traditional Garlic Pickle, made with garlic and a delicious blend of aromatic Indian spices. Its rich garlic flavour, tangy notes, and spicy seasoning make it a perfect accompaniment for everyday meals.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790242296/sowmiyafoods/gztvpx5gcchx9zlmey3j.jpg","slug":"garlic-pickle-200g","stock":25,"lowStockThreshold":10,"inStock":true},

  // 8. Thokku (6 products)
  {"name":"Tomato Thokku - 200g","category":"Thokku","price":85,"mrp":110,"description":"Tangy country tomato thokku in glass bottle.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790227917/sowmiyafoods/kjynaa1nt3qutbzibstc.jpg","slug":"tomato-thokku-200g","stock":50,"lowStockThreshold":10,"inStock":true},
  {"name":"Garlic Thokku – 200g","category":"Thokku","price":95,"mrp":125,"description":"Aromatic spiced garlic thokku in glass jar.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790240594/sowmiyafoods/bpj1xjktv6plr0wfpnkk.jpg","slug":"garlic-thokku-200g","stock":50,"lowStockThreshold":10,"inStock":true},
  {"name":"Tomato Thokku (Pack)","category":"Thokku","price":30,"mrp":30,"description":"Simmered tomato thokku in fresh stay-pack.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790240651/sowmiyafoods/ovmqsebtcibqrx4tzgso.jpg","slug":"tomato-thokku-pack","stock":50,"lowStockThreshold":10,"inStock":true},
  {"name":"Garlic Thokku (Pack)","category":"Thokku","price":30,"mrp":30,"description":"Spiced garlic thokku in convenient pouch pack.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790240679/sowmiyafoods/cwlhdgyhpkpb9tcvlrat.jpg","slug":"garlic-thokku-pack","stock":50,"lowStockThreshold":10,"inStock":true},
  {"name":"Onion Thokku – 200g","category":"Thokku","price":85,"mrp":105,"description":"Enjoy the delicious taste of traditional Onion Thokku, made with flavorful onions and a carefully balanced blend of aromatic Indian spices. Its rich, mildly spicy and savory flavour makes it a perfect accompaniment for breakfast, lunch and everyday meals.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790245797/sowmiyafoods/ioc8nap7tw1l4sng28vs.jpg","slug":"onion-thokku-200g","stock":250,"lowStockThreshold":10,"inStock":true},
  {"name":"Onion Thokku – (Pack)","category":"Thokku","price":30,"mrp":30,"description":"Enjoy the delicious taste of traditional Onion Thokku, made with flavorful onions and a carefully balanced blend of aromatic Indian spices. Its rich, mildly spicy and savory flavour makes it a perfect accompaniment for breakfast, lunch and everyday meals.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790245834/sowmiyafoods/v15eoe0bizcimxtzz19l.jpg","slug":"onion-thokku-pack","stock":300,"lowStockThreshold":10,"inStock":true},

  // 9. Traditional Mix (4 products)
  {"name":"Vatha Kuzhambu –  (Pack)","category":"Traditional Mix","price":30,"mrp":30,"description":"Enjoy the bold, spicy and tangy taste of traditional Vatha Kuzhambu, prepared with a flavorful blend of aromatic spices and traditional South Indian ingredients. Its rich, deep flavour pairs perfectly with hot steamed rice and a drizzle of sesame oil.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790242472/sowmiyafoods/jm8kzifm4diadxoxl0vw.jpg","slug":"vatha-kuzhambu-pack","stock":250,"lowStockThreshold":10,"inStock":true},
  {"name":"Vatha Kuzhambu – 200g","category":"Traditional Mix","price":80,"mrp":100,"description":"Enjoy the bold, spicy and tangy taste of traditional Vatha Kuzhambu, prepared with a flavorful blend of aromatic spices and traditional South Indian ingredients. Its rich, deep flavour pairs perfectly with hot steamed rice and a drizzle of sesame oil.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790242527/sowmiyafoods/hvusbl5jcbiv9zsuydhj.jpg","slug":"vatha-kuzhambu-200g","stock":250,"lowStockThreshold":10,"inStock":true},
  {"name":"Naatu Marunthu Kuzhambu – (Pack)","category":"Traditional Mix","price":30,"mrp":30,"description":"Enjoy the rich, traditional flavour of Naatu Marunthu Kuzhambu, prepared with a carefully selected blend of traditional spices and ingredients. Its aromatic and flavorful profile brings the authentic taste of homemade South Indian cuisine to your everyday meals.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790242598/sowmiyafoods/lnwzzlnin5jdrxczx4ji.jpg","slug":"naatu-marunthu-kuzhambu-pack","stock":250,"lowStockThreshold":10,"inStock":true},
  {"name":"Naatu Marunthu Kuzhambu – 200g","category":"Traditional Mix","price":120,"mrp":140,"description":"Enjoy the rich, traditional flavour of Naatu Marunthu Kuzhambu, prepared with a carefully selected blend of traditional spices and ingredients. Its aromatic and flavorful profile brings the authentic taste of homemade South Indian cuisine to your everyday meals.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790242659/sowmiyafoods/vbmipehss0byka8jil5v.jpg","slug":"naatu-marunthu-kuzhambu-200g","stock":250,"lowStockThreshold":10,"inStock":true},

  // 10. Appalam (4 products)
  {"name":"Traditional Appalam 100g","category":"Appalam","price":35,"mrp":50,"description":"Crunchy sun-dried urad dal appalam papad.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790240975/sowmiyafoods/tkpk8wfx2lij0vscncul.jpg","slug":"traditional-appalam-100g","stock":50,"lowStockThreshold":10,"inStock":true},
  {"name":"Pepper Appalam 100g","category":"Appalam","price":40,"mrp":55,"description":"Black pepper crushed crispy appalam.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790241001/sowmiyafoods/ncnumfklzxsj9vbx3aa4.jpg","slug":"pepper-appalam-100g","stock":50,"lowStockThreshold":10,"inStock":true},
  {"name":"Jeera Appalam 100g","category":"Appalam","price":40,"mrp":55,"description":"Aromatic cumin-infused crunchy papad.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790241023/sowmiyafoods/r14nwvtyjhwmyoykbvh9.jpg","slug":"jeera-appalam-100g","stock":50,"lowStockThreshold":10,"inStock":true},
  {"name":"Rice Vadam / Appalam 100g","category":"Appalam","price":45,"mrp":60,"description":"Crispy sun-dried South Indian rice vadam.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790241043/sowmiyafoods/mxdpljx1jz2mhcll1usx.jpg","slug":"rice-vadam-appalam-100g","stock":50,"lowStockThreshold":10,"inStock":true},

  // 11. Maida (2 products)
  {"name":"Maida 500g","category":"Maida","price":35,"mrp":50,"description":"Fine maida flour.\nIdeal for baking and cooking.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790227514/sowmiyafoods/oem8p01r7ogjvh0j7gkr.jpg","slug":"maida-500g","stock":50,"lowStockThreshold":10,"inStock":true},
  {"name":"Premium Parotta Maida – 1kg","category":"Maida","price":78,"mrp":90,"description":"Prepare delicious, soft and flaky parottas at home with Ramar Premium Parotta Maida. Made from refined wheat flour, it is specially suited for preparing parotta and other popular Indian recipes that require a smooth, workable dough.","image":"https://res.cloudinary.com/qnbhfeck/image/upload/v1790246285/sowmiyafoods/kks4q2qdrlotkpli5m2f.jpg","slug":"premium-parotta-maida-1kg","stock":250,"lowStockThreshold":10,"inStock":true},

];

// 3. Insert products into DB
export const seedProducts = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected successfully");

    await Product.deleteMany(); // Clear existing products
    console.log("Existing products cleared");

    const inserted = await Product.insertMany(products);
    console.log(`✅ Successfully inserted ${inserted.length} default products!`);

    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("❌ Error seeding products:", error);
    try {
      await mongoose.connection.close();
    } catch (closeErr) {
      // ignore
    }
    process.exit(1);
  }
};

// 4. CLI Execution:
// 'node SeedProducts.js' => seeds products to DB
// 'node SeedProducts.js --sync' => pulls products from DB and updates SeedProducts.js & data/products.json
if (process.argv[1] && process.argv[1].endsWith("SeedProducts.js")) {
  if (process.argv.includes("--sync") || process.argv.includes("-s")) {
    mongoose.connect(MONGO_URI).then(async () => {
      await syncSeedFilesFromDb();
      await mongoose.connection.close();
      console.log("Sync complete!");
    });
  } else {
    seedProducts();
  }
}
