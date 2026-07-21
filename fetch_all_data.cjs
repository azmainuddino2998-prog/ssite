const fs = require('fs');

async function fetchData(entityName) {
  const appId = "6a5e0623b671b808e3a154f8";
  const url = `https://holistic-kozzak-style-flow.base44.app/api/apps/${appId}/entities/${entityName}`;
  console.log(`Fetching ${entityName} from ${url}...`);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    fs.writeFileSync(`${entityName}.json`, JSON.stringify(data, null, 2));
    console.log(`Saved ${data.length || 0} records to ${entityName}.json`);
  } catch (err) {
    console.error(`Failed to fetch ${entityName}:`, err);
  }
}

async function run() {
  await fetchData("Product");
  await fetchData("Category");
  await fetchData("SiteSettings");
}

run();
