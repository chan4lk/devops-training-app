import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export interface PostgresArgs {
  name: string;
  resourceGroupName: pulumi.Input<string>;
  adminUser: pulumi.Input<string>;
  adminPassword: pulumi.Input<string>;
  location: pulumi.Input<string>;
  skuName?: string;
}

export function createPostgres(args: PostgresArgs) {
const server = new azure_native.dbforpostgresql.Server(args.name, {
    administratorLogin: args.adminUser,
    administratorLoginPassword: args.adminPassword,
    availabilityZone: "1",
    backup: {
        backupRetentionDays: 7,
        geoRedundantBackup: azure_native.dbforpostgresql.GeoRedundantBackupEnum.Disabled,
    },
    createMode: azure_native.dbforpostgresql.CreateMode.Create,
    highAvailability: {
        mode: azure_native.dbforpostgresql.HighAvailabilityMode.ZoneRedundant,
    },
    location: args.location,
    
    resourceGroupName: args.resourceGroupName,
    serverName: args.name,
    sku: {
        name: args.skuName || "Standard_D4s_v3",
        tier: azure_native.dbforpostgresql.SkuTier.GeneralPurpose,
    },
    storage: {
        storageSizeGB: 512,
    },
    tags: {
        ElasticServer: "1",
    },
    version: azure_native.dbforpostgresql.ServerVersion.ServerVersion_12,
});
  

  const db = new azure_native.dbforpostgresql.Database(`${args.name}-db`, {
    resourceGroupName: args.resourceGroupName,
    serverName: server.name,
    charset: "UTF8",
    collation: "English_United States.1252",
  });

  return { server, db };
}
