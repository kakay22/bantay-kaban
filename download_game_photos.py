#!/usr/bin/env python3
"""Fetch openly licensed Wikimedia Commons images for the CLEAN/CORRUPTION game.
Run from the Vite project root: py -m pip install requests && py download_game_photos.py
The script downloads only CC0/Public Domain/CC BY/CC BY-SA images, appends successful
records to public/photos/photos.json, and writes attribution details to CSV.
Please visually review images; a damaged scene is not proof of corruption.
"""
import csv, html, json, re, sys, time
from pathlib import Path
import requests

ROOT = Path.cwd()
PHOTO_DIR = ROOT / 'public' / 'photos'
JSON_PATH = PHOTO_DIR / 'photos.json'
ATTR_PATH = PHOTO_DIR / 'photo-attributions.csv'
API = 'https://commons.wikimedia.org/w/api.php'
HEADERS = {'User-Agent': 'EducationalPhotoReviewGame/1.0 (Wikimedia Commons asset downloader)'}
JOBS = [
('flagged-riverbank-002','damaged-riverbank-002',True,'Philippines riverbank erosion damaged embankment'),
('flagged-flooding-002','flooded-residential-area-002',True,'Philippines residential area flood water'),
('flagged-bridge-002','bridge-structural-damage-002',True,'Philippines damaged bridge structural damage'),
('flagged-floodwall-002','floodwall-damage-002',True,'Philippines damaged flood control wall cracks'),
('flagged-floodwater-002','floodwater-road-002',True,'Philippines flooded road floodwater'),
('flagged-riverwall-003','riverwall-erosion-003',True,'Philippines river wall erosion damaged retaining wall'),
('flagged-unfinished-001','unfinished-infrastructure-001',True,'Philippines unfinished infrastructure construction'),
('flagged-river-flood-001','overflowing-river-001',True,'Philippines overflowing river flood'),
('flagged-dike-001','damaged-dike-001',True,'Philippines damaged dike embankment'),
('flagged-project-evidence-001','flood-project-evidence-001',True,'Philippines flood control project construction site'),
('clean-riverbank-002','clean-riverbank-002',False,'Philippines intact clean riverbank'),
('clean-bridge-002','clean-bridge-002',False,'Philippines intact bridge over river'),
('clean-river-002','clean-river-002',False,'Philippines river landscape'),
('clean-riprap-002','clean-riprap-002',False,'Philippines intact riprap riverbank protection'),
('clean-floodwall-001','clean-floodwall-001',False,'Philippines intact flood control wall'),
('clean-riverside-001','clean-riverside-001',False,'Philippines maintained riverside'),
('clean-road-001','clean-road-001',False,'Philippines road infrastructure normal condition'),
('clean-bridge-river-001','clean-bridge-river-001',False,'Philippines bridge and river landscape'),
('clean-river-control-001','clean-river-control-001',False,'Philippines river control structure'),
('clean-hanging-bridge-001','clean-hanging-bridge-001',False,'Philippines hanging bridge river'),
('clean-flood-control-001','clean-flood-control-001',False,'Philippines intact flood control structure'),
('clean-river-view-001','clean-river-view-001',False,'Philippines river view'),
('clean-embankment-001','clean-embankment-001',False,'Philippines intact river embankment'),
('clean-bridge-003','clean-bridge-003',False,'Philippines bridge infrastructure intact'),
('clean-riverbank-003','clean-riverbank-003',False,'Philippines clean maintained riverbank'),
]
ALLOWED = ('cc0','public domain','cc by','cc-by','cc by-sa','cc-by-sa')

def plain(x):
    if isinstance(x, dict): x = x.get('value','')
    return html.unescape(re.sub(r'<[^>]*>', '', str(x or ''))).strip()

def safe(s):
    return re.sub(r'[^A-Za-z0-9._-]+','-',s).strip('-._')[:90] or 'photo'

def search(session, query):
    params = {'action':'query','format':'json','generator':'search','gsrsearch':f'filetype:bitmap {query}',
              'gsrnamespace':6,'gsrlimit':25,'prop':'imageinfo','iiprop':'url|mime|size|extmetadata','iiurlwidth':1200}
    r = session.get(API, params=params, timeout=40); r.raise_for_status()
    pages = list(r.json().get('query',{}).get('pages',{}).values())
    return sorted(pages, key=lambda p: len(p.get('title','')))

def get_license(info):
    m = info.get('extmetadata',{})
    name, url = plain(m.get('LicenseShortName')), plain(m.get('LicenseUrl'))
    low = name.lower()
    if any(x in low for x in ALLOWED) or 'creativecommons.org/publicdomain' in url.lower():
        return name or 'Public domain', url
    return '', ''

