"""Exercise protected feedback management against a real local/hosted Worker."""
import argparse
import json
import os
import uuid
from datetime import datetime, timezone
from poc_http import request

p = argparse.ArgumentParser()
p.add_argument('--base', default='http://127.0.0.1:8791')
args = p.parse_args()
headers = {'X-Admin-Token': os.environ['LONKLAR_TEST_ADMIN_TOKEN']}
checks = []


def call(path, payload=None, expected=200, auth=True):
    response = request(args.base, path, payload, headers if auth else {})
    assert response['status'] == expected, (path, response['status'], response['body'][:300])
    checks.append({'path': path, 'status': response['status']})
    return response


def data(path, payload=None, expected=200, auth=True):
    return json.loads(call(path, payload, expected, auth)['body'])


assert request(args.base, '/api/admin/feedback', headers={'X-Admin-Token': 'wrong'})['status'] == 401
data('/api/admin/feedback', expected=401, auth=False)
data('/api/admin/feedback?limit=101', expected=422)
marker = str(uuid.uuid4())
timestamp = datetime.now(timezone.utc).isoformat()
report_id = str(uuid.uuid4())
records = [
    {'kind': 'feedback', 'record': {'type': 'general', 'message': 'SYNTHETIC managed ' + marker, 'timestamp': timestamp}},
    {'kind': 'votes', 'record': {'vote': 'up', 'service_type': 'student', 'estimated_net': 123, 'timestamp': timestamp}},
    {'kind': 'accuracy_reports', 'record': {'report_id': report_id, 'service_type': 'fulltime', 'estimated_net_monthly': 100,
                                         'actual_net_monthly': 101, 'inputs': {'fixture': marker}, 'timestamp': timestamp}},
]
assert data('/api/admin/feedback/import', {'records': records})['inserted'] == 3
assert data('/api/admin/feedback/import', {'records': records})['duplicates'] == 3
listing = data('/api/admin/feedback?kind=feedback&limit=1')
assert len(listing['records']) == 1
row = listing['records'][0]
assert marker in row['record']['message']
record_id = row['id']
assert data('/api/admin/feedback')['retention'] == 'no_automatic_expiry'
data(f'/api/admin/feedback/{record_id}/archive', {'archived': True})
assert all(r['id'] != record_id for r in data('/api/admin/feedback?kind=feedback')['records'])
assert any(r['id'] == record_id for r in data('/api/admin/feedback?kind=feedback&archived=true')['records'])
data(f'/api/admin/feedback/{record_id}/archive', {'archived': False})
assert any(r['id'] == record_id for r in data('/api/admin/feedback?kind=feedback')['records'])
# A conflicting report must roll back the entire batch, including preceding rows.
conflict = [
    {'kind': 'feedback', 'record': {'type': 'general', 'message': 'SYNTHETIC MUST ROLLBACK ' + marker, 'timestamp': timestamp}},
    {**records[2], 'record': {**records[2]['record'], 'actual_net_monthly': 999}},
]
data('/api/admin/feedback/import', {'records': conflict}, 409)
export = call('/api/admin/feedback/export')
rows = [json.loads(line) for line in export['body'].splitlines()]
assert not any(r['record'].get('message') == 'SYNTHETIC MUST ROLLBACK ' + marker for r in rows)
assert sum(r['record'].get('report_id') == report_id for r in rows) == 1
assert any(r['id'] == record_id and r['archived_at'] is None for r in rows)
# Exports round-trip idempotently, including records originally collected publicly.
for start in range(0, len(rows), 10):
    assert data('/api/admin/feedback/import', {'records': rows[start:start+10]})['inserted'] == 0
data('/api/admin/feedback/import', {'records': [{'kind': 'feedback', 'record': {'type': 'general', 'message': 'bad', 'timestamp': 42}}]}, 422)
data('/api/admin/feedback/2147483647/archive', {'archived': True}, 404)
first = data('/api/admin/feedback?limit=1')
assert first['pagination']['next_before']
second = data('/api/admin/feedback?limit=1&before=' + str(first['pagination']['next_before']))
assert second['records'][0]['id'] < first['records'][0]['id']
print(json.dumps({'passed': True, 'checks': len(checks), 'marker': marker, 'record_id': record_id,
                  'report_id': report_id, 'retention': 'no_automatic_expiry'}))
