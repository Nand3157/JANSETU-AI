# JANSETU AI — BACKEND SCHEMA

## Firestore

### users/{userId}
userId
role
countryId
regionId
preferredLanguage
displayName
consentVersion
createdAt
updatedAt
lastLoginAt

### citizen_requests/{requestId}
requestId
userId
sourceChannel
sourceLanguage
originalText
translatedText
audioUrl
photoUrl
latitude
longitude
locationSource
countryId
regionId
districtId
localityId
category
subcategory
problemStatement
affectedServices[]
affectedGroups[]
urgencyScore
aiConfidence
clusterId
priorityScore
status
createdAt
updatedAt

### request_clusters/{clusterId}
clusterId
countryId
regionId
districtId
category
subcategory
title
summary
centroid
requestCount
populationAffected
demandScore
infrastructureGapScore
populationImpactScore
vulnerabilityScore
urgencyScore
feasibilityScore
investmentGapScore
priorityScore
priorityBand
confidence
evidenceRefs[]
dataGapRefs[]
status
createdAt
updatedAt

### projects/{projectId}
projectId
clusterId
title
description
countryId
regionId
districtId
latitude
longitude
estimatedCost
currency
estimatedBeneficiaries
priorityScore
recommendationStatus
approvalStatus
fundingStatus
implementationStatus
startDate
targetDate
completedDate
createdAt
updatedAt

### investment_plans/{planId}
planId
countryId
regionId
districtId
sector
projectName
plannedBudget
allocatedAmount
status
source
sourceDate
startDate
endDate

### audit_logs/{auditId}
auditId
actorUserId
actorRole
action
resourceType
resourceId
before
after
timestamp
reason

## BigQuery Tables

### demographics
country_id
region_id
district_id
population
population_density
children_pct
elderly_pct
female_pct
poverty_index
income_index
urban_rural
source
source_date

### infrastructure_indices
country_id
region_id
district_id
road_index
health_access_index
water_index
education_index
transport_index
digital_connectivity_index
electricity_index
overall_index
source
source_date

### citizen_request_analytics
request_id
cluster_id
country_id
region_id
district_id
category
latitude
longitude
created_date
priority_score

### impact_metrics
project_id
metric
baseline
target
actual
unit
measurement_date
source
quality

## Country Configuration
{
  "countryId": "IN",
  "languages": ["en", "hi", "gu"],
  "currency": "INR",
  "adminLevels": ["state", "district", "taluka", "village"],
  "rankingWeightsVersion": "v1"
}

## Core Schema Rule
Never store only the final priority score. Store every score component and the weight version.
