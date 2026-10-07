#!/usr/bin/env python3
"""Assemble src/ into one self-contained app/index.html (only Chart.js, D3 and JSZip stay on a CDN)."""
import os
here=os.path.dirname(os.path.abspath(__file__))
rd=lambda p:open(os.path.join(here,'src',p),encoding='utf-8').read()
import re
def logo_svg():
    s=open(os.path.join(here,'logo','network-atlas-lockup-transparent.svg'),encoding='utf-8').read()
    m={'#062a30':'var(--green)','#cca300':'var(--gold)','#ed4319':'var(--red)','#8b8d92':'var(--grey)'}
    def tag(t):
        st=[]
        def a(mm):
            v=m.get(mm.group(2).lower())
            if v: st.append('%s:%s'%(mm.group(1),v)); return ''
            return mm.group(0)
        t=re.sub(r'\b(fill|stroke)="(#[0-9a-fA-F]{6})"',a,t)
        if st:
            t=re.sub(r'(\s*/?>)$',' style="%s"\\1'%';'.join(st),t,1)
        return t
    s=re.sub(r'<(?:circle|line|path|ellipse)\b[^>]*>',lambda mm:tag(mm.group(0)),s)
    s=re.sub(r'viewBox="[^"]*" width="[^"]*" height="[^"]*"','viewBox="38 30 780 146" class="logo-svg" focusable="false"',s,1)
    return s
LOGO=logo_svg()
import urllib.parse
_fav=open(os.path.join(here,'logo','network-atlas-dark.svg'),encoding='utf-8').read().replace('\n','')
FAV='<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%s">\n<link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png">\n<link rel="apple-touch-icon" href="apple-touch-icon.png">'%urllib.parse.quote(_fav,safe="/:=' ")
shell=rd('shell.html').replace('/*@LOGO*/',LOGO).replace('<!--@FAVICON-->',FAV)
order=['lib/csv.js','lib/data.js','lib/analysis.js','lib/style.js','lib/sample.js','lib/recs.js','lib/render.js','lib/cards.js','app.js']
scripts='\n'.join('<script id="src-%s">\n%s\n</script>'%(p.replace('/','-').replace('.js',''),rd(p)) for p in order)
for p in order: assert '</script' not in rd(p).lower(), p
out=shell.replace('/*@CSS*/',rd('app.css')).replace('/*@SCRIPTS*/',scripts)
open(os.path.join(here,'index.html'),'w',encoding='utf-8').write(out)
print('built index.html',len(out),'bytes')

about=rd('about.html').replace('/*@LOGO*/',LOGO).replace('<!--@FAVICON-->',FAV).replace('/*@CSS*/',rd('app.css'))
open(os.path.join(here,'about.html'),'w',encoding='utf-8').write(about)
print('built about.html',len(about),'bytes')

