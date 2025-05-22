import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure-native";
import { createAppService } from "./appService";
import { createPostgres } from "./postgres";

// Config
const config = new pulumi.Config();
const location = config.get("location") || "WestEurope";
const resourceGroup = new azure.resources.ResourceGroup("app-rg", { location });

// App Service Plan
const plan = new azure.web.AppServicePlan("appservice-plan", {
  resourceGroupName: resourceGroup.name,
  location,
  sku: {
    name: "B1",
    tier: "Basic",
  },
});

// Frontend App Service
const frontend = createAppService({
  name: "frontend-app",
  resourceGroupName: resourceGroup.name,
  appServicePlanId: plan.id,
  location,
});

// Backend App Service
const backend = createAppService({
  name: "backend-app",
  resourceGroupName: resourceGroup.name,
  appServicePlanId: plan.id,
  location,
});

// Postgres DB
const pgCreds = {
  adminUser: config.require("pgAdminUser"),
  adminPassword: config.requireSecret("pgAdminPassword"),
};
const postgres = createPostgres({
  name: "pg-db",
  resourceGroupName: resourceGroup.name,
  adminUser: pgCreds.adminUser,
  adminPassword: pgCreds.adminPassword,
  location,
});

export const frontendUrl = pulumi.interpolate`https://${frontend.defaultHostName}`;
export const backendUrl = pulumi.interpolate`https://${backend.defaultHostName}`;
export const postgresServer = postgres.server.name;
export const postgresDb = postgres.db.name;
