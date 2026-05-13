import json, re, zipfile, xml.etree.ElementTree as ET
from pathlib import Path

XLSX_PATH = Path('data/FY26_US_COMPLETE_PRICING_GUIDE.xlsx')
OUT_PATH = Path('data/architecturalLettersPricingTables.json')
CATALOG_DIR = Path('data/Gemini_Catalog')

MAIN_NS = {'a':'http://schemas.openxmlformats.org/spreadsheetml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
REL_NS = {'r':'http://schemas.openxmlformats.org/package/2006/relationships'}

ARCH_PATTERNS = [
  'flat cut', 'cast metal', 'fab ', 'acrylic', 'pvc', 'formed plastic', 'face lit', 'halo', 'precision plaques', 'cast plaques', 'etched', 'plaque', 'freight'
]

def col_to_idx(col):
  n=0
  for ch in col:
    n=n*26+(ord(ch)-64)
  return n-1

def parse_shared_strings(z):
  if 'xl/sharedStrings.xml' not in z.namelist(): return []
  root=ET.fromstring(z.read('xl/sharedStrings.xml'))
  out=[]
  for si in root.findall('a:si', MAIN_NS):
    txt=''.join(t.text or '' for t in si.findall('.//a:t', MAIN_NS))
    out.append(txt)
  return out

def parse_sheet(xml_bytes, shared):
  root=ET.fromstring(xml_bytes)
  rows=[]
  for row in root.findall('.//a:sheetData/a:row', MAIN_NS):
    vals={}
    for c in row.findall('a:c', MAIN_NS):
      ref=c.attrib.get('r','A1')
      m=re.match(r'([A-Z]+)', ref)
      if not m: continue
      idx=col_to_idx(m.group(1))
      t=c.attrib.get('t')
      v=c.find('a:v', MAIN_NS)
      if v is None or v.text is None:
        continue
      raw=v.text
      if t=='s':
        val=shared[int(raw)] if raw.isdigit() and int(raw)<len(shared) else raw
      else:
        val=raw
      vals[idx]=val
    if vals:
      max_idx=max(vals)
      arr=['']*(max_idx+1)
      for i,v in vals.items(): arr[i]=v
      rows.append(arr)
  return rows

def normalize(s):
  return re.sub(r'\s+',' ', str(s or '').strip())

def main():
  z=zipfile.ZipFile(XLSX_PATH)
  shared=parse_shared_strings(z)
  wb=ET.fromstring(z.read('xl/workbook.xml'))
  rels=ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
  relmap={r.attrib['Id']:r.attrib['Target'] for r in rels.findall('r:Relationship', REL_NS)}

  sheets=[]
  for s in wb.find('a:sheets', MAIN_NS):
    name=s.attrib['name']
    key=name.lower()
    if not any(p in key for p in ARCH_PATTERNS):
      continue
    rid=s.attrib['{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id']
    target='xl/'+relmap[rid].lstrip('/')
    rows=parse_sheet(z.read(target), shared)
    if not rows:
      continue
    header_idx=0
    best=-1
    for i,r in enumerate(rows[:30]):
      populated=sum(1 for c in r if normalize(c))
      if populated>best:
        best=populated; header_idx=i
    headers=[normalize(c) or f'column_{i+1}' for i,c in enumerate(rows[header_idx])]
    records=[]
    for r in rows[header_idx+1:]:
      rec={}
      for i,h in enumerate(headers):
        if i<len(r) and normalize(r[i]): rec[h]=normalize(r[i])
      if rec: records.append(rec)
    sheets.append({'sheetName':name,'headers':headers,'records':records,'rowCount':len(records)})

  catalog=[p.name for p in sorted(CATALOG_DIR.glob('*.jpg'))]
  payload={'sourceFile':str(XLSX_PATH),'catalogReference':{'directory':str(CATALOG_DIR),'pages':catalog},'sheets':sheets}
  OUT_PATH.write_text(json.dumps(payload, indent=2))
  print(f'wrote {OUT_PATH} with {len(sheets)} sheets')

if __name__=='__main__': main()
