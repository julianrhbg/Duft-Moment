export const groups = {
  fresh: {name:'Frisch & spritzig', description:'Zitrusfrüchte, Minze, frisches Grün', icon:'sun'},
  soft: {name:'Weich & blumig', description:'Blüten, Lavendel, sanfte Kräuter', icon:'flower'},
  warm: {name:'Warm & holzig', description:'Holz, Harz, warme würzige Noten', icon:'tree'}
};
export const activities = {
  wake: {name:'Aufwachen', detail:'Frische für den Anfang', icon:'sunrise'},
  focus: {name:'Lernen & Arbeiten', detail:'Raum für deine Gedanken', icon:'lines'},
  pause: {name:'Pause machen', detail:'Kurz aus allem heraus', icon:'pause'},
  sleep: {name:'Zur Ruhe kommen', detail:'Den Tag leiser werden lassen', icon:'moon'},
  sofa: {name:'Fernsehen & Sofa', detail:'Einfach hier sein', icon:'sofa'},
  room: {name:'Frischer Raum', detail:'Eine klare Duftatmosphäre', icon:'window'},
  surprise: {name:'Überrasch mich', detail:'Heute ohne Plan', icon:'spark'}
};
export const intensities = {subtle:'Dezent', medium:'Deutlich', strong:'Kräftig'};

// Ausgangsquellen bleiben auch ohne erreichbare gemeinsame Konfiguration zugänglich.
export const sourceFallback=[
 {id:'new-stock-de',title:'doTERRA · On Guard (DE, Ölvariante)',url:'https://shop.doterra.com/DE/de_DE/shop/onguard-oil/',kind:'Hersteller · regionale Produktvariante'},
 {id:'eucalyptus-de',title:'doTERRA · Eucalyptus (DE-Shop, fünf Arten)',url:'https://shop.doterra.com/DE/en_DE/shop/eucalyptus-oil/',kind:'Hersteller · Produkt und Diffuserhinweis'},
 {id:'eucalyptus-pip',title:'doTERRA · Eucalyptus EU-Produktblatt',url:'https://media.doterra.com/eu/de/pips/eucalyptus-oil.pdf',kind:'Hersteller · Zusammensetzung'},
 {id:'valerian-de',title:'doTERRA · Valerian EU-Produktblatt',url:'https://media.doterra.com/eu/de/pips/valerian-oil.pdf',kind:'Hersteller · EU-Anwendung, keine Diffuserangabe'},
 {id:'valerian-au',title:'doTERRA · Valerian AU-Produktblatt',url:'https://media.doterra.com/au-otg/en/pips/valerian-oil.pdf',kind:'Hersteller · regionale Abweichung'},
 {id:'holiday-de',title:'doTERRA · Holiday Peace (DE)',url:'https://shop.doterra.com/de/de_de/shop/holiday-peace-oil/',kind:'Hersteller · regionale Produktvariante'},
 {id:'holiday-ca',title:'doTERRA · Holiday Peace (Kanada)',url:'https://www.doterra.com/CA/en/blog/spotlight-holiday-peace-holiday-joy-oil',kind:'Hersteller · regionale Diffuseranwendung'},
 {id:'onguard-old',title:'doTERRA · On Guard DE-Produktblatt von 2018',url:'https://media.doterra.com/de/de/pips/onguard-oil.pdf',kind:'Historischer Herstellerstand · nicht gleich aktuelle Artikelnummer'},

 {id:'lucy-manual',title:'Stadler Form Lucy · EU-Anleitung',url:'https://www.stadlerform.com/media/c1/ce/72/1712837620/stadler-form-lucy-manual-eu.pdf',kind:'Hersteller · Gerät'},
 {id:'lucy',title:'Stadler Form Lucy · Produktseite',url:'https://www.stadlerform.com/de-de/aroma-diffuser/lucy-weiss-l-037',kind:'Hersteller · Gerät'},
 {id:'doterra-eu',title:'doTERRA · Produktübersicht Europa',url:'https://media.doterra.com/eu/de/brochures/product-guide.pdf',kind:'Hersteller · Produkte'},
 {id:'bfr',title:'BfR · Ätherische Öle: Wirkungen mit Einschränkungen',url:'https://www.bfr.bund.de/fragen-und-antworten/thema/aetherische-oele-duftende-wirkungen-mit-einschraenkungen/',kind:'Unabhängige Risikoinformation'},
 {id:'anses',title:'ANSES · Vigil’Anses, Juli 2020',url:'https://vigilanses.anses.fr/sites/default/files/VigilAnsesN11_July2020_Spray.pdf',kind:'Unabhängige Risikoinformation (Englisch)'}
];
