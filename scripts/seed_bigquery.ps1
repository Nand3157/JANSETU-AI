# Seed BigQuery GIS — requires gcloud auth
bq --location=US query --use_legacy_sql=false < data/bigquery/ddl.sql
Write-Host "Loading demo CSVs to BigQuery..."
bq load --source_format=NEWLINE_DELIMITED_JSON jansetu.demographics data/demo/demographics.json
bq load --source_format=NEWLINE_DELIMITED_JSON jansetu.infrastructure_indices data/demo/infrastructure_indices.json
bq load --source_format=NEWLINE_DELIMITED_JSON jansetu.investment_plans data/demo/investment_plans.json
Write-Host "Done — all synthetic demo labeled, not real gov stats"
