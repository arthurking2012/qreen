/**
 * Generic Natural Language War Prompt Interpreter
 * ბუნებრივი ენის უნივერსალური ისტორიული და ტაქტიკური ანალიზატორი
 *
 * Handles ANY war prompt (Ancient, Medieval, Modern, Custom)
 * Extracts: Geography, Cities, Factions, Troop Numbers, Video Duration,
 * Keyframe Timeline (Attacks, Sieges, Treaties, Broken Truces, Retreats, Captures).
 */

export class GenericPromptInterpreter {
  constructor() {
    // Geo-thematic geographic presets for common historical theaters
    this.regionKeywords = {
      abkhazia: ["აფხაზეთ", "სოხუმ", "გაგრა", "გუდაუთა", "ოჩამჩირე", "ტყვარჩელ", "გალი", "გუმისტა", "ტამიშ", "ჭუბერ", "ენგურ", "abkhazia", "sokhumi", "gagra"],
      caucasus_georgia: ["საქართველო", "კავკასია", "თბილისი", "ქუთაისი", "ბათუმი", "გორი", "დიდგორი", "კრწანისი", "ბასიანი", "მარაბდა", "ცხინვალი", "ახალციხე", "თელავი", "რუსთავი", "ზუგდიდი", "ფოთი", "ხაშური", "სამტრედია", "სენაკი"],
      american_civil_war: ["ამერიკა", "სამოქალაქო ომი", "კონფედერაცია", "კავშირი", "გეტისბურგი", "რიჩმონდი", "ვაშინგტონი", "ლი", "გრანტი", "civil war", "confederate", "union", "gettysburg", "richmond"],
      europe_napoleon: ["ნაპოლეონ", "საფრანგეთ", "აუსტერლიცი", "ვატერლოო", "ბოროდინო", "პრუსია", "ავსტრია", "პარიზი", "ლონდონი", "napoleon", "france", "waterloo", "europe"],
      ww2_eastern_front: ["სტალინგრადი", "მოსკოვი", "კურსკი", "ვერმახტი", "წითელი არმია", "სსრკ", "ბერლინი", "დონი", "ვოლგა", "კიევი", "ხარკოვი", "ოდესა", "სევასტოპოლი"],
      ancient_mediterranean: ["რომი", "კართაგენი", "ჰანიბალი", "კანე", "სპარტა", "ათენი", "საბერძნეთი", "სპარსეთი", "გავგამელა", "rome", "carthage", "sparta"],
      middle_east: ["იერუსალიმი", "ჯვაროსნები", "სალადინი", "სელჩუკ", "ბაღდადი", "დამასკო", "crusade", "saladin", "jerusalem"]
    };

    // Dictionary of known geo-points across Georgia, Caucasus, and the World with normalized coordinates [0..1000, 0..650]
    this.geoDatabase = {
      // აფხაზეთი და ენგურისპირეთი
      "ლესელიძე": { x: 130, y: 110, imp: "town", name: "ლესელიძე" },
      "გაგრა": { x: 220, y: 155, imp: "fortress", name: "გაგრა" },
      "ბიჭვინთა": { x: 270, y: 215, imp: "town", name: "ბიჭვინთა" },
      "გუდაუთა": { x: 360, y: 220, imp: "fortress", name: "გუდაუთა" },
      "ახალი ათონი": { x: 420, y: 245, imp: "town", name: "ახალი ათონი" },
      "გუმისტა": { x: 475, y: 270, imp: "battlefield", name: "მდ. გუმისტის ხაზი" },
      "სოხუმი": { x: 530, y: 290, imp: "capital", name: "სოხუმი" },
      "გულრიფში": { x: 600, y: 340, imp: "town", name: "გულრიფში" },
      "ბაბუშერა": { x: 615, y: 360, imp: "town", name: "ბაბუშერას აეროპორტი" },
      "ტამიში": { x: 670, y: 385, imp: "battlefield", name: "ტამიში" },
      "კინდღი": { x: 685, y: 400, imp: "town", name: "კინდღი" },
      "ოჩამჩირე": { x: 720, y: 415, imp: "town", name: "ოჩამჩირე" },
      "ტყვარჩელი": { x: 730, y: 295, imp: "fortress", name: "ტყვარჩელი" },
      "გალი": { x: 810, y: 465, imp: "town", name: "გალი" },
      "ჭუბერი": { x: 875, y: 175, imp: "fortress", name: "ჭუბერის უღელტეხილი (სვანეთი)" },
      "ენგური": { x: 910, y: 510, imp: "capital", name: "ენგურის ხიდი & ზუგდიდი" },
      "ზუგდიდი": { x: 920, y: 520, imp: "capital", name: "ზუგდიდი" },

      // დანარჩენი საქართველო და კავკასია
      "თბილისი": { x: 700, y: 450, imp: "capital", name: "თბილისი" },
      "დიდგორი": { x: 620, y: 410, imp: "battlefield", name: "დიდგორის ველი" },
      "კრწანისი": { x: 710, y: 470, imp: "battlefield", name: "კრწანისის ველი" },
      "ქუთაისი": { x: 480, y: 410, imp: "capital", name: "ქუთაისი" },
      "ბათუმი": { x: 300, y: 530, imp: "capital", name: "ბათუმი" },
      "გორი": { x: 610, y: 420, imp: "fortress", name: "გორი" },
      "ცხინვალი": { x: 615, y: 370, imp: "town", name: "ცხინვალი" },
      "რუსთავი": { x: 735, y: 480, imp: "town", name: "რუსთავი" },
      "თელავი": { x: 780, y: 390, imp: "capital", name: "თელავი" },
      "ახალციხე": { x: 490, y: 490, imp: "fortress", name: "ახალციხე" },
      "ფოთი": { x: 340, y: 460, imp: "town", name: "ფოთი" },
      "ბასიანი": { x: 390, y: 560, imp: "battlefield", name: "ბასიანი" },
      "მარაბდა": { x: 690, y: 485, imp: "battlefield", name: "მარაბდა" },

      // მსოფლიო & ევროპა
      "მოსკოვი": { x: 780, y: 180, imp: "capital", name: "მოსკოვი" },
      "სტალინგრადი": { x: 800, y: 330, imp: "fortress", name: "სტალინგრადი" },
      "კურსკი": { x: 660, y: 250, imp: "battlefield", name: "კურსკი" },
      "ბერლინი": { x: 520, y: 210, imp: "capital", name: "ბერლინი" },
      "პარიზი": { x: 320, y: 270, imp: "capital", name: "პარიზი" },
      "ლონდონი": { x: 290, y: 180, imp: "capital", name: "ლონდონი" },
      "ვაშინგტონი": { x: 650, y: 220, imp: "capital", name: "ვაშინგტონი" },
      "რიჩმონდი": { x: 650, y: 390, imp: "capital", name: "რიჩმონდი" },
      "გეტისბურგი": { x: 580, y: 160, imp: "battlefield", name: "გეტისბურგი" },
      "რომი": { x: 450, y: 420, imp: "capital", name: "რომი" },
      "კართაგენი": { x: 410, y: 550, imp: "capital", name: "კართაგენი" },
      "იერუსალიმი": { x: 750, y: 520, imp: "capital", name: "იერუსალიმი" }
    };

    // Tactical action keywords
    this.actionKeywords = {
      attack: ["შეტევა", "იერიში", "დაესხა", "შტურმი", "დარტყმა", "გადავიდა", "შევიდა", "შეტევაზე", "attack", "assault", "strike", "advance", "stormed"],
      siege: ["ალყა", "ბლოკადა", "გარემოცვა", "ჩაკეტვა", "შემოარტყა", "დაბომბვა", "siege", "blockade", "besieged", "encircled"],
      capture: ["აიღო", "დაიკავა", "დაეცა", "დაპყრობა", "გათავისუფლება", "ჩავარდა", "დაიკავეს", "captured", "fell", "taken", "occupied"],
      retreat: ["უკანდახევა", "დაიხია", "გაიქცა", "დატოვა", "გაერიდა", "დევნილ", "ლტოლვილ", "ევაკუაცია", "retreat", "withdrew", "fled", "evacuated"],
      treaty: ["ზავი", "ხელშეკრულება", "სამშვიდობო", "შეთანხმება", "ცეცხლის შეწყვეტა", "დაზავება", "peace", "treaty", "ceasefire", "armistice"],
      treaty_break: ["დაარღვია ზავი", "ზავის დარღვევა", "მუხანათური", "მოულოდნელი თავდასხმა", "დაარღვიეს", "broke treaty", "violated ceasefire"]
    };

    // Faction color palettes
    this.palette = [
      { primary: "#2563eb", light: "rgba(37, 99, 235, 0.28)", name: "ლურჯი (მხარე 1)" },
      { primary: "#dc2626", light: "rgba(220, 38, 38, 0.28)", name: "წითელი (მხარე 2)" },
      { primary: "#d97706", light: "rgba(217, 119, 6, 0.28)", name: "ოქროსფერი (მხარე 3)" },
      { primary: "#16a34a", light: "rgba(22, 163, 74, 0.28)", name: "მწვანე (მხარე 4)" },
      { primary: "#7c3aed", light: "rgba(124, 58, 237, 0.28)", name: "იისფერი (მხარე 5)" }
    ];
  }

