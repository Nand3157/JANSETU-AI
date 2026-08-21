-- JANSETU AI — BigQuery DDL (GIS-enabled) — synthetic demo labeled
-- Run: bq query --use_legacy_sql=false < data/bigquery/ddl.sql

CREATE SCHEMA IF NOT EXISTS jansetu OPTIONS(description="JANSETU civic intelligence — demo synthetic");

-- 05_BACKEND_SCHEMA.md → demographics
CREATE TABLE IF NOT EXISTS jansetu.demographics (
  country_id STRING, region_id STRING, district_id STRING,
  population INT64, population_density INT64, children_pct FLOAT64, elderly_pct FLOAT64, female_pct FLOAT64,
  poverty_index FLOAT64, income_index INT64, urban_rural STRING,
  source STRING, source_date DATE,
  geom GEOGRAPHY -- BigQuery GIS: ST_GEOGPOINT(lng, lat) per district centroid
) OPTIONS(description="Verified government demographics — synthetic demo labeled");

-- infrastructure_indices
CREATE TABLE IF NOT EXISTS jansetu.infrastructure_indices (
  country_id STRING, region_id STRING, district_id STRING,
  road_index INT64, health_access_index INT64, water_index INT64, education_index INT64,
  transport_index INT64, digital_connectivity_index INT64, electricity_index INT64, overall_index INT64,
  source STRING, source_date DATE,
  geom GEOGRAPHY
) OPTIONS(description="Infrastructure gap — synthetic demo");

-- citizen_request_analytics (operational → analytics)
CREATE TABLE IF NOT EXISTS jansetu.citizen_request_analytics (
  request_id STRING, cluster_id STRING, country_id STRING, region_id STRING, district_id STRING,
  category STRING, latitude FLOAT64, longitude FLOAT64, geom GEOGRAPHY,
  created_date DATE, priority_score FLOAT64
) OPTIONS(description="De-identified request analytics — never precise citizen location publicly");

-- investment_plans
CREATE TABLE IF NOT EXISTS jansetu.investment_plans (
  plan_id STRING, country_id STRING, region_id STRING, district_id STRING, sector STRING,
  project_name STRING, planned_budget INT64, allocated_amount INT64, status STRING,
  source STRING, source_date DATE, start_date DATE, end_date DATE
);

-- impact_metrics
CREATE TABLE IF NOT EXISTS jansetu.impact_metrics (
  project_id STRING, metric STRING, baseline FLOAT64, target FLOAT64, actual FLOAT64,
  unit STRING, measurement_date DATE, source STRING, quality STRING
);

-- Example GIS hotspot query (BigQuery GIS) — demand hotspot map
-- SELECT district_id, COUNT(*) as requests, AVG(priority_score) as avg_priority,
--        ST_CENTROID_AGG(geom) as centroid, ST_CLUSTERDBSCAN(geom, 10000, 2) OVER() as cluster
-- FROM jansetu.citizen_request_analytics WHERE created_date > DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
-- GROUP BY district_id;

-- Admin boundaries (join via district_id) — in prod load from GADM/Maps
