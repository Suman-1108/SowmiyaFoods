// Tamil name & slogan mapping utility for products across the application

export const categoryTamilNames = {
  "Millet": "சிறுதானியம்",
  "Instant Products": "உடனடி பொருட்கள்",
  "Noodles": "நூடுல்ஸ்",
  "Semiya": "சேமியா",
  "Flour Items": "மாவு வகைகள்",
  "Maida": "மைதா வகைகள்",
  "Maida Items": "மைதா வகைகள்",
  "Rava Sooji": "ரவை & சூஜி",
  "Pickles": "ஊறுகாய்",
  "Thokku": "தொக்கு",
  "Traditional Mix": "பாரம்பரிய மிக்ஸ்",
  "Appalam": "அப்பளம்",
  "FLOUR": "மாவு வகைகள்",
  "NOODLES": "நூடுல்ஸ்",
  "INSTANT PRODUCTS": "உடனடி பொருட்கள்",
  "RAVA": "ரவை & சூஜி",
  "VERMICELLI": "சேமியா",
  "spices": "பாரம்பரிய மிக்ஸ்",
  "pickles": "ஊறுகாய்",
  "Millet Products": "சிறுதானியம்",
  "Sooji": "ரவை & சூஜி",
  "MILLETS": "சிறுதானியம்",
  "puppet": "அப்பளம்",
};

// Tamil slogan mapping by product name keywords
export const getTamilSlogan = (name = "", category = "") => {
  const lower = (name || "").toLowerCase();
  const lowerCat = (category || "").toLowerCase();

  if (lower.includes("pickle") || lowerCat.includes("pickle")) {
    return "பாரம்பரிய கைவண்ணத்தில் - சுவையான ஊறுகாய்";
  }
  if (lower.includes("thokku") || lowerCat.includes("thokku")) {
    return "நாவில் ஊறும் சுவை - ராமர் ஸ்பெஷல் தொக்கு";
  }
  if (lower.includes("appalam") || lower.includes("papad") || lowerCat.includes("appalam")) {
    return "மொறுமொறுப்பான சுவை - பாரம்பரிய அப்பளம்";
  }
  if (lower.includes("millet") || lower.includes("ragi") || lower.includes("bajra") || lower.includes("kambu") || lowerCat.includes("millet")) {
    return "சத்தான சிறுதானியம் - ஆரோக்கியத்திற்கு நல்லது";
  }
  if (lower.includes("noodles") || lowerCat.includes("noodles")) {
    return "ருசியான நொடிப்பொழுதில் - ராமர் நூடுல்ஸ்";
  }
  if (lower.includes("vermicelli") || lower.includes("semiya") || lowerCat.includes("semiya")) {
    return "மென்மையான சேமியா - சுவையான உணவு";
  }
  if (lower.includes("maida") || lowerCat.includes("maida") || lowerCat.includes("miada")) {
    return "மென்மையான பரோட்டாவுக்கு - ராமர் மைதா";
  }
  if (lower.includes("atta") || lower.includes("wheat") || lowerCat.includes("flour")) {
    return "மென்மையானது, மிருதுவானது - ராமர் மாவு";
  }
  if (lower.includes("sooji") || lower.includes("rava") || lowerCat.includes("rava")) {
    return "சூப்பர் ரவை - சுவையான உப்மா";
  }
  if (lower.includes("puliyotharai") || lower.includes("idli podi") || lower.includes("podi") || lowerCat.includes("traditional")) {
    return "பாரம்பரிய சுவையில் ராமர் ஸ்பெஷல் மிக்ஸ்";
  }
  return "ராமர் தரம் - சுவையும் ஆரோக்கியமும்";
};

