"""Original local vector landscapes, deterministic and free of external assets."""
from pathlib import Path
import math,random,json
out=Path(__file__).resolve().parents[1]/'public/assets'
palettes={
'spring':('#e4e6d4','#b8c4ae','#718d79','#3e655b','#d6c49b'),
'summer':('#e9dec0','#aebda0','#6e8b72','#355d52','#d4b27b'),
'autumn':('#e7d6b9','#bdba9b','#879478','#485e4e','#b78655'),
'winter':('#e0e5e2','#b7c8c7','#879e9b','#526f6b','#c5cfd0')}
for season,p in palettes.items():
 for phase in ['morning','day','evening']:
  for variant in range(2):
   rnd=random.Random(season+phase+str(variant));sky,far,mid,dark,accent=p
   if phase=='evening': sky,far,mid,dark,accent=('#b9b4a3','#8d9587','#5a7167','#304c43','#d5a975')
   horizon=570+variant*65
   shapes=[]
   for layer,color,y in [(0,far,horizon-100),(1,mid,horizon),(2,dark,horizon+140)]:
    pts=[(-100,y+100)]
    for x in range(-100,1500,80):pts.append((x,y+math.sin(x/230+layer*1.8+variant)*75+rnd.uniform(-18,18)))
    d='M '+' L '.join(f'{x:.0f},{v:.0f}' for x,v in pts)+' L 1500,1800 L -100,1800 Z'
    shapes.append(f'<path d="{d}" fill="{color}" opacity="{.55 if layer<2 else .9}"/>')
   trees=[]
   for i in range(40):
    x=rnd.randrange(-90,1490);y=rnd.randrange(780,1500);h=rnd.randrange(70,250);w=h*.2
    color=dark if season!='winter' else '#47635e'
    trees.append(f'<path d="M{x},{y-h} l{-w},{h*.66} h{w*.5} l{-w*.95},{h*.34} h{w*2.9} l{-w*.95},{-h*.34} h{w*.5} Z" fill="{color}" opacity="{rnd.uniform(.15,.65):.2f}"/>')
   sun='<circle cx="900" cy="350" r="70" fill="#f4e5be" opacity=".72"/>' if phase!='evening' else '<circle cx="950" cy="290" r="40" fill="#f3e9cd" opacity=".8"/>'
   snow=''.join(f'<path d="M{x},930 Q{x+110},900 {x+230},960" fill="none" stroke="#e7efea" stroke-width="35" opacity=".5"/>' for x in range(-50,1400,210)) if season=='winter' else ''
   svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 1800"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="{sky}"/><stop offset="1" stop-color="{accent}"/></linearGradient><linearGradient id="mist" x2="0" y2="1"><stop stop-color="{sky}" stop-opacity="0"/><stop offset=".5" stop-color="{sky}" stop-opacity=".5"/><stop offset="1" stop-color="{sky}" stop-opacity="0"/></linearGradient><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".07"/></feComponentTransfer><feBlend in="SourceGraphic" mode="multiply"/></filter></defs><g filter="url(#grain)"><path fill="url(#sky)" d="M0 0h1400v1800H0z"/>{sun}{''.join(shapes[:2])}<path fill="url(#mist)" d="M0 350h1400v600H0z"/>{shapes[2]}{''.join(trees)}{snow}<path fill="url(#mist)" d="M0 800h1400v850H0z"/><path d="M-50 1610 Q400 1310 730 1490 T1450 1370 V1800H0Z" fill="{dark}" opacity=".4"/></g></svg>'''
   (out/f'{season}-{phase}-{variant}.svg').write_text(svg)
(out/'mark.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="18" fill="#29483e"/><path d="M40 13v37M40 30C18 16 12 51 33 49c12-1 10-18 1-20" stroke="#f2efe7" stroke-width="3" fill="none"/><circle cx="49" cy="47" r="3" fill="#c4a470"/></svg>')
(out/'credits.json').write_text(json.dumps({'landscapes':{'creator':'Für DAZWISCHEN eigens erstellte Vektorillustrationen','files':'*-morning-*.svg, *-day-*.svg, *-evening-*.svg','license':'Projektbestand; keine fremden Bildrechte','note':'Atmosphärische Illustrationen, keine Wetterdaten und keine Herstelleraufnahmen. Kein Video im Projekt.'},'typefaces':'Systemschriften: Georgia und Helvetica/Arial; keine externen Fontanfragen.'},ensure_ascii=False,indent=2))
