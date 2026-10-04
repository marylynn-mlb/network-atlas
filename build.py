#!/usr/bin/env python3
"""Assemble src/ into one self-contained app/index.html (only Chart.js, D3 and JSZip stay on a CDN)."""
import os
here=os.path.dirname(os.path.abspath(__file__))
rd=lambda p:open(os.path.join(here,'src',p),encoding='utf-8').read()
shell=rd('shell.html')
order=['lib/csv.js','lib/data.js','lib/analysis.js','lib/style.js','lib/sample.js','lib/recs.js','lib/render.js','lib/cards.js','app.js']
scripts='\n'.join('<script id="src-%s">\n%s\n</script>'%(p.replace('/','-').replace('.js',''),rd(p)) for p in order)
for p in order: assert '</script' not in rd(p).lower(), p
out=shell.replace('/*@CSS*/',rd('app.css')).replace('/*@SCRIPTS*/',scripts)
open(os.path.join(here,'index.html'),'w',encoding='utf-8').write(out)
print('built index.html',len(out),'bytes')
