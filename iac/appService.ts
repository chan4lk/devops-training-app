import * as azure from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export interface AppServiceArgs {
  name: string;
  resourceGroupName: pulumi.Input<string>;
  appServicePlanId: pulumi.Input<string>;
  location: pulumi.Input<string>;
  appSettings?: { [key: string]: pulumi.Input<string> };
  tags?: { [key: string]: pulumi.Input<string> };
}

export function createAppService(args: AppServiceArgs) {
  return new azure.web.WebApp(args.name, {
    location: args.location,
    resourceGroupName: args.resourceGroupName,
    serverFarmId: args.appServicePlanId,
    siteConfig: {
      appSettings: args.appSettings
        ? Object.entries(args.appSettings).map(([name, value]) => ({ name, value }))
        : undefined,
      linuxFxVersion: "DOCKER|mcr.microsoft.com/appsvc/staticsite:latest", // Default container, will be overridden by deployment
      alwaysOn: true,
      http20Enabled: true,
    },
    httpsOnly: true,
    tags: args.tags,
  });
}
