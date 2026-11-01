"""Regenerate framework-neutral input schemas and reference metadata. No network."""
import inspect
import json
import sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT))
from api import models
from api.routers.meta import get_meta
output=ROOT/'workers_ts'/'src'
schemas={name:cls.model_json_schema() for name,cls in vars(models).items()
         if inspect.isclass(cls) and issubclass(cls,models.BaseModel) and cls is not models.BaseModel}
(output/'schemas.ts').write_text('// Generated from api/models.py; regenerate with scripts/generate_contract.py.\nexport const schemas: Record<string, any> = '+json.dumps(schemas,ensure_ascii=False,indent=2)+';\n')
metadata=get_meta()
metadata['data_freshness']['site_updated_at']=None
(output/'meta.ts').write_text('// Generated from api/routers/meta.py; excludes deployment-specific timestamp.\nconst metadata = '+json.dumps(metadata,ensure_ascii=False,indent=2)+';\nexport function getMeta(updatedAt?:string) { return {...metadata, data_freshness: {...metadata.data_freshness, site_updated_at:updatedAt || null}}; }\n')
