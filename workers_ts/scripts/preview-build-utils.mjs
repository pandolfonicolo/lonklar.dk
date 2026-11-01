export function previewConfig(databaseId) {
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(databaseId??'')) throw new Error('PREVIEW_D1_DATABASE_ID must identify the NEW empty preview database');
  if(databaseId.toLowerCase()==='891c9b79-dc3e-4b65-be50-b2233ecdb80b') throw new Error('Existing Python PoC database is forbidden');
  return {
    name:'lonklar-native-ts-preview', main:'src/index.ts', compatibility_date:'2026-10-01',
    workers_dev:true, preview_urls:false,
    assets:{directory:'./public',binding:'ASSETS',not_found_handling:'single-page-application',run_worker_first:true},
    vars:{PREVIEW_MODE:'true',ALLOWED_ORIGINS:''},
    d1_databases:[{binding:'FEEDBACK_DB',database_name:'lonklar-native-ts-preview',database_id:databaseId,migrations_dir:'./migrations'}],
    ratelimits:[{name:'VOTE_STATS_LIMITER',namespace_id:'130001',simple:{limit:60,period:60}}],
    // No routes, cron, admin token, production analytics, or paid-service bindings.
  };
}
export function isolateHtml(html) {
  html=html.replace(/<script\b[^>]*src=["']https:\/\/analytics\.lonklar\.dk\/[^"']*["'][^>]*>\s*<\/script>/gi,'');
  html=html.replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi,'');
  html=html.replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi,'');
  html=html.replace(/<meta\b[^>]*(?:property=["']og:[^"']*["']|name=["']twitter:[^"']*["'])[^>]*>/gi,'');
  html=html.replace('</head>','<meta name="robots" content="noindex,nofollow,noarchive" /></head>');
  html=html.replace(/<body([^>]*)>/i,'<body$1><aside role="note" style="padding:12px;text-align:center;background:#fff3cd;color:#332701;font:600 14px system-ui">LønKlar test preview — synthetic data only. Not the live service. Feedback stays in a separate test database.</aside>');
  if(/analytics\.lonklar\.dk\/script|data-website-id/i.test(html))throw new Error('Production analytics remains in preview');
  return html;
}
