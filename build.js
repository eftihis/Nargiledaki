const fs = require('fs');
const path = require('path');

const PROJECT_ID = 'hfmr6n6v';
const DATASET = 'production';
const API_VERSION = '2023-05-03';

const FLAVOURS_QUERY = `
*[_type == "flavour"] | order(order asc) {
  _id,
  name,
  description,
  price,
  smokingTime,
  colour,
  textColor,
  order,
  "imageUrl": image.asset->url,
  "imageAlt": image.alt,
  slug,
  tags[]-> {
    title,
    "iconUrl": icon.asset->url
  }
}
`.trim();

async function main() {
  const url = `https://${PROJECT_ID}.apicdn.sanity.io/v${API_VERSION}/data/query/${DATASET}?query=${encodeURIComponent(FLAVOURS_QUERY)}`;

  console.log('Fetching flavours from Sanity...');
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Sanity API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const flavours = data.result || [];

  console.log(`Fetched ${flavours.length} flavours`);

  const outputDir = path.join(__dirname, 'data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  fs.writeFileSync(
    path.join(outputDir, 'flavours.json'),
    JSON.stringify(flavours, null, 2)
  );

  console.log('Written to data/flavours.json');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
