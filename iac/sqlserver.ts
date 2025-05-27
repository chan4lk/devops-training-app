import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export interface SqlServerArgs {
  name: string;
  resourceGroupName: pulumi.Input<string>;
  adminUser: pulumi.Input<string>;
  adminPassword: pulumi.Input<string>;
  location: pulumi.Input<string>;
  tags?: { [key: string]: pulumi.Input<string> };
}

export function createSqlServer(args: SqlServerArgs) {
  // Create SQL Server
  const server = new azure_native.sql.Server(args.name, {
    administratorLogin: args.adminUser,
    administratorLoginPassword: args.adminPassword,
    location: args.location,
    resourceGroupName: args.resourceGroupName,
    version: "12.0", // SQL Server version
    tags: args.tags || {},
  });

  // Database name - db-<app/service name>-<environment>-<instance>
  const dbNameParts = args.name.split('-');
  const dbNameBase = dbNameParts.length > 1 ? dbNameParts[1] : args.name; // Extract the project name part
  
  // Create SQL Database with DTU 10
  const db = new azure_native.sql.Database(`db-${dbNameBase}-001`, {
    resourceGroupName: args.resourceGroupName,
    serverName: server.name,
    sku: {
      name: "S0", // S0 tier corresponds to DTU 10
      tier: "Standard"
    },
    maxSizeBytes: 1073741824, // 1GB
    collation: "SQL_Latin1_General_CP1_CI_AS",
  });

  // Create a firewall rule to allow Azure services
  const firewallRule = new azure_native.sql.FirewallRule(`${args.name}-firewall-azure-services`, {
    resourceGroupName: args.resourceGroupName,
    serverName: server.name,
    startIpAddress: "0.0.0.0",
    endIpAddress: "0.0.0.0",
  });

  return { server, db, firewallRule };
}