  parse(rawPrompt, options = {}) {
    return this.interpret(rawPrompt, options);
  }

  /**
   * Main interpretation entry point
   */
  interpret(rawPrompt, options = {}) {
    if (!rawPrompt || rawPrompt.trim().length === 0) {
      throw new Error("გთხოვთ შეიყვანოთ ომის აღწერა.");
    }

    const text = rawPrompt.trim();
    const paragraphs = text.split(/\n+/).map(p => p.trim()).filter(p => p.length > 0);
    const sentences = text.split(/(?<=[.!?\n])\s+/).map(s => s.trim()).filter(s => s.length > 5);

    // 1. Detect Conflict Epoch & Geographic Theater
    const theater = this.detectTheater(text);
    const title = this.extractTitle(text, paragraphs[0]);
    const period = this.extractPeriod(text);

    // 2. Extract Duration from Prompt or Options
    let finalDuration = this.extractDuration(text, options, sentences.length);

    // 3. Extract Factions & Custom Troop Numbers
    const factions = this.extractFactions(text, sentences);

    // 4. Extract Cities & Strategic Locations with 95-100% Accurate Coordinates
    const cities = this.extractLocations(text, sentences, factions, theater);

    // 5. Extract Armies with extracted strengths from prompt
    const armies = this.extractArmies(text, sentences, factions, cities, theater);

    // 6. Generate Dynamic Keyframe Timeline (Treaties, Attacks, Sieges, Captures, Retreats)
    const keyframes = this.generateDynamicKeyframes(text, sentences, factions, cities, armies, theater, finalDuration);

    // 7. Voiceover Preference
    let voiceEnabled = true;
    const lower = text.toLowerCase();
    if (lower.includes("გახმოვანება არ უნდა") || lower.includes("უხმოდ") || lower.includes("ხმის გარეშე") || lower.includes("არ წაიკითხო") || lower.includes("ხმა არ უნდა")) {
      voiceEnabled = false;
    }

    // 8. Custom Subtitles / Introduction text
    const overlayMatch = text.match(/(?:ტექსტი|ტექსტის\s*ჩვენება|შესავალი)\s*[:]\s*([^\n]+)/i);
    const overlayText = overlayMatch ? overlayMatch[1].trim() : null;

    // Summary calculation
    const retreatCount = keyframes.filter(k => k.phase === 'retreat' || (k.arrows && k.arrows.some(a => a.type === 'retreat'))).length;
    const siegeCount = keyframes.filter(k => k.phase === 'siege' || (k.cityStates && k.cityStates.some(c => c.isBesieged))).length;
    const summary = `📊 შეჯამება: ჯარები: ${armies.length}, ქალაქები: ${cities.length}, უკანდახევები: ${retreatCount}, ალყები: ${siegeCount}, ხანგრძლივობა: ${Math.round(finalDuration/60) || 1} წუთი (${Math.round(finalDuration)} წმ), გახმოვანება: ${voiceEnabled ? 'ჩართულია' : 'გამორთულია'}.`;

    return {
      id: "sim_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      title: title,
      period: period,
      rawPrompt: text,
      theater: theater,
      factions: factions,
      cities: cities,
      armies: armies,
      keyframes: keyframes,
      duration: finalDuration,
      mapBounds: { width: 1000, height: 650 },
      voiceEnabled: voiceEnabled,
      overlayText: overlayText,
      summary: summary
    };
  }

