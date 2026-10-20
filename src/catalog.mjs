import {groups,activities,intensities} from '../public/meta.mjs';
export {groups,activities,intensities};
const stock = [
 ['bergamot-mint','Bergamot Mint','frisch, weich und krautig',['fresh','soft'],2],
 ['bergamot','Bergamot','hell, zitrisch und feinherb',['fresh'],3],
 ['lemon','Lemon','klar und zitronig',['fresh'],3],
 ['lime','Lime','spritzig und grün',['fresh'],3],
 ['lemongrass','Lemongrass','intensiv zitronig und krautig',['fresh'],1],
 ['citronella','Citronella','zitronig und grasig',['fresh'],1],
 ['oregano','Oregano','kräftig, krautig und würzig',['warm'],1],
 ['wild-orange','Wild Orange','weich und orangig',['fresh'],3],
 ['lavender','Lavender','blumig und krautig',['soft'],3],
 ['serenity','Serenity','blumig, weich und warm',['soft'],3],
 ['peppermint','Peppermint','deutlich minzig und kühl',['fresh'],1],
 ['air','Air','minzig und eukalyptusartig',['fresh'],2],
 ['adaptiv','Adaptiv','zitrisch, blumig und krautig',['soft','fresh'],2],
 ['zengest','ZenGest','würzig und minzig',['warm'],1],
 ['metapwr','MetaPWR','zitrisch, minzig und würzig',['fresh'],1],
 ['tulsi','Tulsi / Holy Basil','warm, krautig und würzig',['warm'],1],
 ['grapefruit','Grapefruit','herb und zitrisch',['fresh'],3],
 ['frankincense','Frankincense / Weihrauch','harzig und feinholzig',['warm'],3],
 ['lemon-eucalyptus','Lemon Eucalyptus','zitronig und grün',['fresh'],1],
 ['citrus-bliss','Citrus Bliss','weich und zitrisch',['fresh'],3],
 ['balance','Balance','holzig und warm',['warm'],3],
 ['copaiba','Copaiba','weich, harzig und holzig',['warm'],3],
 ['abode','Abode','würzig, zitrisch und holzig',['warm'],1]
];
const blends = ['serenity','air','adaptiv','zengest','metapwr','citrus-bliss','balance','abode'];
const oils=stock.map(([id,name,profile,groups,cap])=>({id,name,profile,groups,cap,brand:'doTERRA',variant:'oil',available:true,excluded:false,review:'declared',source:'',reviewedAt:'',blend:blends.includes(id),notes:blends.includes(id)?'Fertige Mischung: genaue Zusammensetzung und regionale Ölvariante vor Anwendung anhand des konkreten EU-Etiketts prüfen.':'Ölfläschchen laut übermitteltem Bestand; konkrete EU-Variante und Diffusereignung noch nicht unabhängig geprüft.'}));
const recipes=[];
function add(id,name,parts,groups,activities,description,times=[]){recipes.push({id,name,parts:parts.map(([oil,ratio])=>({oil,ratio})),groups,activities,description,times,priority:0,enabled:true});}
add('citrus-page','Ein unbeschriebenes Blatt',[['lemon',1],['bergamot',1]],['fresh'],['wake','focus','room'],'Zitrone und Bergamotte. Hell, klar und feinherb.',['morning','day']);
add('green-margin','Am Rand des Grüns',[['bergamot-mint',1],['lime',1]],['fresh'],['wake','focus','pause'],'Grüne Limette trifft auf weiche Bergamot Mint.',['morning','day']);
add('open-window','Das offene Fenster',[['grapefruit',1],['lemon',1]],['fresh'],['wake','focus','room'],'Herbe Grapefruit und eine klare Zitronennote.');
add('little-sun','Eine Handvoll Licht',[['wild-orange',2],['grapefruit',1]],['fresh'],['wake','pause','sofa'],'Runde Orange mit einer feinherben Kante.');
add('fresh-linen','Licht auf Leinen',[['bergamot',2],['lavender',1]],['soft'],['pause','sleep','sofa'],'Feiner Lavendel, aufgehellt von Bergamotte.');
add('blue-hour','Die blaue Stunde',[['lavender',1],['copaiba',1]],['soft','warm'],['pause','sleep','sofa'],'Weiche Blüten auf einem stillen, holzigen Grund.',['evening','night']);
add('wood-and-light','Licht zwischen Bäumen',[['frankincense',1],['wild-orange',1]],['warm'],['focus','pause','sofa'],'Warmer Weihrauch mit einem kleinen Lichtstreif Orange.');
add('quiet-wood','Im Schutz der Bäume',[['copaiba',1],['frankincense',1]],['warm'],['focus','pause','sleep','sofa'],'Zwei sanfte Harznoten, warm und zurückhaltend.');
add('wood-margin','Ein warmer Gedanke',[['copaiba',2],['bergamot',1]],['warm'],['focus','pause','sofa'],'Weiches Holz und eine feine, helle Bergamottekante.');
add('lavender','Ein leiser Ausklang',[['lavender',1]],['soft'],['pause','sleep'],'Lavendel für eine schlichte, blumige Duftatmosphäre.');
add('bergamot-mint','Grüne Gedanken',[['bergamot-mint',1]],['soft','fresh'],['focus','pause','wake'],'Bergamot Mint: weich und krautig, keine Pfefferminze.');
add('serenity','Alles darf warten',[['serenity',1]],['soft'],['sleep','sofa'],'Eine fertige, weiche Blütenmischung. Ohne weitere Zusätze.',['evening','night']);
add('balance','Unter den Wipfeln',[['balance',1]],['warm'],['pause','sofa','sleep'],'Eine fertige Mischung mit holziger Duftausrichtung.');
add('citrus-bliss','Der helle Rand',[['citrus-bliss',1]],['fresh'],['wake','pause','sofa','room'],'Eine fertige Mischung mit runder Zitrusnote.');
add('mint-lemon','Klare Linien',[['lemon',3],['peppermint',1]],['fresh'],['focus','room','wake'],'Helle Zitrone mit einer bewusst kleinen Minznote.');
add('orange-lavender','Zwischen Tag und Traum',[['wild-orange',1],['lavender',1]],['soft'],['sleep','pause','sofa'],'Weiche Orange und ein blumiger Lavendelton.');
add('lime-orange','Sonne auf der Schwelle',[['lime',1],['wild-orange',1]],['fresh'],['wake','room','pause'],'Spritzige Limette und die Wärme der Orange.');
// Five editorial compositions. Ingredient roles are documented in research/trios.md.
add('trio-citrus-resin','Helles Holz',[['lemon',1],['bergamot',1],['frankincense',1]],['fresh'],['wake','focus','room'],'Klare Zitrone, feinherbe Bergamotte und ein leiser Harzton.',['morning','day']);
add('trio-green-citrus','Grüner Morgen',[['lime',1],['grapefruit',1],['bergamot-mint',1]],['fresh'],['wake','focus','pause'],'Grüne Limette und herbe Grapefruit, weich verbunden mit Bergamot Mint.',['morning','day']);
add('trio-soft-citrus','Weiches Abendlicht',[['lavender',1],['wild-orange',1],['bergamot',1]],['soft'],['pause','sleep','sofa'],'Blumiger Lavendel, runde Orange und eine feine Bergamottekante.',['evening','night']);
add('trio-warm-resin','Warmer Holzton',[['copaiba',1],['frankincense',1],['wild-orange',1]],['warm'],['focus','pause','sleep','sofa'],'Weiche Copaiba und harziger Weihrauch, abgerundet durch Orange.');
add('trio-floral-wood','Blüten im Holz',[['lavender',1],['copaiba',1],['frankincense',1]],['soft','warm'],['pause','sleep','sofa'],'Lavendelblüten auf weichem Holz und einem feinharzigen Grund.',['evening','night']);
export const trioRecipes=recipes.filter(r=>r.id.startsWith('trio-'));
export const sources=[
 {id:'lucy-manual',title:'Stadler Form Lucy · EU-Anleitung',url:'https://www.stadlerform.com/media/c1/ce/72/1712837620/stadler-form-lucy-manual-eu.pdf',kind:'Hersteller · Gerät'},
 {id:'lucy',title:'Stadler Form Lucy · Produktseite',url:'https://www.stadlerform.com/de-de/aroma-diffuser/lucy-weiss-l-037',kind:'Hersteller · Gerät'},
 {id:'doterra-eu',title:'doTERRA · Produktübersicht Europa',url:'https://media.doterra.com/eu/de/brochures/product-guide.pdf',kind:'Hersteller · Produkte'},
 {id:'bfr',title:'BfR · Ätherische Öle: Wirkungen mit Einschränkungen',url:'https://www.bfr.bund.de/fragen-und-antworten/thema/aetherische-oele-duftende-wirkungen-mit-einschraenkungen/',kind:'Unabhängige Risikoinformation'},
 {id:'anses',title:'ANSES · Vigil’Anses, Juli 2020',url:'https://vigilanses.anses.fr/sites/default/files/VigilAnsesN11_July2020_Spray.pdf',kind:'Unabhängige Risikoinformation (Englisch)'}
];
export const defaults={schemaVersion:1, oils,recipes, device:{name:'Stadler Form Lucy · schwarz',waterMl:50,review:'pending',source:'',reviewedAt:'',notes:'50 ml und 2–3 Einstiegstropfen laut übermitteltem Projektbrief, hier nicht unabhängig bestätigt. Keine numerische Herstellerhöchstmenge belegt.',maxDrops:4,totals:{subtle:2,medium:3,strong:4}}, settings:{defaultIntensity:'medium',motion:true,season:'auto',images:true,disabledScenes:[],title:'DAZWISCHEN',tagline:'Was braucht dein Dazwischen?',intro:'Ein Raum. Ein Moment. Dein Duft.'}};
