import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export interface PostgresArgs {
  name: string;
  resourceGroupName: pulumi.Input<string>;
  adminUser: pulumi.Input<string>;
  adminPassword: pulumi.Input<string>;
  location: pulumi.Input<string>;
  skuName?: string;
  tags?: { [key: string]: pulumi.Input<string> };
}

export function createPostgres(args: PostgresArgs) {
const server = new azure_native.dbforsqlserver.Server(args.name, {
    administratorLogin: args.adminUser,
    administratorLoginPassword: args.adminPassword,
    availabilityZone: "1",
    backup: {
        backupRetentionDays: 7,
        geoRedundantBackup: azure_native.dbforsqlserver.GeoRedundantBackupEnum.Disabled,
    },
    createMode: azure_native.dbforsqlserver.CreateMode.Create,
    highAvailability: {
        mode: azure_native.dbforsqlserver.HighAvailabilityMode.ZoneRedundant,
    },
    location: args.location,
    
    resourceGroupName: args.resourceGroupName,
    serverName: args.name,
    sku: {
        name: "Standard_DTU_10",
        name: args.skuName || "Standard_D4ds_v4",
        tier: azure_native.dbforsqlserver.SkuTier.Standard,
    },
    storage: {
        storageSizeGB: 512,
    },
    tags: {
        ElasticServer: "1",
    },
    version: azure_native.dbforsqlserver.ServerVersion.ServerVersion_2019,
});
  
  // Database name - db-<app/service name>-<environment>-<instance>
  const dbNameParts = args.name.split('-');
  const dbNameBase = dbNameParts.length > 1 ? dbNameParts[1] : args.name; // Extract the project name part
  
  const db = new azure_native.dbforsqlserver.Database(`db-${dbNameBase}-001`, {
    resourceGroupName: args.resourceGroupName,
    serverName: server.name,
    charset: "UTF8",
    collation: "English_United States.1252",
  });

  return { server, db };
}
