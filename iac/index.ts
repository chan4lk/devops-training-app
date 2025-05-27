import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure-native";
import { createAppService } from "./appService";
import { createSqlServer } from "./sqlserver";

// Config
const config = new pulumi.Config();
const location = config.get("location") || "WestEurope";
const environment = config.get("environment") || "dev";
const projectName = config.get("projectName") || "devops";

// Common tags for all resources
const commonTags = {
  environment: environment,
  project: projectName,
  owner: "DevOps Team",
  costCenter: "IT-123",
  createdBy: "Pulumi"
};

// Resource Group - rg-<app/service name>-<environment>-<region>-<instance>
const resourceGroup = new azure.resources.ResourceGroup(`rg-${projectName}-${environment}-${location}-001`, { 
  location,
  tags: commonTags
});

// App Service Plan - plan-<app/service name>-<environment>-<region>-<instance>
const plan = new azure.web.AppServicePlan(`plan-${projectName}-${environment}-${location}-001`, {
  resourceGroupName: resourceGroup.name,
  location,
  sku: {
    name: "B1",
    tier: "Basic",
  },
  tags: commonTags
});

// Frontend App Service - app-<app/service name>-<environment>-<region>-<instance>
const frontend = createAppService({
  name: `app-${projectName}-fe-${environment}-${location}-001`,
  resourceGroupName: resourceGroup.name,
  appServicePlanId: plan.id,
  location,
  tags: commonTags
});

// Backend App Service - app-<app/service name>-<environment>-<region>-<instance>
const backend = createAppService({
  name: `app-${projectName}-be-${environment}-${location}-001`,
  resourceGroupName: resourceGroup.name,
  appServicePlanId: plan.id,
  location,
  tags: commonTags
});

// SQL Server DB with DTU 10
const sqlCreds = {
  adminUser: config.require("pgAdminUser"),
  adminPassword: config.requireSecret("pgAdminPassword"),
};
const sqlServerResource = createSqlServer({
  name: `sql-${projectName}-${environment}-${location}-001`,
  resourceGroupName: resourceGroup.name,
  adminUser: sqlCreds.adminUser,
  adminPassword: sqlCreds.adminPassword,
  location,
  tags: commonTags
});

export const frontendUrl = pulumi.interpolate`https://${frontend.defaultHostName}`;
export const backendUrl = pulumi.interpolate`https://${backend.defaultHostName}`;
export const sqlServer = sqlServerResource.server.name;
export const sqlServerDb = sqlServerResource.db.name;
