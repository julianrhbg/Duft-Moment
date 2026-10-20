import pathlib,json,base64,re
root=pathlib.Path(__file__).resolve().parent.parent
parts=[]
for name in ['public/engine.mjs','public/validate.mjs','src/catalog.mjs']:
 s=(root/name).read_text()
 s=re.sub(r"^import .*?;\n",'',s,flags=re.M)
 s=re.sub(r"^export \{[^}]+\};\n",'',s,flags=re.M)
 parts.append(s.replace('export ',''))
assets={}
types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.json':'application/json; charset=utf-8','.webp':'image/webp'}
for path in (root/'public').rglob('*'):
 if path.is_file():
  url='/'+str(path.relative_to(root/'public'))
  assets[url]={'type':types[path.suffix],'content':base64.b64encode(path.read_bytes()).decode()}
assets['/']=assets.pop('/index.html')
parts.append('const HOST_ASSETS='+json.dumps(assets)+';')
parts.append('const LEGACY_DEFAULTS='+(root/'hosting/legacy-defaults.json').read_text()+';')
parts.append((root/'hosting/server.mjs').read_text())
(root/'worker/index.js').write_text('\n'.join(parts))
print('Hosted GitHub application assembled:',(root/'worker/index.js').stat().st_size,'bytes')