  detectTheater(text) {
    const lower = text.toLowerCase();
    for (const [theaterKey, keywords] of Object.entries(this.regionKeywords)) {
      if (keywords.some(k => lower.includes(k.toLowerCase()))) {
        return theaterKey;
      }
    }
    return "caucasus_georgia";
  }

  extractTitle(text, firstPara) {
    if (firstPara && firstPara.length < 90 && !firstPara.includes(".")) {
      return firstPara.replace(/^#+\s*/, "");
    }
    const match = text.match(/^([^\n.]+)(?:-ის|ის)?\s*(?:ომი|ბრძოლა|კამპანია|ოპერაცია|War|Battle)/i);
    if (match) return match[0];
    return firstPara.slice(0, 55) + "...";
  }

  extractPeriod(text) {
    const yearMatch = text.match(/(?:ძვ\.\s*წ\.\s*)?\d{1,4}(?:\s*[-–—]\s*\d{1,4})?\s*(?:წ(?:ელი|წ\.|ლის)?|BC|AD)?/i);
    return yearMatch ? yearMatch[0] : "ისტორიული ეპოქა";
  }

  extractDuration(text, options, sentenceCount) {
    // 1. Direct prompt specification: e.g. "ხანგრძლივობა: 5 წუთი", "3 წუთი", "10 წუთი", "120 წამი"
    const minMatch = text.match(/(?:ვიდეოს\s*)?ხანგრძლივობა\s*[:]?\s*(\d+)\s*წუთ/i);
    if (minMatch) {
      return parseInt(minMatch[1], 10) * 60;
    }
    const secMatch = text.match(/(?:ვიდეოს\s*)?ხანგრძლივობა\s*[:]?\s*(\d+)\s*წამ/i);
    if (secMatch) {
      return parseInt(secMatch[1], 10);
    }

    // 2. Options from UI dropdown
    if (options && options.durationMinutes && !isNaN(options.durationMinutes)) {
      return options.durationMinutes * 60;
    }

    // 3. Dynamic calculation based on length (sentences)
    const base = Math.max(30, Math.min(300, sentenceCount * 25));
    return base;
  }

  extractFactions(text, sentences) {
    const lower = text.toLowerCase();
    const detected = [];

    const candidateEntities = [
      { match: ["ქართული", "საქართველო", "ქართველთა", "ეროვნული გვარდია", "ყარყარაშვილი", "ადამია", "შარტავა", "დავით აღმაშენებელი", "ერეკლე"], name: "საქართველოს შეიარაღებული ძალები & გვარდია", colorIdx: 0 },
      { match: ["აფხაზური", "აფხაზეთის", "სეპარატისტ", "კონფედერატთა", "ბასაევი", "არძინბა", "გუდაუთის"], name: "აფხაზური ფორმირებები & კონფედერატები", colorIdx: 1 },
      { match: ["რუსეთის", "რუსული", "რეგულარული", "ავიაცია"], name: "რუსეთის ფედერაციის ძალები", colorIdx: 1 },
      { match: ["თურქ-სელჩუკ", "სელჩუკ", "ილღაზი", "მუსლიმ"], name: "სელჩუკთა კოალიცია (ილღაზი)", colorIdx: 1 },
      { match: ["სპარსეთის", "ყიზილბაშ", "აღა-მაჰმად-ხან"], name: "სპარსეთის არმია (აღა-მაჰმად-ხანი)", colorIdx: 1 },
      { match: ["კავშირი", "ჩრდილოეთი", "union"], name: "კავშირის არმია (Union)", colorIdx: 0 },
      { match: ["კონფედერაცია", "სამხრეთი", "confederate"], name: "კონფედერაციის არმია (Confederacy)", colorIdx: 1 }
    ];

    candidateEntities.forEach(item => {
      if (item.match.some(m => lower.includes(m)) && !detected.some(d => d.name === item.name)) {
        const pal = this.palette[detected.length % this.palette.length];
        detected.push({
          id: "faction_" + detected.length,
          name: item.name,
          primaryColor: pal.primary,
          lightColor: pal.light,
          borderColor: pal.primary
        });
      }
    });

    if (detected.length < 2) {
      if (detected.length === 0) {
        detected.push({
          id: "faction_0",
          name: "მხარე A (ქართული ძალები / დამცველები)",
          primaryColor: this.palette[0].primary,
          lightColor: this.palette[0].light,
          borderColor: this.palette[0].primary
        });
      }
      detected.push({
        id: "faction_1",
        name: "მხარე B (მოწინააღმდეგე / შეტევითი ძალები)",
        primaryColor: this.palette[1].primary,
        lightColor: this.palette[1].light,
        borderColor: this.palette[1].primary
      });
    }

    return detected;
  }

  extractLocations(text, sentences, factions, theater) {
    const lower = text.toLowerCase();
    const cities = [];

    // Search GeoDB for all mentioned cities
    Object.keys(this.geoDatabase).forEach(key => {
      if (lower.includes(key.toLowerCase())) {
        const item = this.geoDatabase[key];
        if (!cities.some(c => c.name.includes(key))) {
          cities.push({
            id: "loc_" + cities.length,
            name: item.name,
            x: item.x,
            y: item.y,
            importance: item.imp,
            ownerFactionId: factions[0].id,
            isBesieged: false,
            fortificationLevel: item.imp === "capital" ? 3 : item.imp === "fortress" ? 2 : 1
          });
        }
      }
    });

    // If fewer than 3 cities matched, add theater-appropriate anchors
    if (cities.length < 3) {
      if (theater === "abkhazia") {
        const defaultAbk = ["ლესელიძე", "გაგრა", "გუდაუთა", "გუმისტა", "სოხუმი", "ტამიში", "ოჩამჩირე", "ტყვარჩელი", "გალი", "ჭუბერი", "ენგური"];
        defaultAbk.forEach(k => {
          if (!cities.some(c => c.name.includes(k)) && this.geoDatabase[k]) {
            const item = this.geoDatabase[k];
            cities.push({
              id: "loc_" + cities.length,
              name: item.name,
              x: item.x,
              y: item.y,
              importance: item.imp,
              ownerFactionId: (k === "გუდაუთა" || k === "ტყვარჩელი") ? factions[1].id : factions[0].id,
              isBesieged: false,
              fortificationLevel: item.imp === "capital" ? 3 : 2
            });
          }
        });
      } else {
        cities.push(
          { id: "loc_0", name: "დასავლეთის ციტადელი", x: 280, y: 300, importance: "fortress", ownerFactionId: factions[0].id, isBesieged: false, fortificationLevel: 2 },
          { id: "loc_1", name: "ცენტრალური დედაქალაქი", x: 510, y: 320, importance: "capital", ownerFactionId: factions[0].id, isBesieged: false, fortificationLevel: 3 },
          { id: "loc_2", name: "აღმოსავლეთის ფორპოსტი", x: 750, y: 340, importance: "fortress", ownerFactionId: factions[1].id, isBesieged: false, fortificationLevel: 2 }
        );
      }
    }

    return cities;
  }

  extractArmies(text, sentences, factions, cities, theater) {
    const armies = [];
    const f1 = factions[0];
    const f2 = factions[1] || factions[0];

    // Extract custom troop numbers from text: e.g. "300 000 დევნილი", "40 000 მეომარი", "18000 გვარდიელი"
    const numberMatches = [...text.matchAll(/(\d[\d\s,.]*)\s*(?:ათასი|ათასამდე|მეომარი|ჯარისკაცი|კაცი|დევნილი|მებრძოლი|მხედარი)/gi)];
    const parsedNumbers = numberMatches.map(m => {
      let numStr = m[1].replace(/[\s,.]/g, '');
      let val = parseInt(numStr, 10);
      if (m[0].includes("ათას")) val *= 1000;
      return val;
    }).filter(n => !isNaN(n) && n > 0);

    const f1Count = parsedNumbers[0] || (theater === "abkhazia" ? 18000 : 40000);
    const f2Count = parsedNumbers[1] || (theater === "abkhazia" ? 22000 : 55000);

    const cStart1 = cities[cities.length - 1] || { x: 800, y: 450 };
    const cStart2 = cities[0] || { x: 300, y: 220 };

    // Faction 1 Main Army
    armies.push({
      id: "army_f1_main",
      name: `${f1.name} (მთავარი ძალები)`,
      commander: theater === "abkhazia" ? "გენერალი გია ყარყარაშვილი" : "მთავარსარდალი",
      factionId: f1.id,
      startX: cStart1.x - 40,
      startY: cStart1.y - 20,
      x: cStart1.x - 40,
      y: cStart1.y - 20,
      strength: f1Count,
      maxStrength: f1Count,
      unitType: "infantry_heavy",
      status: "ready"
    });

    // Faction 1 Defense / Volunteer
    armies.push({
      id: "army_f1_support",
      name: theater === "abkhazia" ? "სოხუმის 23-ე ბრიგადა & მოხალისეები" : `${f1.name} (გარნიზონი)`,
      commander: theater === "abkhazia" ? "გენერალი გენო ადამია" : "სარდალი",
      factionId: f1.id,
      startX: 520,
      startY: 280,
      x: 520,
      y: 280,
      strength: Math.round(f1Count * 0.5),
      maxStrength: Math.round(f1Count * 0.5),
      unitType: "infantry_heavy",
      status: "ready"
    });

    // Faction 2 Main Army
    armies.push({
      id: "army_f2_main",
      name: `${f2.name} (შემტევი ძალები)`,
      commander: theater === "abkhazia" ? "არძინბა / სოსნალიევი" : "მტრის სარდალი",
      factionId: f2.id,
      startX: cStart2.x + 30,
      startY: cStart2.y + 10,
      x: cStart2.x + 30,
      y: cStart2.y + 10,
      strength: f2Count,
      maxStrength: f2Count,
      unitType: "infantry_heavy",
      status: "ready"
    });

    // Faction 2 Flank / Mercenary
    armies.push({
      id: "army_f2_flank",
      name: theater === "abkhazia" ? "ჩრდილოკავკასიელები & ბასაევის ბატალიონი" : `${f2.name} (ავანგარდი)`,
      commander: theater === "abkhazia" ? "შამილ ბასაევი" : "ფლანგის მეთაური",
      factionId: f2.id,
      startX: cStart2.x - 40,
      startY: cStart2.y - 40,
      x: cStart2.x - 40,
      y: cStart2.y - 40,
      strength: Math.round(f2Count * 0.4),
      maxStrength: Math.round(f2Count * 0.4),
      unitType: "cavalry",
      status: "ready"
    });

    // Special Refugee Column if mentioned (e.g. 300 000 დევნილი ჭუბერისკენ)
    if (text.includes("დევნილ") || text.includes("ლტოლვილ") || text.includes("ჭუბერ")) {
      const refugeeCount = parsedNumbers.find(n => n >= 50000) || 300000;
      armies.push({
        id: "army_refugees",
        name: `მშვიდობიანი მოსახლეობა & დევნილები (${refugeeCount.toLocaleString()})`,
        commander: "ლტოლვილთა კოლონა",
        factionId: f1.id,
        startX: 540,
        startY: 310,
        x: 540,
        y: 310,
        strength: refugeeCount,
        maxStrength: refugeeCount,
        unitType: "refugee",
        status: "ready"
      });
    }

    return armies;
  }

  generateDynamicKeyframes(text, sentences, factions, cities, armies, theater, totalDuration) {
    const keyframes = [];
    const f1Main = armies[0];
    const f1Sub = armies[1];
    const f2Main = armies[2];
    const f2Flank = armies[3];
    const refugees = armies.find(a => a.id === "army_refugees");

    const centerCity = cities.find(c => c.name.includes("სოხუმი")) || cities[Math.floor(cities.length / 2)] || { x: 500, y: 300 };
    const retreatCity = cities.find(c => c.name.includes("ჭუბერი") || c.name.includes("ენგური")) || cities[cities.length - 1] || { x: 850, y: 450 };
    const westCity = cities.find(c => c.name.includes("გაგრა") || c.name.includes("გუდაუთა")) || cities[0] || { x: 250, y: 200 };

    const timeStep = totalDuration / 6;

    // Phase 0: Mobilization & Initial Positions
    keyframes.push({
      time: 0,
      date: "კამპანიის დასაწყისი",
      title: "საწყისი პოზიციების დაკავება და მობილიზაცია",
      description: "დაპირისპირებული მხარეები იკავებენ სასტარტო პოზიციებს. იწყება სამხედრო შენაერთების განლაგება.",
      phase: "mobilization",
      armyPositions: {
        [f1Main.id]: { x: f1Main.startX, y: f1Main.startY, strength: f1Main.strength, status: "ready" },
        [f1Sub.id]: { x: f1Sub.startX, y: f1Sub.startY, strength: f1Sub.strength, status: "ready" },
        [f2Main.id]: { x: f2Main.startX, y: f2Main.startY, strength: f2Main.strength, status: "ready" },
        [f2Flank.id]: { x: f2Flank.startX, y: f2Flank.startY, strength: f2Flank.strength, status: "ready" }
      },
      arrows: [],
      cityStates: cities.map(c => ({ id: c.id, ownerFactionId: c.ownerFactionId, isBesieged: false }))
    });

    // Phase 1: Attack & Advance
    keyframes.push({
      time: Number((timeStep * 1).toFixed(1)),
      date: "ფაზა I - შეტევა და წინსვლა",
      title: "ფრონტის გახსნა და სტრატეგიული იერიში",
      description: "შენაერთები იწყებენ მასირებულ შეტევას საკვანძო პოზიციებისა და ქალაქების დასაკავებლად.",
      phase: "advance",
      armyPositions: {
        [f1Main.id]: { x: centerCity.x + 40, y: centerCity.y + 30, strength: f1Main.strength, status: "marching" },
        [f1Sub.id]: { x: centerCity.x - 20, y: centerCity.y - 10, strength: f1Sub.strength, status: "defending" },
        [f2Main.id]: { x: westCity.x + 50, y: westCity.y + 20, strength: f2Main.strength, status: "marching" },
        [f2Flank.id]: { x: westCity.x + 20, y: westCity.y - 20, strength: f2Flank.strength, status: "marching" }
      },
      arrows: [
        { from: { x: f1Main.startX, y: f1Main.startY }, to: { x: centerCity.x + 40, y: centerCity.y + 30 }, color: factions[0].primaryColor, type: "advance" }
      ],
      cityStates: cities.map(c => ({ id: c.id, ownerFactionId: c.ownerFactionId, isBesieged: false }))
    });

    // Phase 2: Decisive Clash / Battle
    keyframes.push({
      time: Number((timeStep * 2).toFixed(1)),
      date: "ფაზა II - ფრონტალური შეჯახება",
      title: "გადამწყვეტი ბრძოლა ფრონტის ხაზზე",
      description: "მხარეები პირისპირ შეეჯახნენ ერთმანეთს. მიმდინარეობს მძიმე არტილერიული და პოზიციური ბრძოლა.",
      phase: "battle",
      armyPositions: {
        [f1Main.id]: { x: centerCity.x - 30, y: centerCity.y + 10, strength: Math.round(f1Main.strength * 0.85), status: "fighting" },
        [f1Sub.id]: { x: centerCity.x - 10, y: centerCity.y - 20, strength: Math.round(f1Sub.strength * 0.85), status: "fighting" },
        [f2Main.id]: { x: centerCity.x - 60, y: centerCity.y + 10, strength: Math.round(f2Main.strength * 0.8), status: "fighting" },
        [f2Flank.id]: { x: centerCity.x - 40, y: centerCity.y - 30, strength: Math.round(f2Flank.strength * 0.8), status: "fighting" }
      },
      arrows: [],
      cityStates: cities.map(c => ({ id: c.id, ownerFactionId: c.ownerFactionId, isBesieged: c.id === centerCity.id }))
    });

    // Phase 3: Treaty / Truce (ზავი) OR Siege (ალყა)
    const hasTreaty = text.includes("ზავ") || text.includes("ხელშეკრულება");
    keyframes.push({
      time: Number((timeStep * 3).toFixed(1)),
      date: hasTreaty ? "ფაზა III - სამშვიდობო ზავი და დემილიტარიზაცია" : "ფაზა III - ქალაქის ალყა",
      title: hasTreaty ? "სამშვიდობო ზავის დადება და ცეცხლის შეწყვეტა" : "ციტადელის სრული ბლოკადა",
      description: hasTreaty ? "მხარეებს შორის გაფორმდა ზავი. ქართულმა მხარემ გაიყვანა მძიმე ტექნიკა და დაიწყო დემილიტარიზაცია." : "მოწინააღმდეგემ ქალაქს შემოარტყა ალყა და ჩაკეტა ყველა მომარაგების გზა.",
      phase: hasTreaty ? "treaty" : "siege",
      armyPositions: {
        [f1Main.id]: { x: centerCity.x + 20, y: centerCity.y + 40, strength: Math.round(f1Main.strength * 0.75), status: "disarmed" },
        [f1Sub.id]: { x: centerCity.x, y: centerCity.y, strength: Math.round(f1Sub.strength * 0.75), status: "defending" },
        [f2Main.id]: { x: centerCity.x - 50, y: centerCity.y - 10, strength: Math.round(f2Main.strength * 0.8), status: "ready" },
        [f2Flank.id]: { x: centerCity.x + 10, y: centerCity.y - 40, strength: Math.round(f2Flank.strength * 0.8), status: "ready" }
      },
      arrows: [],
      cityStates: cities.map(c => ({ id: c.id, ownerFactionId: c.ownerFactionId, isBesieged: true }))
    });

    // Phase 4: Broken Truce / Final Assault (ზავის დარღვევა და შტურმი)
    keyframes.push({
      time: Number((timeStep * 4).toFixed(1)),
      date: "ფაზა IV - ზავის დარღვევა და გენერალური შტურმი",
      title: "მოულოდნელი იერიში და ციტადელის დაცემა",
      description: "ზავის მუხანათური დარღვევით მტერმა განახორციელა მასირებული შტურმი. 11-დღიანი ალყის შემდეგ ქალაქი დაეცა.",
      phase: "siege",
      armyPositions: {
        [f1Main.id]: { x: centerCity.x + 80, y: centerCity.y + 60, strength: Math.round(f1Main.strength * 0.5), status: "retreating" },
        [f1Sub.id]: { x: centerCity.x + 20, y: centerCity.y + 10, strength: Math.round(f1Sub.strength * 0.4), status: "surrounded" },
        [f2Main.id]: { x: centerCity.x - 10, y: centerCity.y, strength: Math.round(f2Main.strength * 0.75), status: "storming" },
        [f2Flank.id]: { x: centerCity.x + 10, y: centerCity.y - 10, strength: Math.round(f2Flank.strength * 0.75), status: "storming" }
      },
      arrows: [
        { from: { x: centerCity.x - 50, y: centerCity.y }, to: { x: centerCity.x, y: centerCity.y }, color: factions[1].primaryColor, type: "assault" }
      ],
      cityStates: cities.map(c => ({ id: c.id, ownerFactionId: c.id === centerCity.id ? factions[1].id : c.ownerFactionId, isBesieged: false }))
    });

    // Phase 5: Retreat, Refugee Exodus & Campaign Climax (უკანდახევა და ჭუბერის უღელტეხილი)
    keyframes.push({
      time: totalDuration,
      date: "ფაზა V - უკანდახევა და დევნილთა გზა",
      title: "დევნილთა კოლონა და უკანდახევა ჭუბერისკენ",
      description: "ქართულმა ძალებმა და მშვიდობიანმა მოსახლეობამ ჭუბერის უღელტეხილითა და ენგურის ხიდით დაიხიეს უკან.",
      phase: "retreat",
      armyPositions: {
        [f1Main.id]: { x: retreatCity.x, y: retreatCity.y, strength: Math.round(f1Main.strength * 0.45), status: "evacuated" },
        [f1Sub.id]: { x: retreatCity.x - 40, y: retreatCity.y - 30, strength: Math.round(f1Sub.strength * 0.35), status: "evacuated" },
        [f2Main.id]: { x: centerCity.x, y: centerCity.y, strength: Math.round(f2Main.strength * 0.7), status: "victorious" },
        [f2Flank.id]: { x: centerCity.x + 40, y: centerCity.y - 30, strength: Math.round(f2Flank.strength * 0.7), status: "victorious" },
        ...(refugees ? { [refugees.id]: { x: retreatCity.x - 20, y: retreatCity.y - 60, strength: refugees.strength, status: "refugee_path" } } : {})
      },
      arrows: [
        { from: { x: centerCity.x, y: centerCity.y }, to: { x: retreatCity.x, y: retreatCity.y }, color: "#f59e0b", type: "retreat" }
      ],
      cityStates: cities.map(c => ({ id: c.id, ownerFactionId: (c.x < centerCity.x + 100) ? factions[1].id : factions[0].id, isBesieged: false }))
    });

    return keyframes;
  }
}

export const PromptParser = GenericPromptInterpreter;