def ext_for(mime):
    return {'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp'}.get(mime)

def download_one(session, job, seen):
    item_id, stem, flagged, query = job
    for page in search(session, query):
        title = page.get('title','')
        if not title or title in seen: continue
        infos = page.get('imageinfo') or []
        if not infos: continue
        info = infos[0]; mime = info.get('mime',''); ext = ext_for(mime)
        if not ext or info.get('size',0) > 15*1024*1024: continue
        lic, lic_url = get_license(info)
        if not lic: continue
        image_url = info.get('thumburl') or info.get('url')
        if not image_url: continue
        filename = safe(stem) + ext
        dest = PHOTO_DIR / filename
        if dest.exists(): filename = safe(stem) + '-commons' + ext; dest = PHOTO_DIR / filename
        try:
            with session.get(image_url, stream=True, timeout=60) as r:
                r.raise_for_status()
                ct = r.headers.get('Content-Type','').split(';')[0].lower()
                if ct not in ('image/jpeg','image/png','image/webp'): continue
                total = 0
                with dest.open('wb') as f:
                    for chunk in r.iter_content(65536):
                        if not chunk: continue
                        total += len(chunk)
                        if total > 15*1024*1024: raise ValueError('image exceeds 15 MB')
                        f.write(chunk)
            if dest.stat().st_size < 5000: dest.unlink(missing_ok=True); continue
        except Exception:
            dest.unlink(missing_ok=True); continue
        seen.add(title)
        page_url = 'https://commons.wikimedia.org/wiki/' + title.replace(' ','_')
        meta = info.get('extmetadata',{})
        record = {'id':item_id,'file':filename,'category':'INVESTIGATION_PHOTO' if flagged else 'CLEAN_SCENE',
          'irregular':flagged,'caption':plain(meta.get('ImageDescription'))[:160] or title.removeprefix('File:'),
          'why':('Review this scene for possible damage or warning signs. The photograph alone does not prove corruption.' if flagged else 'No obvious damage is established by this image; inspect the scene carefully.'),
          'tags':['Philippines','photo-review','investigation' if flagged else 'clean-scene'],
          'source':page_url,'sourceVerified':True}
        attribution = {'id':item_id,'file':filename,'title':title,'author':plain(meta.get('Artist')) or plain(meta.get('Credit')) or 'Not listed',
          'license':lic,'license_url':lic_url,'source_page':page_url}
        return record, attribution
    return None

def main():
    if not (ROOT/'public').is_dir():
        sys.exit('ERROR: Run this from the Vite project root (the folder containing public/).')
    if not JSON_PATH.exists():
        sys.exit(f'ERROR: Cannot find {JSON_PATH}. Put your existing photos.json there first.')
    PHOTO_DIR.mkdir(parents=True,exist_ok=True)
    try:
        existing=json.loads(JSON_PATH.read_text(encoding='utf-8'))
        if not isinstance(existing,list): raise ValueError('expected a JSON array')
    except Exception as e: sys.exit(f'ERROR reading photos.json: {e}')
    s=requests.Session(); s.headers.update(HEADERS); seen=set(); fetched=[]
    for n,job in enumerate(JOBS,1):
        print(f'[{n}/{len(JOBS)}] Searching: {job[3]}')
        try: result=download_one(s,job,seen)
        except Exception as e: print('  Search error:',e); result=None
        if result:
            rec,attr=result; fetched.append((rec,attr)); print('  Saved public/photos/'+rec['file']+' — '+attr['license'])
        else: print('  No suitable openly licensed result found; skipped.')
        time.sleep(0.5)
    if not fetched:
        sys.exit('No images downloaded. Check internet access and try again.')
    indices={x.get('id'):i for i,x in enumerate(existing) if isinstance(x,dict)}
    for rec,_ in fetched:
        if rec['id'] in indices: existing[indices[rec['id']]]=rec
        else: existing.append(rec)
    JSON_PATH.write_text(json.dumps(existing,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    with ATTR_PATH.open('w',newline='',encoding='utf-8-sig') as f:
        w=csv.DictWriter(f,fieldnames=['id','file','title','author','license','license_url','source_page']); w.writeheader(); w.writerows(a for _,a in fetched)
    print(f'\nDone: downloaded {len(fetched)} of {len(JOBS)} requested photos.')
    print(f'Updated {JSON_PATH} and wrote {ATTR_PATH}.')
    print('Please inspect each image and confirm its classification before using it in the game.')

if __name__=='__main__': main()
