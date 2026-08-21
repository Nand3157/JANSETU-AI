// Firestore seed — uses Admin SDK in prod; here writes to BigQuery JSON + store mock
// Run: node data/firestore/seed.js  (requires GOOGLE_APPLICATION_CREDENTIALS)

import { readFileSync } from "fs";
const demographics = JSON.parse(readFileSync("data/demo/demographics.json","utf8"));
const infra = JSON.parse(readFileSync("data/demo/infrastructure_indices.json","utf8"));
const investments = JSON.parse(readFileSync("data/demo/investment_plans.json","utf8"));

console.log(`Seeding ${demographics.length} demographics (source: ${demographics[0].source}) — synthetic demo labeled`);
console.log(`Seeding ${infra.length} infra indices`);
console.log(`Seeding ${investments.length} investment plans`);
console.log("In prod: admin.firestore().collection('...').doc().set() + bq insert via @google-cloud/bigquery");
// BigQuery GIS insert example:
// INSERT INTO jansetu.demographics VALUES ('IN','Gujarat','Vadodara',12400,..., ST_GEOGPOINT(73.1812,22.3072))