// Get Tamil name for a product
export const getTamilName = (name = "", category = "") => {
  const lower = (name || "").toLowerCase();

  if (lower.includes("thokku")) {
    if (lower.includes("tomato") || lower.includes("thakkali")) return "தக்காளி தொக்கு";
    if (lower.includes("garlic") || lower.includes("poondu")) return "பூண்டு தொக்கு";
    if (lower.includes("onion") || lower.includes("vengayam")) return "வெங்காய தொக்கு";
    return "சுவையான தொக்கு";
  }
  if (lower.includes("pickle") || lower.includes("oorugai")) {
    if (lower.includes("mango") || lower.includes("maangai")) return "மாங்காய் ஊறுகாய்";
    if (lower.includes("lemon") || lower.includes("elamichai") || lower.includes("lime")) return "எலுமிச்சை ஊறுகாய்";
    if (lower.includes("garlic") || lower.includes("poondu")) return "பூண்டு ஊறுகாய்";
    if (lower.includes("citron") || lower.includes("narthangai")) return "நார்த்தங்காய் ஊறுகாய்";
    if (lower.includes("mixed")) return "கலவை ஊறுகாய்";
    return "பாரம்பரிய ஊறுகாய்";
  }
  if (lower.includes("appalam") || lower.includes("papad") || lower.includes("vadam")) {
    if (lower.includes("pepper") || lower.includes("milagu")) return "மிளகு அப்பளம்";
    if (lower.includes("jeera") || lower.includes("seeragam")) return "சீரக அப்பளம்";
    if (lower.includes("garlic")) return "பூண்டு அப்பளம்";
    if (lower.includes("rice") || lower.includes("vadam")) return "அரிசி அப்பளம்";
    return "பாரம்பரிய அப்பளம்";
  }

  if (lower.includes("millet") && lower.includes("noodles")) return "சிறுதானிய நூடுல்ஸ்";
  if (lower.includes("ragi") && lower.includes("noodles")) return "ராகி நூடுல்ஸ்";
  if (lower.includes("kambu") && lower.includes("noodles")) return "கம்பு நூடுல்ஸ்";
  if (lower.includes("varagu") && lower.includes("noodles")) return "வரகு நூடுல்ஸ்";
  if (lower.includes("thinai") && lower.includes("noodles")) return "தினை நூடுல்ஸ்";
  if (lower.includes("millet") && lower.includes("vermicelli")) return "சிறுதானிய சேமியா";
  if (lower.includes("millet") && (lower.includes("puttu") || lower.includes("dosa"))) return "சிறுதானிய மாவு";
  if (lower.includes("ragi") && (lower.includes("vermicelli") || lower.includes("semiya"))) return "ராகி சேமியா";
  if (lower.includes("ragi") && lower.includes("flour")) return "ராகி மாவு";
  if (lower.includes("bajra") && lower.includes("flour")) return "கம்பு மாவு";
  if (lower.includes("regular semiya") || lower.includes("vermicelli") || lower.includes("semiya")) return "சேமியா";
  if (lower.includes("ramar soft") || lower.includes("soft noodles")) return "ராமர் சாப்ட் நூடுல்ஸ்";
  if (lower.includes("raman")) return "ராமன் நூடுல்ஸ்";
  if (lower.includes("noodles")) return "நூடுல்ஸ்";
  if (lower.includes("atta") || lower.includes("wheat")) return "கோதுமை மாவு";
  if (lower.includes("maida")) return "மைதா";
  if (lower.includes("sooji") || lower.includes("rava")) return "ரவை";
  if (lower.includes("rice flour")) return "அரிசி மாவு";
  if (lower.includes("gram flour")) return "கடலை மாவு";
  if (lower.includes("idli podi") || lower.includes("idly podi")) return "இட்லி பொடி";
  if (lower.includes("ellu podi")) return "எள்ளு இட்லி பொடி";
  if (lower.includes("puliyotharai") || lower.includes("puliyodharai")) return "புளியோதரை மிக்ஸ்";
  if (lower.includes("ulundhankali") || lower.includes("ulunthankali")) return "உளுந்தங்களி மிக்ஸ்";
  if (lower.includes("puttu")) return "புட்டு பொடி";
  if (lower.includes("idiappam") || lower.includes("idiappa")) return "இடியாப்ப மாவு";
  if (lower.includes("murukku")) return "முறுக்கு மாவு";
  if (lower.includes("bajji") || lower.includes("bonda")) return "பஜ்ஜி போண்டா மிக்ஸ்";
  if (lower.includes("parotta")) return "பரோட்டா மாவு";
  if (lower.includes("kozhukattai")) return "கொழுக்கட்டை மாவு";
  if (lower.includes("dosa") || lower.includes("adai")) return "தோசை மிக்ஸ்";
  if (lower.includes("corn")) return "சோள மாவு";
  if (lower.includes("samba") && lower.includes("wheat")) return "சம்பா கோதுமை ரவை";
  if (lower.includes("sivappu") || lower.includes("kavuni")) return "சிவப்பு கவுனி மாவு";
  if (lower.includes("broken")) return "சம்பா கொத்திக்குருணை";

  return categoryTamilNames[category] || category || "";
};
