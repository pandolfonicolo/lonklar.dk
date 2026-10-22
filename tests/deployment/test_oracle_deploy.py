"""Exercise the release script against a fake host; never contact production."""
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[2] / 'scripts/deploy-oracle.sh'
SHA = 'a' * 40
MOCK = r'''#!/usr/bin/env python3
import json, os, pathlib, sys
root=pathlib.Path(os.environ['FAKE_HOST'])
state=json.loads((root/'state.json').read_text())
name=pathlib.Path(sys.argv[0]).name
args=sys.argv[1:]
if name=='sudo': name,args=args[0],args[1:]
state['calls'].append([name]+args)
code=0
if name=='git':
 if args[0]=='status': print(os.environ.get('FAKE_DIRTY',''))
 else: print(os.environ.get('FAKE_HEAD', 'a'*40) if args[0]=='rev-parse' else '2026-10-22T12:00:00Z')
elif name=='install': state['env']=''
elif name=='tee': state['env']=sys.stdin.read()
elif name=='sleep': pass
elif name=='curl': code=22 if os.environ.get('FAIL_HEALTH') and args[-1].endswith('/api/meta') else 0
elif name=='docker':
 command=args[0]; containers=state['containers']
 if command=='build': code=1 if os.environ.get('FAIL_BUILD') else 0
 elif command=='inspect': code=0 if args[1] in containers else 1
 elif command=='rename': containers[args[2]]=containers.pop(args[1])
 elif command=='stop': containers[args[1]]['running']=False
 elif command=='start': containers[args[1]]['running']=True
 elif command=='rm': containers.pop(args[-1],None)
 elif command=='run':
  if os.environ.get('FAIL_RUN'): code=1
  else: containers['lonklar']={'image':args[-1], 'running':True, 'options':args}
 else: raise RuntimeError('Unexpected Docker operation: '+command)
else: raise RuntimeError('Unexpected operation: '+name)
(root/'state.json').write_text(json.dumps(state))
sys.exit(code)
'''

class OracleReleaseTests(unittest.TestCase):
    def release(self, overrides=None, previous=True, revision=SHA):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            executable = root / 'mock'
            executable.write_text(MOCK)
            executable.chmod(0o755)
            for name in ['git', 'sudo', 'curl', 'sleep']:
                (root/name).symlink_to(executable)
            original = {'image':'old-image', 'running':True, 'options':['original-settings']}
            state = {'containers':{'lonklar':original} if previous else {}, 'calls':[], 'env':'old-env'}
            (root/'state.json').write_text(json.dumps(state))
            env = {**os.environ, 'PATH':str(root)+os.pathsep+os.environ['PATH'],
                   'FAKE_HOST':str(root), 'ADMIN_TOKEN':"dummy'$(do-not-evaluate)\""}
            env.update(overrides or {})
            result = subprocess.run(['bash', str(SCRIPT), revision], env=env,
                                    capture_output=True, text=True, timeout=30)
            return result, json.loads((root/'state.json').read_text()), original

    def test_success_publishes_requested_revision_and_preserves_feedback_mount(self):
        result, state, _ = self.release()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(list(state['containers']), ['lonklar'])
        container=state['containers']['lonklar']
        self.assertEqual(container['image'], 'lonklar:'+SHA)
        self.assertIn('/opt/lonklar-data/feedback:/app/feedback_data', container['options'])
        self.assertIn('/opt/lonklar-data/server.env', container['options'])
        self.assertEqual(state['env'], 'ADMIN_TOKEN=dummy\'$(do-not-evaluate)"\n')
        self.assertNotIn('dummy', result.stdout+result.stderr)

    def test_build_failure_keeps_running_container_and_existing_env(self):
        result,state,original=self.release({'FAIL_BUILD':'1'})
        self.assertNotEqual(result.returncode,0)
        self.assertEqual(state['containers'],{'lonklar':original})
        self.assertEqual(state['env'],'old-env')

    def test_failed_api_health_restores_original_container_configuration(self):
        result,state,original=self.release({'FAIL_HEALTH':'1'})
        self.assertNotEqual(result.returncode,0)
        self.assertEqual(state['containers'],{'lonklar':original})
        self.assertIn('restored',result.stderr)

    def test_failed_container_start_restores_original_container(self):
        result,state,original=self.release({'FAIL_RUN':'1'})
        self.assertNotEqual(result.returncode,0)
        self.assertEqual(state['containers'],{'lonklar':original})

    def test_first_release_failure_removes_failed_container(self):
        result,state,_=self.release({'FAIL_HEALTH':'1'},previous=False)
        self.assertNotEqual(result.returncode,0)
        self.assertEqual(state['containers'],{})

    def test_mismatched_checkout_cannot_build_or_stop_production(self):
        result,state,original=self.release({'FAKE_HEAD':'b'*40})
        self.assertNotEqual(result.returncode,0)
        self.assertEqual(state['containers'],{'lonklar':original})
        self.assertFalse(any(call[0]=='docker' for call in state['calls']))

    def test_unpublished_server_changes_cannot_be_built(self):
        result,state,original=self.release({'FAKE_DIRTY':' M api/main.py'})
        self.assertNotEqual(result.returncode,0)
        self.assertEqual(state['containers'],{'lonklar':original})
        self.assertFalse(any(call[0]=='docker' for call in state['calls']))

    def test_invalid_revision_and_missing_or_multiline_secret_fail_before_mutation(self):
        cases=[({},'main'),({'ADMIN_TOKEN':''},SHA),({'ADMIN_TOKEN':'two\nlines'},SHA)]
        for env,revision in cases:
            with self.subTest(env=env,revision=revision):
                result,state,original=self.release(env,revision=revision)
                self.assertNotEqual(result.returncode,0)
                self.assertEqual(state['containers'],{'lonklar':original})
                self.assertEqual(state['env'],'old-env')
                self.assertFalse(any(call[0]=='docker' for call in state['calls']))

if __name__ == '__main__': unittest.main()
