/**
 * Product Sub-Ordering Within Categories
 * Strictly defines and enforces the canonical sub-ordering requested for all categories.
 */

export const getProductSubOrderRank = (category = "", productName = "", price = 0) => {
  const cat = (category || "").toLowerCase().trim();
  const n = (productName || "").toLowerCase().trim();
  const isPack = n.includes("pack") || n.includes("pouch");

  // --- 1. MILLET ---
  if (cat.includes("millet")) {
    // 1. Millet Puttu Podi – 250g 56rs, 2. Millet Puttu Podi – 250g 55rs
    if (n.includes("millet puttu podi") || (n.includes("puttu podi") && n.includes("millet")) || n.includes("puttu podi")) {
      const p = Number(price) || 0;
      if (p === 56 || p > 55) return 1;
      return 2;
    }
    // 3. Sivappu Kavuni Puttu Flour – 250g
    if (n.includes("sivappu kavuni puttu") || (n.includes("kavuni") && n.includes("puttu"))) return 3;
    // 4. Sivappu Idiyappam 250g
    if (n.includes("sivappu idiyappam") || n.includes("sivappu idiappam") || (n.includes("sivappu") && (n.includes("idiyappam") || n.includes("idiappa")))) return 4;
    // 5. Millet Idly Dosa Mix 500g
    if (n.includes("millet idly") || n.includes("millet idli") || (n.includes("idly dosa") && n.includes("millet")) || (n.includes("idli dosa") && n.includes("millet")) || (n.includes("dosa mix") && n.includes("millet"))) return 5;
    // 6. Kambu Maavu
    if (n.includes("kambu maavu") || (n.includes("kambu") && n.includes("maavu")) || (n.includes("kambu") && n.includes("flour"))) return 6;
    // 7. Ragi
    if (n.includes("ragi") && (n.includes("flour") || n.includes("maavu") || (!n.includes("semiya") && !n.includes("vermicelli") && !n.includes("noodle")))) return 7;
    // 8. Ragi Semiya
    if (n.includes("ragi semiya") || n.includes("ragi vermicelli") || (n.includes("ragi") && (n.includes("semiya") || n.includes("vermicelli")))) return 8;
    // 9. Millet Noodles
    if (n.includes("millet noodle") || n.includes("millet noodles")) return 9;
    return 99;
  }

  // --- 2. INSTANT PRODUCTS ---
  if (cat.includes("instant")) {
    if (n.includes("parotta")) return 1;
    if (n.includes("murukku")) return 2;
    if (n.includes("ulundhankali") || n.includes("ulunthankali")) return 3;
    if (n.includes("adai dosa") || n.includes("adai") || (n.includes("dosa") && !n.includes("idli"))) return 4;
    if (n.includes("bajji") || n.includes("bonda")) return 5;
    if (n.includes("idiyappam") || n.includes("idiappam") || n.includes("idiappa")) return 6;
    if (n.includes("venthayam") || n.includes("ventheyam")) return 7;
    if (n.includes("ellu") && (n.includes("idli") || n.includes("podi"))) return 8;
    if ((n.includes("idli podi") || n.includes("idly podi")) && !n.includes("ellu")) return 9;
    if (n.includes("paruppu podi") || n.includes("parupu podi") || n.includes("paruppu") || n.includes("parupu")) return 10;
    if (n.includes("puliyotharai") || n.includes("puliyodharai")) {
      return isPack ? 12 : 11;
    }
    if (n.includes("vatha kuzhambu") || n.includes("vathakuzhambu") || n.includes("vatha")) {
      return isPack ? 14 : 13;
    }
    return 99;
  }

  // --- 3. NOODLES ---
  if (cat.includes("noodle")) {
    if (n.includes("raman") || (n.includes("ramar") && n.includes("noodles") && !n.includes("soft") && !n.includes("regular") && !n.includes("millet"))) return 1;
    if (n.includes("ramar soft") || n.includes("soft")) return 2;
    if ((n.includes("regular") || !n.includes("millet")) && n.includes("100g")) return 3;
    if ((n.includes("regular") || !n.includes("millet")) && (n.includes("200g") || !n.includes("100g"))) return 4;
    if (n.includes("millet noodle") || (n.includes("millet") && n.includes("200g"))) return 5;
    return 99;
  }

  // --- 4. SEMIYA ---
  if (cat.includes("semiya") || cat.includes("vermicelli")) {
    if (n.includes("ragi")) return 1;
    if (n.includes("500g") || n.includes("500 g")) return 3;
    if (n.includes("200g") || n.includes("200 g") || n.includes("regular") || n.includes("semiya")) return 2;
    return 99;
  }

  // --- 5. FLOUR ITEMS ---
  if (cat.includes("flour") && !cat.includes("maida") && !cat.includes("miada")) {
    if (n.includes("gram flour") || n.includes("kadalai") || n.includes("besan")) return 1;
    if (n.includes("rice flour") || n.includes("arisi")) return 2;
    if (/\batta\b|chakki|wheat flour/i.test(n)) return 3;
    if (n.includes("corn flour") || n.includes("corn")) return 4;
    if (n.includes("idayappam") || n.includes("idiyappam") || n.includes("idiappa")) return 5;
    if (n.includes("bajji") || n.includes("bonda")) return 6;
    if (n.includes("ragi")) return 7;
    if (n.includes("kuzhukattai") || n.includes("kozhukattai")) return 8;
    if (n.includes("kambu")) return 9;
    return 99;
  }

  // --- 6. MAIDA / MIADA ---
  if (cat.includes("maida") || cat.includes("miada")) {
    if (n.includes("parotta maida") || (n.includes("maida") && (n.includes("1kg") || n.includes("1 kg") || n.includes("premium")))) return 2;
    if (n.includes("maida") || n.includes("500g") || n.includes("500 g")) return 1;
    return 99;
  }

  // --- 6. RAVA / SOOJI ---
  if (cat.includes("rava") || cat.includes("sooji")) {
    if ((n.includes("samba") || n.includes("broken")) && (n.includes("250g") || n.includes("250 g"))) return 1;
    if ((n.includes("samba") || n.includes("broken")) && (n.includes("500g") || n.includes("500 g"))) return 2;
    if ((n.includes("roasted") || n.includes("sooji") || n.includes("rava")) && (n.includes("250g") || n.includes("250 g"))) return 3;
    if ((n.includes("roasted") || n.includes("sooji") || n.includes("rava")) && (n.includes("500g") || n.includes("500 g"))) return 4;
    if ((n.includes("roasted") || n.includes("sooji") || n.includes("rava")) && (n.includes("1kg") || n.includes("1 kg"))) return 5;
    if (n.includes("samba") || n.includes("broken")) return 1;
    return 99;
  }

  // --- 7. PICKLES ---
  if (cat.includes("pickle")) {
    if (n.includes("lemon") || n.includes("elamichai") || n.includes("lime")) return isPack ? 2 : 1;
    if (n.includes("citron") || n.includes("narthangai")) return isPack ? 4 : 3;
    if (n.includes("sweet mango") || n.includes("sweet maangai")) return isPack ? 6 : 5;
    if (n.includes("cut mango") || (n.includes("mango") && !n.includes("sweet"))) return isPack ? 8 : 7;
    if (n.includes("garlic") || n.includes("poondu")) return isPack ? 10 : 9;
    return 99;
  }

  // --- 8. THOKKU ---
  if (cat.includes("thokku")) {
    if (n.includes("tomato") || n.includes("thakkali")) return isPack ? 2 : 1;
    if (n.includes("garlic") || n.includes("poondu")) return isPack ? 4 : 3;
    if (n.includes("onion") || n.includes("vengayam")) return isPack ? 6 : 5;
    return 99;
  }

  // --- 9. TRADITIONAL MIX ---
  if (cat.includes("traditional") || cat.includes("spices")) {
    if (n.includes("naatu marunthu") || n.includes("marunthu")) return isPack ? 2 : 1;
    if (n.includes("vatha kuzhambu") || n.includes("vathakuzhambu") || n.includes("vatha")) return isPack ? 4 : 3;
    if (n.includes("puliyotharai") || n.includes("puliyodharai")) return isPack ? 6 : 5;
    return 99;
  }

  // --- 10. APPALAM ---
  if (cat.includes("appalam") || cat.includes("puppet") || cat.includes("papad")) {
    if (n.includes("pepper") || n.includes("milagu")) return 2;
    if (n.includes("jeera") || n.includes("seeragam")) return 3;
    if (n.includes("rice") || n.includes("vadam")) return 4;
    if (n.includes("traditional") || n.includes("appalam")) return 1;
    return 99;
  }

  return 99;
};

/**
 * Sort products array according to the canonical sub-ordering
 */
export const sortProductsBySubOrder = (products = [], category = "") => {
  return [...products].sort((a, b) => {
    const catA = category || a.category || "";
    const catB = category || b.category || "";
    const rankA = getProductSubOrderRank(catA, a.name, a.price);
    const rankB = getProductSubOrderRank(catB, b.name, b.price);
    if (rankA !== rankB) return rankA - rankB;
    const priceDiff = (Number(a.price) || 0) - (Number(b.price) || 0);
    if (priceDiff !== 0) return priceDiff;
    return (a.name || "").localeCompare(b.name || "");
  });
};
