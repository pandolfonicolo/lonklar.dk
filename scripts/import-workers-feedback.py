"""Validate legacy JSONL or an admin export; write only with --apply to the proof."""
import argparse
import hashlib
import json
import os
import sys
from datetime import datetime
from pathlib import Path

root=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(root));sys.path.insert(0,str(root/'workers_poc/src'))
from storage import normalize
from poc_http import request

p=argparse.ArgumentParser()
p.add_argument('files',nargs='+',type=Path)
p.add_argument('--apply',action='store_true')
p.add_argument('--token-file',type=Path)
p.add_argument('--base',default='https://lonklar-python-poc.nicolo-pandolfo.workers.dev')
args=p.parse_args()
assert args.base in ('http://127.0.0.1:8791','https://lonklar-python-poc.nicolo-pandolfo.workers.dev')

def records():
    for file in args.files:
        fallback=next((kind for kind in ('accuracy_reports','feedback','votes') if file.name.startswith(kind+'_')),None)
        with file.open() as source:
            for number,line in enumerate(source,1):
                if not line.strip():continue
                try:
                    item=json.loads(line)
                    if 'kind' not in item:item={'kind':fallback,'record':item}
                    if item['kind'] not in ('feedback','accuracy_reports','votes'):raise ValueError('Unrecognized kind or filename')
                    normalize(item['kind'],item['record'])
                    if datetime.fromisoformat(item['record']['timestamp']).tzinfo is None:raise ValueError('Timezone required')
                    if item.get('archived_at') and datetime.fromisoformat(item['archived_at']).tzinfo is None:raise ValueError('Archive timezone required')
                    # Do not carry database IDs across environments.
                    item={key:item[key] for key in ('kind','record','archived_at') if key in item}
                    if len(json.dumps({'records':[item]}).encode())>60000:raise ValueError('Record exceeds import body budget')
                except Exception as error:
                    raise SystemExit(f'{file.name}:{number}: invalid record ({type(error).__name__}); no payload logged') from error
                yield item

count=sum(1 for _ in records()) # Validate the complete source before the first write.
manifest=[{'file':file.name,'sha256':hashlib.sha256(file.read_bytes()).hexdigest()} for file in args.files]
if not args.apply:
    print(json.dumps({'mode':'dry_run','valid_records':count,'files':manifest,'writes':0}));raise SystemExit(0)
token=os.environ.get('LONKLAR_TEST_ADMIN_TOKEN','')
if args.token_file:
    if args.token_file.stat().st_mode & 0o077:raise SystemExit('Token file must have mode 0600')
    token=args.token_file.read_text().strip()
if len(token)<32:raise SystemExit('Use a protected --token-file or LONKLAR_TEST_ADMIN_TOKEN')
inserted=duplicates=0
batch=[]
def send():
    global inserted,duplicates
    response=request(args.base,'/api/admin/feedback/import',{'records':batch},{'X-Admin-Token':token})
    if response['status']!=200:raise SystemExit(f'Import stopped with HTTP {response["status"]}; earlier batches may be committed. Fix the source and retry: committed records are deduplicated.')
    result=json.loads(response['body']);inserted+=result['inserted'];duplicates+=result['duplicates']
for item in records():
    if batch and (len(batch)>=10 or len(json.dumps({'records':batch+[item]}).encode())>60000):send();batch=[]
    batch.append(item)
if batch:send()
print(json.dumps({'mode':'applied_to_isolated_proof','validated':count,'inserted':inserted,'duplicates':duplicates,'files':manifest}))
