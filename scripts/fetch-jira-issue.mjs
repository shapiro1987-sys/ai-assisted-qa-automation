import 'dotenv/config';

const base = process.env.ATLASSIAN_BASE_URL?.replace(/\/$/, '');
const email = process.env.ATLASSIAN_EMAIL;
const token = process.env.ATLASSIAN_API_TOKEN;

if (!base || !email || !token) {
  console.error('Missing ATLASSIAN_BASE_URL, ATLASSIAN_EMAIL, or ATLASSIAN_API_TOKEN');
  process.exit(1);
}

const auth = `Basic ${Buffer.from(`${email}:${token}`).toString('base64')}`;
const headers = {
  Authorization: auth,
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

function adfToText(node) {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (node.type === 'text') return node.text ?? '';
  if (node.type === 'hardBreak') return '\n';
  const inner = (node.content ?? []).map(adfToText).join('');
  if (node.type === 'paragraph' || node.type === 'heading') return `${inner}\n`;
  return inner;
}

async function searchJql(jql) {
  const res = await fetch(`${base}/rest/api/3/search/jql`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      jql,
      fields: ['summary', 'status', 'issuetype', 'description', 'created', 'updated'],
      maxResults: 25,
    }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${text}`);
  return JSON.parse(text);
}

async function getIssue(key) {
  const res = await fetch(`${base}/rest/api/3/issue/${encodeURIComponent(key)}`, { headers });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${text}`);
  return JSON.parse(text);
}

function formatIssue(issue) {
  const f = issue.fields;
  const desc = f.description;
  const description =
    typeof desc === 'string' ? desc : adfToText(desc).trim();
  return {
    key: issue.key,
    id: issue.id,
    url: `${base}/browse/${issue.key}`,
    summary: f.summary,
    status: f.status?.name,
    issueType: f.issuetype?.name,
    created: f.created,
    updated: f.updated,
    description,
  };
}

const issueKey = process.argv[2] ?? 'DS-1';

try {
  const issue = formatIssue(await getIssue(issueKey));
  console.log(JSON.stringify(issue, null, 2));
} catch (err) {
  console.error(`Could not load ${issueKey}:`, err.message);

  const meRes = await fetch(`${base}/rest/api/3/myself`, { headers });
  if (meRes.ok) {
    const me = await meRes.json();
    console.error(`\nAuthenticated as: ${me.displayName} (${me.emailAddress})`);
  } else {
    console.error('\nCould not verify identity:', meRes.status, await meRes.text());
  }

  const projRes = await fetch(`${base}/rest/api/3/project/search?maxResults=50`, { headers });
  if (projRes.ok) {
    const data = await projRes.json();
    console.error('\nAccessible projects:');
    for (const p of data.values ?? []) {
      console.error(`  ${p.key} — ${p.name}`);
    }
  }

  console.error('\nSearching project DS for related issues...\n');
  const queries = [
    'project = DS ORDER BY key ASC',
    'project = DS AND summary ~ "program"',
    'text ~ "DS-1"',
  ];
  for (const jql of queries) {
    try {
      const result = await searchJql(jql);
      const issues = result.issues ?? [];
      console.log(`JQL: ${jql} (${issues.length} shown)`);
      for (const i of issues) {
        console.log(`  ${i.key} | ${i.fields.status?.name} | ${i.fields.summary}`);
      }
      console.log('');
    } catch (e) {
      console.log(`JQL failed (${jql}): ${e.message}\n`);
    }
  }
  process.exit(1);
}
